from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, F
from django.utils import timezone
from django.http import HttpResponse
import csv
from datetime import timedelta
from .models import UserActivity, BookView, SearchQuery
from .serializers import UserActivitySerializer, BookViewSerializer, UserStatsSerializer
from apps.content.models import Reading, ReadingHistory

class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics data.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def user_stats(self, request):
        """
        Get aggregated reading stats for the current user.
        """
        user = request.user
        
        # Calculate stats
        reading_history = ReadingHistory.objects.filter(user=user)
        books_completed = reading_history.filter(status='completed').count()
        books_reading = reading_history.filter(status='reading').count()
        
        # Total reading time (sum of all reading sessions)
        total_reading_time = Reading.objects.filter(user=user).aggregate(
            total_time=Sum('total_reading_time')
        )['total_time'] or 0
        
        # Total pages read (sum of current_page from all reading sessions)
        pages_read = Reading.objects.filter(user=user).aggregate(
            total_pages=Sum('current_page')
        )['total_pages'] or 0

        # Simple streak calculation (mock for now, requires daily activity tracking)
        streak_days = 1 

        data = {
            'total_reading_time': total_reading_time,
            'books_completed': books_completed,
            'books_reading': books_reading,
            'pages_read': pages_read,
            'streak_days': streak_days
        }
        
        serializer = UserStatsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def track_action(self, request):
        """
        Track a generic user action.
        """
        serializer = UserActivitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=request.user,
                ip_address=self.get_client_ip(request)
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=False, methods=['GET'])
    def export_report(self, request):
        """
        Export user activity report as CSV.
        """
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="user_activity.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Action', 'Details', 'IP Address'])

        activities = UserActivity.objects.filter(user=request.user).order_by('-created_at')
        for activity in activities:
            writer.writerow([
                activity.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                activity.action,
                str(activity.details),
                activity.ip_address
            ])

        return response
