from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Loan, BookCopy, LoanQueue
from apps.content.serializers import BookListSerializer


class BookCopySerializer(serializers.ModelSerializer):
    """Serializer for BookCopy model."""
    
    book_title = serializers.CharField(source='book.title', read_only=True)
    
    class Meta:
        model = BookCopy
        fields = (
            'id', 'book', 'book_title', 'copy_number', 'is_available',
            'condition', 'barcode', 'notes', 'created_at'
        )
        read_only_fields = ('created_at',)


class LoanSerializer(serializers.ModelSerializer):
    """Serializer for Loan model with full details."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    book_detail = BookListSerializer(source='book', read_only=True)
    book_copy_detail = BookCopySerializer(source='book_copy', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    can_renew = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Loan
        fields = (
            'id', 'user', 'user_username', 'book', 'book_detail',
            'book_copy', 'book_copy_detail', 'status', 'status_display',
            'borrowed_at', 'due_date', 'returned_at',
            'renewals_count', 'max_renewals', 'fine_amount',
            'is_overdue', 'days_overdue', 'can_renew', 'notes',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'user', 'borrowed_at', 'returned_at', 'renewals_count',
            'fine_amount', 'created_at', 'updated_at'
        )


class LoanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new loan."""
    
    class Meta:
        model = Loan
        fields = ('book', 'book_copy', 'notes')
    
    def validate(self, data):
        """Validate loan creation rules."""
        user = self.context['request'].user
        book = data['book']
        
        # Check if user already has an active loan for this book
        if Loan.objects.filter(
            user=user,
            book=book,
            status=Loan.LoanStatus.ACTIVE
        ).exists():
            raise serializers.ValidationError(
                "Ya tienes un préstamo activo de este libro."
            )
        
        # Check user's loan limits based on subscription
        active_loans_count = Loan.objects.filter(
            user=user,
            status=Loan.LoanStatus.ACTIVE
        ).count()
        
        # Get user's subscription status
        from apps.subscriptions.models import Subscription
        
        user_subscription = Subscription.objects.filter(
            user=user,
            status='active'
        ).first()
        
        # Set loan limits based on subscription
        if user_subscription:
            if user_subscription.plan.name == 'Premium':
                max_loans = 5
                loan_days = 30
            else:
                max_loans = 2
                loan_days = 14
        else:
            # Free users
            max_loans = 2
            loan_days = 14
        
        if active_loans_count >= max_loans:
            raise serializers.ValidationError(
                f"Has alcanzado el límite de {max_loans} préstamos activos."
            )
        
        # Check if book copy is available
        book_copy = data.get('book_copy')
        if book_copy and not book_copy.is_available:
            raise serializers.ValidationError(
                "Este ejemplar no está disponible."
            )
        
        # If no specific copy, check if any copy is available
        if not book_copy:
            available_copy = BookCopy.objects.filter(
                book=book,
                is_available=True
            ).first()
            
            if not available_copy:
                raise serializers.ValidationError(
                    "No hay ejemplares disponibles de este libro. "
                    "Puedes unirte a la cola de espera."
                )
            
            data['book_copy'] = available_copy
        
        # Set due date
        data['_loan_days'] = loan_days
        
        return data
    
    def create(self, validated_data):
        """Create loan and mark copy as unavailable."""
        loan_days = validated_data.pop('_loan_days', 14)
        
        loan = Loan.objects.create(
            user=self.context['request'].user,
            due_date=timezone.now().date() + timedelta(days=loan_days),
            **validated_data
        )
        
        # Mark copy as unavailable
        if loan.book_copy:
            loan.book_copy.is_available = False
            loan.book_copy.save(update_fields=['is_available'])
        
        return loan


class LoanQueueSerializer(serializers.ModelSerializer):
    """Serializer for LoanQueue model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    book_detail = BookListSerializer(source='book', read_only=True)
    
    class Meta:
        model = LoanQueue
        fields = (
            'id', 'user', 'user_username', 'book', 'book_detail',
            'position', 'notified', 'notified_at', 'expires_at',
            'created_at'
        )
        read_only_fields = ('user', 'position', 'notified', 'notified_at', 'expires_at', 'created_at')


class LoanQueueCreateSerializer(serializers.Serializer):
    """Serializer for joining the loan queue."""
    
    book = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.content.models', fromlist=['Book']).Book.objects.all()
    )
    
    def validate_book(self, book):
        """Validate that user can join the queue."""
        user = self.context['request'].user
        
        # Check if user already in queue for this book
        if LoanQueue.objects.filter(user=user, book=book).exists():
            raise serializers.ValidationError(
                "Ya estás en la cola de espera para este libro."
            )
        
        # Check if user has active loan
        if Loan.objects.filter(
            user=user,
            book=book,
            status=Loan.LoanStatus.ACTIVE
        ).exists():
            raise serializers.ValidationError(
                "Ya tienes un préstamo activo de este libro."
            )
        
        return book
    
    def create(self, validated_data):
        """Add user to queue."""
        user = self.context['request'].user
        book = validated_data['book']
        
        # Get next position in queue
        last_position = LoanQueue.objects.filter(book=book).count()
        
        queue_entry = LoanQueue.objects.create(
            user=user,
            book=book,
            position=last_position + 1
        )
        
        return queue_entry
