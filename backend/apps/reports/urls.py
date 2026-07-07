from django.urls import path

from .views import (
    AdminMatchesView,
    AdminReportsView,
    AdminSubscriptionsView,
    AdminUserDetailView,
    AdminUsersView,
    AdminUserStatusView,
    DashboardView,
)


urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUsersView.as_view(), name="admin-users"),
    path("users/<uuid:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<uuid:user_id>/status/", AdminUserStatusView.as_view(), name="admin-user-status"),
    path("matches/", AdminMatchesView.as_view(), name="admin-matches"),
    path("subscriptions/", AdminSubscriptionsView.as_view(), name="admin-subscriptions"),
    path("reports/", AdminReportsView.as_view(), name="admin-reports"),
]