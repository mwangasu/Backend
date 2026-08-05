from django.urls import path
from rest_framework.routers import DefaultRouter

from .reports import ExportPDFView

from .views import (
    AnalyzeFeedbackView,
    DashboardView,
    RecentFeedbackView,
    WardViewSet,
    CategoryViewSet,
    CitizenFeedbackViewSet,
)

router = DefaultRouter()

router.register(r"wards", WardViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"feedback", CitizenFeedbackViewSet)

urlpatterns = router.urls + [
    path(
        "analyze/",
        AnalyzeFeedbackView.as_view(),
        name="analyze-feedback",
    ),

    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard",
    ),

    path(
        "recent/",
        RecentFeedbackView.as_view(),
        name="recent-feedback",
    ),

    path(
        "reports/pdf/",
        ExportPDFView.as_view(),
        name="export-pdf",
    ),
]