"""
Django signals para sincronización automática con Elasticsearch.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Book
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
