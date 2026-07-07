from django.urls import path

from .views import AvailabilityView, ScheduleMeetingView, UpcomingMeetingsView


urlpatterns = [
    path("availability/", AvailabilityView.as_view(), name="calendar-availability"),
    path("schedule/<uuid:match_id>/", ScheduleMeetingView.as_view(), name="calendar-schedule"),
    path("upcoming/", UpcomingMeetingsView.as_view(), name="calendar-upcoming"),
]