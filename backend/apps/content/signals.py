"""
Django signals para sincronización automática con Meilisearch y cache invalidation.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.conf import settings
from .models import Book, Category, Author, Review, Favorite, ReadingHistory
from apps.core.cache_utils import invalidate_cache, make_cache_key
import logging

logger = logging.getLogger(__name__)

# Import Meilisearch functions
try:
    from .search_meilisearch import index_book, delete_book_from_index as meilisearch_delete_book
    MEILISEARCH_AVAILABLE = True
except ImportError:
    MEILISEARCH_AVAILABLE = False
    logger.warning("Meilisearch module not available - indexing will be skipped")


@receiver(post_save, sender=Book)
def index_book_on_save(sender, instance, created, **kwargs):
    """
    Indexa el libro en Meilisearch e invalida el cache cuando se guarda.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro guardado
        created: True si es nuevo, False si es actualización
    """
    # Index in Meilisearch
    if MEILISEARCH_AVAILABLE:
        try:
            index_book(instance)
            action = 'indexed' if created else 're-indexed'
            logger.info(f"Book '{instance.title}' (ID: {instance.id}) {action} in Meilisearch")
        except Exception as e:
            logger.error(f"Error indexing book '{instance.title}' (ID: {instance.id}) in Meilisearch: {str(e)}")
    else:
        logger.debug(f"Meilisearch indexing skipped for '{instance.title}' (not available)")

    # Invalidate cache
    try:
        logger.info(f"Invalidating book cache for '{instance.title}' (created={created})")

        # Invalidate dashboard stats
        cache.delete(make_cache_key('dashboard', 'stats'))

        # Invalidate books list caches
        invalidate_cache('books:list:*')
        invalidate_cache('view:BookListView:*')

        # Invalidate book detail cache
        book_detail_key = make_cache_key('book', 'detail', slug=instance.slug)
        cache.delete(book_detail_key)

        # Invalidate search results
        invalidate_cache('search:*')

        # Invalidate category cache if book has a category
        if instance.category:
            cache.delete(make_cache_key('categories', 'list'))

    except Exception as e:
        logger.error(f"Error invalidating cache for book '{instance.title}': {e}")


@receiver(post_delete, sender=Book)
def delete_book_from_index(sender, instance, **kwargs):
    """
    Elimina el libro de Meilisearch e invalida el cache cuando se elimina.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro eliminado
    """
    # Remove from Meilisearch index
    if MEILISEARCH_AVAILABLE:
        try:
            meilisearch_delete_book(instance.id)
            logger.info(f"Book '{instance.title}' (ID: {instance.id}) removed from Meilisearch")
        except Exception as e:
            logger.error(f"Error removing book '{instance.title}' (ID: {instance.id}) from Meilisearch: {str(e)}")
    else:
        logger.debug(f"Meilisearch deletion skipped for '{instance.title}' (not available)")

    # Invalidate cache
    try:
        logger.info(f"Invalidating book cache for '{instance.title}' (deleted)")
        cache.delete(make_cache_key('dashboard', 'stats'))
        invalidate_cache('books:*')
        invalidate_cache('search:*')
        invalidate_cache('view:BookListView:*')
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")


@receiver(post_save, sender=Review)
def log_review_creation(sender, instance, created, **kwargs):
    """
    Log when a new review is created.
    This can be extended to update verified_reader status in Phase 2 when loan system is implemented.
    """
    if created:
        logger.info(f"Review created by {instance.user.username} for {instance.book.title} - Rating: {instance.rating}/5")


@receiver(post_save, sender=ReadingHistory)
def track_reading_completion(sender, instance, created, **kwargs):
    """
    Track when users complete books for analytics.
    """
    if instance.status == 'completed' and instance.completed_at:
        logger.info(f"{instance.user.username} completed reading {instance.book.title}")


# =============================================================================
# CACHE INVALIDATION SIGNALS
# =============================================================================

@receiver(post_save, sender=Category)
def invalidate_category_cache_on_save(sender, instance, created, **kwargs):
    """
    Invalidate category cache when a category is created or updated.
    Re-index all books in this category if the category's name changed.
    """
    logger.info(f"Invalidating category cache (created={created})")
    cache.delete(make_cache_key('categories', 'list'))
    cache.delete(make_cache_key('dashboard', 'stats'))
    invalidate_cache('categories:*')

    # Re-index books if category name changed (affects search)
    if not created and MEILISEARCH_AVAILABLE:
        try:
            # Get all books in this category
            books = instance.books.all()
            if books.exists():
                from .search_meilisearch import index_books_bulk
                index_books_bulk(books)
                logger.info(f"Re-indexed {books.count()} books for category '{instance.name}'")
        except Exception as e:
            logger.error(f"Error re-indexing books for category '{instance.name}': {e}")


@receiver(post_delete, sender=Category)
def invalidate_category_cache_on_delete(sender, instance, **kwargs):
    """Invalidate category cache when a category is deleted"""
    logger.info(f"Invalidating category cache (deleted)")
    cache.delete(make_cache_key('categories', 'list'))
    cache.delete(make_cache_key('dashboard', 'stats'))
    invalidate_cache('categories:*')


@receiver(post_save, sender=Author)
def invalidate_author_cache_on_save(sender, instance, created, **kwargs):
    """
    Invalidate author cache when an author is created or updated.
    Re-index all books by this author if the author's name changed.
    """
    logger.info(f"Invalidating author cache (created={created})")
    cache.delete(make_cache_key('authors', 'list'))
    invalidate_cache('authors:*')

    # Re-index books if author name changed (affects search)
    if not created and MEILISEARCH_AVAILABLE:
        try:
            # Get all books by this author
            books = instance.books.all()
            if books.exists():
                from .search_meilisearch import index_books_bulk
                index_books_bulk(books)
                logger.info(f"Re-indexed {books.count()} books for author '{instance.name}'")
        except Exception as e:
            logger.error(f"Error re-indexing books for author '{instance.name}': {e}")


@receiver(post_delete, sender=Author)
def invalidate_author_cache_on_delete(sender, instance, **kwargs):
    """Invalidate author cache when an author is deleted"""
    logger.info(f"Invalidating author cache (deleted)")
    cache.delete(make_cache_key('authors', 'list'))
    invalidate_cache('authors:*')


@receiver(post_save, sender=Favorite)
def invalidate_favorite_cache_on_save(sender, instance, created, **kwargs):
    """Invalidate favorite cache when a favorite is created"""
    if created:
        logger.info(f"Invalidating favorites cache for user {instance.user.id}")
        favorites_key = make_cache_key('user', instance.user.id, 'favorites')
        cache.delete(favorites_key)


@receiver(post_delete, sender=Favorite)
def invalidate_favorite_cache_on_delete(sender, instance, **kwargs):
    """Invalidate favorite cache when a favorite is removed"""
    logger.info(f"Invalidating favorites cache for user {instance.user.id}")
    favorites_key = make_cache_key('user', instance.user.id, 'favorites')
    cache.delete(favorites_key)
