from __future__ import annotations

from dataclasses import dataclass

from django.db.models import Q

from apps.matching.models import CompatibilityReport, Match
from apps.profiles.models import Profile


@dataclass
class CandidateResult:
    user_id: str
    profile_id: str
    display_name: str
    city: str
    age: int | None
    overall_score: float
    stage_1_score: float
    stage_2_score: float
    stage_3_score: float
    reasons: list[str]


def calculate_age(profile: Profile) -> int | None:
    if not profile.birth_date:
        return None
    today = profile.birth_date.today()
    return today.year - profile.birth_date.year - (
        (today.month, today.day) < (profile.birth_date.month, profile.birth_date.day)
    )


def _normalize_score(value: float, max_value: float) -> float:
    if max_value <= 0:
        return 0.0
    return max(0.0, min(1.0, value / max_value))


def _preference_score(source: Profile, candidate: Profile) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0

    preference = getattr(source.user, "partner_preference", None)
    candidate_age = calculate_age(candidate)
    if preference and candidate_age is not None:
        if preference.age_min <= candidate_age <= preference.age_max:
            score += 0.35
            reasons.append("yaş tercihi uyumlu")
        if preference.preferred_city and preference.preferred_city.lower() == candidate.city.lower():
            score += 0.25
            reasons.append("şehir tercihi uyumlu")
        if preference.preferred_education and preference.preferred_education.lower() == candidate.education.lower():
            score += 0.2
            reasons.append("eğitim tercihi uyumlu")
        if preference.smoking_preference and preference.smoking_preference.lower() == candidate.smoking.lower():
            score += 0.1
            reasons.append("sigara tercihi uyumlu")
        if preference.children_preference and preference.children_preference.lower() == candidate.wants_children.lower():
            score += 0.1
            reasons.append("çocuk tercihi uyumlu")
    else:
        if source.city.lower() == candidate.city.lower():
            score += 0.5
            reasons.append("aynı şehir")
        if source.education.lower() == candidate.education.lower():
            score += 0.3
            reasons.append("benzer eğitim")
        if source.smoking.lower() == candidate.smoking.lower():
            score += 0.2
            reasons.append("yaşam tarzı benzer")

    return round(score * 100, 2), reasons


def _profile_similarity_score(source: Profile, candidate: Profile) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0

    if source.city.lower() == candidate.city.lower():
        score += 0.3
        reasons.append("aynı şehirde")
    if source.zodiac_sign.lower() == candidate.zodiac_sign.lower():
        score += 0.15
        reasons.append("aynı burç")
    if source.marital_status.lower() == candidate.marital_status.lower():
        score += 0.15
        reasons.append("ilişki beklentisi benzer")
    if source.wants_children.lower() == candidate.wants_children.lower():
        score += 0.2
        reasons.append("aile planı benzer")

    height_gap = abs(source.height - candidate.height)
    score += (1 - _normalize_score(height_gap, 40)) * 0.2
    if height_gap <= 10:
        reasons.append("fiziksel tercih aralığında")

    return round(score * 100, 2), reasons


def _twin_readiness_score(source: Profile, candidate: Profile) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0

    source_twin = getattr(source.user, "digital_twin", None)
    candidate_twin = getattr(candidate.user, "digital_twin", None)
    if source_twin and candidate_twin:
        completion_gap = abs(source_twin.completion_score - candidate_twin.completion_score)
        score += (1 - _normalize_score(completion_gap, 100)) * 0.5
        reasons.append("dijital ikiz olgunluğu yakın")

        if source_twin.communication_style.lower() == candidate_twin.communication_style.lower():
            score += 0.3
            reasons.append("iletişim tarzı benzer")

        if source_twin.is_active and candidate_twin.is_active:
            score += 0.2
            reasons.append("iki dijital ikiz de aktif")
    else:
        score += 0.2
        reasons.append("temel profil verisi mevcut")

    return round(score * 100, 2), reasons


