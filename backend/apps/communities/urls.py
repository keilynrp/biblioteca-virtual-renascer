from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReadingClubViewSet, DiscussionThreadViewSet, PostViewSet

router = DefaultRouter()
router.register(r'clubs', ReadingClubViewSet, basename='readingclub')
router.register(r'threads', DiscussionThreadViewSet, basename='discussionthread')
router.register(r'posts', PostViewSet, basename='community-post')

urlpatterns = [
    path('', include(router.urls)),
]
