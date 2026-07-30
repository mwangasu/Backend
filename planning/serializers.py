from rest_framework import serializers

from .models import ConstituentFeedback, PlanningSubmission


class PlanningSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanningSubmission
        fields = [
            'id',
            'constituency_name',
            'development_goal',
            'priority_area',
            'budget_estimate',
            'created_at',
        ]


class ConstituentFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConstituentFeedback
        fields = ['id', 'submission', 'feedback_text', 'sentiment', 'created_at']
        read_only_fields = ['submission', 'sentiment', 'created_at']
