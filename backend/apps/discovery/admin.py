from django.contrib import admin

from .models import FlirtRequest


@admin.register(FlirtRequest)
class FlirtRequestAdmin(admin.ModelAdmin):
    list_display = ("requester", "target", "status", "created_at")
    search_fields = ("requester__email", "target__email")
    list_filter = ("status",)