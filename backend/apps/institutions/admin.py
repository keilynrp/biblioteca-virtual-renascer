from django.contrib import admin
from .models import Institution, InstitutionMembership, InstitutionType


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display  = ('name', 'abbreviation', 'code', 'country', 'institution_type', 'ror_id', 'created_at')
    list_filter   = ('institution_type', 'country')
    search_fields = ('name', 'abbreviation', 'code', 'ror_id')
    readonly_fields = ('code', 'created_at', 'updated_at')
    fieldsets = (
        ('Identificación', {
            'fields': ('name', 'abbreviation', 'code', 'ror_id'),
            'description': (
                'El código estructurado (ej: AO-UNI-0001) se genera automáticamente '
                'al guardar si se deja vacío. El ROR ID permite vincular con el '
                'ecosistema académico global (ver ror.org).'
            ),
        }),
        ('Clasificación', {
            'fields': ('institution_type', 'country'),
        }),
        ('Información de contacto', {
            'fields': ('logo', 'website', 'address'),
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(InstitutionMembership)
class InstitutionMembershipAdmin(admin.ModelAdmin):
    list_display   = ('user', 'institution', 'role', 'status', 'joined_at')
    list_filter    = ('role', 'status')
    search_fields  = ('user__username', 'user__email', 'institution__name')
    raw_id_fields  = ('user', 'invited_by')
