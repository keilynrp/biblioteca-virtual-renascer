from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post, Category, Tag
from .serializers import PostListSerializer, PostDetailSerializer, CategorySerializer, TagSerializer

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows posts to be viewed.
    Only published posts are visible by default.
    """
    queryset = Post.objects.filter(status='published')
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags']
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['published_at', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer
    pagination_class = None

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    lookup_field = 'slug'
    serializer_class = TagSerializer
    pagination_class = None
