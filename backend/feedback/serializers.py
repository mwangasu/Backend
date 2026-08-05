from rest_framework import serializers  
from .models import Ward, Category, CitizenFeedback,Department


class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class CitizenFeedbackSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source="ward.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = CitizenFeedback
        fields = [
    "id",
    "citizen_name",
    "ward",
    "ward_name",
    "feedback_text",
    "category",
    "category_name",
    "priority",
    "ai_summary",
    "recommendation",
    "department",
    "department_name",
    "action_plan",
    "created_at",
]
        
class AnalyzeFeedbackSerializer(serializers.Serializer):
    citizen_name = serializers.CharField(required=False, allow_blank=True)
    ward = serializers.IntegerField()
    feedback_text = serializers.CharField()