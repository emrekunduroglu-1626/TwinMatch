from django.urls import path

from .views import (
    AgeConfirmView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetView,
    PrivacyExportView,
    DeleteAccountView,
    RegisterView,
    SendOtpView,
    TokenRefreshView,
    VerifyOtpView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("phone/send-otp/", SendOtpView.as_view(), name="send-otp"),
    path("phone/verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("age-confirm/", AgeConfirmView.as_view(), name="age-confirm"),
    path("password/reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", MeView.as_view(), name="me"),
    path("privacy/export/", PrivacyExportView.as_view(), name="privacy-export"),
    path("account/delete/", DeleteAccountView.as_view(), name="delete-account"),
]