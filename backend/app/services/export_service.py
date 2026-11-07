import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.models.incident import Incident

class IncidentExportService:
    def generate_pdf_report(self, incident: Incident) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom dark & high contrast typography for enterprise PDF
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#080B12'),
            fontName='Helvetica-Bold'
        )
        
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#315CFF'),
            fontName='Helvetica-Bold',
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#1E293B'),
            fontName='Helvetica'
        )

        code_style = ParagraphStyle(
            'CodeBlock',
            parent=styles['Code'],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#0F172A'),
            fontName='Courier',
            backColor=colors.HexColor('#F1F5F9'),
            borderPadding=6
        )

        elements = []

        # Header Title
        elements.append(Paragraph("RECALLX AI — INCIDENT POSTMORTEM REPORT", title_style))
        elements.append(Paragraph(f"<b>Title:</b> {incident.title}", h2_style))
        elements.append(Spacer(1, 8))

        # Metadata Table
        meta_data = [
            [
                Paragraph("<b>Incident ID:</b>", body_style), Paragraph(str(incident.id), body_style),
                Paragraph("<b>Severity:</b>", body_style), Paragraph(str(incident.severity), body_style)
            ],
            [
                Paragraph("<b>Status:</b>", body_style), Paragraph(str(incident.status), body_style),
                Paragraph("<b>Verified Fix:</b>", body_style), Paragraph("Yes (Confirmed)" if incident.is_verified else "No", body_style)
            ],
            [
                Paragraph("<b>Affected Services:</b>", body_style), Paragraph(", ".join(incident.affected_services or []), body_style),
                Paragraph("<b>Hindsight Sync:</b>", body_style), Paragraph("Synchronized" if incident.hindsight_synced else "Local Bank", body_style)
            ],
            [
                Paragraph("<b>Detected At:</b>", body_style), Paragraph(incident.created_at.strftime('%Y-%m-%d %H:%M UTC'), body_style),
                Paragraph("<b>Resolved At:</b>", body_style), Paragraph(incident.resolved_at.strftime('%Y-%m-%d %H:%M UTC') if incident.resolved_at else "Ongoing", body_style)
            ]
        ]
        t = Table(meta_data, colWidths=[100, 170, 100, 170])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 14))

        # Symptoms & Impact
        elements.append(Paragraph("1. Incident Summary & Observed Symptoms", h2_style))
        elements.append(Paragraph(incident.description or "No description provided.", body_style))
        elements.append(Spacer(1, 10))

        # Root Cause
        elements.append(Paragraph("2. Root Cause Analysis", h2_style))
        elements.append(Paragraph(incident.root_cause or "Analysis in progress.", body_style))
        elements.append(Spacer(1, 10))

        # Verified Resolution & Preventative Fix
        elements.append(Paragraph("3. Resolution & Historical Preventative Measure", h2_style))
        verified_text = incident.verified_resolution or incident.resolution_steps or "Resolution pending."
        elements.append(Paragraph(verified_text, body_style))
        elements.append(Spacer(1, 10))

        # Error Logs Excerpt
        if incident.error_logs:
            elements.append(Paragraph("4. Captured Telemetry & Error Signatures", h2_style))
            escaped_logs = incident.error_logs[:1200].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            elements.append(Paragraph(escaped_logs.replace("\n", "<br/>"), code_style))
            elements.append(Spacer(1, 10))

        # Footer
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94A3B8'), spaceBefore=20, spaceAfter=10))
        elements.append(Paragraph("Generated by RECALLX AI Memory Agent • Persistent Memory powered by Hindsight", ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#64748B'),
            alignment=1
        )))

        doc.build(elements)
        buffer.seek(0)
        return buffer

export_service = IncidentExportService()
