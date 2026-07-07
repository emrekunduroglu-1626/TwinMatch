from django.contrib import admin

from .models import Venue, VenueCategory


@admin.register(VenueCategory)
class VenueCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "city",
        "district",
        "is_safe_date_spot",
        "safety_score",
        "is_sponsored",
        "is_active",
    )
    search_fields = ("name", "city", "district", "google_place_id")
    list_filter = ("category", "city", "is_safe_date_spot", "is_sponsored", "is_active")
