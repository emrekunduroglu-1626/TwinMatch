from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.discovery.models import FlirtRequest
from apps.matching.services import build_candidate_results
from apps.profiles.models import Profile


User = get_user_model()


class DiscoveryFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        candidates = build_candidate_results(request.user, limit=20)
        return Response(
            {
                "count": len(candidates),
                "results": [
                    {
                        "user_id": item.user_id,
                        "profile_id": item.profile_id,
                        "display_name": item.display_name,
                        "city": item.city,
                        "age": item.age,
                        "compatibility_score": item.overall_score,
                        "highlights": item.reasons,
                    }
                    for item in candidates
                ],
            }
        )


class DiscoveryProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, profile_id, *args, **kwargs):
        try:
            profile = Profile.objects.select_related("user").prefetch_related("photos").get(id=profile_id, onboarding_completed=True)
        except Profile.DoesNotExist:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "id": str(profile.id),
                "user_id": str(profile.user_id),
                "display_name": profile.display_name,
                "city": profile.city,
                "education": profile.education,
                "occupation": profile.occupation,
                "zodiac_sign": profile.zodiac_sign,
                "bio": profile.bio,
                "photos": [
                    {
                        "id": str(photo.id),
                        "cdn_url": photo.cdn_url,
                        "is_primary": photo.is_primary,
                    }
                    for photo in profile.photos.all().order_by("sort_order", "created_at")
                ],
            }
        )


class FlirtRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id, *args, **kwargs):
        if str(request.user.id) == str(user_id):
            return Response({"detail": "Kullanıcı kendisine flört isteği gönderemez."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": "Hedef kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        flirt_request, created = FlirtRequest.objects.get_or_create(
            requester=request.user,
            target=target_user,
            defaults={"status": FlirtRequest.Status.PENDING},
        )
        if not created and flirt_request.status == FlirtRequest.Status.REJECTED:
            flirt_request.status = FlirtRequest.Status.PENDING
            flirt_request.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "detail": "Flört isteği kaydedildi.",
                "request": {
                    "id": str(flirt_request.id),
                    "requester_id": str(flirt_request.requester_id),
                    "target_id": str(flirt_request.target_id),
                    "status": flirt_request.status,
                },
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )