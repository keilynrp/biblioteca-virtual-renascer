from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Loan, BookCopy, LoanQueue
from .serializers import (
    LoanSerializer, LoanCreateSerializer, BookCopySerializer,
    LoanQueueSerializer, LoanQueueCreateSerializer
)
import logging

logger = logging.getLogger(__name__)


class LoanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing book loans.
    
    Provides endpoints for:
    - Listing user's loans
    - Creating new loans
    - Returning books
    - Renewing loans
    - Viewing active/overdue loans
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter loans to only those belonging to the authenticated user."""
        if getattr(self, 'swagger_fake_view', False):
            return Loan.objects.none()
        
        user = self.request.user
        if user.is_staff:
            return Loan.objects.all().select_related(
                'user', 'book', 'book__author', 'book__category', 'book_copy'
            )
        return Loan.objects.filter(user=user).select_related(
            'book', 'book__author', 'book__category', 'book_copy'
        )
    
    def get_serializer_class(self):
        """Use different serializer for create action."""
        if self.action == 'create':
            return LoanCreateSerializer
        return LoanSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new loan."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        loan = serializer.save()
        
        # Create notification
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=request.user,
            type=Notification.NotificationType.BOOK_AVAILABLE,
            title=f'Préstamo confirmado: {loan.book.title}',
            message=f'Has tomado prestado "{loan.book.title}". Fecha de vencimiento: {loan.due_date.strftime("%d/%m/%Y")}.',
            link=f'/my-loans',
            metadata={
                'loan_id': loan.id,
                'book_id': loan.book.id,
                'due_date': loan.due_date.isoformat()
            }
        )
        
        headers = self.get_success_headers(serializer.data)
        return_serializer = LoanSerializer(loan, context={'request': request})
        return Response(return_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['patch'])
    def return_loan(self, request, pk=None):
        """Return a borrowed book."""
        loan = self.get_object()
        
        try:
            loan.return_book()
            
            # Check if anyone is in queue for this book
            from .utils import process_loan_return
            process_loan_return(loan.book)
            
            logger.info(f"Loan {loan.id} returned by user {request.user.username}")
            
            serializer = self.get_serializer(loan)
            return Response(serializer.data)
        
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'])
    def renew(self, request, pk=None):
        """Renew a loan."""
        loan = self.get_object()
        
        try:
            # Check if anyone is in queue
            if LoanQueue.objects.filter(book=loan.book).exists():
                return Response(
                    {'error': 'No puedes renovar porque hay usuarios en cola de espera.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            loan.renew()
            
            # Create notification
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=request.user,
                type=Notification.NotificationType.LOAN_EXPIRING,
                title=f'Préstamo renovado: {loan.book.title}',
                message=f'Has renovado el préstamo de "{loan.book.title}". Nueva fecha de vencimiento: {loan.due_date.strftime("%d/%m/%Y")}.',
                link='/my-loans',
                metadata={
                    'loan_id': loan.id,
                    'book_id': loan.book.id,
                    'due_date': loan.due_date.isoformat()
                }
            )
            
            logger.info(f"Loan {loan.id} renewed by user {request.user.username}")
            
            serializer = self.get_serializer(loan)
            return Response(serializer.data)
        
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active loans."""
        active_loans = self.get_queryset().filter(status=Loan.LoanStatus.ACTIVE)
        
        page = self.paginate_queryset(active_loans)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(active_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue loans."""
        overdue_loans = self.get_queryset().filter(
            status=Loan.LoanStatus.ACTIVE,
            due_date__lt=timezone.now().date()
        )
        
        serializer = self.get_serializer(overdue_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get loan history (returned loans)."""
        history = self.get_queryset().filter(status=Loan.LoanStatus.RETURNED)
        
        page = self.paginate_queryset(history)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def can_borrow(self, request):
        """Check if user can borrow a specific book."""
        book_id = request.query_params.get('book_id')
        
        if not book_id:
            return Response(
                {'error': 'book_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already has this book
        has_active_loan = Loan.objects.filter(
            user=request.user,
            book_id=book_id,
            status=Loan.LoanStatus.ACTIVE
        ).exists()
        
        if has_active_loan:
            return Response({'can_borrow': False, 'reason': 'Ya tienes este libro prestado'})
        
        # Check active loans count
        active_count = Loan.objects.filter(
            user=request.user,
            status=Loan.LoanStatus.ACTIVE
        ).count()
        
        # Check subscription
        from apps.subscriptions.models import Subscription
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        max_loans = 5 if subscription and subscription.plan.name == 'Premium' else 2
        
        if active_count >= max_loans:
            return Response({
                'can_borrow': False,
                'reason': f'Has alcanzado el límite de {max_loans} préstamos activos'
            })
        
        # Check availability
        available_copy = BookCopy.objects.filter(
            book_id=book_id,
            is_available=True
        ).exists()
        
        return Response({
            'can_borrow': available_copy,
            'reason': 'Disponible' if available_copy else 'No hay ejemplares disponibles',
            'queue_available': not available_copy
        })


class BookCopyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing book copies."""
    
    queryset = BookCopy.objects.all().select_related('book')
    serializer_class = BookCopySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class LoanQueueViewSet(viewsets.ModelViewSet):
    """ViewSet for managing loan queue/reservations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter to user's reservations."""
        if getattr(self, 'swagger_fake_view', False):
            return LoanQueue.objects.none()
        
        return LoanQueue.objects.filter(user=self.request.user).select_related(
            'book', 'book__author', 'book__category'
        )
    
    def get_serializer_class(self):
        """Use different serializer for create action."""
        if self.action == 'create':
            return LoanQueueCreateSerializer
        return LoanQueueSerializer
    
    def create(self, request, *args, **kwargs):
        """Join the loan queue for a book."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        queue_entry = serializer.save()
        
        # Create notification
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=request.user,
            type=Notification.NotificationType.BOOK_RECOMMENDATION,
            title=f'Reserva confirmada: {queue_entry.book.title}',
            message=f'Te has unido a la cola de espera para "{queue_entry.book.title}". Posición: {queue_entry.position}.',
            link=f'/library/{queue_entry.book.slug}',
            metadata={
                'queue_id': queue_entry.id,
                'book_id': queue_entry.book.id,
                'position': queue_entry.position
            }
        )
        
        headers = self.get_success_headers(serializer.data)
        return_serializer = LoanQueueSerializer(queue_entry, context={'request': request})
        return Response(return_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def my_reservations(self, request):
        """Get user's active reservations."""
        reservations = self.get_queryset().filter(notified=False)
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
