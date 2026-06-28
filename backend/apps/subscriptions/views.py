
from rest_framework import generics, permissions, status, viewsets
from apps.core.permissions import IsAdminType
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import (
    Plan, UserSubscription, InstitutionSubscription,
    Collection, CollectionBook, InstitutionCollectionAccess,
    BookPurchase,
)
from .serializers import (
    PlanSerializer, UserSubscriptionSerializer, InstitutionSubscriptionSerializer,
    CollectionSerializer, CollectionBookSerializer, InstitutionCollectionAccessSerializer,
    BookPurchaseSerializer, BookPurchaseCreateSerializer,
)


# ─────────────────────────────────────────────────────────────────────
# Plans
# ─────────────────────────────────────────────────────────────────────

class PlanListView(generics.ListCreateAPIView):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsAdminType()]
        return [permissions.AllowAny()]


class PlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminType()]

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()
        plan.is_active = False
        plan.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────
# User Subscriptions
# ─────────────────────────────────────────────────────────────────────

class SubscriptionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminType()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not subscription:
            return Response({"detail": "No active subscription"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)

    def post(self, request):
        plan_id = request.data.get('plan_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # Determine start date
        if start_date:
            start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start_date_obj = timezone.now()

        # Deactivate existing subscriptions
        UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            start_date=start_date_obj
        )
        if end_date:
            subscription.end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            subscription.save()

        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CancelSubscriptionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not subscription:
            return Response({"detail": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)

        subscription.is_active = False
        subscription.auto_renew = False
        subscription.save()

        return Response({"detail": "Subscription cancelled successfully"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────
# Institution Subscriptions
# ─────────────────────────────────────────────────────────────────────

class InstitutionSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing Institution Subscriptions.
    Admin only or Institution Managers.
    """
    queryset = InstitutionSubscription.objects.all()
    serializer_class = InstitutionSubscriptionSerializer
    permission_classes = (IsAdminType,)


# ─────────────────────────────────────────────────────────────────────
# Trial Status
# ─────────────────────────────────────────────────────────────────────

class TrialStatusView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        has_active_subscription = UserSubscription.objects.filter(
            user=user, is_active=True, end_date__gte=timezone.now()
        ).exists()

        trial_end_date = getattr(user, 'trial_end_date', None)
        now = timezone.now()

        if trial_end_date is None:
            days_remaining = 0
            is_on_trial = False
            trial_expired = True
        else:
            delta = trial_end_date - now
            days_remaining = max(0, delta.days)
            trial_expired = delta.total_seconds() <= 0
            is_on_trial = not has_active_subscription and not trial_expired

        return Response({
            'is_on_trial': is_on_trial,
            'days_remaining': days_remaining,
            'trial_end_date': trial_end_date,
            'has_active_subscription': has_active_subscription,
            'trial_expired': trial_expired,
        })


# ─────────────────────────────────────────────────────────────────────
# Access Level (new)
# ─────────────────────────────────────────────────────────────────────

class AccessLevelView(APIView):
    """
    GET /api/subscriptions/access-level/
    Returns the current user's computed access tier.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from .utils import get_user_access_level
        tier = get_user_access_level(request.user)
        return Response({'access_level': tier})


# ─────────────────────────────────────────────────────────────────────
# Collections API (new)
# ─────────────────────────────────────────────────────────────────────

class CollectionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/subscriptions/collections/        — lista pública
    POST /api/subscriptions/collections/        — crear (admin)
    """
    queryset = Collection.objects.filter(is_active=True)
    serializer_class = CollectionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminType()]
        return [permissions.AllowAny()]


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/subscriptions/collections/<slug>/
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminType()]


class CollectionBooksView(APIView):
    """
    GET  /api/subscriptions/collections/<slug>/books/  — libros paginados
    POST /api/subscriptions/collections/<slug>/books/  — agregar libro
    DELETE /api/subscriptions/collections/<slug>/books/<book_id>/  — quitar libro
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminType()]

    def get(self, request, slug):
        from apps.content.models import Book
        try:
            collection = Collection.objects.get(slug=slug, is_active=True)
        except Collection.DoesNotExist:
            return Response({"detail": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)

        books = collection.books.all().order_by('title')
        from apps.content.serializers import BookListSerializer
        serializer = BookListSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, slug):
        try:
            collection = Collection.objects.get(slug=slug)
        except Collection.DoesNotExist:
            return Response({"detail": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)

        book_id = request.data.get('book_id')
        if not book_id:
            return Response({"detail": "book_id required"}, status=status.HTTP_400_BAD_REQUEST)

        from apps.content.models import Book
        from django.shortcuts import get_object_or_404
        book = get_object_or_404(Book, id=book_id)

        obj, created = CollectionBook.objects.get_or_create(
            collection=collection, book=book,
            defaults={'order': CollectionBook.objects.filter(collection=collection).count()}
        )
        if not created:
            return Response({"detail": "Book already in collection"}, status=status.HTTP_200_OK)

        return Response({"detail": "Book added to collection"}, status=status.HTTP_201_CREATED)


class CollectionBookDeleteView(APIView):
    permission_classes = (IsAdminType,)

    def delete(self, request, slug, book_id):
        deleted, _ = CollectionBook.objects.filter(
            collection__slug=slug, book_id=book_id
        ).delete()
        if not deleted:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────
# Institutional Collection Purchase (à la carte)
# ─────────────────────────────────────────────────────────────────────

class InstitutionCollectionPurchaseView(APIView):
    """
    POST /api/subscriptions/institutions/<id>/collections/purchase/
    Body: { "collection_id": <int>, "expires_at": "..." (optional) }
    Admin-only: grants à la carte access.
    """
    permission_classes = (IsAdminType,)

    def post(self, request, institution_id):
        from apps.institutions.models import Institution
        from django.shortcuts import get_object_or_404

        institution = get_object_or_404(Institution, id=institution_id)
        collection_id = request.data.get('collection_id')
        expires_at = request.data.get('expires_at')

        if not collection_id:
            return Response({"detail": "collection_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            collection = Collection.objects.get(id=collection_id, is_active=True)
        except Collection.DoesNotExist:
            return Response({"detail": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)

        obj, created = InstitutionCollectionAccess.objects.update_or_create(
            institution=institution,
            collection=collection,
            defaults={
                'is_active': True,
                'expires_at': expires_at,
            }
        )
        serializer = InstitutionCollectionAccessSerializer(obj)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class InstitutionCollectionListView(generics.ListAPIView):
    """
    GET /api/subscriptions/institutions/<id>/collections/
    List all active collection accesses for an institution.
    """
    serializer_class = InstitutionCollectionAccessSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return InstitutionCollectionAccess.objects.filter(
            institution_id=self.kwargs['institution_id'],
            is_active=True,
        ).select_related('collection')


# ───────────────────────────────────────────────────────────────────
# BookPurchase (micro-transacciones B2C) — Fase 5
# ───────────────────────────────────────────────────────────────────

class BookPurchaseView(APIView):
    """
    POST /api/subscriptions/book-purchase/
    Body: { "book_id": int, "purchase_type": "permanent"|"rental", "payment_method": "..." }
    Creates a Stripe PaymentIntent for a single book purchase.
    """
    permission_classes = (permissions.IsAuthenticated,)

    RENTAL_DAYS = 30  # Default rental duration

    def post(self, request):
        serializer = BookPurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        purchase_type = serializer.validated_data['purchase_type']

        from apps.content.models import Book
        from django.shortcuts import get_object_or_404
        book = get_object_or_404(Book, id=book_id)

        if not book.is_premium:
            return Response(
                {"detail": "Este libro es gratuito, no requiere compra."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already purchased
        existing = BookPurchase.objects.filter(user=request.user, book=book).first()
        if existing and existing.is_valid:
            return Response(
                {"detail": "Ya tienes acceso a este libro."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine price from collection retail_price or a default
        collection = book.collections.first()
        if collection and collection.retail_price:
            price = collection.retail_price
        else:
            from decimal import Decimal
            price = Decimal('9.99')  # Default retail price

        if purchase_type == 'rental':
            from decimal import Decimal
            price = round(price * Decimal('0.4'), 2)  # 40% of purchase price for rental

        # Calculate valid_until for rentals
        from datetime import timedelta
        valid_until = None
        if purchase_type == 'rental':
            valid_until = timezone.now() + timedelta(days=self.RENTAL_DAYS)

        # Create transaction
        import stripe
        import os
        from apps.payments.models import Transaction

        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(price * 100),
                currency='usd',
                metadata={
                    'book_id': book_id,
                    'user_id': request.user.id,
                    'purchase_type': purchase_type,
                    'type': 'book_purchase',
                    # Store valid_until so the webhook can set the exact same value
                    'valid_until': valid_until.isoformat() if valid_until else '',
                },
            )

            transaction = Transaction.objects.create(
                user=request.user,
                amount=price,
                status='PENDING',
                payment_method='CREDIT_CARD',
                stripe_payment_intent_id=intent.id,
            )

            # BookPurchase is created by the webhook (payment_intent.succeeded)
            # after payment is confirmed, not here.
            return Response({
                'transaction_id': str(transaction.id),
                'client_secret': intent.client_secret,
                'amount': float(price),
                'purchase_type': purchase_type,
                'valid_until': valid_until,
            }, status=status.HTTP_201_CREATED)

        except stripe.error.StripeError as e:
            return Response(
                {"detail": f"Error de pago: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MyPurchasesView(generics.ListAPIView):
    """
    GET /api/subscriptions/my-purchases/
    List all books purchased by the current user.
    """
    serializer_class = BookPurchaseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return BookPurchase.objects.filter(
            user=self.request.user,
        ).select_related('book', 'transaction').order_by('-purchased_at')

