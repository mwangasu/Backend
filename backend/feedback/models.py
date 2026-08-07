from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("guest", "Guest"),
        ("staff", "Staff"),
        ("admin", "Admin"),
        ("official", "Government Official"),
    ]

    # Rank order for "at least this role" checks - higher number = more access.
    ROLE_RANK = {"guest": 0, "staff": 1, "admin": 2, "official": 3}

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="guest")

    # Citizens (Guest role) register and log in with their National ID
    # rather than a self-chosen username, so reports can be traced back to
    # a real, reachable person instead of unverifiable free-text details.
    national_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class County(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Counties"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Ward(models.Model):
    name = models.CharField(max_length=100)
    county = models.ForeignKey(
        County,
        on_delete=models.CASCADE,
        related_name="wards",
        null=True,
    )

    class Meta:
        unique_together = ("county", "name")
        ordering = ["county__name", "name"]

    def __str__(self):
        return f"{self.name} ({self.county})" if self.county else self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CitizenFeedback(models.Model):

    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Pending Approval", "Pending Approval"),
        ("Approved", "Approved"),
        ("Resolved", "Resolved"),
        ("Declined", "Declined"),
    ]

    citizen_name = models.CharField(max_length=100, blank=True)

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_feedback",
    )

    ward = models.ForeignKey(
        Ward,
        on_delete=models.CASCADE,
    )

    feedback_text = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedbacks",
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="Medium",
    )

    ai_summary = models.TextField(blank=True)
    recommendation = models.TextField(blank=True)
    action_plan = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Open",
    )

    resolution_notes = models.TextField(blank=True)

    # Whether an admin has reviewed the AI-assigned priority tag - either
    # confirming it or overriding `priority` to something else.
    priority_reviewed = models.BooleanField(default=False)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_feedback",
    )

    # Government Official's final decision on funding this case.
    allocated_budget = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        help_text="Budget allocated in KES.",
    )
    estimated_completion = models.CharField(
        max_length=100, blank=True,
        help_text="Free-form timeframe, e.g. '3 months', 'Q2 2027'.",
    )
    decision_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_feedback",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ward} - {self.priority}"