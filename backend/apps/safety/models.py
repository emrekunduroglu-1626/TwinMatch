from django.conf import settings
from django.db import models

from common.models import BaseModel


class UserBlock(BaseModel):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_created")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_received")
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_user_block"),
            models.CheckConstraint(condition=~models.Q(blocker=models.F("blocked")), name="blocker_not_blocked_self"),
        ]

    def __str__(self) -> str:
        return f"UserBlock({self.blocker_id} -> {self.blocked_id})"


class UserReport(BaseModel):
    class Category(models.TextChoices):
        PROFILE = "profile", "Profile"
        MESSAGE = "message", "Message"
        GIFT_NOTE = "gift_note", "Gift Note"
        VENUE = "venue", "Venue"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWING = "reviewing", "Reviewing"
        ACTIONED = "actioned", "Actioned"
        DISMISSED = "dismissed", "Dismissed"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_created")
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports_received"
    )
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.OTHER)
    object_id = models.CharField(max_length=255, blank=True)
    reason = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.OPEN)
    admin_notes = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"UserReport({self.reporter_id}, {self.category}, {self.status})"
