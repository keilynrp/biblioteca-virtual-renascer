import pytest
from django.urls import reverse
from rest_framework import status
from apps.content.models import Book, Author, Reading, Review
from apps.institutions.models import Institution
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def institution(db):
    return Institution.objects.create(name="Test Inst", code="T01")

@pytest.fixture
def inst_user(create_user, institution):
    return create_user(username="inst_user", email="inst@ex.com", institution=institution)

@pytest.fixture
def book(db):
    author = Author.objects.create(name="Author X")
    return Book.objects.create(title="Book X", author=author, slug="book-x")

@pytest.mark.django_db
class TestAnalytics:
    """Tests for dashboard and institutional analytics"""

    def test_dashboard_stats_real_data(self, authenticated_client, user, book):
        """Test that dashboard_stats returns real metrics instead of placeholders"""
        # 1. Setup reading and reviews
        Reading.objects.create(user=user, book=book, current_page=10, total_reading_time=3600)
        Review.objects.create(user=user, book=book, rating=5, title="Great", comment="X")
        
        url = reverse('dashboard_stats')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        
        assert data['average_rating'] == 5.0
        assert data['books_borrowed'] == 1
        assert data['total_reading_hours'] == 1.0  # 3600s / 3600

    def test_institutional_analytics_access(self, api_client, inst_user, institution, book):
        """Test access and metrics for institutional analytics"""
        # 1. Authenticate inst_user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(inst_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # 2. Setup reading for the user in the institution
        Reading.objects.create(user=inst_user, book=book, current_page=5, total_reading_time=1800)
        
        url = reverse('institutional_analytics')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        
        assert data['institution_name'] == "Test Inst"
        assert data['total_students'] == 1
        assert data['total_reading_hours'] == 0.5
        assert data['total_pages_read'] == 5
        assert len(data['top_books']) == 1

    def test_institutional_analytics_forbidden(self, authenticated_client):
        """Standard user without institution should get 403"""
        url = reverse('institutional_analytics')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
