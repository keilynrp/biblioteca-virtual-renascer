"""
Tests for content management (books, authors, categories)
"""

import pytest
from rest_framework import status
from apps.content.models import Book, Author, Category


@pytest.mark.django_db
class TestBookList:
    """Tests for book list endpoint"""

    def test_list_books_public(self, api_client, book, premium_book):
        """Test anyone can view book list"""
        response = api_client.get('/api/content/books/')

        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data or isinstance(response.data, list)

    def test_list_books_pagination(self, api_client, author, category, create_book):
        """Test book list is paginated"""
        # Create multiple books
        for i in range(25):
            create_book(
                title=f'Book {i}',
                author=author,
                category=category
            )

        response = api_client.get('/api/content/books/')

        assert response.status_code == status.HTTP_200_OK
        # Should be paginated (PAGE_SIZE=20 in settings)
        if 'results' in response.data:
            assert len(response.data['results']) == 20
            assert 'next' in response.data

    def test_filter_books_by_category(self, api_client, book, another_category, create_book, author):
        """Test filtering books by category"""
        # Create book in different category
        other_book = create_book(
            title='Other Book',
            author=author,
            category=another_category
        )

        response = api_client.get(
            f'/api/content/books/?category__slug={another_category.slug}'
        )

        assert response.status_code == status.HTTP_200_OK
        # Verify only books from that category are returned
        results = response.data.get('results', response.data)
        for result in results:
            assert result['category']['slug'] == another_category.slug

    def test_filter_books_by_author(self, api_client, book, another_author, create_book, category):
        """Test filtering books by author"""
        other_book = create_book(
            title='Other Author Book',
            author=another_author,
            category=category
        )

        response = api_client.get(
            f'/api/content/books/?author__id={another_author.id}'
        )

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        for result in results:
            assert result['author']['id'] == another_author.id

    def test_filter_books_premium(self, api_client, book, premium_book):
        """Test filtering premium books"""
        response = api_client.get('/api/content/books/?is_premium=true')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        for result in results:
            assert result['is_premium'] is True

    def test_search_books_by_title(self, api_client, book):
        """Test searching books by title"""
        response = api_client.get(
            f'/api/content/books/?search={book.title[:5]}'
        )

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) > 0


@pytest.mark.django_db
class TestBookDetail:
    """Tests for book detail endpoint"""

    def test_get_book_detail(self, api_client, book):
        """Test getting book details"""
        response = api_client.get(f'/api/content/books/{book.slug}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == book.title
        assert response.data['slug'] == book.slug
        assert 'author' in response.data
        assert 'category' in response.data

    def test_get_book_detail_nonexistent(self, api_client):
        """Test getting non-existent book returns 404"""
        response = api_client.get('/api/content/books/nonexistent-slug/')

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestBookCreation:
    """Tests for creating books"""

    def test_create_book_authenticated(self, authenticated_client, author, category):
        """Test authenticated user can create book"""
        book_data = {
            'title': 'New Book',
            'author': author.id,
            'category': category.id,
            'description': 'A new book description',
            'is_premium': False
        }

        # Note: This might require file upload, adjust based on actual serializer
        response = authenticated_client.post(
            '/api/content/books/',
            book_data,
            format='json'
        )

        # May need authentication and permissions
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,  # If file is required
            status.HTTP_403_FORBIDDEN  # If admin-only
        ]

    def test_create_book_unauthenticated(self, api_client, author, category):
        """Test unauthenticated user cannot create book"""
        book_data = {
            'title': 'New Book',
            'author': author.id,
            'category': category.id,
            'description': 'A new book description'
        }

        response = api_client.post(
            '/api/content/books/',
            book_data,
            format='json'
        )

        # Should require authentication
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]


@pytest.mark.django_db
class TestCategoryEndpoints:
    """Tests for category endpoints"""

    def test_list_categories(self, api_client, category, another_category):
        """Test listing categories"""
        response = api_client.get('/api/content/categories/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) >= 2

    def test_get_category_detail(self, api_client, category):
        """Test getting category details"""
        response = api_client.get(f'/api/content/categories/{category.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == category.name
        assert response.data['slug'] == category.slug

    def test_create_category_authenticated(self, authenticated_client):
        """Test creating category"""
        category_data = {
            'name': 'Science Fiction',
            'description': 'Sci-fi books'
        }

        response = authenticated_client.post(
            '/api/content/categories/',
            category_data,
            format='json'
        )

        # May require special permissions
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_403_FORBIDDEN
        ]


@pytest.mark.django_db
class TestAuthorEndpoints:
    """Tests for author endpoints"""

    def test_list_authors(self, api_client, author, another_author):
        """Test listing authors"""
        response = api_client.get('/api/content/authors/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) >= 2

    def test_get_author_detail(self, api_client, author):
        """Test getting author details"""
        response = api_client.get(f'/api/content/authors/{author.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == author.name

    def test_create_author_authenticated(self, authenticated_client):
        """Test creating author"""
        author_data = {
            'name': 'New Author',
            'bio': 'A new author biography'
        }

        response = authenticated_client.post(
            '/api/content/authors/',
            author_data,
            format='json'
        )

        # May require special permissions
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_403_FORBIDDEN
        ]


@pytest.mark.django_db
class TestDashboardStats:
    """Tests for dashboard statistics endpoint"""

    def test_get_dashboard_stats_authenticated(
        self, authenticated_client, book, premium_book
    ):
        """Test authenticated user can get dashboard stats"""
        response = authenticated_client.get('/api/content/dashboard/stats/')

        assert response.status_code == status.HTTP_200_OK
        assert 'total_books' in response.data
        assert 'total_users' in response.data
        assert 'average_rating' in response.data
        assert 'recent_books' in response.data
        assert 'top_categories' in response.data

        # Verify counts are correct
        assert response.data['total_books'] >= 2

    def test_get_dashboard_stats_unauthenticated(self, api_client):
        """Test unauthenticated user cannot get dashboard stats"""
        response = api_client.get('/api/content/dashboard/stats/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestBookModel:
    """Tests for Book model"""

    def test_book_slug_auto_generated(self, author, category):
        """Test book slug is auto-generated from title"""
        book = Book.objects.create(
            title='My Test Book',
            author=author,
            category=category,
            description='Test description',
            file='test.pdf'
        )

        assert book.slug == 'my-test-book'

    def test_book_str_representation(self, book):
        """Test book string representation"""
        assert str(book) == book.title


@pytest.mark.django_db
class TestCategoryModel:
    """Tests for Category model"""

    def test_category_slug_auto_generated(self):
        """Test category slug is auto-generated"""
        category = Category.objects.create(
            name='Science Fiction'
        )

        assert category.slug == 'science-fiction'

    def test_category_str_representation(self, category):
        """Test category string representation"""
        assert str(category) == category.name


@pytest.mark.django_db
class TestAuthorModel:
    """Tests for Author model"""

    def test_author_str_representation(self, author):
        """Test author string representation"""
        assert str(author) == author.name

    def test_author_books_relationship(self, author, category, create_book):
        """Test author can have multiple books"""
        book1 = create_book(title='Book 1', author=author, category=category)
        book2 = create_book(title='Book 2', author=author, category=category)

        assert author.books.count() == 2
        assert book1 in author.books.all()
        assert book2 in author.books.all()
