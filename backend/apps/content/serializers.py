
from rest_framework import serializers
from .models import Book, Author, Category, Review, ReviewHelpful, Favorite, ReadingHistory, Reading

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ('id', 'name', 'bio', 'photo')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description')

class BookListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ('id', 'title', 'slug', 'description', 'author', 'category', 'cover_image', 'is_premium')

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
    cover_image = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    favorite_count = serializers.IntegerField(read_only=True)
    user_has_favorited = serializers.SerializerMethodField()
    user_review = serializers.SerializerMethodField()
    user_reading_status = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = (
            'id', 'title', 'slug', 'description', 'author', 'author_detail',
            'category', 'category_detail', 'cover_image', 'file', 'publication_date',
            'isbn', 'is_premium', 'average_rating', 'review_count', 'favorite_count',
            'user_has_favorited', 'user_review', 'user_reading_status'
        )
        read_only_fields = ('slug',)

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

    def get_user_has_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_user_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            review = obj.reviews.filter(user=request.user).first()
            if review:
                return ReviewSerializer(review, context=self.context).data
        return None

    def get_user_reading_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            history = obj.readers.filter(user=request.user).first()
            if history:
                return ReadingHistorySerializer(history, context=self.context).data
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['author'] = AuthorSerializer(instance.author).data
        representation['category'] = CategorySerializer(instance.category).data
        representation.pop('author_detail', None)
        representation.pop('category_detail', None)
        return representation


# Review Serializers
class ReviewUserSerializer(serializers.ModelSerializer):
    """Minimal user info for reviews"""
    class Meta:
        model = serializers.SerializerMethodField()  # Will use AUTH_USER_MODEL
        fields = ('id', 'username', 'avatar')

    def get_model(self):
        from django.contrib.auth import get_user_model
        return get_user_model()


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
