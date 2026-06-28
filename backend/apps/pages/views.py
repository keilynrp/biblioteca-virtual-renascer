from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.core.permissions import IsAdminType

from .models import Page
from .serializers import PageSerializer, PageWriteSerializer


class PageViewSet(viewsets.ModelViewSet):
    """
    CRUD for pages. Public read (retrieve only), admin write.

    GET  /api/pages/            -> list all (admin only)
    POST /api/pages/            -> create (admin only)
    GET  /api/pages/<slug>/     -> retrieve by slug (public: published only)
    PATCH/PUT /api/pages/<slug>/ -> update content (admin only)
    DELETE /api/pages/<slug>/   -> delete (admin only)
    """
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action == 'retrieve':
            return [AllowAny()]
        return [IsAdminType()]

    def get_queryset(self):
        qs = Page.objects.all()
        # Non-admin retrieve: only return published pages
        if self.action == 'retrieve':
            user = self.request.user
            is_admin = (
                user.is_authenticated and
                (user.is_staff or getattr(user, 'user_type', None) == 'admin')
            )
            if not is_admin:
                qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return PageWriteSerializer
        return PageSerializer
