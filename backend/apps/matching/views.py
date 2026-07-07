from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.services import ensure_conversation_for_match, seed_conversation_messages
from common.pagination import DefaultPagination
from apps.matching.models import Match
from apps.matching.services import advance_match, build_candidate_results, create_match_from_candidate, ensure_compatibility_report


User = get_user_model()


def _serialize_match(match: Match) -> dict:
    return {
        "id": str(match.id),
        "user_a_id": str(match.user_a_id),
        "user_b_id": str(match.user_b_id),
        "stage": match.stage,
        "status": match.status,
        "stage_1_score": match.stage_1_score,
        "stage_2_score": match.stage_2_score,
        "stage_3_score": match.stage_3_score,
        "overall_score": match.overall_score,
        "created_at": match.created_at,
    }


class CandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        candidates = build_candidate_results(request.user)
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
                        "overall_score": item.overall_score,
                        "stage_1_score": item.stage_1_score,
                        "stage_2_score": item.stage_2_score,
                        "stage_3_score": item.stage_3_score,
                        "reasons": item.reasons,
                    }
                    for item in candidates
                ],
            }
        )


class InitiateMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id, *args, **kwargs):
        if str(request.user.id) == str(user_id):
            return Response({"detail": "Kullanıcı kendisiyle eşleşme başlatamaz."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.select_related("profile", "digital_twin").get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": "Hedef kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        match = create_match_from_candidate(request.user, target_user)
        return Response({"detail": "Eşleme başlatıldı.", "match": _serialize_match(match)}, status=status.HTTP_201_CREATED)


class MatchProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id, *args, **kwargs):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"detail": "Eşleşme bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not match.involves_user(request.user):
            return Response({"detail": "Bu eşleşmeye erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        conversation = None
        if match.stage >= Match.Stage.TWIN_CHAT:
            try:
                conversation = ensure_conversation_for_match(match)
            except ValueError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            seed_conversation_messages(conversation)

        return Response(
            {
                "match": _serialize_match(match),
                "conversation_id": str(conversation.id) if conversation else None,
                "next_action": (
                    "digital_twin_chat"
                    if match.stage == Match.Stage.TWIN_CHAT
                    else "review_report"
                    if match.stage == Match.Stage.READY_TO_REVEAL
                    else "identity_revealed"
                    if match.stage == Match.Stage.REVEALED
                    else "start_match"
                ),
            }
        )

    def post(self, request, match_id, *args, **kwargs):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"detail": "Eşleşme bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not match.involves_user(request.user):
            return Response({"detail": "Bu eşleşmeye erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        match = advance_match(match)
        conversation_id = None
        if match.stage >= Match.Stage.TWIN_CHAT:
            try:
                conversation = ensure_conversation_for_match(match)
            except ValueError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            seed_conversation_messages(conversation)
            conversation_id = str(conversation.id)

        return Response({"detail": "Eşleşme aşaması güncellendi.", "match": _serialize_match(match), "conversation_id": conversation_id})


class MatchReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id, *args, **kwargs):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"detail": "Eşleşme bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not match.involves_user(request.user):
            return Response({"detail": "Bu rapora erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        report = ensure_compatibility_report(match)
        return Response(
            {
                "match_id": str(match.id),
                "overall_score": match.overall_score,
                "scores": {
                    "communication": report.communication_score,
                    "character": report.character_score,
                    "lifestyle": report.lifestyle_score,
                    "values": report.values_score,
                    "career": report.career_score,
                    "hobbies": report.hobbies_score,
                },
                "analysis": report.detailed_analysis,
            }
        )


class RevealMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id, *args, **kwargs):
        try:
            match = Match.objects.select_related("user_a__profile", "user_b__profile").get(id=match_id)
        except Match.DoesNotExist:
            return Response({"detail": "Eşleşme bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not match.involves_user(request.user):
            return Response({"detail": "Bu eşleşmeye erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        if match.stage < Match.Stage.READY_TO_REVEAL:
            return Response({"detail": "Kimlik açılımı için eşleşme henüz hazır değil."}, status=status.HTTP_400_BAD_REQUEST)

        match = advance_match(match)
        counterpart = match.user_b if match.user_a_id == request.user.id else match.user_a
        profile = getattr(counterpart, "profile", None)
        return Response(
            {
                "detail": "Kimlik açılımı tamamlandı.",
                "match": _serialize_match(match),
                "counterpart": {
                    "user_id": str(counterpart.id),
                    "display_name": profile.display_name if profile else "",
                    "city": profile.city if profile else "",
                    "bio": profile.bio if profile else "",
                },
            }
        )


class MatchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        matches = Match.objects.filter(Q(user_a=request.user) | Q(user_b=request.user)).order_by("-created_at")
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(matches, request, view=self)
        return paginator.get_paginated_response([_serialize_match(match) for match in page])