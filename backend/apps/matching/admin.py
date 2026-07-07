from django.contrib import admin

from .models import CompatibilityReport, Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("user_a", "user_b", "stage", "status", "overall_score")
    search_fields = ("user_a__email", "user_b__email")
    list_filter = ("stage", "status")


@admin.register(CompatibilityReport)
class CompatibilityReportAdmin(admin.ModelAdmin):
    list_display = ("match", "communication_score", "character_score", "lifestyle_score")