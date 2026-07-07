from django.conf import settings
from django.db import models

from common.models import BaseModel


class FlirtRequest(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flirt_requests_sent")
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flirt_requests_received")
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["requester", "target"], name="unique_flirt_request_pair"),
        ]