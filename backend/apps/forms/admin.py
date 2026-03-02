from django.contrib import admin
from .models import Form, FormField, FormSubmission, FormNotificationRecipient


class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 0
    ordering = ['order']


class FormNotificationRecipientInline(admin.TabularInline):
    model = FormNotificationRecipient
    extra = 0


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'status', 'version', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('uuid', 'version', 'field_snapshots', 'created_at', 'updated_at')
    inlines = [FormFieldInline, FormNotificationRecipientInline]


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'form', 'form_version', 'is_spam', 'is_read', 'created_at')
    list_filter = ('is_spam', 'is_read', 'form')
    search_fields = ('uuid',)
    readonly_fields = ('uuid', 'form', 'form_version', 'data', 'file_uploads',
                       'ip_address', 'user_agent', 'submitted_by', 'created_at')
