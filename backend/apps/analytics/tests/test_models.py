from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.analytics.models import UserActivity, SearchQuery

User = get_user_model()

class UserActivityModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_create_activity(self):
        activity = UserActivity.objects.create(
            user=self.user,
            action='login',
            ip_address='127.0.0.1'
        )
        self.assertEqual(activity.user.username, 'testuser')
        self.assertEqual(activity.action, 'login')
        self.assertEqual(activity.ip_address, '127.0.0.1')

class SearchQueryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='searcher', password='password')

    def test_create_search_query(self):
        query = SearchQuery.objects.create(
            user=self.user,
            query='django',
            results_count=5
        )
        self.assertEqual(query.query, 'django')
        self.assertEqual(query.results_count, 5)
