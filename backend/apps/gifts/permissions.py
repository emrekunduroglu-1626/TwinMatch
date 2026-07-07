from rest_framework.permissions import BasePermission


class IsGiftOrderParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        user_id = getattr(request.user, "id", None)
        return obj.sender_id == user_id or obj.receiver_id == user_id


class IsGiftOrderReceiver(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.receiver_id == getattr(request.user, "id", None)
