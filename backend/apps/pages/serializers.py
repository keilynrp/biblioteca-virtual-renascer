from rest_framework import serializers
from .models import Page


class PageSerializer(serializers.ModelSerializer):
    """Read serializer for public and admin listing."""
    page_type_display = serializers.CharField(source='get_page_type_display', read_only=True)

    class Meta:
        model = Page
        fields = (
            'slug', 'title', 'page_type', 'page_type_display',
            'is_published', 'content', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')


class PageWriteSerializer(serializers.ModelSerializer):
    """Write serializer for admin create/update. Accepts the raw Puck Data JSON."""

    class Meta:
        model = Page
        fields = ('slug', 'title', 'page_type', 'is_published', 'content')

    def validate_content(self, value):
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("content debe ser un objeto JSON.")
        return value