def build_candidate_results(user, limit: int = 10) -> list[CandidateResult]:
    source_profile = user.profile
    existing_match_ids = Match.objects.filter(Q(user_a=user) | Q(user_b=user)).values_list("user_a_id", "user_b_id")
    excluded_ids = {user.id}
    for user_a_id, user_b_id in existing_match_ids:
        excluded_ids.add(user_a_id)
        excluded_ids.add(user_b_id)

    candidates = (
        Profile.objects.select_related("user")
        .exclude(user_id__in=excluded_ids)
        .filter(onboarding_completed=True, user__is_active=True)
    )

    results: list[CandidateResult] = []
    for candidate in candidates:
        stage_1_score, reasons_1 = _preference_score(source_profile, candidate)
        stage_2_score, reasons_2 = _profile_similarity_score(source_profile, candidate)
        stage_3_score, reasons_3 = _twin_readiness_score(source_profile, candidate)
        overall_score = round((stage_1_score * 0.45) + (stage_2_score * 0.35) + (stage_3_score * 0.20), 2)
        results.append(
            CandidateResult(
                user_id=str(candidate.user_id),
                profile_id=str(candidate.id),
                display_name=candidate.display_name,
                city=candidate.city,
                age=calculate_age(candidate),
                overall_score=overall_score,
                stage_1_score=stage_1_score,
                stage_2_score=stage_2_score,
                stage_3_score=stage_3_score,
                reasons=(reasons_1 + reasons_2 + reasons_3)[:5],
            )
        )

    results.sort(key=lambda item: item.overall_score, reverse=True)
    return results[:limit]


def create_match_from_candidate(source_user, target_user) -> Match:
    source_profile = source_user.profile
    target_profile = target_user.profile

    stage_1_score, _ = _preference_score(source_profile, target_profile)
    stage_2_score, _ = _profile_similarity_score(source_profile, target_profile)
    stage_3_score, _ = _twin_readiness_score(source_profile, target_profile)
    overall_score = round((stage_1_score * 0.45) + (stage_2_score * 0.35) + (stage_3_score * 0.20), 2)

    user_a, user_b = sorted([source_user, target_user], key=lambda item: str(item.id))
    match, created = Match.objects.get_or_create(
        user_a=user_a,
        user_b=user_b,
        defaults={
            "stage": Match.Stage.CANDIDATE,
            "status": Match.Status.ACTIVE,
            "stage_1_score": stage_1_score,
            "stage_2_score": stage_2_score,
            "stage_3_score": stage_3_score,
            "overall_score": overall_score,
        },
    )
    if not created:
        match.stage_1_score = stage_1_score
        match.stage_2_score = stage_2_score
        match.stage_3_score = stage_3_score
        match.overall_score = overall_score
        if match.status == Match.Status.PENDING:
            match.status = Match.Status.ACTIVE
        match.save(update_fields=["stage_1_score", "stage_2_score", "stage_3_score", "overall_score", "status", "updated_at"])
    return match


def advance_match(match: Match) -> Match:
    if match.stage == Match.Stage.CANDIDATE:
        match.stage = Match.Stage.TWIN_CHAT
        match.status = Match.Status.ACTIVE
    elif match.stage == Match.Stage.TWIN_CHAT:
        match.stage = Match.Stage.READY_TO_REVEAL
        match.status = Match.Status.COMPLETED
    elif match.stage == Match.Stage.READY_TO_REVEAL:
        match.stage = Match.Stage.REVEALED
        match.status = Match.Status.REVEALED
    match.save(update_fields=["stage", "status", "updated_at"])
    return match


def ensure_compatibility_report(match: Match) -> CompatibilityReport:
    overall = match.overall_score or 0
    defaults = {
        "communication_score": round(min(100.0, (match.stage_3_score or overall) * 0.95), 2),
        "character_score": round(min(100.0, (match.stage_2_score or overall) * 0.92), 2),
        "lifestyle_score": round(min(100.0, (match.stage_2_score or overall) * 0.88), 2),
        "values_score": round(min(100.0, (match.stage_1_score or overall) * 0.9), 2),
        "career_score": round(min(100.0, overall * 0.84), 2),
        "hobbies_score": round(min(100.0, overall * 0.8), 2),
        "detailed_analysis": {
            "summary": "Profil, tercih ve dijital ikiz verileri üzerinden otomatik uyumluluk özeti üretildi.",
            "strengths": [
                "öncelikli tercih alanlarında kesişim",
                "iletişim tarzı ve dijital ikiz hazırlığı",
            ],
            "risks": [
                "gerçek görüşme öncesi beklenti doğrulaması gerekli",
            ],
        },
    }
    report, _ = CompatibilityReport.objects.get_or_create(match=match, defaults=defaults)
    return report