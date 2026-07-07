from django.urls import path

from .views import (
    CommunicationStyleView,
    CreateDigitalTwinView,
    DigitalTwinStatusView,
    PartnerPreferencesView,
    SurveyAnswersView,
    SurveyQuestionsView,
)


urlpatterns = [
    path("survey/questions/", SurveyQuestionsView.as_view(), name="digital-twin-survey-questions"),
    path("survey/answers/", SurveyAnswersView.as_view(), name="digital-twin-survey-answers"),
    path("partner-preferences/", PartnerPreferencesView.as_view(), name="digital-twin-partner-preferences"),
    path("communication-style/", CommunicationStyleView.as_view(), name="digital-twin-communication-style"),
    path("create/", CreateDigitalTwinView.as_view(), name="digital-twin-create"),
    path("status/", DigitalTwinStatusView.as_view(), name="digital-twin-status"),
]