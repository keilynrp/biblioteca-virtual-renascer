
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Book, Author, Category, Review, ReviewHelpful, Favorite, ReadingHistory, Reading,
    Bookmark, Highlight, Annotation
)
from .validators import validate_pdf_file, validate_image_file

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ('id', 'name', 'bio', 'photo')

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'parent', 'children')

    def get_children(self, obj):
        # Recursive children representation
        serializer = CategorySerializer(obj.children.all(), many=True, context=self.context)
        return serializer.data

class BookListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ('id', 'title', 'slug', 'description', 'author', 'category', 'cover_image', 'is_premium', 'publication_date', 'isbn', 'created_at')

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

class BookDetailSerializer(serializers.ModelSerializer):
    author_detail = AuthorSerializer(source='author', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    author = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all(), write_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    publication_date = serializers.DateField(required=False, allow_null=True)
    # Use ImageField for write operations, SerializerMethodField for read
    cover_image_upload = serializers.ImageField(write_only=True, required=False, allow_null=True, validators=[validate_image_file])
    cover_image = serializers.SerializerMethodField(read_only=True)
    # Use FileField for write operations, SerializerMethodField for read
    file_upload = serializers.FileField(write_only=True, required=False, allow_null=True, validators=[validate_pdf_file])
    file = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    favorite_count = serializers.SerializerMethodField()
    user_has_favorited = serializers.SerializerMethodField()
    user_review = serializers.SerializerMethodField()
    user_reading_status = serializers.SerializerMethodField()
    similar_books = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = (
            'id', 'title', 'slug', 'description', 'author', 'author_detail',
            'category', 'category_detail', 'cover_image', 'cover_image_upload',
            'file', 'file_upload', 'publication_date',
            'isbn', 'is_premium', 'average_rating', 'review_count', 'favorite_count',
            'user_has_favorited', 'user_review', 'user_reading_status', 'similar_books'
        )
        read_only_fields = ('slug',)
        extra_kwargs = {
            'publication_date': {'required': False, 'allow_null': True}
        }

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_file(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_average_rating(self, obj):
        """
        Get average rating from annotation (optimized) or fallback to property
        """
        # Try to get from annotation first (optimized)
        if hasattr(obj, 'average_rating_annotated'):
            avg = obj.average_rating_annotated
            return round(avg, 1) if avg else 0.0
        # Fallback to property (causes query)
        return obj.average_rating

    def get_review_count(self, obj):
        """
        Get review count from annotation (optimized) or fallback to property
        """
        # Try to get from annotation first (optimized)
        if hasattr(obj, 'review_count_annotated'):
            return obj.review_count_annotated
        # Fallback to property (causes query)
        return obj.review_count

    def get_favorite_count(self, obj):
        """
        Get favorite count from annotation (optimized) or fallback to property
        """
        # Try to get from annotation first (optimized)
        if hasattr(obj, 'favorite_count_annotated'):
            return obj.favorite_count_annotated
        # Fallback to property (causes query)
        return obj.favorite_count

    def get_user_has_favorited(self, obj):
        """
        Check if user has favorited using prefetched data (optimized)
        """
        # Try to use prefetched data first (optimized - no query)
        if hasattr(obj, 'user_favorites_cached'):
            return len(obj.user_favorites_cached) > 0
        # Fallback to query if not prefetched
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_user_review(self, obj):
        """
        Get user's review using prefetched data (optimized)
        """
        # Try to use prefetched data first (optimized - no query)
        if hasattr(obj, 'user_reviews_cached'):
            reviews = obj.user_reviews_cached
            if reviews:
                return ReviewSerializer(reviews[0], context=self.context).data
            return None
        # Fallback to query if not prefetched
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            review = obj.reviews.filter(user=request.user).first()
            if review:
                return ReviewSerializer(review, context=self.context).data
        return None

    def get_user_reading_status(self, obj):
        """
        Get user's reading status using prefetched data (optimized)
        """
        # Try to use prefetched data first (optimized - no query)
        if hasattr(obj, 'user_reading_cached'):
            histories = obj.user_reading_cached
            if histories:
                return ReadingHistorySerializer(histories[0], context=self.context).data
            return None
        # Fallback to query if not prefetched
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            history = obj.readers.filter(user=request.user).first()
            if history:
                return ReadingHistorySerializer(history, context=self.context).data
        return None

    def get_similar_books(self, obj):
        """
        Logic for 'Similar Books' recommendations:
        - Books from the same category (excl. actual)
        - Books from the same author (excl. actual)
        - Limit to 5 books
        """
        from django.db.models import Q
        similar = Book.objects.select_related('author', 'category').filter(
            Q(category=obj.category) | Q(author=obj.author)
        ).exclude(id=obj.id)[:5]
        
        return BookListSerializer(similar, many=True, context=self.context).data

    def to_internal_value(self, data):
        """Override to handle empty string for publication_date before validation"""
        # Convert empty string to None for publication_date before DRF tries to parse it
        if 'publication_date' in data and data['publication_date'] == '':
            data = data.copy() if hasattr(data, 'copy') else dict(data)
            data['publication_date'] = None
        return super().to_internal_value(data)

    def validate_publication_date(self, value):
        """Validate publication date - allow None or empty string"""
        if value == '' or value is None:
            return None
        return value

    def create(self, validated_data):
        """Handle file uploads during creation"""
        # Extract upload fields
        cover_image_upload = validated_data.pop('cover_image_upload', None)
        file_upload = validated_data.pop('file_upload', None)

        # Create book instance
        book = Book.objects.create(**validated_data)

        # Set files if provided
        if cover_image_upload:
            book.cover_image = cover_image_upload
        if file_upload:
            book.file = file_upload

        # Save to persist file changes
        if cover_image_upload or file_upload:
            book.save()

        return book

    def update(self, instance, validated_data):
        """Handle file uploads during update"""
        # Extract upload fields
        cover_image_upload = validated_data.pop('cover_image_upload', None)
        file_upload = validated_data.pop('file_upload', None)

        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update files if provided
        if cover_image_upload:
            instance.cover_image = cover_image_upload
        if file_upload:
            instance.file = file_upload

        # Save all changes
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['author'] = AuthorSerializer(instance.author).data if instance.author else None
        representation['category'] = CategorySerializer(instance.category).data if instance.category else None
        representation.pop('author_detail', None)
        representation.pop('category_detail', None)
        return representation


# Review Serializers
class ReviewUserSerializer(serializers.ModelSerializer):
    """Minimal user info for reviews"""
    class Meta:
        from django.contrib.auth import get_user_model
        model = get_user_model()
        fields = ('id', 'username', 'avatar')


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    user_has_voted_helpful = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'book', 'user', 'rating', 'title', 'comment',
            'is_verified_reader', 'helpful_count', 'user_has_voted_helpful',
            'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'helpful_count', 'is_verified_reader', 'book')

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.avatar.url if hasattr(obj.user, 'avatar') and obj.user.avatar else None
        }

    def get_user_has_voted_helpful(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source='book',
        write_only=True
    )

    class Meta:
        model = Favorite
        fields = ('id', 'book', 'book_id', 'notes', 'created_at')
        read_only_fields = ('created_at',)


class ReadingHistorySerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source='book',
        write_only=True
    )

    class Meta:
        model = ReadingHistory
        fields = (
            'id', 'book', 'book_id', 'status', 'progress_percentage',
            'started_at', 'completed_at', 'last_read_at', 'created_at'
        )
        read_only_fields = ('last_read_at', 'created_at')

    def validate_progress_percentage(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("El progreso debe estar entre 0 y 100.")
        return value


class ReadingSerializer(serializers.ModelSerializer):
    """Serializer for detailed reading progress (PDF viewer)"""
    book = BookListSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source='book',
        write_only=True
    )
    is_finished = serializers.BooleanField(read_only=True)
    pages_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Reading
        fields = (
            'id', 'book', 'book_id', 'current_page', 'total_pages',
            'progress_percentage', 'zoom_level', 'started_at', 'last_read_at',
            'total_reading_time', 'is_finished', 'pages_remaining'
        )
        read_only_fields = ('progress_percentage', 'started_at', 'last_read_at')

    def validate_current_page(self, value):
        """Validate current page is positive"""
        if value < 1:
            raise serializers.ValidationError("La página actual debe ser mayor a 0.")
        return value

    def validate_total_pages(self, value):
        """Validate total pages is positive"""
        if value is not None and value < 1:
            raise serializers.ValidationError("El total de páginas debe ser mayor a 0.")
        return value

    def validate_zoom_level(self, value):
        """Validate zoom level is within reasonable range"""
        if not 0.5 <= value <= 3.0:
            raise serializers.ValidationError("El nivel de zoom debe estar entre 0.5 y 3.0.")
        return value

    def validate(self, data):
        """Validate current_page doesn't exceed total_pages"""
        current_page = data.get('current_page')
        total_pages = data.get('total_pages')

        # If we have both values, validate
        if current_page and total_pages and current_page > total_pages:
            raise serializers.ValidationError({
                'current_page': "La página actual no puede ser mayor al total de páginas."
            })

        return data


class ReadingProgressUpdateSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quick progress updates"""
    class Meta:
        model = Reading
        fields = ('current_page', 'zoom_level', 'total_reading_time')

    def validate_current_page(self, value):
        if value < 1:
            raise serializers.ValidationError("La página actual debe ser mayor a 0.")
        return value


# =============================================================================
# Annotation Serializers - Sprint 10
# =============================================================================

class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for bookmarks"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_slug = serializers.CharField(source='book.slug', read_only=True)

    class Meta:
        model = Bookmark
        fields = (
            'id', 'user', 'book', 'book_title', 'book_slug',
            'page_number', 'title', 'notes',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'book_title', 'book_slug')

    def validate_page_number(self, value):
        if value < 1:
            raise serializers.ValidationError("El número de página debe ser mayor a 0.")
        return value

    def create(self, validated_data):
        # Automatically set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HighlightSerializer(serializers.ModelSerializer):
    """Serializer for text highlights"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_slug = serializers.CharField(source='book.slug', read_only=True)
    color_display = serializers.CharField(source='get_color_display', read_only=True)

    class Meta:
        model = Highlight
        fields = (
            'id', 'user', 'book', 'book_title', 'book_slug',
            'page_number', 'selected_text', 'color', 'color_display',
            'position_data', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'book_title', 'book_slug', 'color_display')

    def validate_page_number(self, value):
        if value < 1:
            raise serializers.ValidationError("El número de página debe ser mayor a 0.")
        return value

    def validate_selected_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El texto seleccionado no puede estar vacío.")
        if len(value) > 5000:
            raise serializers.ValidationError("El texto seleccionado es demasiado largo (máximo 5000 caracteres).")
        return value.strip()

    def create(self, validated_data):
        # Automatically set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AnnotationSerializer(serializers.ModelSerializer):
    """Serializer for annotations"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_slug = serializers.CharField(source='book.slug', read_only=True)
    highlight_data = HighlightSerializer(source='highlight', read_only=True)

    class Meta:
        model = Annotation
        fields = (
            'id', 'user', 'book', 'book_title', 'book_slug',
            'page_number', 'highlight', 'highlight_data',
            'content', 'selected_text', 'position_data',
            'is_private', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'book_title', 'book_slug', 'highlight_data')

    def validate_page_number(self, value):
        if value < 1:
            raise serializers.ValidationError("El número de página debe ser mayor a 0.")
        return value

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El contenido de la anotación no puede estar vacío.")
        if len(value) > 10000:
            raise serializers.ValidationError("El contenido es demasiado largo (máximo 10000 caracteres).")
        return value.strip()

    def validate(self, data):
        """Validate that highlight belongs to same book if provided"""
        highlight = data.get('highlight')
        book = data.get('book')

        if highlight and book and highlight.book != book:
            raise serializers.ValidationError({
                'highlight': "El resaltado debe pertenecer al mismo libro."
            })

        return data

    def create(self, validated_data):
        # Automatically set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
