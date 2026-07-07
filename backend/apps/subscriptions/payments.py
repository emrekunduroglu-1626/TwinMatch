"""
Ödeme sağlayıcı katmanı.

PAYMENT_PROVIDER ortam değişkeniyle seçilir:
  mock (varsayılan)  → geliştirme/test: anında başarılı checkout
  iyzico             → Iyzico CheckoutForm API (IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL)

Akış:
  1. initialize_checkout() → PENDING abonelik + ödeme sayfası token'ı
  2. Kullanıcı Iyzico ödeme sayfasında kartını girer (kart verisi BİZE HİÇ GELMEZ — PCI-DSS kapsamı dışında kalırız)
  3. Iyzico callback → verify_checkout() sonucu PAID/FAILED
  4. Webhook (sunucudan sunucuya) imza doğrulamalı yedek kanal
"""
import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import uuid
from abc import ABC, abstractmethod
from decimal import Decimal

logger = logging.getLogger("twinmatch.payments")


class CheckoutResult:
    def __init__(self, provider_ref: str, checkout_token: str, checkout_url: str):
        self.provider_ref = provider_ref
        self.checkout_token = checkout_token
        self.checkout_url = checkout_url


class PaymentProvider(ABC):
    @abstractmethod
    def initialize_checkout(self, *, user, plan_code: str, amount: Decimal, is_annual: bool, callback_url: str) -> CheckoutResult:
        ...

    @abstractmethod
    def verify_checkout(self, checkout_token: str) -> str:
        """'paid' | 'failed' | 'pending' döner."""

    @abstractmethod
    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        ...


class MockPaymentProvider(PaymentProvider):
    """Geliştirme/test: ödemeyi anında başarılı sayar. Webhook imzası MOCK_WEBHOOK_SECRET ile HMAC."""

    SECRET = os.environ.get("MOCK_WEBHOOK_SECRET", "mock-secret")

    def initialize_checkout(self, *, user, plan_code, amount, is_annual, callback_url):
        ref = f"mock-{uuid.uuid4().hex[:12]}"
        token = secrets.token_urlsafe(24)
        return CheckoutResult(
            provider_ref=ref,
            checkout_token=token,
            checkout_url=f"{callback_url}?token={token}&mock=1",
        )

    def verify_checkout(self, checkout_token: str) -> str:
        return "paid"  # mock her zaman başarılı

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        expected = hmac.new(self.SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature or "")


class IyzicoPaymentProvider(PaymentProvider):
    """
    Iyzico CheckoutForm Initialize + Retrieve.
    Kimlik bilgileri env'den; eksikse başlatmada RuntimeError (sessiz mock'a düşme YOK —
    üretimde yanlışlıkla sahte ödeme kabul edilmesin).
    """

    def __init__(self):
        self.api_key = os.environ.get("IYZICO_API_KEY", "")
        self.secret_key = os.environ.get("IYZICO_SECRET_KEY", "")
        self.base_url = os.environ.get("IYZICO_BASE_URL", "https://sandbox-api.iyzipay.com")
        if not (self.api_key and self.secret_key):
            raise RuntimeError("IYZICO_API_KEY ve IYZICO_SECRET_KEY ortam değişkenleri gereklidir.")

    # --- Iyzico HMAC-SHA256 auth başlığı (v2) ---
    def _auth_header(self, uri_path: str, body: str) -> dict:
        random_key = secrets.token_hex(8)
        payload = random_key + uri_path + body
        signature = hmac.new(self.secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()
        authorization = base64.b64encode(
            f"apiKey:{self.api_key}&randomKey:{random_key}&signature:{signature}".encode()
        ).decode()
        return {
            "Authorization": f"IYZWSv2 {authorization}",
            "Content-Type": "application/json",
        }

    def _post(self, uri_path: str, payload: dict) -> dict:
        import urllib.request

        body = json.dumps(payload)
        req = urllib.request.Request(
            f"{self.base_url}{uri_path}",
            data=body.encode(),
            headers=self._auth_header(uri_path, body),
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())

    def initialize_checkout(self, *, user, plan_code, amount, is_annual, callback_url):
        conversation_id = f"sub-{user.id}-{uuid.uuid4().hex[:8]}"
        payload = {
            "locale": "tr",
            "conversationId": conversation_id,
            "price": str(amount),
            "paidPrice": str(amount),
            "currency": "TRY",
            "basketId": plan_code,
            "paymentGroup": "SUBSCRIPTION",
            "callbackUrl": callback_url,
            "buyer": {
                "id": str(user.id),
                "name": "TwinMatch",
                "surname": "User",
                "email": user.email,
                "identityNumber": "11111111111",  # Zorunlu alan; KYC ayrıca verification app'te
                "registrationAddress": "Türkiye",
                "city": "Istanbul",
                "country": "Turkey",
            },
            "basketItems": [{
                "id": plan_code,
                "name": f"TwinMatch {plan_code} ({'yıllık' if is_annual else 'aylık'})",
                "category1": "Subscription",
                "itemType": "VIRTUAL",
                "price": str(amount),
            }],
        }
        data = self._post("/payment/iyzipos/checkoutform/initialize/auth/ecom", payload)
        if data.get("status") != "success":
            logger.warning("Iyzico initialize failed: %s", data.get("errorMessage", "?"))
            raise RuntimeError("Ödeme sağlayıcı başlatılamadı.")
        return CheckoutResult(
            provider_ref=conversation_id,
            checkout_token=data["token"],
            checkout_url=data.get("paymentPageUrl", ""),
        )

    def verify_checkout(self, checkout_token: str) -> str:
        data = self._post(
            "/payment/iyzipos/checkoutform/auth/ecom/detail",
            {"locale": "tr", "token": checkout_token},
        )
        if data.get("status") == "success" and data.get("paymentStatus") == "SUCCESS":
            return "paid"
        if data.get("paymentStatus") in {"FAILURE", "INIT_THREEDS"}:
            return "failed"
        return "pending"

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        expected = hmac.new(self.secret_key.encode(), raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature or "")


_PROVIDERS = {
    "mock": MockPaymentProvider,
    "iyzico": IyzicoPaymentProvider,
}


def get_payment_provider() -> PaymentProvider:
    name = os.environ.get("PAYMENT_PROVIDER", "mock").lower()
    provider_cls = _PROVIDERS.get(name)
    if provider_cls is None:
        raise RuntimeError(f"Bilinmeyen PAYMENT_PROVIDER: {name}")
    return provider_cls()
