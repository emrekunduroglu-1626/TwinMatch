from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.matching.models import Match

from .models import VerificationRecord


class SelfieVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        selfie_s3_key = request.data.get("selfie_s3_key")
        confidence_score = float(request.data.get("confidence_score", 0))
        liveness_passed = bool(request.data.get("liveness_passed", False))

        if not selfie_s3_key:
            return Response({"detail": "selfie_s3_key zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        verification_status = (
            VerificationRecord.Status.APPROVED
            if liveness_passed and confidence_score >= 0.8
            else VerificationRecord.Status.REJECTED
        )
        failure_reason = "" if verification_status == VerificationRecord.Status.APPROVED else "Yüz benzerliği veya canlılık skoru yetersiz."
        verified_at = timezone.now() if verification_status == VerificationRecord.Status.APPROVED else None

        record, created = VerificationRecord.objects.update_or_create(
            user=request.user,
            defaults={
                "selfie_s3_key": selfie_s3_key,
                "status": verification_status,
                "confidence_score": confidence_score,
                "failure_reason": failure_reason,
                "verified_at": verified_at,
                "rekognition_response": {
                    "liveness_passed": liveness_passed,
                    "confidence_score": confidence_score,
                },
            },
        )
        if record.status == VerificationRecord.Status.APPROVED:
            Match.objects.filter(
                status=Match.Status.ACTIVE,
                stage__lt=Match.Stage.REVEALED,
            ).filter(user_a=request.user).update(stage=Match.Stage.REVEALED, status=Match.Status.REVEALED)
            Match.objects.filter(
                status=Match.Status.ACTIVE,
                stage__lt=Match.Stage.REVEALED,
            ).filter(user_b=request.user).update(stage=Match.Stage.REVEALED, status=Match.Status.REVEALED)

        return Response(
            {
                "id": str(record.id),
                "status": record.status,
                "confidence_score": record.confidence_score,
                "failure_reason": record.failure_reason,
                "verified_at": record.verified_at,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class VerificationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        record = VerificationRecord.objects.filter(user=request.user).first()
        if not record:
            return Response({"status": "not_started", "verified": False})
        return Response(
            {
                "status": record.status,
                "verified": record.status == VerificationRecord.Status.APPROVED,
                "confidence_score": record.confidence_score,
                "failure_reason": record.failure_reason,
                "verified_at": record.verified_at,
            }
        )