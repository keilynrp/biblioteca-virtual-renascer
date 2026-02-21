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


class NotificationAdminSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id', 'user', 'username', 'user_email',
            'type', 'type_display', 'title', 'message',
            'link', 'is_read', 'is_emailed', 'metadata',
            'created_at', 'read_at'
        )
        read_only_fields = ('created_at', 'read_at', 'is_emailed')


class NotificationAdminCreateSerializer(serializers.ModelSerializer):
    send_to_all = serializers.BooleanField(default=False, write_only=True)
    send_email = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = Notification
        fields = ('user', 'type', 'title', 'message', 'link', 'metadata', 'send_to_all', 'send_email')

    def validate(self, data):
        if not data.get('send_to_all') and not data.get('user'):
            raise serializers.ValidationError({'user': 'Requerido si no es broadcast.'})
        return data
