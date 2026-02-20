from rest_framework import serializers
from .models import UserActivity, BookView, SearchQuery

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'action', 'details', 'ip_address', 'user_agent', 'created_at']
        read_only_fields = ['user', 'created_at', 'ip_address']

class BookViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookView
        fields = ['id', 'book', 'user', 'created_at']
        read_only_fields = ['user', 'created_at', 'ip_address']

class SearchQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchQuery
        fields = ['id', 'query', 'results_count', 'created_at']
        read_only_fields = ['user', 'created_at']

class UserStatsSerializer(serializers.Serializer):
    """
    Serializer for aggregated user statistics
    """
    total_reading_time = serializers.IntegerField()
    books_completed = serializers.IntegerField()
    books_reading = serializers.IntegerField()
    pages_read = serializers.IntegerField()
    streak_days = serializers.IntegerField()
