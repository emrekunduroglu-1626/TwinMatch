from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressVaultViewSet,
    GiftCatalogViewSet,
    GiftNotificationViewSet,
    GiftOrderViewSet,
    GiftSettingViewSet,
)

router = DefaultRouter()
router.register("catalog", GiftCatalogViewSet, basename="gift-catalog")
router.register("orders", GiftOrderViewSet, basename="gift-orders")
router.register("notifications", GiftNotificationViewSet, basename="gift-notifications")

urlpatterns = [
    path(
        "settings/",
        GiftSettingViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update"}),
        name="gift-settings",
    ),
    path(
        "address/",
        AddressVaultViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update"}),
        name="gift-address",
    ),
] + router.urls
