from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user notifications.
    
    Provides endpoints for:
    - Listing notifications (paginated)
    - Retrieving a single notification
    - Marking notifications as read
    - Getting unread count (for polling)
    - Marking all notifications as read
    """
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Filter notifications to only those belonging to the authenticated user."""
        return Notification.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializer for create action (admin only)."""
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def perform_create(self, serializer):
        """Ensure user is set to the authenticated user for self-created notifications."""
        # Only admins should create notifications via API, but we set user just in case
        if not self.request.user.is_staff:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Allow partial updates only for is_read field."""
        partial = kwargs.pop('partial', True)  # Force partial update
        return super().update(request, *args, partial=partial, **kwargs)
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all user's notifications as read."""
        updated_count = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'{updated_count} notification(s) marked as read',
            'count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get the count of unread notifications.
        This endpoint is designed for polling from the frontend.
        """
        count = self.get_queryset().filter(is_read=False).count()
        return Response({
            'unread_count': count
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get the 10 most recent notifications."""
        recent_notifications = self.get_queryset()[:10]
        serializer = self.get_serializer(recent_notifications, many=True)
        return Response(serializer.data)
