from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DeviceToken, Notification, NotificationPreference


def _serialize_notification(notification):
    return {
        "id": str(notification.id),
        "title": notification.title,
        "body": notification.body,
        "notification_type": notification.notification_type,
        "is_read": notification.is_read,
        "data": notification.data,
        "created_at": notification.created_at,
    }


def _serialize_preference(preference):
    return {
        "push_enabled": preference.push_enabled,
        "email_enabled": preference.email_enabled,
        "match_updates_enabled": preference.match_updates_enabled,
        "marketing_enabled": preference.marketing_enabled,
    }


class NotificationsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        unread_count = notifications.filter(is_read=False).count()
        return Response(
            {
                "items": [_serialize_notification(item) for item in notifications],
                "count": notifications.count(),
                "unread_count": unread_count,
            }
        )


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        notification = get_object_or_404(Notification, id=kwargs["notification_id"], user=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        return Response(_serialize_notification(notification))


class NotificationSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        preference, _created = NotificationPreference.objects.get_or_create(user=request.user)
        for field in ["push_enabled", "email_enabled", "match_updates_enabled", "marketing_enabled"]:
            if field in request.data:
                setattr(preference, field, bool(request.data.get(field)))
        preference.save()
        return Response(_serialize_preference(preference))


class DeviceTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        fcm_token = request.data.get("fcm_token")
        device_type = request.data.get("device_type")
        if not fcm_token or not device_type:
            return Response({"detail": "fcm_token ve device_type zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        device_token, created = DeviceToken.objects.update_or_create(
            user=request.user,
            fcm_token=fcm_token,
            defaults={"device_type": device_type, "is_active": True},
        )
        return Response(
            {
                "id": str(device_token.id),
                "fcm_token": device_token.fcm_token,
                "device_type": device_token.device_type,
                "is_active": device_token.is_active,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )