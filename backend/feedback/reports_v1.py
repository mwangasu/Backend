from io import BytesIO

from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from .models import CitizenFeedback
class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph(
                "<b>CivicLens AI</b>",
                styles["Title"]
            )
        )

        elements.append(
            Paragraph(
                "Citizen Feedback Analytics Report",
                styles["Heading2"]
            )
        )

        elements.append(Spacer(1, 20))

        total = CitizenFeedback.objects.count()

        high = CitizenFeedback.objects.filter(priority="High").count()

        medium = CitizenFeedback.objects.filter(priority="Medium").count()

        low = CitizenFeedback.objects.filter(priority="Low").count()

        summary = [
            ["Metric", "Count"],
            ["Total Reports", total],
            ["High Priority", high],
            ["Medium Priority", medium],
            ["Low Priority", low],
        ]

        table = Table(summary)

        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1D4ED8")),
            ("TEXTCOLOR",(0,0),(-1,0),colors.white),
            ("GRID",(0,0),(-1,-1),1,colors.grey),
            ("BOTTOMPADDING",(0,0),(-1,0),12),
            ("BACKGROUND",(0,1),(-1,-1),colors.whitesmoke),
        ]))

        elements.append(table)

        elements.append(Spacer(1,30))
        elements.append(
            Paragraph(
                "Recent High Priority Reports",
                styles["Heading2"]
            )
        )

        elements.append(Spacer(1,12))

        reports = (
            CitizenFeedback.objects
            .select_related("ward","category")
            .order_by("-created_at")[:10]
        )

        for report in reports:

            elements.append(
                Paragraph(
                    f"<b>{report.category.name}</b> | {report.priority}",
                    styles["Heading3"]
                )
            )

            elements.append(
                Paragraph(
                    f"Ward: {report.ward.name}",
                    styles["Normal"]
                )
            )

            elements.append(
                Paragraph(
                    f"Summary: {report.ai_summary}",
                    styles["Normal"]
                )
            )

            elements.append(
                Paragraph(
                    f"Recommendation: {report.recommendation}",
                    styles["Normal"]
                )
            )

            elements.append(Spacer(1,16))
            doc.build(elements)

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename="CivicLens_Report.pdf"
        )