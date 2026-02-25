from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Category, Tag
from django.utils.text import slugify

User = get_user_model()

class AuthorSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'avatar')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description')
        extra_kwargs = {
            'slug': {'required': False}
        }

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
        extra_kwargs = {
            'slug': {'required': False}
        }

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

class PostListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'title', 'slug', 'description', 'featured_image', 
                  'category', 'category_name', 'author_name', 'status', 'published_at', 'created_at')

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

class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating posts.
    Handles primary keys for category and tags.
    """
    class Meta:
        model = Post
        fields = ('id', 'title', 'slug', 'description', 'content', 'featured_image', 
                  'category', 'tags', 'status', 'published_at')
        extra_kwargs = {
            'slug': {'required': False},
            'published_at': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name']) if 'name' in validated_data else slugify(validated_data['title'])
        
        # Auto-assign author if not provided (should be current user)
        if 'author' not in validated_data:
            request = self.context.get('request')
            if request and request.user:
                validated_data['author'] = request.user
                
        return super().create(validated_data)
