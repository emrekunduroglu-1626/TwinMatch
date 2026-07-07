from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import serializers

from apps.chat.models import Conversation, Message
from apps.digital_twin.models import DigitalTwin
from apps.matching.models import CompatibilityReport, Match
from apps.profiles.models import Profile
from apps.subscriptions.models import Payment, Subscription
from apps.verification.models import VerificationRecord
try:
    from apps.safety.models import UserReport
except Exception:
    UserReport = None


User = get_user_model()


class AdminDashboardSerializer(serializers.Serializer):
    users_total = serializers.IntegerField()
    users_active = serializers.IntegerField()
    users_verified = serializers.IntegerField()
    profiles_completed = serializers.IntegerField()
    digital_twins_active = serializers.IntegerField()
    matches_total = serializers.IntegerField()
    matches_active = serializers.IntegerField()
    matches_revealed = serializers.IntegerField()
    conversations_total = serializers.IntegerField()
    messages_total = serializers.IntegerField()
    subscriptions_active = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_reports = serializers.IntegerField()


class AdminUserListSerializer(serializers.ModelSerializer):
    profile_completed = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    active_subscription_plan = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "is_active",
            "is_staff",
            "is_phone_verified",
            "is_age_confirmed",
            "date_joined",
            "last_login",
            "profile_completed",
            "verification_status",
            "active_subscription_plan",
        ]

    def get_profile_completed(self, obj):
        profile = getattr(obj, "profile", None)
        return bool(profile and profile.onboarding_completed)

    def get_verification_status(self, obj):
        record = getattr(obj, "verification_record", None)
        return record.status if record else "missing"

    def get_active_subscription_plan(self, obj):
        now = timezone.now()
        subscription = (
            obj.subscriptions.filter(status=Subscription.Status.ACTIVE, expires_at__gte=now)
            .order_by("-expires_at")
            .first()
        )
        return subscription.plan if subscription else None


class AdminUserDetailSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    verification = serializers.SerializerMethodField()
    digital_twin = serializers.SerializerMethodField()
    subscriptions = serializers.SerializerMethodField()
    match_summary = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "is_active",
            "is_staff",
            "is_phone_verified",
            "is_age_confirmed",
            "date_joined",
            "last_login",
            "profile",
            "verification",
            "digital_twin",
            "subscriptions",
            "match_summary",
        ]

    def get_profile(self, obj):
        profile = getattr(obj, "profile", None)
        if not profile:
            return None
        return {
            "display_name": profile.display_name,
            "city": profile.city,
            "occupation": profile.occupation,
            "education": profile.education,
            "gender": profile.gender,
            "onboarding_completed": profile.onboarding_completed,
            "photo_count": profile.photos.count(),
            "has_video": hasattr(profile, "video"),
        }

    def get_verification(self, obj):
        record = getattr(obj, "verification_record", None)
        if not record:
            return None
        return {
            "status": record.status,
            "confidence_score": record.confidence_score,
            "failure_reason": record.failure_reason,
            "verified_at": record.verified_at,
        }

    def get_digital_twin(self, obj):
        twin = getattr(obj, "digital_twin", None)
        if not twin:
            return None
        return {
            "communication_style": twin.communication_style,
            "completion_score": twin.completion_score,
            "is_active": twin.is_active,
        }

    def get_subscriptions(self, obj):
        return [
            {
                "plan": subscription.plan,
                "status": subscription.status,
                "is_annual": subscription.is_annual,
                "started_at": subscription.started_at,
                "expires_at": subscription.expires_at,
            }
            for subscription in obj.subscriptions.order_by("-created_at")[:5]
        ]

    def get_match_summary(self, obj):
        matches = Match.objects.filter(Q(user_a=obj) | Q(user_b=obj))
        return {
            "total": matches.count(),
            "active": matches.filter(status=Match.Status.ACTIVE).count(),
            "revealed": matches.filter(status=Match.Status.REVEALED).count(),
        }


class AdminUserStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()


class AdminMatchSerializer(serializers.Serializer):
    total_matches = serializers.IntegerField()
    active_matches = serializers.IntegerField()
    completed_matches = serializers.IntegerField()
    revealed_matches = serializers.IntegerField()
    average_overall_score = serializers.FloatField()
    stage_breakdown = serializers.DictField(child=serializers.IntegerField())
    top_pairs = serializers.ListField(child=serializers.DictField())


class AdminSubscriptionSerializer(serializers.Serializer):
    active_subscriptions = serializers.IntegerField()
    annual_subscriptions = serializers.IntegerField()
    plan_breakdown = serializers.DictField(child=serializers.IntegerField())
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_status_breakdown = serializers.DictField(child=serializers.IntegerField())


