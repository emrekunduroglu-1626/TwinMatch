from django.conf import settings
from django.db import models

from common.models import BaseModel


class SurveyAnswer(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="survey_answers")
    question_id = models.IntegerField()
    answer = models.JSONField(default=dict)


class PartnerPreference(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="partner_preference")
    age_min = models.IntegerField()
    age_max = models.IntegerField()
    preferred_city = models.CharField(max_length=255)
    preferred_education = models.CharField(max_length=255)
    smoking_preference = models.CharField(max_length=32)
    children_preference = models.CharField(max_length=32)


class DigitalTwin(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="digital_twin")
    system_prompt = models.TextField()
    communication_style = models.CharField(max_length=64)
    personality_summary = models.JSONField(default=dict)
    completion_score = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)