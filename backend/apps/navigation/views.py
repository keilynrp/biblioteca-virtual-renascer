from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response

from .models import NavZone, NavItem
from .serializers import NavZoneSerializer, SaveItemsSerializer


class IsAdminType(BasePermission):
    """Allows access only to admin users (staff or user_type='admin')."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or
             getattr(request.user, 'user_type', None) == 'admin')
        )


class NavZoneViewSet(viewsets.ModelViewSet):
    """
    CRUD for navigation zones + save_items action.

    GET  /api/navigation/              -> AllowAny — all zones with nested items
    POST /api/navigation/              -> admin only
    PATCH/PUT /api/navigation/<id>/    -> admin only
    DELETE /api/navigation/<id>/       -> admin only
    PUT /api/navigation/<id>/items/    -> admin only — replace all items for a zone
    """
    queryset = NavZone.objects.all().prefetch_related('items__children')
    serializer_class = NavZoneSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminType()]

    @action(detail=True, methods=['put'], url_path='items')
    def save_items(self, request, pk=None):
        zone = self.get_object()
        serializer = SaveItemsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items_data = serializer.validated_data['items']

        # Delete existing top-level items (cascades to children)
        zone.items.filter(parent=None).delete()

        # Create top-level items first
        top_level_items = []
        for idx, item_data in enumerate(items_data):
            nav_item = NavItem.objects.create(
                zone=zone,
                parent=None,
                label=item_data.get('label', ''),
                url=item_data.get('url', ''),
                open_in_new_tab=item_data.get('open_in_new_tab', False),
                item_type=item_data.get('item_type', 'link'),
                widget_type=item_data.get('widget_type', ''),
                widget_content=item_data.get('widget_content', {}),
                order=idx,
                is_visible=item_data.get('is_visible', True),
            )
            top_level_items.append((nav_item, item_data.get('children', [])))

        # Create children
        for parent_item, children in top_level_items:
            for cidx, child_data in enumerate(children):
                NavItem.objects.create(
                    zone=zone,
                    parent=parent_item,
                    label=child_data.get('label', ''),
                    url=child_data.get('url', ''),
                    open_in_new_tab=child_data.get('open_in_new_tab', False),
                    item_type=child_data.get('item_type', 'link'),
                    widget_type=child_data.get('widget_type', ''),
                    widget_content=child_data.get('widget_content', {}),
                    order=cidx,
                    is_visible=child_data.get('is_visible', True),
                )

        zone.refresh_from_db()
        return Response(NavZoneSerializer(zone).data, status=status.HTTP_200_OK)
