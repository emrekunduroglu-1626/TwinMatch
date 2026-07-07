from django.urls import path

from .views import SafeDateSpotsView, VenueDetailView, VenueListView

urlpatterns = [
    path("", VenueListView.as_view(), name="venues-list"),
    path("safe-date-spots/", SafeDateSpotsView.as_view(), name="venues-safe-date-spots"),
    path("<uuid:pk>/", VenueDetailView.as_view(), name="venues-detail"),
]
