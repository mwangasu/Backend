from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ConstituentFeedback, PlanningSubmission
from .serializers import ConstituentFeedbackSerializer, PlanningSubmissionSerializer
from .utils import build_report, infer_sentiment


class SubmitPlanningView(APIView):
    def post(self, request):
        serializer = PlanningSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DashboardView(APIView):
    def get(self, request):
        submissions = PlanningSubmission.objects.all()
        serializer = PlanningSubmissionSerializer(submissions, many=True)
        return Response({'submissions': serializer.data}, status=status.HTTP_200_OK)


class GenerateReportView(APIView):
    def get(self, request, submission_id):
        submission = get_object_or_404(PlanningSubmission, id=submission_id)
        feedback_items = submission.feedback.all()
        report = build_report(submission, feedback_items)
        return Response(report, status=status.HTTP_200_OK)


class AnalyzeFeedbackView(APIView):
    def post(self, request):
        submission_id = request.data.get('submission_id')
        submission = get_object_or_404(PlanningSubmission, id=submission_id)
        feedback_text = request.data.get('feedback_text', '')
        feedback = ConstituentFeedback.objects.create(
            submission=submission,
            feedback_text=feedback_text,
            sentiment=infer_sentiment(feedback_text),
        )
        serializer = ConstituentFeedbackSerializer(feedback)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
