from django.db import models

from apps.digital_twin.models import DigitalTwin
from apps.matching.models import Match
from common.models import BaseModel


class Conversation(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="conversations")
    twin_a = models.ForeignKey(DigitalTwin, on_delete=models.CASCADE, related_name="conversations_as_a")
    twin_b = models.ForeignKey(DigitalTwin, on_delete=models.CASCADE, related_name="conversations_as_b")
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.ACTIVE)
    total_messages = models.IntegerField(default=0)


class Message(BaseModel):
    class MessageType(models.TextChoices):
        TEXT = "text", "Text"
        SYSTEM = "system", "System"

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender_twin = models.ForeignKey(DigitalTwin, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    message_type = models.CharField(max_length=32, choices=MessageType.choices, default=MessageType.TEXT)