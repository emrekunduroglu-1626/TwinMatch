from django.conf import settings
from django.db import models

from common.models import BaseModel


class Match(BaseModel):
    class Stage(models.IntegerChoices):
        CANDIDATE = 1, "candidate"
        TWIN_CHAT = 2, "twin_chat"
        READY_TO_REVEAL = 3, "ready_to_reveal"
        REVEALED = 4, "revealed"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        REVEALED = "revealed", "Revealed"
        DECLINED = "declined", "Declined"

    user_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_as_a")
    user_b = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_as_b")
    stage = models.IntegerField(choices=Stage.choices, default=Stage.CANDIDATE)
    stage_1_score = models.FloatField(null=True, blank=True)
    stage_2_score = models.FloatField(null=True, blank=True)
    stage_3_score = models.FloatField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user_a", "user_b"], name="unique_match_pair"),
        ]

    def involves_user(self, user):
        return self.user_a_id == user.id or self.user_b_id == user.id


class CompatibilityReport(BaseModel):
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name="compatibility_report")
    communication_score = models.FloatField()
    character_score = models.FloatField()
    lifestyle_score = models.FloatField()
    values_score = models.FloatField()
    career_score = models.FloatField()
    hobbies_score = models.FloatField()
    detailed_analysis = models.JSONField(default=dict)