class AdminReportSerializer(serializers.Serializer):
    pending_user_reports = serializers.IntegerField()
    pending_verifications = serializers.IntegerField()
    rejected_verifications = serializers.IntegerField()
    incomplete_profiles = serializers.IntegerField()
    inactive_digital_twins = serializers.IntegerField()
    low_score_matches = serializers.IntegerField()


def build_dashboard_payload():
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = (
        Payment.objects.filter(status=Payment.Status.PAID, created_at__gte=month_start)
        .aggregate(total=Count("id"))
    )
    paid_amount = (
        Payment.objects.filter(status=Payment.Status.PAID, created_at__gte=month_start)
        .values_list("amount", flat=True)
    )
    revenue_total = sum(paid_amount) if paid_amount else 0
    return {
        "users_total": User.objects.count(),
        "users_active": User.objects.filter(is_active=True).count(),
        "users_verified": VerificationRecord.objects.filter(status=VerificationRecord.Status.APPROVED).count(),
        "profiles_completed": Profile.objects.filter(onboarding_completed=True).count(),
        "digital_twins_active": DigitalTwin.objects.filter(is_active=True).count(),
        "matches_total": Match.objects.count(),
        "matches_active": Match.objects.filter(status=Match.Status.ACTIVE).count(),
        "matches_revealed": Match.objects.filter(status=Match.Status.REVEALED).count(),
        "conversations_total": Conversation.objects.count(),
        "messages_total": Message.objects.count(),
        "subscriptions_active": Subscription.objects.filter(status=Subscription.Status.ACTIVE, expires_at__gte=now).count(),
        "monthly_revenue": revenue_total,
        "pending_reports": (UserReport.objects.filter(status=UserReport.Status.OPEN).count() if UserReport else 0) + VerificationRecord.objects.filter(status=VerificationRecord.Status.PENDING).count(),
    }


def build_match_payload():
    stage_breakdown = {
        str(item["stage"]): item["count"]
        for item in Match.objects.values("stage").annotate(count=Count("id")).order_by("stage")
    }
    top_pairs = [
        {
            "match_id": item.id,
            "user_a": item.user_a.email,
            "user_b": item.user_b.email,
            "overall_score": item.overall_score,
            "status": item.status,
        }
        for item in Match.objects.select_related("user_a", "user_b").order_by("-overall_score")[:5]
    ]
    scores = [score for score in Match.objects.values_list("overall_score", flat=True) if score is not None]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0
    return {
        "total_matches": Match.objects.count(),
        "active_matches": Match.objects.filter(status=Match.Status.ACTIVE).count(),
        "completed_matches": Match.objects.filter(status=Match.Status.COMPLETED).count(),
        "revealed_matches": Match.objects.filter(status=Match.Status.REVEALED).count(),
        "average_overall_score": average_score,
        "stage_breakdown": stage_breakdown,
        "top_pairs": top_pairs,
    }


def build_subscription_payload():
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    plan_breakdown = {
        item["plan"]: item["count"]
        for item in Subscription.objects.filter(status=Subscription.Status.ACTIVE, expires_at__gte=now)
        .values("plan")
        .annotate(count=Count("id"))
    }
    payment_status_breakdown = {
        item["status"]: item["count"]
        for item in Payment.objects.values("status").annotate(count=Count("id"))
    }
    paid_amount = (
        Payment.objects.filter(status=Payment.Status.PAID, created_at__gte=month_start)
        .values_list("amount", flat=True)
    )
    revenue_total = sum(paid_amount) if paid_amount else 0
    return {
        "active_subscriptions": Subscription.objects.filter(status=Subscription.Status.ACTIVE, expires_at__gte=now).count(),
        "annual_subscriptions": Subscription.objects.filter(
            status=Subscription.Status.ACTIVE,
            expires_at__gte=now,
            is_annual=True,
        ).count(),
        "plan_breakdown": plan_breakdown,
        "monthly_revenue": revenue_total,
        "payment_status_breakdown": payment_status_breakdown,
    }


def build_report_payload():
    return {
        "pending_user_reports": UserReport.objects.filter(status=UserReport.Status.OPEN).count() if UserReport else 0,
        "pending_verifications": VerificationRecord.objects.filter(status=VerificationRecord.Status.PENDING).count(),
        "rejected_verifications": VerificationRecord.objects.filter(status=VerificationRecord.Status.REJECTED).count(),
        "incomplete_profiles": Profile.objects.filter(onboarding_completed=False).count(),
        "inactive_digital_twins": DigitalTwin.objects.filter(is_active=False).count(),
        "low_score_matches": Match.objects.filter(overall_score__lt=50).count(),
    }