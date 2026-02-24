from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Category, Tag

User = get_user_model()

class AuthorSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'avatar')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description')

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')

class PostListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'title', 'slug', 'description', 'featured_image', 
                  'category', 'category_name', 'author_name', 'published_at')

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username

class PostDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author = AuthorSummarySerializer(read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'title', 'slug', 'description', 'content', 'featured_image', 
                  'category', 'tags', 'author', 'status', 'published_at', 'created_at')
