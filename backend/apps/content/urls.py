
from django.urls import path
from .views import (
    BookListView, BookDetailView,
    CategoryListView, CategoryDetailView,
    AuthorListView, AuthorDetailView,
    dashboard_stats,
    search_books,
    autocomplete_books,
    search_facets,
    rebuild_search_index,
    import_books_from_openlibrary,
    get_import_stats,
    # Review views
    ReviewListCreateView, ReviewDetailView, UserReviewListView, MarkReviewHelpfulView,
    # Favorite views
    FavoriteListView, ToggleFavoriteView,
    # Reading history views
    ReadingHistoryListView, UpdateReadingHistoryView,
    # Reading (PDF viewer) views
    ReadingListView, StartReadingView, ReadingDetailView,
    UpdateReadingProgressView, ServeBookFileView,
    # Annotation views (Sprint 10)
    BookmarkListCreateView, BookmarkDetailView,
    HighlightListCreateView, HighlightDetailView,
    AnnotationListCreateView, AnnotationDetailView
)

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),

    # Search endpoints
    path('search/', search_books, name='search_books'),
    path('search/autocomplete/', autocomplete_books, name='autocomplete_books'),
    path('search/facets/', search_facets, name='search_facets'),
    path('search/rebuild-index/', rebuild_search_index, name='rebuild_search_index'),

    # Admin - Import endpoints
    path('admin/import-books/', import_books_from_openlibrary, name='import_books'),
    path('admin/import-stats/', get_import_stats, name='import_stats'),

    # Books
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<slug:slug>/', BookDetailView.as_view(), name='book_detail'),

    # Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<int:id>/', CategoryDetailView.as_view(), name='category_detail'),

    # Authors
    path('authors/', AuthorListView.as_view(), name='author_list'),
    path('authors/<int:id>/', AuthorDetailView.as_view(), name='author_detail'),

    # Reviews
    path('books/<slug:slug>/reviews/', ReviewListCreateView.as_view(), name='book_reviews'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    path('reviews/<int:pk>/helpful/', MarkReviewHelpfulView.as_view(), name='review_helpful'),
    path('user/reviews/', UserReviewListView.as_view(), name='user_reviews'),

    # Favorites
    path('user/favorites/', FavoriteListView.as_view(), name='user_favorites'),
    path('user/favorites/<int:book_id>/', ToggleFavoriteView.as_view(), name='toggle_favorite'),

    # Reading History
    path('user/reading-history/', ReadingHistoryListView.as_view(), name='reading_history'),
    path('user/reading-history/<int:book_id>/', UpdateReadingHistoryView.as_view(), name='update_reading_history'),

    # Reading (PDF Viewer)
    path('user/readings/', ReadingListView.as_view(), name='reading_list'),  # Continue reading
    path('user/readings/start/<int:book_id>/', StartReadingView.as_view(), name='start_reading'),
    path('user/readings/<int:book_id>/', ReadingDetailView.as_view(), name='reading_detail'),
    path('user/readings/<int:book_id>/progress/', UpdateReadingProgressView.as_view(), name='update_reading_progress'),
    path('books/<int:book_id>/file/', ServeBookFileView.as_view(), name='serve_book_file'),

    # Annotations (Sprint 10)
    path('user/bookmarks/', BookmarkListCreateView.as_view(), name='bookmark_list'),
    path('user/bookmarks/<int:pk>/', BookmarkDetailView.as_view(), name='bookmark_detail'),
    path('user/highlights/', HighlightListCreateView.as_view(), name='highlight_list'),
    path('user/highlights/<int:pk>/', HighlightDetailView.as_view(), name='highlight_detail'),
    path('user/annotations/', AnnotationListCreateView.as_view(), name='annotation_list'),
    path('user/annotations/<int:pk>/', AnnotationDetailView.as_view(), name='annotation_detail'),
]
