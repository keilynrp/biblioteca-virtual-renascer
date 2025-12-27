
from rest_framework import serializers
from .models import Book, Author, Category

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
    
    class Meta:
        model = Book
        fields = ('id', 'title', 'slug', 'description', 'author', 'category', 'cover_image', 'is_premium')

class BookDetailSerializer(serializers.ModelSerializer):
    author_detail = AuthorSerializer(source='author', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    author = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all(), write_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)

    class Meta:
        model = Book
        fields = ('id', 'title', 'slug', 'description', 'author', 'author_detail', 'category', 'category_detail', 'cover_image', 'file', 'publication_date', 'isbn', 'is_premium')
        read_only_fields = ('slug',)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['author'] = AuthorSerializer(instance.author).data
        representation['category'] = CategorySerializer(instance.category).data
        representation.pop('author_detail', None)
        representation.pop('category_detail', None)
        return representation
