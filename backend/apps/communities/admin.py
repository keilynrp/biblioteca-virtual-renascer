from django.contrib import admin
from .models import ReadingClub, ClubMembership, DiscussionThread, Post

class MembershipInline(admin.TabularInline):
    model = ClubMembership
    extra = 1
    raw_id_fields = ('user',)

@admin.register(ReadingClub)
class ReadingClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'is_private', 'created_at', 'get_members_count')
    list_filter = ('is_private', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MembershipInline]
    
    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = "Miembros"

@admin.register(DiscussionThread)
class DiscussionThreadAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'author', 'posts_count', 'is_pinned', 'created_at')
    list_filter = ('is_pinned', 'is_locked', 'created_at')
    search_fields = ('title', 'club__name')
    raw_id_fields = ('author', 'club', 'book')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'author', 'created_at')
    search_fields = ('content', 'author__username')
    raw_id_fields = ('author', 'thread')
