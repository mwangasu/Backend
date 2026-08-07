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
    CountyViewSet,
    MeView,
    RegisterView,
    UserViewSet,
)

router = DefaultRouter()

router.register(r"counties", CountyViewSet)
router.register(r"wards", WardViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"feedback", CitizenFeedbackViewSet)
router.register(r"users", UserViewSet)

urlpatterns = router.urls + [
    path(
        "analyze/",
        AnalyzeFeedbackView.as_view(),
        name="analyze-feedback",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
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