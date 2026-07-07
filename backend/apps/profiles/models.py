from django.conf import settings
from django.db import models
from pgvector.django import VectorField

from common.models import BaseModel


class Profile(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    gender = models.CharField(max_length=32)
    height = models.IntegerField()
    education = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    occupation = models.CharField(max_length=255)
    zodiac_sign = models.CharField(max_length=64)
    bio = models.TextField(blank=True)
    smoking = models.CharField(max_length=32)
    wants_children = models.CharField(max_length=32)
    marital_status = models.CharField(max_length=64)
    onboarding_completed = models.BooleanField(default=False)
    embedding = VectorField(dimensions=1536, null=True, blank=True)


class Photo(BaseModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="photos")
    s3_key = models.CharField(max_length=512)
    cdn_url = models.URLField()
    is_primary = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)


class Video(BaseModel):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="video")
    s3_key = models.CharField(max_length=512)
    cdn_url = models.URLField()
    duration = models.IntegerField()