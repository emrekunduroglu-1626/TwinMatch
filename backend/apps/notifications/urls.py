from django.urls import path

from .views import DeviceTokenView, NotificationReadView, NotificationSettingsView, NotificationsListView


urlpatterns = [
    path("", NotificationsListView.as_view(), name="notifications-list"),
    path("<uuid:notification_id>/read/", NotificationReadView.as_view(), name="notifications-read"),
    path("settings/", NotificationSettingsView.as_view(), name="notifications-settings"),
    path("device/", DeviceTokenView.as_view(), name="notifications-device"),
]