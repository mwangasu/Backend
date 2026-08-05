from io import BytesIO
from datetime import datetime
import os

from django.conf import settings
from django.http import FileResponse

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)

from .models import CitizenFeedback
PRIMARY = colors.HexColor("#0F4C81")
SECONDARY = colors.HexColor("#2563EB")
LIGHT = colors.HexColor("#F8FAFC")
HEADER = colors.HexColor("#E8F1FB")
BORDER = colors.HexColor("#D1D5DB")
TEXT = colors.HexColor("#374151")
SUCCESS = colors.HexColor("#16A34A")
WARNING = colors.HexColor("#D97706")
DANGER = colors.HexColor("#DC2626")
styles = getSampleStyleSheet()

TITLE_STYLE = ParagraphStyle(
    "TitleStyle",
    parent=styles["Title"],
    alignment=TA_CENTER,
    textColor=PRIMARY,
    fontSize=24,
    spaceAfter=10,
)

SUBTITLE_STYLE = ParagraphStyle(
    "SubtitleStyle",
    parent=styles["Heading2"],
    alignment=TA_CENTER,
    textColor=TEXT,
    fontSize=13,
    spaceAfter=18,
)

SECTION_STYLE = ParagraphStyle(
    "SectionStyle",
    parent=styles["Heading2"],
    textColor=PRIMARY,
    fontSize=15,
    spaceBefore=16,
    spaceAfter=8,
)

BODY_STYLE = ParagraphStyle(
    "BodyStyle",
    parent=styles["BodyText"],
    textColor=TEXT,
    fontSize=10,
    leading=16,
)
def build_header(elements):
    logo_path = os.path.join(
        settings.BASE_DIR,
        "assets",
        "logo.png",
    )

    if os.path.exists(logo_path):
        logo = Image(
            logo_path,
            width=0.9 * inch,
            height=0.9 * inch,
        )
        logo.hAlign = "CENTER"
        elements.append(logo)

    elements.append(
        Paragraph(
            "CIVICLENS AI",
            TITLE_STYLE,
        )
    )

    elements.append(
        Paragraph(
            "Citizen Intelligence Report",
            SUBTITLE_STYLE,
        )
    )

    elements.append(
        Paragraph(
            "AI-Powered County Decision Support Platform",
            BODY_STYLE,
        )
    )

    elements.append(
        Paragraph(
            f"Generated on: {datetime.now().strftime('%d %B %Y %I:%M %p')}",
            BODY_STYLE,
        )
    )

    elements.append(Spacer(1, 0.3 * inch))
   
class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        buffer = BytesIO()

        doc = SimpleDocTemplate(
    buffer,
    rightMargin=40,
    leftMargin=40,
    topMargin=40,
    bottomMargin=30,
) 

        styles = getSampleStyleSheet()

        elements = []

        build_header(elements)

        total = CitizenFeedback.objects.count()

        high = CitizenFeedback.objects.filter(priority="High").count()

        medium = CitizenFeedback.objects.filter(priority="Medium").count()

        low = CitizenFeedback.objects.filter(priority="Low").count()

        elements.append(
            Paragraph(
                "Executive Summary",
                SECTION_STYLE,
            )
        )

        summary = [
            ["Metric", "Value"],
            ["Total Citizen Reports", total],
            ["High Priority Cases", high],
            ["Medium Priority Cases", medium],
            ["Low Priority Cases", low],
        ]

        table = Table(summary, colWidths=[280, 120])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, 1), (-1, -1), LIGHT),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 11),
            ("ALIGN", (1, 1), (1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 10),
        ]))

        elements.append(table)

        elements.append(Spacer(1, 25))
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
            priority_colour = SUCCESS

            if report.priority == "High":
                priority_colour = DANGER
            elif report.priority == "Medium":
                priority_colour = WARNING

            report_table = Table([
    [
        Paragraph("<b>Category</b>", BODY_STYLE),
        Paragraph(report.category.name, BODY_STYLE),
    ],
    [
        Paragraph("<b>Ward</b>", BODY_STYLE),
        Paragraph(report.ward.name, BODY_STYLE),
    ],
    [
        Paragraph("<b>Priority</b>", BODY_STYLE),
        Paragraph(
            f'<font color="{priority_colour}"><b>{report.priority}</b></font>',
            BODY_STYLE,
        ),
    ],
    [
        Paragraph("<b>Summary</b>", BODY_STYLE),
        Paragraph(report.ai_summary, BODY_STYLE),
    ],
    [
        Paragraph("<b>Recommendation</b>", BODY_STYLE),
        Paragraph(report.recommendation, BODY_STYLE),
    ],
], colWidths=[120, 350])

            report_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), HEADER),
                ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (1, 2), (1, 2), priority_colour),
                ("FONTNAME", (1, 2), (1, 2), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("BACKGROUND", (1, 0), (1, -1), colors.white),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))

            elements.append(report_table)
            elements.append(Spacer(1, 18))

        doc.build(elements)

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"CivicLens_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
        )