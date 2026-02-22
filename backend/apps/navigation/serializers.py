from rest_framework import serializers
from .models import NavZone, NavItem


class NavItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = NavItem
        fields = (
            'id', 'label', 'url', 'open_in_new_tab',
            'item_type', 'widget_type', 'widget_content',
            'order', 'is_visible', 'children',
        )

    def get_children(self, obj):
        qs = obj.children.filter(is_visible=True).order_by('order')
        return NavItemSerializer(qs, many=True).data


class NavZoneSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = NavZone
        fields = ('id', 'label', 'location', 'order', 'items')

    def get_items(self, obj):
        qs = obj.items.filter(parent=None).order_by('order')
        return NavItemSerializer(qs, many=True).data


class SaveItemsSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField(), allow_empty=True)
