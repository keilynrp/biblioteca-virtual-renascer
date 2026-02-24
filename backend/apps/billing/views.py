import logging
from decimal import Decimal
from django.db.models import Sum, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import BillingProfile, StoredPaymentMethod, Invoice
from .serializers import BillingProfileSerializer, StoredPaymentMethodSerializer, InvoiceSerializer
from .services.stripe_service import StripeService

logger = logging.getLogger(__name__)


def _get_or_create_billing_profile(user):
    """Lazy-create BillingProfile on first access."""
    profile, _ = BillingProfile.objects.get_or_create(
        user=user,
        defaults={'email': user.email},
    )
    return profile


class BillingProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_billing_profile(request.user)
        serializer = BillingProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = _get_or_create_billing_profile(request.user)
        serializer = BillingProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SetupIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_billing_profile(request.user)
        try:
            StripeService.get_or_create_customer(profile, request.user)
            result = StripeService.create_setup_intent(profile.stripe_customer_id)
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f'SetupIntent error for user {request.user}: {e}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        methods = StoredPaymentMethod.objects.filter(user=request.user)
        serializer = StoredPaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)


class PaymentMethodDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            method = StoredPaymentMethod.objects.get(pk=pk, user=request.user)
        except StoredPaymentMethod.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            StripeService.detach_payment_method(method.stripe_pm_id)
        except Exception as e:
            logger.error(f'Failed to detach PM {method.stripe_pm_id}: {e}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        method.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PaymentMethodSetDefaultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            method = StoredPaymentMethod.objects.get(pk=pk, user=request.user)
        except StoredPaymentMethod.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile = _get_or_create_billing_profile(request.user)
        if not profile.stripe_customer_id:
            return Response({'detail': 'No Stripe customer found.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            StripeService.set_default_payment_method(profile.stripe_customer_id, method.stripe_pm_id)
        except Exception as e:
            logger.error(f'Failed to set default PM: {e}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Update is_default flag in DB
        StoredPaymentMethod.objects.filter(user=request.user).update(is_default=False)
        method.is_default = True
        method.save(update_fields=['is_default'])

        serializer = StoredPaymentMethodSerializer(method)
        return Response(serializer.data)


class InvoiceListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        qs = Invoice.objects.filter(user=self.request.user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())

        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(invoice_number__icontains=search)
                | Q(description__icontains=search)
                | Q(billing_name__icontains=search)
            )

        return qs


class InvoiceSummaryView(APIView):
    """Lightweight summary stats for the invoices stat cards."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Invoice.objects.filter(user=request.user)
        total_paid = qs.filter(status=Invoice.STATUS_PAID).aggregate(
            s=Sum('amount')
        )['s'] or Decimal('0')
        total_refunded = qs.filter(status=Invoice.STATUS_REFUNDED).aggregate(
            s=Sum('amount')
        )['s'] or Decimal('0')
        invoice_count = qs.count()
        return Response({
            'total_paid': str(total_paid),
            'total_refunded': str(total_refunded),
            'invoice_count': invoice_count,
        })


class InvoiceDownloadView(APIView):
    """
    Stream an invoice as PDF.
    Supports JWT via Authorization header OR ?token= query param for direct browser downloads.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # Authenticate via header or query param
        user = request.user
        if not user or not user.is_authenticated:
            token = request.query_params.get('token')
            if not token:
                return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
            try:
                validated = JWTAuthentication().get_validated_token(token.encode())
                user = JWTAuthentication().get_user(validated)
            except (InvalidToken, TokenError):
                return Response({'detail': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            invoice = Invoice.objects.get(pk=pk, user=user)
        except Invoice.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            from .services.invoice_pdf import generate_invoice_pdf
            pdf_buffer = generate_invoice_pdf(invoice)
        except Exception as e:
            logger.error(f'PDF generation error for invoice {pk}: {e}')
            return Response({'detail': 'PDF generation failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        filename = f'{invoice.invoice_number}.pdf'
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response


class RefundView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if invoice.status != Invoice.STATUS_PAID:
            return Response(
                {'detail': f'Invoice is not in PAID status (current: {invoice.status}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not invoice.transaction or not invoice.transaction.stripe_payment_intent_id:
            return Response(
                {'detail': 'No associated Stripe PaymentIntent found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = request.data.get('amount')
        reason = request.data.get('reason', 'requested_by_customer')

        amount_cents = None
        if amount:
            try:
                amount_cents = int(float(amount) * 100)
            except (ValueError, TypeError):
                return Response({'detail': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refund = StripeService.create_refund(
                invoice.transaction.stripe_payment_intent_id,
                amount_cents=amount_cents,
                reason=reason,
            )
        except Exception as e:
            logger.error(f'Stripe refund error for invoice {pk}: {e}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Update invoice and transaction status
        invoice.status = Invoice.STATUS_REFUNDED
        invoice.stripe_refund_id = refund.id
        invoice.refunded_at = timezone.now()
        invoice.save(update_fields=['status', 'stripe_refund_id', 'refunded_at'])

        transaction = invoice.transaction
        transaction.status = 'REFUNDED'
        transaction.save(update_fields=['status'])

        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
