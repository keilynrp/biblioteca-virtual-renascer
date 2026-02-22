from django.contrib import admin
from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display  = ('title', 'slug', 'page_type', 'is_published', 'updated_at')
    list_filter   = ('page_type', 'is_published')
    search_fields = ('title', 'slug')
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title',)}
