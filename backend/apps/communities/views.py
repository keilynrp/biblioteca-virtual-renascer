from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import ReadingClub, ClubMembership, DiscussionThread, Post
from .serializers import (
    ReadingClubListSerializer, ReadingClubDetailSerializer,
    DiscussionThreadListSerializer, DiscussionThreadDetailSerializer,
    PostSerializer, ClubMembershipSerializer, DiscussionThreadCreateSerializer
)

class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow creator of an object to edit it.
    Assumes the model instance has an `creator` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow author of an object to edit it.
    Assumes the model instance has an `author` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class ReadingClubViewSet(viewsets.ModelViewSet):
    queryset = ReadingClub.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    filterset_fields = ['is_private']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReadingClubDetailSerializer
        return ReadingClubListSerializer

    def perform_create(self, serializer):
        club = serializer.save(creator=self.request.user)
        # Add creator as ADMIN
        ClubMembership.objects.create(
            user=self.request.user, 
            club=club, 
            role='ADMIN'
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, slug=None):
        club = self.get_object()
        
        if ClubMembership.objects.filter(user=request.user, club=club).exists():
            return Response(
                {"detail": "Ya eres miembro de este club."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if club.is_private:
            # Logic for request approval would go here
            return Response(
                {"detail": "Este es un club privado. Solicitud enviada (Mock)."},
                status=status.HTTP_200_OK
            )
        
        ClubMembership.objects.create(user=request.user, club=club, role='MEMBER')
        return Response({"detail": "Te has unido al club exitosamente."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, slug=None):
        club = self.get_object()
        deleted, _ = ClubMembership.objects.filter(user=request.user, club=club).delete()
        
        if deleted:
            return Response({"detail": "Has salido del club."}, status=status.HTTP_200_OK)
        return Response({"detail": "No eres miembro de este club."}, status=status.HTTP_400_BAD_REQUEST)

class DiscussionThreadViewSet(viewsets.ModelViewSet):
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['club']
    ordering_fields = ['created_at', 'posts_count']

    def get_serializer_class(self):
        if self.action == 'create':
            return DiscussionThreadCreateSerializer
        if self.action == 'list':
            return DiscussionThreadListSerializer
        return DiscussionThreadDetailSerializer

    def perform_create(self, serializer):
        club = serializer.validated_data.get('club')
        if not ClubMembership.objects.filter(user=self.request.user, club=club).exists():
            raise serializers.ValidationError({"detail": "Debes ser miembro del club para crear discusiones."})

        content = serializer.validated_data.pop('content')
        thread = serializer.save(author=self.request.user, posts_count=1)
        
        # Create the first post
        Post.objects.create(
            thread=thread,
            author=self.request.user,
            content=content
        )

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['thread']

    def perform_create(self, serializer):
        thread = serializer.validated_data.get('thread')
        if not ClubMembership.objects.filter(user=self.request.user, club=thread.club).exists():
            raise serializers.ValidationError({"detail": "Debes ser miembro del club para responder."})

        post = serializer.save(author=self.request.user)
        # Update thread post count
        thread = post.thread
        thread.posts_count += 1
        thread.save(update_fields=['posts_count'])

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({"detail": "Like removido", "likes_count": post.likes.count()})
        else:
            post.likes.add(request.user)
            return Response({"detail": "Like agregado", "likes_count": post.likes.count()})
