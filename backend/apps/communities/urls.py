from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReadingClubViewSet, DiscussionThreadViewSet, PostViewSet

router = DefaultRouter()
router.register(r'clubs', ReadingClubViewSet)
router.register(r'threads', DiscussionThreadViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
