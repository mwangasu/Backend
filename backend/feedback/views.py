import logging
import re

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.shortcuts import render
from django.utils import timezone
from rest_framework import serializers as drf_serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .services.gemma import analyze_feedback
from .models import Ward, Category, CitizenFeedback, Department, County, UserProfile
from .permissions import IsAdmin, IsOfficial, IsStaff, ReadOnlyOrAdminWrite, has_min_role, user_role
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    WardSerializer,
    CategorySerializer,
    CitizenFeedbackSerializer,
    AnalyzeFeedbackSerializer,
    CountySerializer,

)

logger = logging.getLogger(__name__)
User = get_user_model()


class CountyViewSet(viewsets.ModelViewSet):
    permission_classes = [ReadOnlyOrAdminWrite]
    queryset = County.objects.all()
    serializer_class = CountySerializer


class WardViewSet(viewsets.ModelViewSet):
    permission_classes = [ReadOnlyOrAdminWrite]
    queryset = Ward.objects.all()
    serializer_class = WardSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        county_id = self.request.query_params.get("county")

        if county_id:
            queryset = queryset.filter(county_id=county_id)

        return queryset


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [ReadOnlyOrAdminWrite]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CitizenFeedbackViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaff]
    queryset = CitizenFeedback.objects.all().order_by("-created_at")
    serializer_class = CitizenFeedbackSerializer

    def get_permissions(self):
        # Reviewing the AI's priority call and permanently deleting a case
        # are admin-or-above powers. Approving a budget is official-only.
        # Everyday case handling (status/notes) is open to any staff member.
        if self.action in ["confirm_priority", "decline_priority", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        if self.action == "approve_case":
            return [IsAuthenticated(), IsOfficial()]
        return super().get_permissions()

    @action(detail=True, methods=["post"])
    def confirm_priority(self, request, pk=None):
        """Admin+ agrees with the AI's priority tag as-is."""
        feedback = self.get_object()
        feedback.priority_reviewed = True
        feedback.reviewed_by = request.user
        feedback.save()
        return Response(self.get_serializer(feedback).data)

    @action(detail=True, methods=["post"])
    def decline_priority(self, request, pk=None):
        """Admin+ overrides the AI's priority tag (e.g. downgrades a false-positive High)."""
        feedback = self.get_object()
        new_priority = request.data.get("priority")

        if new_priority not in dict(CitizenFeedback.PRIORITY_CHOICES):
            return Response(
                {"error": "priority must be one of Low, Medium, High."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        feedback.priority = new_priority
        feedback.priority_reviewed = True
        feedback.reviewed_by = request.user
        feedback.save()
        return Response(self.get_serializer(feedback).data)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Staff+ can mark day-to-day progress. Declining a report outright
        is admin-or-above; final "Approved" funding decisions go through
        approve_case instead, since that requires budget/timeline/reason."""
        feedback = self.get_object()
        new_status = request.data.get("status")
        notes = request.data.get("resolution_notes")

        if new_status not in dict(CitizenFeedback.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status == "Approved":
            return Response(
                {"error": "Use the approve_case action to approve a case with a budget, timeline, and reason."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status == "Declined" and not has_min_role(request.user, "admin"):
            return Response(
                {"error": "Only admins can decline a report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        feedback.status = new_status

        if notes is not None:
            feedback.resolution_notes = notes

        feedback.reviewed_by = request.user
        feedback.save()
        return Response(self.get_serializer(feedback).data)

    @action(detail=True, methods=["post"])
    def approve_case(self, request, pk=None):
        """Government Official's final sign-off: allocates a budget and
        timeline and records why, then moves the case to Approved."""
        feedback = self.get_object()

        budget = request.data.get("budget")
        timeline = (request.data.get("timeline") or "").strip()
        reason = (request.data.get("reason") or "").strip()

        if not budget or not timeline or not reason:
            return Response(
                {"error": "budget, timeline, and reason are all required to approve a case."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            budget = float(budget)
            if budget <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"error": "budget must be a positive number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        feedback.status = "Approved"
        feedback.allocated_budget = budget
        feedback.estimated_completion = timeline
        feedback.decision_reason = reason
        feedback.approved_by = request.user
        feedback.approved_at = timezone.now()
        feedback.reviewed_by = request.user
        feedback.save()
        return Response(self.get_serializer(feedback).data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        return Response({
            "username": user.username,
            "email": user.email,
            "role": user_role(user),
            "national_id": profile.national_id if profile else None,
            "phone_number": profile.phone_number if profile else "",
        })


class RegisterView(APIView):
    """Public self-registration for citizens (Guest role).

    Citizens log in with their National ID rather than a self-chosen
    username, so a submitted report can actually be traced back to and
    followed up with a real person, instead of whatever name/contact they
    felt like typing."""

    permission_classes = [AllowAny]

    NATIONAL_ID_RE = re.compile(r"^\d{6,10}$")
    PHONE_RE = re.compile(r"^(?:\+254|0)\d{9}$")

    def post(self, request):
        national_id = (request.data.get("national_id") or "").strip()
        phone_number = (request.data.get("phone_number") or "").strip()
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not national_id or not phone_number or not password:
            return Response(
                {"error": "national_id, phone_number, and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self.NATIONAL_ID_RE.match(national_id):
            return Response(
                {"error": "Enter a valid National ID number (6-10 digits)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self.PHONE_RE.match(phone_number):
            return Response(
                {"error": "Enter a valid phone number, e.g. 0712345678 or +254712345678."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=national_id).exists():
            return Response(
                {"error": "An account with this National ID already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # The National ID doubles as the login username - Django's own
        # unique constraint on username is what enforces "one account per ID".
        user = User.objects.create_user(username=national_id, email=email, password=password)
        UserProfile.objects.update_or_create(
            user=user,
            defaults={"national_id": national_id, "phone_number": phone_number},
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "role": user_role(user),
            },
            status=status.HTTP_201_CREATED,
        )


class StaffUserSerializer(drf_serializers.ModelSerializer):
    role = drf_serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "date_joined"]
        read_only_fields = ["id", "date_joined"]

    def get_role(self, obj):
        return user_role(obj)


class UserViewSet(viewsets.ModelViewSet):
    """Admin-or-above management of staff/admin/official login accounts."""

    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = StaffUserSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def create(self, request, *args, **kwargs):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        role = request.data.get("role", "staff")

        if role not in ["staff", "admin", "official"]:
            return Response(
                {"error": "role must be one of staff, admin, official."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not username or not password:
            return Response(
                {"error": "username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "That username is already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=(role in ["admin", "official"]),
        )
        UserProfile.objects.update_or_create(user=user, defaults={"role": role})

        return Response(
            StaffUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        target = self.get_object()

        if target.id == request.user.id:
            return Response(
                {"error": "You can't remove your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user_role(target) == "official" and User.objects.filter(profile__role="official").count() <= 1:
            return Response(
                {"error": "Can't remove the last remaining Government Official account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)


class AnalyzeFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AnalyzeFeedbackSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            ward = Ward.objects.get(id=data["ward"])
        except Ward.DoesNotExist:
            return Response(
                {"error": "That ward could not be found. Please pick a ward again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai = analyze_feedback(data["feedback_text"])
        except Exception:
            logger.exception("AI feedback analysis failed")
            return Response(
                {"error": "AI analysis is temporarily unavailable. Please try again in a moment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        category, _ = Category.objects.get_or_create(
            name=ai["category"]
        )
        department, _ = Department.objects.get_or_create(
            name=ai["department"]
        )
        feedback = CitizenFeedback.objects.create(
            citizen_name=data.get("citizen_name", ""),
            submitted_by=request.user,
            ward=ward,
            feedback_text=data["feedback_text"],
            category=category,
            priority=ai["priority"],
            ai_summary=ai["summary"],
            recommendation=ai["recommendation"],
            department=department,
            action_plan="\n".join(ai["action_plan"]),
        )

        return Response(
            CitizenFeedbackSerializer(feedback, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):

        # Declined reports (rejected as invalid/spam) don't count toward the
        # active caseload metrics.
        queryset = CitizenFeedback.objects.exclude(status="Declined")

        county_id = request.query_params.get("county")

        if county_id:
            queryset = queryset.filter(ward__county_id=county_id)

        total_feedback = queryset.count()

        high_priority = queryset.filter(priority="High").count()
        medium_priority = queryset.filter(priority="Medium").count()
        low_priority = queryset.filter(priority="Low").count()

        categories = [
            {
                "name": item["category__name"],
                "count": item["total"]
            }
            for item in (
                queryset
                .values("category__name")
                .annotate(total=Count("id"))
                .order_by("-total")
            )
        ]
        wards = [
            {
                "name": item["ward__name"],
                "count": item["total"]
            }
            for item in (
                queryset
                .values("ward__name")
                .annotate(total=Count("id"))
                .order_by("-total")
            )
        ]
        departments = [
            {
                "name": item["department__name"],
                "count": item["total"]
            }
            for item in (
                queryset
                .values("department__name")
                .annotate(total=Count("id"))
                .order_by("-total")
            )
        ]

        return Response({
            "total_feedback": total_feedback,
            "high_priority": high_priority,
            "medium_priority": medium_priority,
            "low_priority": low_priority,
            "categories": categories,
            "wards": wards,
            "departments": departments,
        })


class RecentFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        feedback = (
            CitizenFeedback.objects
            .select_related("ward", "ward__county", "category", "department")
            .order_by("-created_at")
        )

        county_id = request.query_params.get("county")

        if county_id:
            feedback = feedback.filter(ward__county_id=county_id)

        can_see_names = has_min_role(request.user, "admin")

        data = []

        for item in feedback[:10]:
            data.append({
                "id": item.id,
                "citizen_name": (
                    item.citizen_name if can_see_names
                    else ("Withheld (Admin only)" if item.citizen_name else "")
                ),
                "ward": item.ward.name,
                "county": item.ward.county.name if item.ward.county else "",
                "category": item.category.name,
                "priority": item.priority,
                "priority_reviewed": item.priority_reviewed,
                "status": item.status,
                "summary": item.ai_summary,
                "created_at": item.created_at,
                "department": item.department.name if item.department else "",
            })

        return Response(data)