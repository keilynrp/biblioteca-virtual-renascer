import pytest
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from apps.content.models import Book, Author, Category
from apps.content.search_meilisearch import index_book

@pytest.mark.django_db
class TestSearchMeilisearch:
    """
    Tests for Meilisearch integration.
    """

    @pytest.fixture
    def setup_data(self):
        author = Author.objects.create(name="Test Author")
        category = Category.objects.create(name="Test Category", slug="test-category")
        book = Book.objects.create(
            title="Searchable Book Title",
            description="Interesting description about search",
            author=author,
            category=category,
            is_premium=False,
            slug="searchable-book"
        )
        return book, author, category

    @patch('apps.content.search_meilisearch.MeilisearchClient.get_index')
    def test_search_endpoint(self, mock_get_index, client, setup_data):
        """Test search endpoint returns results from Meilisearch."""
        book, author, category = setup_data
        
        # Mock index.search return value
        mock_index = MagicMock()
        mock_index.search.return_value = {
            'hits': [
                {
                    'id': book.id,
                    'title': book.title,
                    'slug': book.slug,
                    'author_name': author.name,
                    'category_name': category.name,
                    'is_premium': False
                }
            ],
            'estimatedTotalHits': 1,
            'processingTimeMs': 5
        }
        
        mock_get_index.return_value = mock_index
        
        url = reverse('search_books')
        response = client.get(url, {'q': 'Searchable'})
        
        if response.status_code != 200:
            print(f"Response Error: {response.data}")
            
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['title'] == book.title
        assert mock_index.search.called

    @patch('apps.content.search_meilisearch.MeilisearchClient.get_index')
    def test_autocomplete_endpoint(self, mock_get_index, client, setup_data):
        """Test autocomplete endpoint."""
        book, _, _ = setup_data
        
        mock_index = MagicMock()
        mock_index.search.return_value = {
            'hits': [
                {
                    'id': book.id,
                    'title': book.title,
                    'slug': book.slug,
                    'author_name': book.author.name
                }
            ]
        }
        
        mock_get_index.return_value = mock_index
        
        url = reverse('autocomplete_books')
        response = client.get(url, {'q': 'Sea'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['suggestions']) == 1
        assert response.data['suggestions'][0]['title'] == book.title

    @patch('apps.content.search_meilisearch.MeilisearchClient.get_index')
    def test_facets_endpoint(self, mock_get_index, client):
        """Test facets endpoint."""
        mock_index = MagicMock()
        mock_index.search.return_value = {
            'facetDistribution': {
                'category_name': {'Fiction': 10, 'Science': 5},
                'author_name': {'Author A': 8, 'Author B': 7},
                'is_premium': {'false': 12, 'true': 3}
            }
        }
        
        mock_get_index.return_value = mock_index
        
        url = reverse('search_facets')
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'categories' in response.data
        assert 'authors' in response.data
        assert any(c['name'] == 'Fiction' for c in response.data['categories'])

    @patch('apps.content.search_meilisearch.MeilisearchClient.get_index')
    def test_index_book_signal(self, mock_get_index, setup_data):
        """Test that saving a book triggers indexing."""
        mock_index = MagicMock()
        mock_get_index.return_value = mock_index
        
        # Trigger signal by updating the book
        book, _, _ = setup_data
        book.title = "Updated Title"
        book.save()
        
        # Verify add_documents was called
        assert mock_index.add_documents.called
        # Check that the document contains the updated title
        args, _ = mock_index.add_documents.call_args
        assert args[0][0]['title'] == "Updated Title"
