from django.conf import settings
from django.db import models

from common.models import BaseModel


class VerificationRecord(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="verification_record")
    selfie_s3_key = models.CharField(max_length=512)
    status = models.CharField(max_length=32, choices=Status.choices)
    rekognition_response = models.JSONField(default=dict)
    confidence_score = models.FloatField(default=0)
    failure_reason = models.CharField(max_length=255, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)