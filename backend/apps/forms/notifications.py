import logging
from apps.mailer.services import send_email

logger = logging.getLogger(__name__)


def send_form_notification(form, submission):
    """Send email to all active notification recipients for a form."""
    recipients = form.notification_recipients.filter(is_active=True)
    if not recipients.exists():
        return

    subject = f'[BVS] Nueva respuesta: {form.title}'

    # Plain text
    lines = [f'Se recibió una nueva respuesta en el formulario "{form.title}".\n']
    for key, value in submission.data.items():
        lines.append(f'{key}: {value}')
    if submission.file_uploads:
        lines.append('\nArchivos adjuntos:')
        for label, path in submission.file_uploads.items():
            lines.append(f'  - {label}: {path}')
    lines.append(f'\nFecha: {submission.created_at}')
    lines.append(f'IP: {submission.ip_address or "N/A"}')
    body_text = '\n'.join(lines)

    # HTML
    rows = ''.join(
        f'<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">{k}</td>'
        f'<td style="padding:8px;border:1px solid #ddd">{v}</td></tr>'
        for k, v in submission.data.items()
    )
    body_html = (
        f'<h2 style="color:#00576F">Nueva respuesta: {form.title}</h2>'
        f'<table style="border-collapse:collapse;width:100%">{rows}</table>'
        f'<p style="color:#666;margin-top:16px">IP: {submission.ip_address or "N/A"} '
        f'| Fecha: {submission.created_at}</p>'
    )

    for recipient in recipients:
        ok = send_email(
            to=recipient.email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            template_key='form_submission',
        )
        if not ok:
            logger.warning(
                'Failed to send form notification to %s for form %s',
                recipient.email, form.title,
            )
