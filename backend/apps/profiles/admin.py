from django.contrib import admin

from .models import Photo, Profile, Video


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "city", "occupation", "onboarding_completed")
    search_fields = ("display_name", "city", "occupation")
    list_filter = ("onboarding_completed", "gender", "city")


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("profile", "is_primary", "sort_order")
    list_filter = ("is_primary",)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("profile", "duration")