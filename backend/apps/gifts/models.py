from django.conf import settings
from django.db import models

from common.models import BaseModel


class GiftSetting(BaseModel):
    class ReceiveFrom(models.TextChoices):
        NOBODY = "nobody", "Nobody"
        MATCHES_ONLY = "matches_only", "Matches Only"
        APPROVED_ONLY = "approved_only", "Approved Only"
        AFTER_FIRST_DATE = "after_first_date", "After First Date"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gift_setting")
    can_receive = models.BooleanField(default=False)
    can_send = models.BooleanField(default=False)
    receive_from = models.CharField(max_length=32, choices=ReceiveFrom.choices, default=ReceiveFrom.NOBODY)
    blocked_senders = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="blocked_by_gift_settings", blank=True)

    def __str__(self) -> str:
        return f"GiftSetting({self.user_id})"


class AddressVault(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="address_vault")
    address_line1 = models.CharField(max_length=255, blank=True, default="")
    address_line2 = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=255, blank=True, default="")
    district = models.CharField(max_length=255, blank=True, default="")
    postal_code = models.CharField(max_length=32, blank=True, default="")
    phone_masked = models.CharField(max_length=32, blank=True, default="")
    is_verified = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"AddressVault({self.user_id})"


class GiftCategory(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    icon = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name


class GiftProduct(BaseModel):
    class Supplier(models.TextChoices):
        AMAZON = "amazon", "Amazon"
        CICEKSEPETI = "ciceksepeti", "Çiçeksepeti"

    class TierRequired(models.TextChoices):
        GOLD = "gold", "Gold"
        PLATINUM = "platinum", "Platinum"

    category = models.ForeignKey(GiftCategory, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True)
    supplier = models.CharField(max_length=32, choices=Supplier.choices)
    supplier_product_id = models.CharField(max_length=255, blank=True)
    is_available = models.BooleanField(default=True)
    tier_required = models.CharField(max_length=32, choices=TierRequired.choices, default=TierRequired.GOLD)

    @property
    def total_price(self):
        return self.price + self.service_fee

    def __str__(self) -> str:
        return self.name


class GiftOrder(BaseModel):
    class Status(models.TextChoices):
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        PREPARING = "preparing", "Preparing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        REFUNDED = "refunded", "Refunded"

    SENDER_VISIBLE_STATUSES = [
        Status.PENDING_APPROVAL,
        Status.APPROVED,
        Status.PREPARING,
        Status.SHIPPED,
        Status.DELIVERED,
    ]

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gift_orders_sent")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gift_orders_received")
    product = models.ForeignKey(GiftProduct, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING_APPROVAL)
    gift_note = models.TextField(blank=True)
    note_moderated = models.BooleanField(default=False)
    payment_status = models.CharField(max_length=32, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rejection_reason = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return f"GiftOrder({self.sender_id} -> {self.receiver_id}, {self.status})"


class GiftNotification(BaseModel):
    class NotificationType(models.TextChoices):
        GIFT_REQUEST = "gift_request", "Gift Request"
        GIFT_ACCEPTED = "gift_accepted", "Gift Accepted"
        GIFT_REJECTED = "gift_rejected", "Gift Rejected"
        GIFT_SHIPPED = "gift_shipped", "Gift Shipped"
        GIFT_DELIVERED = "gift_delivered", "Gift Delivered"

    order = models.ForeignKey(GiftOrder, on_delete=models.CASCADE, related_name="notifications")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gift_notifications")
    notification_type = models.CharField(max_length=32, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    message = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"GiftNotification({self.recipient_id}, {self.notification_type})"
