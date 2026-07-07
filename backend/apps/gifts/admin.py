from django.contrib import admin

from .models import AddressVault, GiftCategory, GiftNotification, GiftOrder, GiftProduct, GiftSetting


@admin.register(GiftSetting)
class GiftSettingAdmin(admin.ModelAdmin):
    list_display = ("user", "can_receive", "can_send", "receive_from")
    search_fields = ("user__email",)
    list_filter = ("can_receive", "can_send", "receive_from")


@admin.register(AddressVault)
class AddressVaultAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "district", "is_verified")
    search_fields = ("user__email", "city", "district")
    list_filter = ("is_verified", "city")


@admin.register(GiftCategory)
class GiftCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(GiftProduct)
class GiftProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "service_fee", "supplier", "tier_required", "is_available")
    search_fields = ("name", "supplier_product_id")
    list_filter = ("category", "supplier", "tier_required", "is_available")


@admin.register(GiftOrder)
class GiftOrderAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "product", "status", "payment_status", "payment_amount", "created_at")
    search_fields = ("sender__email", "receiver__email")
    list_filter = ("status", "payment_status")


@admin.register(GiftNotification)
class GiftNotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "order", "notification_type", "is_read", "created_at")
    search_fields = ("recipient__email",)
    list_filter = ("notification_type", "is_read")
