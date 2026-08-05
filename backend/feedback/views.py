from django.db.models import Count
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .services.gemma import analyze_feedback
from .models import Ward, Category, CitizenFeedback, Department
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    WardSerializer,
    CategorySerializer,
    CitizenFeedbackSerializer,
    AnalyzeFeedbackSerializer,

)


class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CitizenFeedbackViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CitizenFeedback.objects.all().order_by("-created_at")
    serializer_class = CitizenFeedbackSerializer


class AnalyzeFeedbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = AnalyzeFeedbackSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        ai = analyze_feedback(data["feedback_text"])

        ward = Ward.objects.get(id=data["ward"])

        category, _ = Category.objects.get_or_create(
            name=ai["category"]
        )
        department, _ = Department.objects.get_or_create(
            name=ai["department"]
        )
        feedback = CitizenFeedback.objects.create(
            citizen_name=data.get("citizen_name", ""),
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
            CitizenFeedbackSerializer(feedback).data,
            status=status.HTTP_201_CREATED,
        )
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_feedback = CitizenFeedback.objects.count()

        high_priority = CitizenFeedback.objects.filter(priority="High").count()
        medium_priority = CitizenFeedback.objects.filter(priority="Medium").count()
        low_priority = CitizenFeedback.objects.filter(priority="Low").count()

        categories = [
            {
                "name": item["category__name"],
                "count": item["total"]
            }
            for item in (
                CitizenFeedback.objects
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
                CitizenFeedback.objects
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
                CitizenFeedback.objects
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        feedback = (
            CitizenFeedback.objects
            .select_related("ward", "category", "department")
            .order_by("-created_at")[:10]
        )

        data = []

        for item in feedback:
            data.append({
                "id": item.id,
                "citizen_name": item.citizen_name,
                "ward": item.ward.name,
                "category": item.category.name,
                "priority": item.priority,
                "summary": item.ai_summary,
                "created_at": item.created_at,
                "department": item.department.name if item.department else "",
            })

        return Response(data)