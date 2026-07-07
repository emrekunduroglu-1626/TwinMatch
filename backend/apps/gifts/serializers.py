from rest_framework import serializers

from apps.gifts.services import ALLOWED_SUPPLIERS, user_has_gift_access
from apps.gifts.models import (
    AddressVault,
    GiftCategory,
    GiftNotification,
    GiftOrder,
    GiftProduct,
    GiftSetting,
)


class GiftSettingSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        request = self.context.get("request")
        wants_gift_access = attrs.get("can_receive") is True or attrs.get("can_send") is True
        if request and wants_gift_access and not user_has_gift_access(request.user):
            raise serializers.ValidationError("Anonim hediye alma/gönderme ayarları Gold ve Platinum üyelere özeldir.")
        return attrs

    class Meta:
        model = GiftSetting
        fields = [
            "id",
            "can_receive",
            "can_send",
            "receive_from",
            "blocked_senders",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AddressVaultSerializer(serializers.ModelSerializer):
    """Only ever exposed to the vault owner. Never serialize this for a sender/other user."""

    def validate_phone_masked(self, value):
        value = value.strip()
        if value and not value.startswith("+90") and len(value) < 10:
            raise serializers.ValidationError("Maskeli telefon geçerli bir teslimat numarası olmalıdır.")
        return value

    class Meta:
        model = AddressVault
        fields = [
            "id",
            "address_line1",
            "address_line2",
            "city",
            "district",
            "postal_code",
            "phone_masked",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at", "updated_at"]


class GiftCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCategory
        fields = ["id", "name", "slug", "icon", "is_active"]


class GiftProductSerializer(serializers.ModelSerializer):
    category = GiftCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GiftCategory.objects.all(), source="category", write_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = GiftProduct
        fields = [
            "id",
            "category",
            "category_id",
            "name",
            "description",
            "price",
            "service_fee",
            "total_price",
            "image_url",
            "supplier",
            "is_available",
            "tier_required",
        ]

    def get_total_price(self, obj) -> str:
        return str(obj.total_price)

    def validate_supplier(self, value):
        if value not in ALLOWED_SUPPLIERS:
            raise serializers.ValidationError("Sadece Amazon ve Çiçeksepeti tedarikçileri desteklenir.")
        return value


class GiftOrderCreateSerializer(serializers.ModelSerializer):
    def validate_product(self, product):
        if not product.is_available:
            raise serializers.ValidationError("Ürün şu anda mevcut değil.")
        if product.supplier not in ALLOWED_SUPPLIERS:
            raise serializers.ValidationError("Bu tedarikçi anonim hediye operasyonunda desteklenmiyor.")
        return product

    class Meta:
        model = GiftOrder
        fields = ["id", "receiver", "product", "gift_note"]
        read_only_fields = ["id"]


class GiftOrderSerializer(serializers.ModelSerializer):
    """Sender-facing serializer: never includes receiver's address/phone/courier data."""

    product = GiftProductSerializer(read_only=True)
    product_price = serializers.SerializerMethodField()
    service_fee = serializers.SerializerMethodField()

    class Meta:
        model = GiftOrder
        fields = [
            "id",
            "sender",
            "receiver",
            "product",
            "product_price",
            "service_fee",
            "status",
            "gift_note",
            "note_moderated",
            "payment_status",
            "payment_amount",
            "rejection_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_product_price(self, obj) -> str:
        return str(obj.product.price)

    def get_service_fee(self, obj) -> str:
        return str(obj.product.service_fee)


class GiftOrderRejectSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class GiftNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftNotification
        fields = [
            "id",
            "order",
            "recipient",
            "notification_type",
            "is_read",
            "message",
            "created_at",
        ]
        read_only_fields = fields
