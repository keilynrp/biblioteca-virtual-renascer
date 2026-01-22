"""
Unit tests for notifications app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.notifications.models import Notification
from apps.content.models import Book, Author, Category, Review, Favorite

User = get_user_model()


class NotificationModelTest(TestCase):
    """Tests for Notification model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_notification(self):
        """Test creating a notification."""
        notification = Notification.objects.create(
            user=self.user,
            type=Notification.NotificationType.WELCOME,
            title='Test Notification',
            message='This is a test message'
        )
        
        self.assertEqual(notification.user, self.user)
        self.assertFalse(notification.is_read)
        self.assertFalse(notification.is_emailed)
        self.assertEqual(notification.type, Notification.NotificationType.WELCOME)
    
    def test_mark_as_read(self):
        """Test marking notification as read."""
        notification = Notification.objects.create(
            user=self.user,
            type=Notification.NotificationType.WELCOME,
            title='Test',
            message='Test'
        )
        
        notification.mark_as_read()
        notification.refresh_from_db()
        
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)


class NotificationAPITest(TestCase):
    """Tests for Notification API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test notifications
        self.notification1 = Notification.objects.create(
            user=self.user,
            type=Notification.NotificationType.WELCOME,
            title='Welcome!',
            message='Welcome to BVS'
        )
        self.notification2 = Notification.objects.create(
            user=self.user,
            type=Notification.NotificationType.NEW_REVIEW,
            title='New Review',
            message='Someone reviewed your favorite book',
            is_read=True
        )
        # Notification for other user
        Notification.objects.create(
            user=self.other_user,
            type=Notification.NotificationType.WELCOME,
            title='Other',
            message='Other user notification'
        )
    
    def test_list_notifications(self):
        """Test listing notifications (only user's own)."""
        response = self.client.get('/api/notifications/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)  # Only user's notifications
    
    def test_unread_count(self):
        """Test unread count endpoint."""
        response = self.client.get('/api/notifications/unread_count/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 1)

    
    def test_mark_as_read(self):
        """Test marking single notification as read."""
        response = self.client.patch(f'/api/notifications/{self.notification1.id}/mark_read/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification1.refresh_from_db()
        self.assertTrue(self.notification1.is_read)
    
    def test_mark_all_as_read(self):
        """Test marking all notifications as read."""
        response = self.client.post('/api/notifications/mark_all_read/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)  # Only 1 was unread
        
        # Verify both are now read
        self.notification1.refresh_from_db()
        self.notification2.refresh_from_db()
        self.assertTrue(self.notification1.is_read)
        self.assertTrue(self.notification2.is_read)
    
    def test_recent_notifications(self):
        """Test getting recent notifications."""
        response = self.client.get('/api/notifications/recent/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class NotificationSignalTest(TestCase):
    """Tests for notification signals."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.reviewer = User.objects.create_user(
            username='reviewer',
            email='reviewer@example.com',
            password='testpass123'
        )
        
        # Create book
        self.author = Author.objects.create(name='Test Author')
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        self.book = Book.objects.create(
            title='Test Book',
            slug='test-book',
            author=self.author,
            category=self.category
        )
        
        # User favorites the book
        Favorite.objects.create(user=self.user, book=self.book)
    
    def test_new_review_notification(self):
        """Test that notification is created when someone reviews a favorited book."""
        initial_count = Notification.objects.filter(user=self.user).count()
        
        # Reviewer creates a review
        Review.objects.create(
            user=self.reviewer,
            book=self.book,
            rating=5,
            title='Great book!',
            comment='I loved it'
        )
        
        # Check notification was created
        final_count = Notification.objects.filter(user=self.user).count()
        self.assertEqual(final_count, initial_count + 1)
        
        # Check notification content
        notification = Notification.objects.filter(user=self.user).latest('created_at')
        self.assertEqual(notification.type, Notification.NotificationType.NEW_REVIEW)
        self.assertIn(self.book.title, notification.title)
        self.assertIn(str(5), notification.message)  # Rating in message
