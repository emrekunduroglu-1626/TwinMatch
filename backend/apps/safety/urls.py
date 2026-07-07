from rest_framework.routers import DefaultRouter

from .views import UserBlockViewSet, UserReportViewSet

router = DefaultRouter()
router.register("blocks", UserBlockViewSet, basename="safety-blocks")
router.register("reports", UserReportViewSet, basename="safety-reports")

urlpatterns = router.urls
