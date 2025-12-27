
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

# Configure Stripe
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
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Create Stripe PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=int(plan.price * 100),  # Stripe expects amount in cents
                currency=plan.currency.lower() if hasattr(plan, 'currency') else 'usd',
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
                payment_method=serializer.validated_data['payment_method'],
                stripe_payment_intent_id=intent.id
            )

            return Response({
                "transaction_id": str(transaction.id),
                "client_secret": intent.client_secret,
                "amount": plan.price
            }, status=status.HTTP_201_CREATED)

        except stripe.error.StripeError as e:
            return Response({
                "detail": f"Stripe error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

class ConfirmPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not transaction_id:
            return Response({"detail": "Transaction ID required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        except Transaction.DoesNotExist:
            return Response({"detail": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        if transaction.status == 'COMPLETED':
            return Response({"detail": "Transaction already completed"}, status=status.HTTP_200_OK)

        try:
            # Verify payment with Stripe
            if transaction.stripe_payment_intent_id:
                intent = stripe.PaymentIntent.retrieve(transaction.stripe_payment_intent_id)
                
                if intent.status == 'succeeded':
                    transaction.status = 'COMPLETED'
                    transaction.save()

                    # Activate Subscription
                    UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)
                    UserSubscription.objects.create(
                        user=request.user,
                        plan=transaction.plan,
                        start_date=timezone.now(),
                        is_active=True
                    )

                    return Response({
                        "status": "Payment successful", 
                        "subscription": "active"
                    }, status=status.HTTP_200_OK)
                elif intent.status == 'requires_payment_method':
                    transaction.status = 'FAILED'
                    transaction.save()
                    return Response({
                        "detail": "Payment failed. Please try again with a different payment method."
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        "detail": f"Payment status: {intent.status}"
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "detail": "No Stripe payment intent found"
                }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            return Response({
                "detail": f"Stripe error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

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
            except Transaction.DoesNotExist:
                pass

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
