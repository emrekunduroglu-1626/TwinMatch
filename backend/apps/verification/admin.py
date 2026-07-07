from django.contrib import admin

from .models import VerificationRecord


@admin.register(VerificationRecord)
class VerificationRecordAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "confidence_score", "verified_at")
    search_fields = ("user__email", "user__phone")
    list_filter = ("status",)