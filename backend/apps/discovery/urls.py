from django.urls import path

from .views import DiscoveryFeedView, DiscoveryProfileView, FlirtRequestView


urlpatterns = [
    path("feed/", DiscoveryFeedView.as_view(), name="discovery-feed"),
    path("profile/<uuid:profile_id>/", DiscoveryProfileView.as_view(), name="discovery-profile"),
    path("flirt/<uuid:user_id>/", FlirtRequestView.as_view(), name="discovery-flirt"),
]