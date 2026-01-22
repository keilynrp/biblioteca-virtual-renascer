from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'user', 'type', 'type_display', 'title', 'message', 
            'link', 'is_read', 'is_emailed', 'metadata', 
            'created_at', 'read_at'
        )
        read_only_fields = ('user', 'created_at', 'read_at', 'is_emailed')
    
    def to_representation(self, instance):
        """Customize representation to hide user field in responses."""
        representation = super().to_representation(instance)
        # Remove user ID from response (redundant since user is authenticated)
        representation.pop('user', None)
        return representation


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications (admin use)."""
    
    class Meta:
        model = Notification
        fields = (
            'user', 'type', 'title', 'message', 'link', 'metadata'
        )
