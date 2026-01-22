"""
Utility functions for loan management.
"""
from django.utils import timezone
from datetime import timedelta
from .models import Loan, LoanQueue
from apps.notifications.models import Notification
import logging

logger = logging.getLogger(__name__)


def process_loan_return(book):
    """
    Process loan return and notify next user in queue.
    
    Args:
        book: Book instance that was returned
    """
    # Get first person in queue
    queue_entry = LoanQueue.objects.filter(
        book=book,
        notified=False
    ).order_by('position').first()
    
    if queue_entry:
        # Notify user
        queue_entry.notify_availability()
        
        # Create notification
        Notification.objects.create(
            user=queue_entry.user,
            type=Notification.NotificationType.BOOK_AVAILABLE,
            title=f'Libro disponible: {book.title}',
            message=f'El libro "{book.title}" que reservaste ya está disponible. Tienes 3 días para tomarlo prestado.',
            link=f'/library/{book.slug}',
            metadata={
                'queue_id': queue_entry.id,
                'book_id': book.id,
                'expires_at': queue_entry.expires_at.isoformat() if queue_entry.expires_at else None
            }
        )
        
        logger.info(f"Notified user {queue_entry.user.username} about available book {book.title}")


def check_overdue_loans():
    """
    Check for overdue loans and update status + send notifications.
    This should be run as a periodic task (Celery).
    """
    # Get active loans that are overdue
    overdue_loans = Loan.objects.filter(
        status=Loan.LoanStatus.ACTIVE,
        due_date__lt=timezone.now().date()
    )
    
    for loan in overdue_loans:
        # Update status
        loan.status = Loan.LoanStatus.OVERDUE
        loan.save(update_fields=['status'])
        
        # Check if notification already sent today
        today_notification = Notification.objects.filter(
            user=loan.user,
            type=Notification.NotificationType.LOAN_EXPIRING,
            metadata__loan_id=loan.id,
            created_at__date=timezone.now ().date()
        ).exists()
        
        if not today_notification:
            # Create notification
            Notification.objects.create(
                user=loan.user,
                type=Notification.NotificationType.LOAN_EXPIRING,
                title=f'Préstamo vencido: {loan.book.title}',
                message=f'El préstamo de "{loan.book.title}" venció hace {loan.days_overdue} día(s). Por favor devuélvelo lo antes posible.',
                link='/my-loans',
                metadata={
                    'loan_id': loan.id,
                    'book_id': loan.book.id,
                    'days_overdue': loan.days_overdue
                }
            )
    
    logger.info(f"Processed {overdue_loans.count()} overdue loans")
    return overdue_loans.count()


def send_due_soon_reminders():
    """
    Send reminders for loans due in 3 days.
    This should be run as a periodic task (Celery).
    """
    three_days_from_now = timezone.now().date() + timedelta(days=3)
    
    due_soon_loans = Loan.objects.filter(
        status=Loan.LoanStatus.ACTIVE,
        due_date=three_days_from_now
    )
    
    for loan in due_soon_loans:
        # Check if notification already sent
        existing_notification = Notification.objects.filter(
            user=loan.user,
            type=Notification.NotificationType.LOAN_EXPIRING,
            metadata__loan_id=loan.id,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).exists()
        
        if not existing_notification:
            Notification.objects.create(
                user=loan.user,
                type=Notification.NotificationType.LOAN_EXPIRING,
                title=f'Recordatorio: {loan.book.title} vence pronto',
                message=f'El préstamo de "{loan.book.title}" vence en 3 días ({loan.due_date.strftime("%d/%m/%Y")}). {"Puedes renovarlo" if loan.can_renew else "Por favor devuélvelo a tiempo"}.',
                link='/my-loans',
                metadata={
                    'loan_id': loan.id,
                    'book_id': loan.book.id,
                    'due_date': loan.due_date.isoformat(),
                    'can_renew': loan.can_renew
                }
            )
    
    logger.info(f"Sent {due_soon_loans.count()} due soon reminders")
    return due_soon_loans.count()
