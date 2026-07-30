from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import ConstituentFeedback, PlanningSubmission


class PlanningApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_submit_and_dashboard_endpoints(self):
        response = self.client.post(
            reverse('submit-planning'),
            {
                'constituency_name': 'North District',
                'development_goal': 'Improve water access',
                'priority_area': 'Infrastructure',
                'budget_estimate': '250000.00',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(PlanningSubmission.objects.count(), 1)

        dashboard_response = self.client.get(reverse('dashboard'))
        self.assertEqual(dashboard_response.status_code, 200)
        self.assertGreaterEqual(len(dashboard_response.json()['submissions']), 1)

    def test_feedback_analysis_and_report_generation(self):
        submission = PlanningSubmission.objects.create(
            constituency_name='South District',
            development_goal='Expand clinics',
            priority_area='Health',
            budget_estimate='120000.00',
        )
        ConstituentFeedback.objects.create(submission=submission, feedback_text='This is a great initiative for health support.')
        ConstituentFeedback.objects.create(submission=submission, feedback_text='There are concerns about delays and poor access.')

        feedback_response = self.client.post(
            reverse('analyze-feedback'),
            {'submission_id': submission.id, 'feedback_text': 'The plan is helpful and promising.'},
            format='json',
        )
        self.assertEqual(feedback_response.status_code, 201)

        report_response = self.client.get(reverse('generate-report', kwargs={'submission_id': submission.id}))
        self.assertEqual(report_response.status_code, 200)
        self.assertIn('summary', report_response.json())
