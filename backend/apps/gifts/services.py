from __future__ import annotations

import re
from typing import Iterable

from django.db.models import Q
from django.utils import timezone

from apps.calendar_app.models import ScheduledMeeting
from apps.gifts.models import AddressVault, GiftSetting
from apps.matching.models import Match
from apps.subscriptions.models import Subscription

TIER_RANK = {"gold": 1, "platinum": 2}
ALLOWED_SUPPLIERS = {"amazon", "ciceksepeti"}

# İletişim/adres bilgisi sızıntısını azaltan MVP moderasyon filtresi.
# Production'da bu katman bir moderasyon servisi + insan incelemesiyle güçlendirilmeli.
BANNED_NOTE_PATTERNS: Iterable[re.Pattern[str]] = [
    re.compile(r"\b0?5\d{2}[\s.\-/]?\d{3}[\s.\-/]?\d{2}[\s.\-/]?\d{2}\b", re.IGNORECASE),
    re.compile(r"\b\+?\d{1,3}[\s.\-/]?(?:\(?\d{2,4}\)?[\s.\-/]?){2,5}\d{2,4}\b", re.IGNORECASE),
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
    re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE),
    re.compile(r"(?<!\w)@[A-Z0-9._]{3,30}\b", re.IGNORECASE),
    re.compile(r"\b(?:instagram|insta|ig|telegram|tg|whatsapp|wp|x|twitter|tiktok|snapchat|dm|direct message|özelden|numaram|mailim)\b[^\n,.!?;]{0,60}", re.IGNORECASE),
    re.compile(r"\b\d{5}\b"),
    re.compile(r"\b(?:mahalle|mah\.?|sokak|sok\.?|cadde|cad\.?|apartman|apt\.?|no\s*[:#]?\s*\d+|daire\s*[:#]?\s*\d+)\b[^\n,.!?;]{0,80}", re.IGNORECASE),
]


def get_sender_gift_tier(user) -> str | None:
    """Aktif aboneliğe göre hediye gönderim seviyesini döner.

    Plus -> gold, Premium -> platinum. Basic/Freemium veya abonelik yoksa None.
    """
    now = timezone.now()
    plan = (
        Subscription.objects.filter(user=user, status=Subscription.Status.ACTIVE, expires_at__gte=now)
        .order_by("-expires_at")
        .values_list("plan", flat=True)
        .first()
    )
    if plan == Subscription.Plan.PREMIUM:
        return "platinum"
    if plan == Subscription.Plan.PLUS:
        return "gold"
    return None


def user_has_gift_access(user) -> bool:
    return get_sender_gift_tier(user) is not None


def sender_tier_allows_product(sender_tier: str | None, product_tier_required: str) -> bool:
    if sender_tier is None:
        return False
    return TIER_RANK.get(sender_tier, 0) >= TIER_RANK.get(product_tier_required, 0)


def can_sender_send_gifts(sender) -> tuple[bool, str]:
    if not user_has_gift_access(sender):
        return False, "Anonim hediye özelliği Gold ve Platinum üyelere özeldir."
    setting = GiftSetting.objects.filter(user=sender).first()
    if not setting or not setting.can_send:
        return False, "Hediye gönderme ayarın kapalı."
    return True, ""


def can_receiver_accept_from_sender(receiver, sender) -> tuple[bool, str]:
    setting = GiftSetting.objects.filter(user=receiver).first()
    if not setting or not setting.can_receive:
        return False, "Alıcı hediye almayı açmamış."

    if setting.blocked_senders.filter(id=sender.id).exists():
        return False, "Gönderen bu alıcı tarafından engellenmiş."

    # Genel güvenlik bloğu varsa hediye akışını da kes.
    try:
        from apps.safety.models import UserBlock

        if UserBlock.objects.filter(blocker=receiver, blocked=sender).exists():
            return False, "Gönderen bu alıcı tarafından engellenmiş."
    except Exception:
        pass

    if setting.receive_from == GiftSetting.ReceiveFrom.NOBODY:
        return False, "Alıcı kimseden hediye kabul etmiyor."

    match_qs = Match.objects.filter(
        (Q(user_a=sender) & Q(user_b=receiver)) | (Q(user_a=receiver) & Q(user_b=sender))
    )

    if setting.receive_from == GiftSetting.ReceiveFrom.MATCHES_ONLY:
        if not match_qs.exists():
            return False, "Alıcı sadece eşleşmelerinden hediye kabul ediyor."
        return True, ""

    if setting.receive_from == GiftSetting.ReceiveFrom.APPROVED_ONLY:
        if not match_qs.filter(stage__gte=Match.Stage.READY_TO_REVEAL).exists():
            return False, "Alıcı sadece onayladığı eşleşmelerden hediye kabul ediyor."
        return True, ""

    if setting.receive_from == GiftSetting.ReceiveFrom.AFTER_FIRST_DATE:
        match_ids = match_qs.values_list("id", flat=True)
        first_date_happened = ScheduledMeeting.objects.filter(
            match_id__in=match_ids, date__lt=timezone.now().date()
        ).exists()
        if not first_date_happened:
            return False, "Alıcı ilk buluşma sonrası hediye kabul ediyor."
        return True, ""

    return False, "Bilinmeyen hediye izin ayarı."


def address_vault_is_ready(user) -> tuple[bool, str]:
    vault = AddressVault.objects.filter(user=user).first()
    if not vault:
        return False, "Hediyeyi kabul etmek için adres kasasını tamamlamalısın."
    required_fields = [vault.address_line1, vault.city, vault.district, vault.postal_code, vault.phone_masked]
    if any(not str(value).strip() for value in required_fields):
        return False, "Adres kasası eksik. Adres, şehir, ilçe, posta kodu ve maskeli telefon zorunludur."
    if not vault.is_verified:
        return False, "Hediyeyi kabul etmek için adres kasası doğrulanmış olmalı."
    return True, ""


def moderate_gift_note(note: str) -> tuple[str, bool]:
    """Anonimliği bozabilecek kişisel iletişim/adres bilgisini maskeler."""
    if not note:
        return "", True

    cleaned = str(note)[:500]
    changed = False
    for pattern in BANNED_NOTE_PATTERNS:
        cleaned, count = pattern.subn("***", cleaned)
        changed = changed or count > 0
    cleaned = re.sub(r"\*{4,}", "***", cleaned)
    return cleaned.strip(), not changed
