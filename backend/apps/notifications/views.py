from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer, NotificationAdminSerializer, NotificationAdminCreateSerializer


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


class IsAdminType(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_staff or getattr(request.user, 'user_type', None) == 'admin')
        )


class AdminNotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminType]

    def list(self, request):
        qs = Notification.objects.select_related('user').order_by('-created_at')
        ntype = request.query_params.get('type')
        is_read = request.query_params.get('is_read')
        search = request.query_params.get('search')
        if ntype:
            qs = qs.filter(type=ntype)
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() == 'true')
        if search:
            qs = qs.filter(user__username__icontains=search) | qs.filter(title__icontains=search)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        total = qs.count()
        notifications = qs[(page - 1) * page_size: page * page_size]
        return Response({'count': total, 'results': NotificationAdminSerializer(notifications, many=True).data})

    def create(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        serializer = NotificationAdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        send_to_all = data.pop('send_to_all', False)
        send_email = data.pop('send_email', False)
        if send_to_all:
            users = list(User.objects.filter(is_active=True))
            objs = Notification.objects.bulk_create([Notification(user=u, **data) for u in users])
            if send_email:
                for n in objs:
                    try:
                        from .email_utils import send_notification_email
                        send_notification_email(n)
                    except Exception:
                        pass
            return Response({'created': len(objs)}, status=status.HTTP_201_CREATED)
        else:
            n = Notification.objects.create(**data)
            if send_email:
                try:
                    from .email_utils import send_notification_email
                    send_notification_email(n)
                except Exception:
                    pass
            return Response(NotificationAdminSerializer(n).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        try:
            Notification.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        deleted, _ = Notification.objects.filter(pk__in=ids).delete()
        return Response({'deleted': deleted})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.db.models import Count
        return Response({
            'total': Notification.objects.count(),
            'unread': Notification.objects.filter(is_read=False).count(),
            'emailed': Notification.objects.filter(is_emailed=True).count(),
            'by_type': list(Notification.objects.values('type').annotate(count=Count('id')).order_by('-count')),
        })
