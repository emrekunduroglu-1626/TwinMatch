from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from common.models import BaseModel

from .managers import UserManager


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    is_age_confirmed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self) -> str:
        return self.email

class OtpCode(BaseModel):
    """SMS OTP kodları — kod asla düz metin saklanmaz, SHA-256 hash tutulur."""

    phone = models.CharField(max_length=32, db_index=True)
    code_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)

    MAX_ATTEMPTS = 5

    @property
    def is_valid(self) -> bool:
        return (not self.is_used) and self.attempts < self.MAX_ATTEMPTS and self.expires_at >= timezone.now()

    def __str__(self) -> str:
        return f"OtpCode({self.phone})"
