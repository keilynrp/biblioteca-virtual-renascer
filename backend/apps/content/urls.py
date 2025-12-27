
from django.urls import path
from .views import (
    BookListView, BookDetailView,
    CategoryListView, CategoryDetailView,
    AuthorListView, AuthorDetailView,
    dashboard_stats
)

urlpatterns = [
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<slug:slug>/', BookDetailView.as_view(), name='book_detail'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<int:id>/', CategoryDetailView.as_view(), name='category_detail'),
    path('authors/', AuthorListView.as_view(), name='author_list'),
    path('authors/<int:id>/', AuthorDetailView.as_view(), name='author_detail'),
]
