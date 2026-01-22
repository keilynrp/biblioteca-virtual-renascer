"""
Django signals for automatic notification creation.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.content.models import Review
from .models import Notification
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Review)
def notify_on_new_review(sender, instance, created, **kwargs):
    """
    Create notification when a new review is posted on a book.
    Notify users who have favorited the book.
    """
    if created:
        # Get users who favorited this book (excluding the reviewer)
        favorited_users = instance.book.favorited_by.exclude(
            user=instance.user
        ).select_related('user')
        
        if favorited_users.exists():
            notifications = []
            for favorite in favorited_users:
                notifications.append(
                    Notification(
                        user=favorite.user,
                        type=Notification.NotificationType.NEW_REVIEW,
                        title=f'Nueva reseña en "{instance.book.title}"',
                        message=f'{instance.user.username} ha dejado una reseña de {instance.rating} estrellas en "{instance.book.title}".',
                        link=f'/library/{instance.book.slug}',
                        metadata={
                            'book_id': instance.book.id,
                            'book_slug': instance.book.slug,
                            'review_id': instance.id,
                            'reviewer': instance.user.username,
                            'rating': instance.rating
                        }
                    )
                )
            
            # Bulk create notifications for efficiency
            Notification.objects.bulk_create(notifications)
            logger.info(f"Created {len(notifications)} notifications for new review on {instance.book.title}")


# TODO: Add more signal handlers for other notification types:
# - Subscription expiring (use Celery periodic task)
# - Loan expiring (use Celery periodic task)
# - Book available (when loan system is implemented)
# - Admin announcements (manual creation via admin panel)
