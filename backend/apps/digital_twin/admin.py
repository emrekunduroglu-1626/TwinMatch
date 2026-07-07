from django.contrib import admin

from .models import DigitalTwin, PartnerPreference, SurveyAnswer


@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ("user", "question_id")
    search_fields = ("user__email",)


@admin.register(PartnerPreference)
class PartnerPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "preferred_city", "age_min", "age_max")
    search_fields = ("user__email", "preferred_city")


@admin.register(DigitalTwin)
class DigitalTwinAdmin(admin.ModelAdmin):
    list_display = ("user", "communication_style", "completion_score", "is_active")
    search_fields = ("user__email", "communication_style")
    list_filter = ("is_active",)