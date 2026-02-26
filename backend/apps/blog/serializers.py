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
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'slug', 'description', 'content', 'featured_image', 
                  'category', 'tags', 'status', 'published_at')
        extra_kwargs = {
            'slug': {'required': False},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'content': {'required': False, 'allow_null': True, 'allow_blank': True},
            'status': {'required': False},
            'published_at': {'required': False, 'allow_null': True}
        }

    def to_internal_value(self, data):
        """Aggressively handle empty strings from FormData."""
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Clean up all fields that might be empty strings
        for field in ['category', 'description', 'content', 'featured_image', 'published_at', 'status']:
            if field in data and data[field] == '':
                data[field] = None
                
        # Many-to-Many special case
        if 'tags' in data and (data['tags'] == '' or data['tags'] == '[]'):
            data['tags'] = []
            
        return super().to_internal_value(data)

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['title'])
        
        # Auto-assign author if not provided
        if 'author' not in validated_data:
            request = self.context.get('request')
            if request and request.user:
                validated_data['author'] = request.user
                
        return super().create(validated_data)
