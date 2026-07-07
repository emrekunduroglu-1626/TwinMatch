from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health_check, name="health-check"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/profiles/", include("apps.profiles.urls")),
    path("api/v1/verification/", include("apps.verification.urls")),
    path("api/v1/digital-twin/", include("apps.digital_twin.urls")),
    path("api/v1/matching/", include("apps.matching.urls")),
    path("api/v1/chat/", include("apps.chat.urls")),
    path("api/v1/discovery/", include("apps.discovery.urls")),
    path("api/v1/calendar/", include("apps.calendar_app.urls")),
    path("api/v1/subscriptions/", include("apps.subscriptions.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/admin/", include("apps.reports.urls")),
    path("api/v1/gifts/", include("apps.gifts.urls")),
    path("api/v1/venues/", include("apps.venues.urls")),
    path("api/v1/safety/", include("apps.safety.urls")),
]