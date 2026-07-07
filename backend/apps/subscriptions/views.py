from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.permissions import AllowAny

from .models import Payment, Subscription
from .payments import get_payment_provider


PLAN_CATALOG = {
    Subscription.Plan.BASIC: {
        "name": "Basic",
        "monthly_price": Decimal("299.90"),
        "yearly_price": Decimal("2999.00"),
        "features": ["Haftalik sinirli eslesme", "Temel filtreler", "Standart destek"],
    },
    Subscription.Plan.PLUS: {
        "name": "Plus",
        "monthly_price": Decimal("499.90"),
        "yearly_price": Decimal("4999.00"),
        "features": ["Sinirsiz eslesme", "Gelismis filtreler", "Oncelikli destek"],
    },
    Subscription.Plan.PREMIUM: {
        "name": "Premium",
        "monthly_price": Decimal("799.90"),
        "yearly_price": Decimal("7999.00"),
        "features": ["Kimlik acilimi onceligi", "VIP eslesme", "Takvim onceligi"],
    },
}


def _serialize_subscription(subscription):
    return {
        "id": str(subscription.id),
        "plan": subscription.plan,
        "status": subscription.status,
        "is_annual": subscription.is_annual,
        "price_monthly": str(subscription.price_monthly),
        "price_yearly": str(subscription.price_yearly) if subscription.price_yearly is not None else None,
        "started_at": subscription.started_at,
        "expires_at": subscription.expires_at,
        "iyzico_subscription_ref": subscription.iyzico_subscription_ref,
        "is_active": subscription.is_active,
    }


def _get_active_subscription(user):
    now = timezone.now()
    subscription = (
        Subscription.objects.filter(user=user, status=Subscription.Status.ACTIVE, expires_at__gte=now)
        .order_by("-expires_at")
        .first()
    )
    expired_subscriptions = Subscription.objects.filter(user=user, status=Subscription.Status.ACTIVE, expires_at__lt=now)
    if expired_subscriptions.exists():
        expired_subscriptions.update(status=Subscription.Status.EXPIRED)
    return subscription


class PlansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        active_subscription = _get_active_subscription(request.user)
        plans = []
        for plan_code, plan_data in PLAN_CATALOG.items():
            plans.append(
                {
                    "code": plan_code,
                    "name": plan_data["name"],
                    "monthly_price": str(plan_data["monthly_price"]),
                    "yearly_price": str(plan_data["yearly_price"]),
                    "features": plan_data["features"],
                    "is_current": bool(active_subscription and active_subscription.plan == plan_code),
                }
            )
        return Response({"items": plans, "count": len(plans)})


