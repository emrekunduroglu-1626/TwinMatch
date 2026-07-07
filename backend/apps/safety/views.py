from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.pagination import DefaultPagination

from .models import UserBlock, UserReport
from .serializers import UserBlockSerializer, UserReportSerializer


class UserBlockViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = UserBlock.objects.none()
    serializer_class = UserBlockSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return UserBlock.objects.filter(blocker=self.request.user).select_related("blocked").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(blocker=self.request.user)

    @action(detail=False, methods=["post"], url_path="unblock")
    def unblock(self, request, *args, **kwargs):
        blocked_id = request.data.get("blocked")
        if not blocked_id:
            return Response({"blocked": "Bu alan zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = UserBlock.objects.filter(blocker=request.user, blocked_id=blocked_id).delete()
        return Response({"detail": "Engel kaldırıldı.", "deleted": bool(deleted)})


class UserReportViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = UserReport.objects.none()
    serializer_class = UserReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return UserReport.objects.filter(reporter=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
