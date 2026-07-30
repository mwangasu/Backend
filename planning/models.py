from django.db import models


class PlanningSubmission(models.Model):
    constituency_name = models.CharField(max_length=255)
    development_goal = models.CharField(max_length=500)
    priority_area = models.CharField(max_length=255)
    budget_estimate = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.constituency_name} - {self.priority_area}"


class ConstituentFeedback(models.Model):
    submission = models.ForeignKey(PlanningSubmission, related_name='feedback', on_delete=models.CASCADE)
    feedback_text = models.TextField()
    sentiment = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.feedback_text[:80]
