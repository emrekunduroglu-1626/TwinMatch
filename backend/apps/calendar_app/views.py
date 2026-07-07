from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.matching.models import Match

from .models import Availability, ScheduledMeeting


def _serialize_availability(availability):
    return {
        "id": str(availability.id),
        "date": availability.date,
        "start_time": availability.start_time,
        "end_time": availability.end_time,
    }


def _serialize_meeting(meeting, current_user):
    match_user = meeting.match.user_b if meeting.match.user_a_id == current_user.id else meeting.match.user_a
    return {
        "id": str(meeting.id),
        "match_id": str(meeting.match_id),
        "date": meeting.date,
        "start_time": meeting.start_time,
        "end_time": meeting.end_time,
        "status": meeting.status,
        "created_by": str(meeting.created_by_id),
        "counterpart_user_id": str(match_user.id),
    }


class AvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        availabilities = Availability.objects.filter(user=request.user).order_by("date", "start_time")
        return Response({"items": [_serialize_availability(item) for item in availabilities], "count": availabilities.count()})

    def post(self, request, *args, **kwargs):
        date = request.data.get("date")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        if not date or not start_time or not end_time:
            return Response({"detail": "date, start_time ve end_time zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
        if start_time >= end_time:
            return Response({"detail": "start_time end_time'dan once olmalidir."}, status=status.HTTP_400_BAD_REQUEST)

        availability = Availability.objects.create(
            user=request.user,
            date=date,
            start_time=start_time,
            end_time=end_time,
        )
        return Response(_serialize_availability(availability), status=status.HTTP_201_CREATED)


class ScheduleMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        match = get_object_or_404(Match, id=kwargs["match_id"])
        if not match.involves_user(request.user):
            return Response({"detail": "Bu eslesme icin yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)
        if match.stage < Match.Stage.READY_TO_REVEAL:
            return Response({"detail": "Takvim planlama icin kimlik acilimi asamasina gelinmeli."}, status=status.HTTP_409_CONFLICT)

        date = request.data.get("date")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        if not date or not start_time or not end_time:
            return Response({"detail": "date, start_time ve end_time zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
        if start_time >= end_time:
            return Response({"detail": "start_time end_time'dan once olmalidir."}, status=status.HTTP_400_BAD_REQUEST)

        availability_exists = Availability.objects.filter(
            user=request.user,
            date=date,
            start_time__lte=start_time,
            end_time__gte=end_time,
        ).exists()
        if not availability_exists:
            return Response({"detail": "Secilen saat araligi uygunluk kaydinizla eslesmiyor."}, status=status.HTTP_400_BAD_REQUEST)

        counterpart = match.user_b if match.user_a_id == request.user.id else match.user_a
        counterpart_available = Availability.objects.filter(
            user=counterpart,
            date=date,
            start_time__lte=start_time,
            end_time__gte=end_time,
        ).exists()
        if not counterpart_available:
            return Response({"detail": "Karsi taraf bu saat araliginda musait degil."}, status=status.HTTP_409_CONFLICT)

        overlapping_meeting = ScheduledMeeting.objects.filter(
            match=match,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time,
            status="scheduled",
        ).exists()
        if overlapping_meeting:
            return Response({"detail": "Bu eslesme icin cakisan bir gorusme zaten var."}, status=status.HTTP_409_CONFLICT)

        meeting = ScheduledMeeting.objects.create(
            match=match,
            date=date,
            start_time=start_time,
            end_time=end_time,
            created_by=request.user,
            status="scheduled",
        )
        return Response(_serialize_meeting(meeting, request.user), status=status.HTTP_201_CREATED)


class UpcomingMeetingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        meetings = (
            ScheduledMeeting.objects.filter(status="scheduled")
            .filter(match__user_a=request.user)
            .select_related("match", "match__user_a", "match__user_b")
        )
        counterpart_meetings = (
            ScheduledMeeting.objects.filter(status="scheduled")
            .filter(match__user_b=request.user)
            .select_related("match", "match__user_a", "match__user_b")
        )
        ordered_meetings = sorted(list(meetings) + list(counterpart_meetings), key=lambda item: (item.date, item.start_time))
        return Response({"items": [_serialize_meeting(item, request.user) for item in ordered_meetings], "count": len(ordered_meetings)})