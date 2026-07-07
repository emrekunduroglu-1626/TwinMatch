from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminUserOrReadOnly
from .serializers import (
    AdminDashboardSerializer,
    AdminMatchSerializer,
    AdminReportSerializer,
    AdminSubscriptionSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserStatusSerializer,
    build_dashboard_payload,
    build_match_payload,
    build_report_payload,
    build_subscription_payload,
)


User = get_user_model()


class ReportsSkeletonView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOrReadOnly]
    message = ""

    def get(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "GET"})

    def put(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "PUT"})


class DashboardView(ReportsSkeletonView):
    def get(self, request, *args, **kwargs):
        serializer = AdminDashboardSerializer(build_dashboard_payload())
        return Response(serializer.data)


class AdminUsersView(ReportsSkeletonView):
    def get(self, request, *args, **kwargs):
        query = request.query_params.get("q")
        users = User.objects.all().select_related("profile", "verification_record").order_by("-date_joined")
        if query:
            users = users.filter(Q(email__icontains=query) | Q(phone__icontains=query))
        serializer = AdminUserListSerializer(users[:50], many=True)
        return Response({"count": users.count(), "results": serializer.data})


class AdminUserDetailView(ReportsSkeletonView):
    def get(self, request, user_id, *args, **kwargs):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserDetailSerializer(user)
        return Response(serializer.data)


class AdminUserStatusView(ReportsSkeletonView):
    def put(self, request, user_id, *args, **kwargs):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.is_active = serializer.validated_data["is_active"]
        user.save(update_fields=["is_active", "updated_at"])
        return Response({"id": str(user.id), "is_active": user.is_active})


class AdminMatchesView(ReportsSkeletonView):
    def get(self, request, *args, **kwargs):
        serializer = AdminMatchSerializer(build_match_payload())
        return Response(serializer.data)


class AdminSubscriptionsView(ReportsSkeletonView):
    def get(self, request, *args, **kwargs):
        serializer = AdminSubscriptionSerializer(build_subscription_payload())
        return Response(serializer.data)


class AdminReportsView(ReportsSkeletonView):
    def get(self, request, *args, **kwargs):
        serializer = AdminReportSerializer(build_report_payload())
        return Response(serializer.data)