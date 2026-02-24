
import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Transaction
from .serializers import CheckoutSerializer, TransactionSerializer
from apps.subscriptions.models import Plan, UserSubscription
import stripe
import os

from .services.paypal_service import PayPalService

# Configure logging and Stripe
logger = logging.getLogger(__name__)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class StripeConfigView(APIView):
    """
    Returns the Stripe publishable key for frontend
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        return Response({
            'publishableKey': os.getenv('STRIPE_PUBLISHABLE_KEY')
        })

class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_id = serializer.validated_data['plan_id']
        payment_method = serializer.validated_data['payment_method']
        order_reference = serializer.validated_data.get('order_reference', '')

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        if payment_method == 'CREDIT_CARD':
            try:
                # Create Stripe PaymentIntent
                intent = stripe.PaymentIntent.create(
                    amount=int(plan.price * 100),  # Stripe expects amount in cents
                    currency='usd', # Default or use plan currency
                    metadata={
                        'plan_id': plan_id,
                        'user_id': request.user.id,
                        'user_email': request.user.email,
                    }
                )

                # Create Pending Transaction
                transaction = Transaction.objects.create(
                    user=request.user,
                    plan=plan,
                    amount=plan.price,
                    status='PENDING',
                    payment_method='CREDIT_CARD',
                    stripe_payment_intent_id=intent.id
                )

                return Response({
                    "transaction_id": str(transaction.id),
                    "client_secret": intent.client_secret,
                    "amount": plan.price,
                    "payment_method": "CREDIT_CARD"
                }, status=status.HTTP_201_CREATED)

            except stripe.error.StripeError as e:
                return Response({"detail": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif payment_method == 'PAYPAL':
            # For PayPal, we handle actual order creation on frontend but register it here
            transaction = Transaction.objects.create(
                user=request.user,
                plan=plan,
                amount=plan.price,
                status='PENDING',
                payment_method='PAYPAL'
            )
            return Response({
                "transaction_id": str(transaction.id),
                "amount": plan.price,
                "payment_method": "PAYPAL"
            }, status=status.HTTP_201_CREATED)

        elif payment_method == 'MANUAL_TRANSFER':
            if not order_reference:
                return Response({"order_reference": ["This field is required for manual transfers."]}, status=status.HTTP_400_BAD_REQUEST)
            
            transaction = Transaction.objects.create(
                user=request.user,
                plan=plan,
                amount=plan.price,
                status='PENDING',
                payment_method='MANUAL_TRANSFER',
                payment_reference=order_reference
            )
            return Response({
                "transaction_id": str(transaction.id),
                "status": "PENDING_APPROVAL",
                "detail": "Transfer recorded. Waiting for administrator approval."
            }, status=status.HTTP_201_CREATED)

        return Response({"detail": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST)

class ConfirmPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        payment_method = request.data.get('payment_method')
        
        if not transaction_id:
            return Response({"detail": "Transaction ID required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        except Transaction.DoesNotExist:
            return Response({"detail": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        if transaction.status == 'COMPLETED':
            return Response({"detail": "Transaction already completed"}, status=status.HTTP_200_OK)

        if payment_method == 'CREDIT_CARD':
            try:
                if transaction.stripe_payment_intent_id:
                    intent = stripe.PaymentIntent.retrieve(transaction.stripe_payment_intent_id)
                    if intent.status == 'succeeded':
                        self._activate_subscription(transaction)
                        return Response({"status": "Payment successful", "subscription": "active"}, status=status.HTTP_200_OK)
                    else:
                        return Response({"detail": f"Payment status: {intent.status}"}, status=status.HTTP_200_OK)
            except stripe.error.StripeError as e:
                return Response({"detail": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif payment_method == 'PAYPAL':
            paypal_order_id = request.data.get('paypal_order_id')
            if not paypal_order_id:
                return Response({"detail": "PayPal Order ID required"}, status=status.HTTP_400_BAD_REQUEST)
            
            paypal = PayPalService()
            order = paypal.verify_order(paypal_order_id)
            
            if order and order.get('status') in ['COMPLETED', 'APPROVED']:
                transaction.paypal_order_id = paypal_order_id
                self._activate_subscription(transaction)
                return Response({"status": "Payment successful", "subscription": "active"}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "PayPal verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Payment confirmation not supported for this method"}, status=status.HTTP_400_BAD_REQUEST)

    def _activate_subscription(self, transaction):
        transaction.status = 'COMPLETED'
        transaction.save()

        # Deactivate old subscriptions
        UserSubscription.objects.filter(user=transaction.user, is_active=True).update(is_active=False)
        
        # Create new subscription
        UserSubscription.objects.create(
            user=transaction.user,
            plan=transaction.plan,
            start_date=timezone.now(),
            is_active=True
        )

        # Create Invoice
        try:
            from apps.billing.services.invoice_service import create_invoice_for_transaction
            create_invoice_for_transaction(transaction)
        except Exception as e:
            logger.error(f"Invoice creation failed: {str(e)}")

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Handle Stripe webhook events for payment confirmations
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            # Find transaction by payment_intent_id
            try:
                transaction = Transaction.objects.get(
                    stripe_payment_intent_id=payment_intent['id']
                )
                
                if transaction.status != 'COMPLETED':
                    transaction.status = 'COMPLETED'
                    transaction.save()

                    # Activate Subscription
                    UserSubscription.objects.filter(
                        user=transaction.user,
                        is_active=True
                    ).update(is_active=False)

                    UserSubscription.objects.create(
                        user=transaction.user,
                        plan=transaction.plan,
                        start_date=timezone.now(),
                        is_active=True
                    )

                    # Create Invoice for this transaction
                    try:
                        from apps.billing.services.invoice_service import create_invoice_for_transaction
                        create_invoice_for_transaction(transaction)
                    except Exception as invoice_err:
                        logger.error(f'Invoice creation failed: {invoice_err}')
            except Transaction.DoesNotExist:
                pass

        elif event['type'] == 'setup_intent.succeeded':
            try:
                from apps.billing.services.webhook_billing import handle_setup_intent_succeeded
                handle_setup_intent_succeeded(event['data']['object'])
            except Exception as setup_err:
                logger.error(f'setup_intent.succeeded handler failed: {setup_err}')

        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            
            try:
                transaction = Transaction.objects.get(
                    stripe_payment_intent_id=payment_intent['id']
                )
                transaction.status = 'FAILED'
                transaction.save()
            except Transaction.DoesNotExist:
                pass

        return Response(status=status.HTTP_200_OK)

class BankDetailsView(APIView):
    """
    Returns the bank details for manual transfers from environment variables
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            'bankName': os.getenv('BANK_NAME', 'Banco de Desarrollo'),
            'accountName': os.getenv('BANK_ACCOUNT_NAME', 'Biblioteca Virtual Renascer'),
            'accountNumber': os.getenv('BANK_ACCOUNT_NUMBER', '12345678-9'),
            'pixKey': os.getenv('BANK_PIX_KEY', 'financeiro@bvs.org'),
        })
