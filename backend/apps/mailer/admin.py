from django.contrib import admin
from .models import SMTPConfig, EmailLog, EmailTemplate


@admin.register(SMTPConfig)
class SMTPConfigAdmin(admin.ModelAdmin):
    list_display = ['host', 'port', 'username', 'from_email', 'is_active', 'updated_at']
    readonly_fields = ['password_encrypted', 'updated_at']


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'subject', 'template_key', 'status', 'sent_at']
    list_filter = ['status', 'template_key']
    search_fields = ['recipient', 'subject']
    readonly_fields = ['id', 'recipient', 'subject', 'template_key', 'status', 'error_message', 'sent_at']


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['key', 'subject', 'is_active', 'updated_at']
    list_filter = ['is_active']
