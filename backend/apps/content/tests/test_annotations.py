import pytest
from django.urls import reverse
from rest_framework import status
from apps.content.models import Book, Author, Bookmark, Highlight, Annotation

@pytest.fixture
def book(db):
    author = Author.objects.create(name="Author X")
    return Book.objects.create(title="Book X", author=author, slug="book-x")

@pytest.mark.django_db
class TestAnnotations:
    """Tests for Bookmark, Highlight, and Annotation views"""

    def test_bookmark_lifecycle(self, authenticated_client, book):
        """Test creating and retrieving bookmarks"""
        url = reverse('bookmark_list')
        payload = {
            'book': book.id,
            'page_number': 15,
            'title': 'Test Bookmark'
        }
        
        # Create
        response = authenticated_client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        bookmark_id = response.data['id']
        
        # List
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) == 1
        assert results[0]['page_number'] == 15

        # Delete
        detail_url = reverse('bookmark_detail', kwargs={'pk': bookmark_id})
        response = authenticated_client.delete(detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_highlight_lifecycle(self, authenticated_client, book):
        """Test creating and retrieving highlights"""
        url = reverse('highlight_list')
        payload = {
            'book': book.id,
            'page_number': 20,
            'selected_text': 'Text to highlight',
            'color': 'yellow',
            'position_data': {'rect': [0,0,10,10]}
        }
        
        # Create
        response = authenticated_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # List
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert results[0]['selected_text'] == 'Text to highlight'

    def test_annotation_lifecycle(self, authenticated_client, book):
        """Test creating and retrieving textual annotations"""
        url = reverse('annotation_list')
        payload = {
            'book': book.id,
            'page_number': 30,
            'content': 'My personal note about this page',
            'is_private': True
        }
        
        # Create
        response = authenticated_client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        
        # List
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert results[0]['content'] == 'My personal note about this page'
