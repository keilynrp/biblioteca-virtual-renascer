from django.contrib import admin
from .models import NavZone, NavItem


class NavItemInline(admin.TabularInline):
    model = NavItem
    extra = 1
    fields = ('label', 'url', 'item_type', 'order', 'is_visible', 'parent')
    fk_name = 'zone'


@admin.register(NavZone)
class NavZoneAdmin(admin.ModelAdmin):
    list_display  = ('label', 'location', 'order')
    list_filter   = ('location',)
    search_fields = ('label',)
    inlines       = [NavItemInline]


@admin.register(NavItem)
class NavItemAdmin(admin.ModelAdmin):
    list_display  = ('label', 'url', 'zone', 'item_type', 'order', 'is_visible')
    list_filter   = ('zone', 'item_type', 'is_visible')
    search_fields = ('label', 'url')
