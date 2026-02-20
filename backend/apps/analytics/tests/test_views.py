from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.analytics.models import UserActivity

User = get_user_model()

class AnalyticsViewsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='analytics_user', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_track_action(self):
        url = '/api/analytics/analytics/track_action/'
        data = {'action': 'view_book', 'details': {'book_id': 1}}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserActivity.objects.count(), 1)
        self.assertEqual(UserActivity.objects.get().action, 'view_book')

    def test_user_stats(self):
        # Create some mock data if needed, or just check the structure
        url = '/api/analytics/analytics/user_stats/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_reading_time', response.data)
        self.assertIn('books_completed', response.data)

    def test_export_report(self):
        # Create some activity
        UserActivity.objects.create(user=self.user, action='login')
        
        url = '/api/analytics/analytics/export_report/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn(b'login', response.content)
