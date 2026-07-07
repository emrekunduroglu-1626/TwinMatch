from django.db import models

from common.models import BaseModel


class VenueCategory(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self) -> str:
        return self.name


class Venue(BaseModel):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(VenueCategory, on_delete=models.CASCADE, related_name="venues")
    description = models.TextField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    google_place_id = models.CharField(max_length=255, blank=True)
    google_rating = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    website = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    is_safe_date_spot = models.BooleanField(default=False)
    safety_score = models.IntegerField(default=0)
    safety_criteria = models.JSONField(default=dict, blank=True)
    is_sponsored = models.BooleanField(default=False)
    sponsor_discount = models.CharField(max_length=255, blank=True)
    sponsor_perks = models.JSONField(default=list, blank=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name
