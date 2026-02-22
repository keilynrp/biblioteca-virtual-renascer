from io import BytesIO


def generate_invoice_pdf(invoice) -> BytesIO:
    # Lazy imports so a missing reportlab package only breaks the download
    # endpoint, not the entire Django startup / URL conf loading.
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    """
    Generate a PDF invoice in memory using ReportLab.
    Returns a BytesIO object positioned at the start.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor('#4F46E5')
    muted_color = colors.HexColor('#6B7280')

    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=primary_color,
        spaceAfter=2 * mm,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=muted_color,
        spaceAfter=1 * mm,
    )
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=9,
        textColor=muted_color,
    )
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=10,
    )
    right_style = ParagraphStyle(
        'Right',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_RIGHT,
    )

    story = []

    # Header
    story.append(Paragraph('INVOICE', title_style))
    story.append(Paragraph('BVS Biblioteca Virtual', subtitle_style))
    story.append(Spacer(1, 6 * mm))

    # Invoice metadata table
    issued_date = invoice.issued_at.strftime('%B %d, %Y') if invoice.issued_at else '—'
    status_text = invoice.get_status_display()

    meta_data = [
        ['Invoice Number:', invoice.invoice_number, 'Status:', status_text],
        ['Date Issued:', issued_date, '', ''],
    ]
    meta_table = Table(meta_data, colWidths=[40 * mm, 60 * mm, 30 * mm, 40 * mm])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), muted_color),
        ('TEXTCOLOR', (2, 0), (2, -1), muted_color),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6 * mm))

    # "Billed To" section
    story.append(Paragraph('BILLED TO', label_style))
    story.append(Spacer(1, 1 * mm))
    story.append(Paragraph(invoice.billing_name or '—', value_style))
    if invoice.billing_address:
        for line in invoice.billing_address.split(','):
            line = line.strip()
            if line:
                story.append(Paragraph(line, subtitle_style))
    story.append(Spacer(1, 8 * mm))

    # Line items table
    table_data = [
        ['Description', 'Amount'],
    ]
    description = invoice.description or 'Subscription'
    amount_str = f'{invoice.currency} {invoice.amount:,.2f}'
    table_data.append([description, amount_str])

    col_widths = [doc.width - 50 * mm, 50 * mm]
    items_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4 * mm),
        ('TOPPADDING', (0, 0), (-1, 0), 4 * mm),
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3 * mm),
        ('TOPPADDING', (0, 1), (-1, -1), 3 * mm),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.HexColor('#E5E7EB')),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4 * mm))

    # Total row
    total_data = [['', 'TOTAL', f'{invoice.currency} {invoice.amount:,.2f}']]
    total_table = Table(total_data, colWidths=[doc.width - 90 * mm, 40 * mm, 50 * mm])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('TEXTCOLOR', (1, 0), (1, 0), muted_color),
        ('TOPPADDING', (0, 0), (-1, -1), 2 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2 * mm),
    ]))
    story.append(total_table)

    # Refund notice
    if invoice.status == 'REFUNDED' and invoice.refunded_at:
        story.append(Spacer(1, 6 * mm))
        refunded_date = invoice.refunded_at.strftime('%B %d, %Y')
        story.append(Paragraph(
            f'<font color="#EF4444"><b>REFUNDED</b></font> on {refunded_date}',
            styles['Normal'],
        ))

    doc.build(story)
    buffer.seek(0)
    return buffer
