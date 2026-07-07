from rest_framework import serializers

from .models import Venue, VenueCategory


class VenueCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueCategory
        fields = ["id", "name", "slug"]


class VenueListSerializer(serializers.ModelSerializer):
    category = VenueCategorySerializer(read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "category",
            "city",
            "district",
            "latitude",
            "longitude",
            "google_rating",
            "image_url",
            "is_safe_date_spot",
            "safety_score",
            "is_sponsored",
            "sponsor_discount",
        ]


class VenueDetailSerializer(serializers.ModelSerializer):
    category = VenueCategorySerializer(read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "category",
            "description",
            "address",
            "city",
            "district",
            "latitude",
            "longitude",
            "google_place_id",
            "google_rating",
            "phone",
            "website",
            "image_url",
            "is_safe_date_spot",
            "safety_score",
            "safety_criteria",
            "is_sponsored",
            "sponsor_discount",
            "sponsor_perks",
            "opening_hours",
            "is_active",
        ]
