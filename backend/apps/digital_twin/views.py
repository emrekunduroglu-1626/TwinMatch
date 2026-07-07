from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DigitalTwin, PartnerPreference, SurveyAnswer


class DigitalTwinSkeletonView(APIView):
    permission_classes = [IsAuthenticated]
    message = ""

    def get(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "GET"})

    def post(self, request, *args, **kwargs):
        return Response({"detail": self.message, "method": "POST"})


class SurveyQuestionsView(DigitalTwinSkeletonView):
    permission_classes = [AllowAny]
    message = "Anket soruları endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        return Response({"items": SURVEY_QUESTIONS, "count": len(SURVEY_QUESTIONS)})


class SurveyAnswersView(DigitalTwinSkeletonView):
    message = "Anket cevapları endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        answers = SurveyAnswer.objects.filter(user=request.user).order_by("question_id")
        return Response({"items": [_serialize_answer(answer) for answer in answers], "count": answers.count()})

    def post(self, request, *args, **kwargs):
        answers_payload = request.data.get("answers", [])
        if not isinstance(answers_payload, list) or not answers_payload:
            return Response({"detail": "answers alanı dolu bir liste olmalıdır."}, status=status.HTTP_400_BAD_REQUEST)

        saved_answers = []
        for item in answers_payload:
            question_id = item.get("question_id")
            answer_value = item.get("answer")
            if question_id is None:
                return Response({"detail": "Her cevap için question_id zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
            answer, _ = SurveyAnswer.objects.update_or_create(
                user=request.user,
                question_id=question_id,
                defaults={"answer": answer_value},
            )
            saved_answers.append(_serialize_answer(answer))

        return Response({"items": saved_answers, "count": len(saved_answers)}, status=status.HTTP_200_OK)


class PartnerPreferencesView(DigitalTwinSkeletonView):
    message = "Partner tercihleri endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        preference = PartnerPreference.objects.filter(user=request.user).first()
        return Response({"item": _serialize_preference(preference) if preference else None})

    def post(self, request, *args, **kwargs):
        required_fields = [
            "age_min",
            "age_max",
            "preferred_city",
            "preferred_education",
            "smoking_preference",
            "children_preference",
        ]
        missing_fields = [field for field in required_fields if request.data.get(field) in (None, "")]
        if missing_fields:
            return Response(
                {"detail": "Zorunlu alanlar eksik.", "missing_fields": missing_fields},
                status=status.HTTP_400_BAD_REQUEST,
            )

        preference, created = PartnerPreference.objects.update_or_create(
            user=request.user,
            defaults={field: request.data.get(field) for field in required_fields},
        )
        return Response(_serialize_preference(preference), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CommunicationStyleView(DigitalTwinSkeletonView):
    message = "İletişim tarzı endpoint iskeleti hazır."

    def post(self, request, *args, **kwargs):
        communication_style = request.data.get("communication_style")
        if not communication_style:
            return Response({"detail": "communication_style zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        twin, created = DigitalTwin.objects.update_or_create(
            user=request.user,
            defaults={
                "communication_style": communication_style,
                "system_prompt": request.data.get("system_prompt", ""),
                "personality_summary": request.data.get("personality_summary", {}),
                "completion_score": _calculate_completion_score(request.user),
            },
        )
        return Response(_serialize_twin(twin), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CreateDigitalTwinView(DigitalTwinSkeletonView):
    message = "Dijital ikiz oluşturma endpoint iskeleti hazır."

    def post(self, request, *args, **kwargs):
        answers = SurveyAnswer.objects.filter(user=request.user)
        preference = PartnerPreference.objects.filter(user=request.user).first()
        if not answers.exists() or not preference:
            return Response(
                {"detail": "Dijital ikiz oluşturmak için anket cevapları ve partner tercihleri tamamlanmalıdır."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        communication_style = request.data.get("communication_style") or _infer_communication_style(answers)
        personality_summary = {
            "answer_count": answers.count(),
            "top_traits": _extract_traits(answers),
            "preferred_city": preference.preferred_city,
            "preferred_age_range": [preference.age_min, preference.age_max],
        }
        system_prompt = (
            f"Kullanıcı iletişim tarzı: {communication_style}. "
            f"Öne çıkan özellikler: {', '.join(personality_summary['top_traits'])}. "
            f"Partner tercihi şehir: {preference.preferred_city}."
        )

        twin, created = DigitalTwin.objects.update_or_create(
            user=request.user,
            defaults={
                "communication_style": communication_style,
                "personality_summary": personality_summary,
                "system_prompt": system_prompt,
                "completion_score": _calculate_completion_score(request.user),
                "is_active": True,
            },
        )
        return Response(_serialize_twin(twin), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class DigitalTwinStatusView(DigitalTwinSkeletonView):
    message = "Dijital ikiz durum endpoint iskeleti hazır."

    def get(self, request, *args, **kwargs):
        twin = DigitalTwin.objects.filter(user=request.user).first()
        answers_count = SurveyAnswer.objects.filter(user=request.user).count()
        has_preferences = PartnerPreference.objects.filter(user=request.user).exists()
        return Response(
            {
                "is_ready": bool(twin and twin.is_active),
                "completion_score": twin.completion_score if twin else _calculate_completion_score(request.user),
                "answers_count": answers_count,
                "has_partner_preferences": has_preferences,
                "communication_style": twin.communication_style if twin else None,
            }
        )


SURVEY_QUESTIONS = [
    {"id": 1, "category": "values", "text": "Bir ilişkide en çok neye önem verirsin?"},
    {"id": 2, "category": "lifestyle", "text": "Hafta sonunu ideal olarak nasıl geçirirsin?"},
    {"id": 3, "category": "communication", "text": "Bir anlaşmazlıkta nasıl iletişim kurarsın?"},
    {"id": 4, "category": "future", "text": "Önümüzdeki 5 yıl için en önemli hedefin nedir?"},
]


def _serialize_answer(answer):
    return {
        "id": str(answer.id),
        "question_id": answer.question_id,
        "answer": answer.answer,
    }


def _serialize_preference(preference):
    if not preference:
        return None
    return {
        "id": str(preference.id),
        "age_min": preference.age_min,
        "age_max": preference.age_max,
        "preferred_city": preference.preferred_city,
        "preferred_education": preference.preferred_education,
        "smoking_preference": preference.smoking_preference,
        "children_preference": preference.children_preference,
    }


def _serialize_twin(twin):
    return {
        "id": str(twin.id),
        "communication_style": twin.communication_style,
        "system_prompt": twin.system_prompt,
        "personality_summary": twin.personality_summary,
        "completion_score": twin.completion_score,
        "is_active": twin.is_active,
    }


def _calculate_completion_score(user):
    answers_count = SurveyAnswer.objects.filter(user=user).count()
    has_preferences = PartnerPreference.objects.filter(user=user).exists()
    has_twin = DigitalTwin.objects.filter(user=user, is_active=True).exists()
    score = min(answers_count * 20, 60)
    if has_preferences:
        score += 20
    if has_twin:
        score += 20
    return min(score, 100)


def _infer_communication_style(answers):
    communication_answer = answers.filter(question_id=3).first()
    if not communication_answer:
        return "balanced"
    answer_text = str(communication_answer.answer).lower()
    if "açık" in answer_text or "direkt" in answer_text:
        return "direct"
    if "sakin" in answer_text or "dinlerim" in answer_text:
        return "empathetic"
    return "balanced"


def _extract_traits(answers):
    traits = []
    for answer in answers[:3]:
        answer_text = str(answer.answer)
        if answer_text:
            traits.append(answer_text[:32])
    return traits or ["uyumlu", "meraklı"]