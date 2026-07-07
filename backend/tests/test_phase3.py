"""
Faz 3 testleri: SMS sağlayıcı, e-posta şifre sıfırlama, Iyzico ödeme akışı.
"""
import hashlib
import hmac
import json

from django.core import mail
from django.test import override_settings
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.accounts.sms import ConsoleSmsBackend, get_sms_backend
from apps.subscriptions.models import Payment, Subscription
from apps.subscriptions.payments import MockPaymentProvider, get_payment_provider


class SmsBackendTests(APITestCase):
    def test_default_backend_is_console(self):
        self.assertIsInstance(get_sms_backend(), ConsoleSmsBackend)

    def test_console_backend_always_succeeds(self):
        self.assertTrue(ConsoleSmsBackend().send("+905551112233", "test"))

    def test_netgsm_requires_credentials(self):
        import os
        from apps.accounts.sms import NetgsmSmsBackend
        os.environ.pop("NETGSM_USERCODE", None)
        with self.assertRaises(RuntimeError):
            NetgsmSmsBackend()


class PasswordResetFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="reset@test.com", phone="+905551112280", password="Eski!Sifre42"
        )

    def test_reset_sends_email_with_uid_and_token(self):
        r = self.client.post("/api/v1/auth/password/reset/", {"email": "reset@test.com"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("uid=", mail.outbox[0].body)
        self.assertIn("token=", mail.outbox[0].body)

    def test_unknown_email_sends_nothing_but_same_response(self):
        r = self.client.post("/api/v1/auth/password/reset/", {"email": "ghost@test.com"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)  # e-posta yok ama yanıt aynı

    def _extract_uid_token(self):
        self.client.post("/api/v1/auth/password/reset/", {"email": "reset@test.com"}, format="json")
        body = mail.outbox[0].body
        uid = body.split("uid=")[1].split("&")[0]
        token = body.split("token=")[1].split()[0].strip()
        return uid, token

    def test_confirm_with_valid_token_changes_password(self):
        uid, token = self._extract_uid_token()
        r = self.client.post("/api/v1/auth/password/reset/confirm/", {
            "uid": uid, "token": token, "new_password": "Yeni!Sifre42"
        }, format="json")
        self.assertEqual(r.status_code, 200)
        # Yeni şifre ile giriş yapılabilmeli
        login = self.client.post("/api/v1/auth/login/", {"email": "reset@test.com", "password": "Yeni!Sifre42"}, format="json")
        self.assertEqual(login.status_code, 200)

    def test_token_single_use(self):
        uid, token = self._extract_uid_token()
        self.client.post("/api/v1/auth/password/reset/confirm/", {
            "uid": uid, "token": token, "new_password": "Yeni!Sifre42"
        }, format="json")
        r2 = self.client.post("/api/v1/auth/password/reset/confirm/", {
            "uid": uid, "token": token, "new_password": "Baska!Sifre42"
        }, format="json")
        self.assertEqual(r2.status_code, 400)  # şifre değişince token geçersizleşir

    def test_confirm_rejects_weak_password(self):
        uid, token = self._extract_uid_token()
        r = self.client.post("/api/v1/auth/password/reset/confirm/", {
            "uid": uid, "token": token, "new_password": "12345678"
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_confirm_rejects_bogus_uid(self):
        r = self.client.post("/api/v1/auth/password/reset/confirm/", {
            "uid": "bogus", "token": "bogus", "new_password": "Yeni!Sifre42"
        }, format="json")
        self.assertEqual(r.status_code, 400)


class PaymentProviderTests(APITestCase):
    def test_default_provider_is_mock(self):
        self.assertIsInstance(get_payment_provider(), MockPaymentProvider)

    def test_iyzico_requires_credentials(self):
        import os
        from apps.subscriptions.payments import IyzicoPaymentProvider
        os.environ.pop("IYZICO_API_KEY", None)
        with self.assertRaises(RuntimeError):
            IyzicoPaymentProvider()

    def test_mock_webhook_signature_roundtrip(self):
        provider = MockPaymentProvider()
        body = b'{"test": 1}'
        sig = hmac.new(provider.SECRET.encode(), body, hashlib.sha256).hexdigest()
        self.assertTrue(provider.verify_webhook_signature(body, sig))
        self.assertFalse(provider.verify_webhook_signature(body, "yanlis"))


class CheckoutFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="pay@test.com", phone="+905551112290", password="Guclu!Sifre42"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _checkout(self, plan="plus", is_annual=False):
        return self.client.post("/api/v1/subscriptions/checkout/", {
            "plan": plan, "is_annual": is_annual
        }, format="json")

    def test_checkout_creates_pending_subscription(self):
        r = self._checkout()
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["subscription"]["status"], "pending")
        self.assertIn("checkout_url", r.json())
        self.assertIn("checkout_token", r.json())

    def test_checkout_invalid_plan_rejected(self):
        r = self._checkout(plan="diamond")
        self.assertEqual(r.status_code, 400)

    def test_callback_activates_subscription(self):
        token = self._checkout().json()["checkout_token"]
        r = self.client.post("/api/v1/subscriptions/checkout/callback/", {"token": token}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["result"], "paid")
        self.assertEqual(r.json()["subscription"]["status"], "active")
        payment = Payment.objects.get(iyzico_payment_id=token)
        self.assertEqual(payment.status, Payment.Status.PAID)

    def test_callback_idempotent(self):
        token = self._checkout().json()["checkout_token"]
        self.client.post("/api/v1/subscriptions/checkout/callback/", {"token": token}, format="json")
        r2 = self.client.post("/api/v1/subscriptions/checkout/callback/", {"token": token}, format="json")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(Payment.objects.filter(iyzico_payment_id=token).count(), 1)

    def test_callback_foreign_token_404(self):
        other = User.objects.create_user(email="other@test.com", phone="+905551112291", password="Guclu!Sifre42")
        token = self._checkout().json()["checkout_token"]
        other_client = APIClient()
        other_client.force_authenticate(other)
        r = other_client.post("/api/v1/subscriptions/checkout/callback/", {"token": token}, format="json")
        self.assertEqual(r.status_code, 404)  # başkasının ödemesini aktive edemez

    def test_active_subscription_blocks_new_checkout(self):
        token = self._checkout().json()["checkout_token"]
        self.client.post("/api/v1/subscriptions/checkout/callback/", {"token": token}, format="json")
        r = self._checkout()
        self.assertEqual(r.status_code, 409)


class WebhookSecurityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="wh@test.com", phone="+905551112295", password="Guclu!Sifre42"
        )
        client = APIClient()
        client.force_authenticate(self.user)
        r = client.post("/api/v1/subscriptions/checkout/", {"plan": "basic"}, format="json")
        self.sub_ref = r.json()["subscription"]["iyzico_subscription_ref"]

    def _signed_post(self, payload, valid=True):
        body = json.dumps(payload).encode()
        secret = MockPaymentProvider.SECRET.encode()
        sig = hmac.new(secret, body, hashlib.sha256).hexdigest() if valid else "gecersiz"
        return self.client.post(
            "/api/v1/subscriptions/webhook/iyzico/",
            data=body, content_type="application/json",
            HTTP_X_IYZ_SIGNATURE=sig,
        )

    def test_webhook_rejects_invalid_signature(self):
        r = self._signed_post({"iyzico_subscription_ref": self.sub_ref, "status": "paid"}, valid=False)
        self.assertEqual(r.status_code, 401)

    def test_webhook_accepts_valid_signature(self):
        r = self._signed_post({"iyzico_subscription_ref": self.sub_ref, "status": "paid"})
        self.assertEqual(r.status_code, 200)
        sub = Subscription.objects.get(iyzico_subscription_ref=self.sub_ref)
        self.assertEqual(sub.status, Subscription.Status.ACTIVE)

    def test_webhook_no_jwt_needed(self):
        """Webhook anonim istemciden imzayla çalışmalı (Iyzico JWT taşımaz)."""
        r = self._signed_post({"iyzico_subscription_ref": self.sub_ref, "status": "paid"})
        self.assertNotEqual(r.status_code, 401)
