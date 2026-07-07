from django.urls import path

from .views import SelfieVerificationView, VerificationStatusView


urlpatterns = [
    path("selfie/", SelfieVerificationView.as_view(), name="verification-selfie"),
    path("status/", VerificationStatusView.as_view(), name="verification-status"),
]