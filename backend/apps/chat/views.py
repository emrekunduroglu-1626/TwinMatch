from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.models import Conversation
from apps.chat.services import ensure_conversation_for_match, seed_conversation_messages
from apps.matching.models import Match


class ConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        conversations = Conversation.objects.select_related("match", "twin_a", "twin_b").filter(
            Q(match__user_a=request.user) | Q(match__user_b=request.user)
        ).order_by("-updated_at")
        results = [
            {
                "id": str(conversation.id),
                "match_id": str(conversation.match_id),
                "status": conversation.status,
                "total_messages": conversation.total_messages,
                "updated_at": conversation.updated_at,
            }
            for conversation in conversations
        ]
        return Response({"count": len(results), "results": results})

    def post(self, request, *args, **kwargs):
        match_id = request.data.get("match_id")
        if not match_id:
            return Response({"detail": "match_id zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"detail": "Eşleşme bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not match.involves_user(request.user):
            return Response({"detail": "Bu eşleşmeye erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        try:
            conversation = ensure_conversation_for_match(match)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        seed_conversation_messages(conversation)
        return Response(
            {
                "detail": "Konuşma hazır.",
                "conversation": {
                    "id": str(conversation.id),
                    "match_id": str(conversation.match_id),
                    "status": conversation.status,
                    "total_messages": conversation.total_messages,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id, *args, **kwargs):
        try:
            conversation = Conversation.objects.select_related("match").get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"detail": "Konuşma bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if not conversation.match.involves_user(request.user):
            return Response({"detail": "Bu konuşmaya erişim izniniz yok."}, status=status.HTTP_403_FORBIDDEN)

        messages = conversation.messages.select_related("sender_twin").order_by("created_at")
        return Response(
            {
                "conversation_id": str(conversation.id),
                "count": messages.count(),
                "results": [
                    {
                        "id": str(message.id),
                        "sender_twin_id": str(message.sender_twin_id),
                        "content": message.content,
                        "message_type": message.message_type,
                        "created_at": message.created_at,
                    }
                    for message in messages
                ],
            }
        )