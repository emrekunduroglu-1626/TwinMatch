from __future__ import annotations

from apps.chat.models import Conversation, Message
from apps.matching.models import Match


def ensure_conversation_for_match(match: Match) -> Conversation:
    twin_a = getattr(match.user_a, "digital_twin", None)
    twin_b = getattr(match.user_b, "digital_twin", None)
    if twin_a is None or twin_b is None:
        raise ValueError("Konuşma başlatmak için iki kullanıcıda da dijital ikiz bulunmalı.")

    conversation, _ = Conversation.objects.get_or_create(
        match=match,
        defaults={
            "twin_a": twin_a,
            "twin_b": twin_b,
            "status": Conversation.Status.ACTIVE,
        },
    )
    return conversation


def seed_conversation_messages(conversation: Conversation) -> None:
    if conversation.messages.exists():
        return

    opening_messages = [
        (
            conversation.twin_a,
            "Merhaba, ortak değerlerimiz ve iletişim tarzımız üzerinden seni tanımak isterim.",
        ),
        (
            conversation.twin_b,
            "Ben de aynı şekilde düşünüyorum. Önce günlük yaşam ritmimizi ve beklentilerimizi konuşalım.",
        ),
        (
            conversation.twin_a,
            "Harika, uzun vadeli uyum ve şehir planlarımız da güçlü bir eşleşme sinyali veriyor.",
        ),
    ]

    for sender_twin, content in opening_messages:
        Message.objects.create(conversation=conversation, sender_twin=sender_twin, content=content)

    conversation.total_messages = len(opening_messages)
    conversation.save(update_fields=["total_messages", "updated_at"])