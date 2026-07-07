from django.conf import settings
from django.db import models

from apps.matching.models import Match
from common.models import BaseModel


class Availability(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="availabilities")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()


class ScheduledMeeting(BaseModel):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="scheduled_meetings")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scheduled_meetings_created")
    status = models.CharField(max_length=32, default="scheduled")