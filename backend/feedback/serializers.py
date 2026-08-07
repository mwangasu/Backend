from rest_framework import serializers
from .models import Ward, Category, CitizenFeedback, Department, County
from .permissions import has_min_role


class CountySerializer(serializers.ModelSerializer):
    class Meta:
        model = County
        fields = "__all__"


class WardSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source="county.name", read_only=True)

    class Meta:
        model = Ward
        fields = ["id", "name", "county", "county_name"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class CitizenFeedbackSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source="ward.name", read_only=True)
    county_name = serializers.CharField(source="ward.county.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.username", read_only=True, default=None)
    approved_by_name = serializers.CharField(source="approved_by.username", read_only=True, default=None)
    citizen_name = serializers.SerializerMethodField()

    def get_citizen_name(self, obj):
        # Citizen identity is only visible to admin-or-above - everyone else
        # sees a redacted placeholder so the case can still be worked
        # without PII spreading to every staff account.
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if has_min_role(user, "admin"):
            return obj.citizen_name

        if user and user.is_authenticated and obj.submitted_by_id == user.id:
            return obj.citizen_name

        return "Withheld (Admin only)" if obj.citizen_name else ""

    class Meta:
        model = CitizenFeedback
        fields = [
    "id",
    "citizen_name",
    "ward",
    "ward_name",
    "county_name",
    "feedback_text",
    "category",
    "category_name",
    "priority",
    "priority_reviewed",
    "ai_summary",
    "recommendation",
    "department",
    "department_name",
    "action_plan",
    "status",
    "resolution_notes",
    "reviewed_by_name",
    "allocated_budget",
    "estimated_completion",
    "decision_reason",
    "approved_by_name",
    "approved_at",
    "created_at",
    "updated_at",
]
        read_only_fields = [
            "priority_reviewed", "reviewed_by_name", "updated_at",
            "allocated_budget", "estimated_completion", "decision_reason",
            "approved_by_name", "approved_at",
        ]


class AnalyzeFeedbackSerializer(serializers.Serializer):
    citizen_name = serializers.CharField(required=False, allow_blank=True)
    ward = serializers.IntegerField()
    feedback_text = serializers.CharField()
