import logging
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsAdminTypeOrReadOnly

from .models import Post, Category, Tag
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CategorySerializer, TagSerializer
)

logger = logging.getLogger(__name__)

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be viewed, created, or edited.
    """
    lookup_field = 'slug'
    permission_classes = [IsAdminTypeOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'status']
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['published_at', 'created_at', 'title']

    def dispatch(self, request, *args, **kwargs):
        print(f"DEBUG: Dispatching {request.method} {request.path}")
        return super().dispatch(request, *args, **kwargs)

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

    def update(self, request, *args, **kwargs):
        # DRF calls update for both PUT and PATCH
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Aggressively handle the data
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        print(f"DEBUG: Processing {request.method} for {instance.slug}")
        logger.info(f"PATCH/PUT DATA for {instance.slug}: {data}")

        serializer = self.get_serializer(instance, data=data, partial=partial)
        if not serializer.is_valid():
            print(f"DEBUG: Validation failed: {serializer.errors}")
            logger.error(f"POST VALIDATION FAILED: {serializer.errors}")
            # Drastic: return detailed errors to help debug if it still fails
            return Response({
                "error": "Validation Error",
                "details": serializer.errors,
                "received_keys": list(data.keys())
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            serializer.save()
            return Response(serializer.data)
        except Exception as e:
            print(f"DEBUG: Save failed: {str(e)}")
            logger.exception(f"SAVE FAILED for {instance.slug}")
            return Response({
                "error": "Database Save Error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer
    permission_classes = [IsAdminTypeOrReadOnly]
    pagination_class = None

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    lookup_field = 'slug'
    serializer_class = TagSerializer
    permission_classes = [IsAdminTypeOrReadOnly]
    pagination_class = None
