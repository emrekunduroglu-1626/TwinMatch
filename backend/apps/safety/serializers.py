from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserBlock, UserReport

User = get_user_model()


class UserBlockSerializer(serializers.ModelSerializer):
    blocked = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = UserBlock
        fields = ["id", "blocked", "reason", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_blocked(self, value):
        request = self.context.get("request")
        if request and value.id == request.user.id:
            raise serializers.ValidationError("Kendini engelleyemezsin.")
        return value


class UserReportSerializer(serializers.ModelSerializer):
    reported_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = UserReport
        fields = ["id", "reported_user", "category", "object_id", "reason", "details", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate_reason(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Şikayet nedeni en az 3 karakter olmalı.")
        return value
