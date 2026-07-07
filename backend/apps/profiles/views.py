from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Photo, Profile, Video


class ProfilesSkeletonView(APIView):
    permission_classes = [IsAuthenticated]
    message = ""

    def get(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "GET"})

    def put(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "PUT"})

    def post(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "POST"})

    def delete(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "DELETE"})


class MyProfileView(ProfilesSkeletonView):
    message = "Kendi profil endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_profile(profile, include_private=True))

    def put(self, request, *args, **kwargs):
        payload = request.data
        profile = Profile.objects.filter(user=request.user).first()
        creating = profile is None
        if creating:
            profile = Profile(user=request.user)

        required_fields = [
            "display_name",
            "birth_date",
            "gender",
            "height",
            "education",
            "city",
            "occupation",
            "zodiac_sign",
            "smoking",
            "wants_children",
            "marital_status",
        ]
        missing_fields = [field for field in required_fields if creating and not payload.get(field)]
        if missing_fields:
            return Response(
                {"detail": "Zorunlu alanlar eksik.", "missing_fields": missing_fields},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for field in required_fields + ["bio"]:
            if field in payload:
                setattr(profile, field, payload.get(field))

        profile.onboarding_completed = _is_profile_complete(profile)
        profile.save()
        return Response(
            _serialize_profile(profile, include_private=True),
            status=status.HTTP_201_CREATED if creating else status.HTTP_200_OK,
        )


class MyPhotosView(ProfilesSkeletonView):
    message = "Profil fotoğraf endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        photos = profile.photos.order_by("sort_order", "created_at")
        return Response({"items": [_serialize_photo(photo) for photo in photos], "count": photos.count()})

    def post(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        s3_key = request.data.get("s3_key")
        cdn_url = request.data.get("cdn_url")
        if not s3_key or not cdn_url:
            return Response({"detail": "s3_key ve cdn_url zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        photo = Photo.objects.create(
            profile=profile,
            s3_key=s3_key,
            cdn_url=cdn_url,
            is_primary=bool(request.data.get("is_primary", False)),
            sort_order=request.data.get("sort_order") or profile.photos.count(),
        )
        if photo.is_primary:
            profile.photos.exclude(id=photo.id).update(is_primary=False)
        elif not profile.photos.exclude(id=photo.id).filter(is_primary=True).exists():
            photo.is_primary = True
            photo.save(update_fields=["is_primary", "updated_at"])

        return Response(_serialize_photo(photo), status=status.HTTP_201_CREATED)


class MyPhotoDetailView(ProfilesSkeletonView):
    message = "Profil fotoğraf detay endpoint iskeleti hazır."

    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        photo = get_object_or_404(Photo, id=kwargs["photo_id"], profile=profile)
        was_primary = photo.is_primary
        photo.delete()
        if was_primary:
            replacement = profile.photos.order_by("sort_order", "created_at").first()
            if replacement:
                replacement.is_primary = True
                replacement.save(update_fields=["is_primary", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyVideoView(ProfilesSkeletonView):
    message = "Profil video endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        video = Video.objects.filter(profile=profile).first()
        return Response({"item": _serialize_video(video) if video else None})

    def put(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profil bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        s3_key = request.data.get("s3_key")
        cdn_url = request.data.get("cdn_url")
        duration = request.data.get("duration")
        if not s3_key or not cdn_url or duration is None:
            return Response({"detail": "s3_key, cdn_url ve duration zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        video, created = Video.objects.update_or_create(
            profile=profile,
            defaults={"s3_key": s3_key, "cdn_url": cdn_url, "duration": duration},
        )
        return Response(_serialize_video(video), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PublicProfileView(ProfilesSkeletonView):
    message = "Genel profil endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        profile = get_object_or_404(Profile, id=kwargs["profile_id"])
        return Response(_serialize_profile(profile, include_private=False))


def _serialize_profile(profile, include_private):
    primary_photo = profile.photos.filter(is_primary=True).first()
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "display_name": profile.display_name,
        "birth_date": profile.birth_date,
        "gender": profile.gender,
        "height": profile.height,
        "education": profile.education,
        "city": profile.city,
        "occupation": profile.occupation,
        "zodiac_sign": profile.zodiac_sign,
        "bio": profile.bio,
        "smoking": profile.smoking,
        "wants_children": profile.wants_children,
        "marital_status": profile.marital_status,
        "onboarding_completed": profile.onboarding_completed,
        "photo_count": profile.photos.count(),
        "has_video": hasattr(profile, "video"),
        "primary_photo_url": primary_photo.cdn_url if primary_photo else None,
        "photos": [_serialize_photo(photo) for photo in profile.photos.order_by("sort_order", "created_at")] if include_private else None,
        "video": _serialize_video(getattr(profile, "video", None)) if include_private else None,
    }


def _serialize_photo(photo):
    return {
        "id": str(photo.id),
        "cdn_url": photo.cdn_url,
        "is_primary": photo.is_primary,
        "sort_order": photo.sort_order,
    }


def _serialize_video(video):
    if not video:
        return None
    return {
        "id": str(video.id),
        "cdn_url": video.cdn_url,
        "duration": video.duration,
    }


def _is_profile_complete(profile):
    required_values = [
        profile.display_name,
        profile.birth_date,
        profile.gender,
        profile.height,
        profile.education,
        profile.city,
        profile.occupation,
        profile.zodiac_sign,
        profile.smoking,
        profile.wants_children,
        profile.marital_status,
    ]
    return all(required_values)