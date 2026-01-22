from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanViewSet, BookCopyViewSet, LoanQueueViewSet

router = DefaultRouter()
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'book-copies', BookCopyViewSet, basename='bookcopy')
router.register(r'loan-queue', LoanQueueViewSet, basename='loanqueue')

urlpatterns = [
    path('', include(router.urls)),
]
