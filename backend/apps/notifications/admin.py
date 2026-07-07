from django.contrib import admin

from .models import DeviceToken, Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "notification_type", "is_read", "created_at")
    search_fields = ("user__email", "title")
    list_filter = ("notification_type", "is_read")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "push_enabled", "email_enabled", "match_updates_enabled", "marketing_enabled")


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "device_type", "is_active", "created_at")
    search_fields = ("user__email", "fcm_token")
    list_filter = ("device_type", "is_active")