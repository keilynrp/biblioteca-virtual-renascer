from rest_framework import serializers
from .models import ReadingClub, ClubMembership, DiscussionThread, Post
from apps.content.models import Book
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar')

class ClubMembershipSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = ClubMembership
        fields = ('id', 'user', 'role', 'joined_at', 'is_approved')

class ReadingClubListSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = ReadingClub
        fields = ('id', 'name', 'slug', 'description', 'cover_image', 'is_private', 'members_count', 'created_at', 'is_member')

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ClubMembership.objects.filter(club=obj, user=request.user).exists()
        return False

class ReadingClubDetailSerializer(ReadingClubListSerializer):
    creator = UserSimpleSerializer(read_only=True)
    recent_threads = serializers.SerializerMethodField()
    
    class Meta(ReadingClubListSerializer.Meta):
        fields = ReadingClubListSerializer.Meta.fields + ('creator', 'recent_threads')
        
    def get_recent_threads(self, obj):
        threads = obj.threads.all()[:5]
        return DiscussionThreadListSerializer(threads, many=True).data

class PostSerializer(serializers.ModelSerializer):
    author = UserSimpleSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'thread', 'author', 'content', 'created_at', 'updated_at', 'likes_count', 'is_liked')
        read_only_fields = ('author',)

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class DiscussionThreadListSerializer(serializers.ModelSerializer):
    author = UserSimpleSerializer(read_only=True)
    last_reply = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionThread
        fields = ('id', 'title', 'club', 'author', 'is_pinned', 'is_locked', 'posts_count', 'created_at', 'last_reply')

    def get_last_reply(self, obj):
        last_post = obj.posts.order_by('-created_at').first()
        if last_post:
            return {
                'author': last_post.author.username,
                'created_at': last_post.created_at
            }
        return None

class DiscussionThreadDetailSerializer(DiscussionThreadListSerializer):
    posts = PostSerializer(many=True, read_only=True)
    
    class Meta(DiscussionThreadListSerializer.Meta):
        fields = DiscussionThreadListSerializer.Meta.fields + ('posts',)

class DiscussionThreadCreateSerializer(serializers.ModelSerializer):
    content = serializers.CharField(write_only=True)
    posts_count = serializers.IntegerField(read_only=True)
    book = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = DiscussionThread
        fields = ('id', 'title', 'club', 'book', 'content', 'posts_count')
