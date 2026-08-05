from django.contrib import admin
from .models import Ward, Category, Department, CitizenFeedback


@admin.register(Ward)
class WardAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
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
        "created_at",
    )

    list_filter = (
        "priority",
        "category",
        "department",
        "ward",
    )

    search_fields = (
        "citizen_name",
        "feedback_text",
        "ai_summary",
    )

    ordering = ("-created_at",)