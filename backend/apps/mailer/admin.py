from django import forms
from django.contrib import admin
from .models import SMTPConfig, EmailLog, EmailTemplate
from .services import encrypt_password


class SMTPConfigAdminForm(forms.ModelForm):
    password_plain = forms.CharField(
        label='Contraseña',
        required=False,
        widget=forms.PasswordInput(render_value=False),
        help_text='Escribe la nueva contraseña para actualizarla. Déjala en blanco para conservar la actual.',
    )

    class Meta:
        model = SMTPConfig
        exclude = ['password_encrypted']

    def save(self, commit=True):
        instance = super().save(commit=False)
        plain = self.cleaned_data.get('password_plain', '').strip()
        if plain:
            instance.password_encrypted = encrypt_password(plain)
        if commit:
            instance.save()
        return instance


@admin.register(SMTPConfig)
class SMTPConfigAdmin(admin.ModelAdmin):
    form = SMTPConfigAdminForm
    list_display = ['host', 'port', 'username', 'from_email', 'is_active', 'updated_at']
    readonly_fields = ['updated_at']


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
