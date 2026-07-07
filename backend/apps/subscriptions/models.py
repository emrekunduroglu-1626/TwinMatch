from django.conf import settings
from django.db import models
from django.utils import timezone

from common.models import BaseModel


class Subscription(BaseModel):
    class Plan(models.TextChoices):
        BASIC = "basic", "Basic"
        PLUS = "plus", "Plus"
        PREMIUM = "premium", "Premium"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        CANCELED = "canceled", "Canceled"
        EXPIRED = "expired", "Expired"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.CharField(max_length=32, choices=Plan.choices)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_annual = models.BooleanField(default=False)
    iyzico_subscription_ref = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField()
    expires_at = models.DateTimeField()

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE and self.expires_at >= timezone.now()


class Payment(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="TRY")
    iyzico_payment_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING)