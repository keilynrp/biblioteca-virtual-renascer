import pytest
from django.contrib.admin.sites import AdminSite
from apps.content.models import Review, Book, Author
from apps.content.admin import ReviewAdmin
from apps.authentication.models import User

@pytest.fixture
def review_admin():
    """Fixture for ReviewAdmin instance"""
    return ReviewAdmin(Review, AdminSite())

@pytest.mark.django_db
class TestAdminActions:
    """Tests for custom moderation actions in the admin"""

    def test_approve_reviews_action(self, review_admin, db):
        """Test that approve_reviews action correctly marks reviews as verified"""
        # 1. Setup
        from unittest.mock import MagicMock
        from django.contrib.messages.storage.fallback import FallbackStorage
        
        author = Author.objects.create(name="Test Author")
        book = Book.objects.create(title="Test Book", author=author, slug="test-book")
        user = User.objects.create_user(username="reviewer", email="rev@ex.com", password="pass")
        
        r1 = Review.objects.create(book=book, user=user, rating=5, title="Great", comment="Good", is_verified_reader=False)
        r2 = Review.objects.create(book=book, user=User.objects.create_user(username="u2", email="u2@ex.com"), rating=4, title="Fine", comment="OK", is_verified_reader=False)
        
        # Mock request with messages storage
        request = MagicMock()
        setattr(request, '_messages', FallbackStorage(request))
        
        # 2. Action
        queryset = Review.objects.filter(id__in=[r1.id, r2.id])
        review_admin.approve_reviews(request, queryset)
        
        # 3. Verify
        r1.refresh_from_db()
        r2.refresh_from_db()
        assert r1.is_verified_reader is True
        assert r2.is_verified_reader is True

    def test_disapprove_reviews_action(self, review_admin, db):
        """Test that disapprove_reviews action correctly unmarks reviews as verified"""
        from unittest.mock import MagicMock
        from django.contrib.messages.storage.fallback import FallbackStorage
        
        author = Author.objects.create(name="Test Author")
        book = Book.objects.create(title="Test Book", author=author, slug="test-book")
        user = User.objects.create_user(username="reviewer", email="rev@ex.com", password="pass")
        
        r1 = Review.objects.create(book=book, user=user, rating=5, title="Great", comment="Good", is_verified_reader=True)
        
        # Mock request with messages storage
        request = MagicMock()
        setattr(request, '_messages', FallbackStorage(request))
        
        queryset = Review.objects.filter(id=r1.id)
        review_admin.disapprove_reviews(request, queryset)
        
        r1.refresh_from_db()
        assert r1.is_verified_reader is False
