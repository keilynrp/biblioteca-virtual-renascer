from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post, Category, Tag
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CategorySerializer, TagSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit or delete content.
    """
    def has_permission(self, request, view):
        # Allow search engines and non-auth users to read
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only staff/admins for other methods
        return request.user and request.user.is_staff

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be viewed, created, or edited.
    """
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'status']
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['published_at', 'created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        # Staff see everything (drafts/published)
        if user and user.is_staff:
            return Post.objects.all().order_by('-created_at')
        # Public see only published
        return Post.objects.filter(status='published').order_by('-published_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostListSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    lookup_field = 'slug'
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
