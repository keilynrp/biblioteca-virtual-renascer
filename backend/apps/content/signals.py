"""
Django signals para sincronización automática con Elasticsearch y cache invalidation.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Book, Category, Author, Review, Favorite, ReadingHistory
# Elasticsearch disabled - using Meilisearch instead
# from .documents import BookDocument
from apps.core.cache_utils import invalidate_cache, make_cache_key
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Book)
def index_book_on_save(sender, instance, created, **kwargs):
    """
    Invalida el cache cuando se guarda un libro.
    TODO: Migrar a Meilisearch para indexación.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro guardado
        created: True si es nuevo, False si es actualización
    """
    # Elasticsearch indexing disabled - using Meilisearch instead
    # try:
    #     doc = BookDocument.from_django_model(instance)
    #     doc.save()
    #     action = 'indexed' if created else 'updated'
    #     logger.info(f"Book '{instance.title}' (ID: {instance.id}) {action} in Elasticsearch")
    # except Exception as e:
    #     logger.error(f"Error indexing book '{instance.title}' (ID: {instance.id}): {str(e)}")

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
    Invalida el cache cuando se elimina un libro.
    TODO: Migrar a Meilisearch para indexación.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro eliminado
    """
    # Elasticsearch indexing disabled - using Meilisearch instead
    # try:
    #     doc = BookDocument.get(id=instance.id, ignore=404)
    #     if doc:
    #         doc.delete()
    #         logger.info(f"Book '{instance.title}' (ID: {instance.id}) removed from Elasticsearch")
    # except Exception as e:
    #     logger.error(f"Error removing book '{instance.title}' (ID: {instance.id}) from Elasticsearch: {str(e)}")

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
    """Invalidate category cache when a category is created or updated"""
    logger.info(f"Invalidating category cache (created={created})")
    cache.delete(make_cache_key('categories', 'list'))
    cache.delete(make_cache_key('dashboard', 'stats'))
    invalidate_cache('categories:*')


@receiver(post_delete, sender=Category)
def invalidate_category_cache_on_delete(sender, instance, **kwargs):
    """Invalidate category cache when a category is deleted"""
    logger.info(f"Invalidating category cache (deleted)")
    cache.delete(make_cache_key('categories', 'list'))
    cache.delete(make_cache_key('dashboard', 'stats'))
    invalidate_cache('categories:*')


@receiver(post_save, sender=Author)
def invalidate_author_cache_on_save(sender, instance, created, **kwargs):
    """Invalidate author cache when an author is created or updated"""
    logger.info(f"Invalidating author cache (created={created})")
    cache.delete(make_cache_key('authors', 'list'))
    invalidate_cache('authors:*')


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
