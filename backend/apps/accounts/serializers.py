import re

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User

PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kayıtlı.")
        return value

    def validate_phone(self, value):
        value = value.replace(" ", "").replace("-", "")
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Geçerli bir telefon numarası girin.")
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Bu telefon numarası zaten kayıtlı.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


class SendOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=32)

    def validate_phone(self, value):
        value = value.replace(" ", "").replace("-", "")
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Geçerli bir telefon numarası girin.")
        return value


class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=32)
    code = serializers.CharField(max_length=6, min_length=6)


class AgeConfirmSerializer(serializers.Serializer):
    is_age_confirmed = serializers.BooleanField()


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "is_phone_verified",
            "is_age_confirmed",
            "date_joined",
        ]
        read_only_fields = fields


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)


class PrivacyExportSerializer(serializers.Serializer):
    user = MeSerializer()
    safety = serializers.DictField()
    subscriptions = serializers.ListField()
