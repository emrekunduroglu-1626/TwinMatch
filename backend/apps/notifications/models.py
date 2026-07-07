from django.conf import settings
from django.db import models

from common.models import BaseModel


class Notification(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    body = models.TextField()
    notification_type = models.CharField(max_length=32)
    is_read = models.BooleanField(default=False)
    data = models.JSONField(null=True, blank=True)


class DeviceToken(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_tokens")
    fcm_token = models.CharField(max_length=512)
    device_type = models.CharField(max_length=32)
    is_active = models.BooleanField(default=True)


class NotificationPreference(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference")
    push_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)
    match_updates_enabled = models.BooleanField(default=True)
    marketing_enabled = models.BooleanField(default=False)