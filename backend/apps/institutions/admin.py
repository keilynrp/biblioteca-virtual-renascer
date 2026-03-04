from django.contrib import admin
from .models import Institution, InstitutionMembership


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'website', 'created_at')
    search_fields = ('name', 'code')


@admin.register(InstitutionMembership)
class InstitutionMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'role', 'status', 'joined_at')
    list_filter = ('role', 'status')
    search_fields = ('user__username', 'user__email', 'institution__name')
    raw_id_fields = ('user', 'invited_by')
