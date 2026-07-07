from django.contrib import admin

from .models import Availability, ScheduledMeeting


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "start_time", "end_time")
    search_fields = ("user__email",)


@admin.register(ScheduledMeeting)
class ScheduledMeetingAdmin(admin.ModelAdmin):
    list_display = ("match", "date", "start_time", "end_time", "status")
    list_filter = ("status",)