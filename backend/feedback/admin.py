from django.contrib import admin
from .models import Ward, Category, Department, CitizenFeedback, County, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email")


@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Ward)
class WardAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "county")
    list_filter = ("county",)
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)


@admin.register(CitizenFeedback)
class CitizenFeedbackAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "citizen_name",
        "ward",
        "category",
        "department",
        "priority",
        "priority_reviewed",
        "status",
        "allocated_budget",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
        "priority_reviewed",
        "category",
        "department",
        "ward__county",
        "ward",
    )

    search_fields = (
        "citizen_name",
        "feedback_text",
        "ai_summary",
    )

    ordering = ("-created_at",)