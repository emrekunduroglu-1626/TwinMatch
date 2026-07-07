from django.urls import path

from .views import MyPhotoDetailView, MyPhotosView, MyProfileView, MyVideoView, PublicProfileView


urlpatterns = [
    path("me/", MyProfileView.as_view(), name="profiles-me"),
    path("me/photos/", MyPhotosView.as_view(), name="profiles-me-photos"),
    path("me/photos/<uuid:photo_id>/", MyPhotoDetailView.as_view(), name="profiles-me-photo-detail"),
    path("me/video/", MyVideoView.as_view(), name="profiles-me-video"),
    path("<uuid:profile_id>/", PublicProfileView.as_view(), name="profiles-detail"),
]