class CheckoutView(APIView):
    """Ödeme başlat: PENDING abonelik oluşturur, sağlayıcının ödeme sayfası URL'ini döner.

    Kart verisi hiçbir zaman bu API'ye gelmez — kullanıcı sağlayıcının kendi
    sayfasında öder (PCI-DSS kapsamı sağlayıcıda kalır).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        plan = request.data.get("plan")
        is_annual = bool(request.data.get("is_annual", False))

        if plan not in PLAN_CATALOG:
            return Response({"detail": "Gecersiz plan secimi."}, status=status.HTTP_400_BAD_REQUEST)

        active_subscription = _get_active_subscription(request.user)
        if active_subscription:
            return Response(
                {"detail": "Aktif abonelik varken yeni checkout baslatilamaz.", "subscription": _serialize_subscription(active_subscription)},
                status=status.HTTP_409_CONFLICT,
            )

        plan_data = PLAN_CATALOG[plan]
        amount = plan_data["yearly_price"] if is_annual else plan_data["monthly_price"]
        now = timezone.now()
        expires_at = now + (timedelta(days=365) if is_annual else timedelta(days=30))

        provider = get_payment_provider()
        callback_url = request.build_absolute_uri("/api/v1/subscriptions/checkout/callback/")
        checkout = provider.initialize_checkout(
            user=request.user, plan_code=plan, amount=amount,
            is_annual=is_annual, callback_url=callback_url,
        )

        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            price_monthly=plan_data["monthly_price"],
            price_yearly=plan_data["yearly_price"],
            is_annual=is_annual,
            iyzico_subscription_ref=checkout.provider_ref,
            status=Subscription.Status.PENDING,
            started_at=now,
            expires_at=expires_at,
        )
        Payment.objects.create(
            user=request.user,
            subscription=subscription,
            amount=amount,
            currency="TRY",
            iyzico_payment_id=checkout.checkout_token,
            status=Payment.Status.PENDING,
        )
        return Response(
            {
                "subscription": _serialize_subscription(subscription),
                "checkout_url": checkout.checkout_url,
                "checkout_token": checkout.checkout_token,
            },
            status=status.HTTP_201_CREATED,
        )


class CheckoutCallbackView(APIView):
    """Kullanıcı ödeme sayfasından dönünce token doğrulanır ve abonelik aktive edilir."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        token = request.data.get("token", "")
        if not token:
            return Response({"detail": "token zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.filter(iyzico_payment_id=token, user=request.user).select_related("subscription").first()
        if not payment or not payment.subscription:
            return Response({"detail": "Ödeme kaydı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == Payment.Status.PAID:
            return Response({"subscription": _serialize_subscription(payment.subscription)})  # idempotent

        result = get_payment_provider().verify_checkout(token)
        subscription = payment.subscription

        if result == "paid":
            payment.status = Payment.Status.PAID
            subscription.status = Subscription.Status.ACTIVE
        elif result == "failed":
            payment.status = Payment.Status.FAILED
            subscription.status = Subscription.Status.EXPIRED
            subscription.expires_at = timezone.now()
        # pending → dokunma, kullanıcı tekrar deneyebilir

        payment.save(update_fields=["status", "updated_at"])
        subscription.save(update_fields=["status", "expires_at", "updated_at"])
        return Response({"result": result, "subscription": _serialize_subscription(subscription)})


class IyzicoWebhookView(APIView):
    """Sunucudan-sunucuya bildirim. Kimlik JWT ile DEĞİL, gövde HMAC imzasıyla doğrulanır
    (webhook'u gönderen Iyzico sunucusudur, kullanıcı oturumu taşımaz)."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        signature = request.headers.get("X-Iyz-Signature", "")
        if not get_payment_provider().verify_webhook_signature(request.body, signature):
            return Response({"detail": "İmza doğrulanamadı."}, status=status.HTTP_401_UNAUTHORIZED)

        subscription_ref = request.data.get("iyzico_subscription_ref")
        payment_status = request.data.get("status")

        if not subscription_ref or payment_status not in {Payment.Status.PAID, Payment.Status.FAILED, Payment.Status.REFUNDED}:
            return Response({"detail": "Webhook payload gecersiz."}, status=status.HTTP_400_BAD_REQUEST)

        subscription = Subscription.objects.filter(iyzico_subscription_ref=subscription_ref).first()
        if not subscription:
            return Response({"detail": "Abonelik bulunamadi."}, status=status.HTTP_404_NOT_FOUND)

        payment = subscription.payments.order_by("-created_at").first()
        if payment:
            payment.status = payment_status
            payment.save(update_fields=["status", "updated_at"])

        if payment_status == Payment.Status.PAID:
            subscription.status = Subscription.Status.ACTIVE
        elif payment_status == Payment.Status.REFUNDED:
            subscription.status = Subscription.Status.CANCELED
            subscription.expires_at = timezone.now()
        else:
            subscription.status = Subscription.Status.PENDING
            subscription.expires_at = timezone.now()
        subscription.save(update_fields=["status", "expires_at", "updated_at"])

        return Response({"subscription": _serialize_subscription(subscription)})


class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        subscription = _get_active_subscription(request.user)
        if not subscription:
            return Response({"item": None})
        return Response({"item": _serialize_subscription(subscription)})


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        subscription = _get_active_subscription(request.user)
        if not subscription:
            return Response({"detail": "Iptal edilecek aktif abonelik bulunamadi."}, status=status.HTTP_404_NOT_FOUND)

        subscription.status = Subscription.Status.CANCELED
        subscription.expires_at = timezone.now()
        subscription.save(update_fields=["status", "expires_at", "updated_at"])
        return Response({"item": _serialize_subscription(subscription)})