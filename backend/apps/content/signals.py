"""
Django signals para sincronización automática con Elasticsearch.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Book, Review, ReadingHistory
from .documents import BookDocument
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Book)
def index_book_on_save(sender, instance, created, **kwargs):
    """
    Indexa o actualiza un libro en Elasticsearch cuando se guarda.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro guardado
        created: True si es nuevo, False si es actualización
    """
    try:
        doc = BookDocument.from_django_model(instance)
        doc.save()

        action = 'indexed' if created else 'updated'
        logger.info(f"Book '{instance.title}' (ID: {instance.id}) {action} in Elasticsearch")

    except Exception as e:
        logger.error(f"Error indexing book '{instance.title}' (ID: {instance.id}): {str(e)}")


@receiver(post_delete, sender=Book)
def delete_book_from_index(sender, instance, **kwargs):
    """
    Elimina un libro del índice de Elasticsearch cuando se borra.

    Args:
        sender: Clase del modelo (Book)
        instance: Instancia del libro eliminado
    """
    try:
        doc = BookDocument.get(id=instance.id, ignore=404)
        if doc:
            doc.delete()
            logger.info(f"Book '{instance.title}' (ID: {instance.id}) removed from Elasticsearch")

    except Exception as e:
        logger.error(f"Error removing book '{instance.title}' (ID: {instance.id}) from Elasticsearch: {str(e)}")


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
