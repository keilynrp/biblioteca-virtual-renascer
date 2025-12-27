
from django.urls import path
from .views import (
    BookListView, BookDetailView,
    CategoryListView, CategoryDetailView,
    AuthorListView, AuthorDetailView,
    dashboard_stats,
    search_books,
    autocomplete_books,
    search_facets,
    rebuild_search_index
)

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),

    # Search endpoints
    path('search/', search_books, name='search_books'),
    path('search/autocomplete/', autocomplete_books, name='autocomplete_books'),
    path('search/facets/', search_facets, name='search_facets'),
    path('search/rebuild-index/', rebuild_search_index, name='rebuild_search_index'),

    # Books
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<slug:slug>/', BookDetailView.as_view(), name='book_detail'),

    # Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<int:id>/', CategoryDetailView.as_view(), name='category_detail'),

    # Authors
    path('authors/', AuthorListView.as_view(), name='author_list'),
    path('authors/<int:id>/', AuthorDetailView.as_view(), name='author_detail'),
]
