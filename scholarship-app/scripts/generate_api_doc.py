import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

def generate_pdf(filename="google_ads_api_design_document.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=54, leftMargin=54,
        topMargin=54, bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1a73e8'),
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#202124'),
        spaceBefore=15,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#3c4043'),
        spaceAfter=10
    )
    
    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#006600'),
        backColor=colors.HexColor('#f8f9fa'),
        borderColor=colors.HexColor('#dadce0'),
        borderWidth=1,
        borderPadding=8,
        spaceAfter=15
    )

    story = []

    # Title
    story.append(Paragraph("Google Ads API Design Document", title_style))
    story.append(Paragraph("Internal Tooling: Scholarship Search Volume Analysis", ParagraphStyle('Sub', fontName='Helvetica-Oblique', fontSize=10, spaceAfter=20)))
    story.append(Spacer(1, 10))

    # Section 1: Overview
    story.append(Paragraph("1. Tool Overview", h2_style))
    story.append(Paragraph(
        "This document describes a custom, internal command-line tool built to perform keyword research for the "
        "India Scholarships portal. The tool accesses the Google Ads API's <b>KeywordPlanIdeaService</b> to "
        "retrieve search volumes, competition levels, and bidding ranges for educational and financial aid queries.",
        body_style
    ))

    # Section 2: Access & Users
    story.append(Paragraph("2. Audience & User Access", h2_style))
    story.append(Paragraph(
        "<b>Access Level:</b> Internal Users Only.<br/>"
        "The tool is structured as a command-line script run directly by internal developers. There is no external-facing "
        "user interface, public dashboard, or client access. All configurations and generated CSV reports are "
        "stored securely on local workstations.",
        body_style
    ))

    # Section 3: Technical Architecture
    story.append(Paragraph("3. Technical Flow & API Services", h2_style))
    story.append(Paragraph(
        "The tool utilizes the official <b>google-ads</b> Python SDK. It reads credentials (Client ID, Client Secret, "
        "Refresh Token, and Developer Token) from a secure, local <i>google-ads.yaml</i> file.",
        body_style
    ))
    
    # Grid of details
    data = [
        [Paragraph("<b>API Service</b>", body_style), Paragraph("<b>Usage</b>", body_style)],
        [Paragraph("KeywordPlanIdeaService", body_style), Paragraph("Queries Google's keyword database to generate suggestions and historical metrics.", body_style)],
        [Paragraph("GeoTargetConstantService", body_style), Paragraph("Restricts queries to India (Geo ID: 2356) to ensure localization.", body_style)]
    ]
    t = Table(data, colWidths=[150, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f3f4')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dadce0')),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Section 4: Implementation Code Structure
    story.append(Paragraph("4. Core Request Structure (Snippet)", h2_style))
    snippet = (
        "def fetch_keywords(client, customer_id, keywords):\n"
        "    service = client.get_service('KeywordPlanIdeaService')\n"
        "    request = client.get_type('GenerateKeywordIdeasRequest')\n"
        "    request.customer_id = customer_id\n"
        "    request.language = 'customers/{id}/languages/1000' # English\n"
        "    request.geo_target_constants.append('customers/{id}/geoTargetConstants/2356') # India\n"
        "    request.keyword_and_url_seed.keywords.extend(keywords)\n"
        "    \n"
        "    response = service.generate_keyword_ideas(request=request)\n"
        "    return response"
    )
    story.append(Paragraph(snippet.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # Build PDF
    doc.build(story)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    generate_pdf()
