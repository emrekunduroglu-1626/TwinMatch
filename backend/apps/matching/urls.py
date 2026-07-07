from django.urls import path

from .views import CandidatesView, InitiateMatchView, MatchHistoryView, MatchProcessView, MatchReportView, RevealMatchView


urlpatterns = [
    path("candidates/", CandidatesView.as_view(), name="matching-candidates"),
    path("initiate/<uuid:user_id>/", InitiateMatchView.as_view(), name="matching-initiate"),
    path("process/<uuid:match_id>/", MatchProcessView.as_view(), name="matching-process"),
    path("report/<uuid:match_id>/", MatchReportView.as_view(), name="matching-report"),
    path("reveal/<uuid:match_id>/", RevealMatchView.as_view(), name="matching-reveal"),
    path("history/", MatchHistoryView.as_view(), name="matching-history"),
]