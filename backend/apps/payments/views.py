
import logging
from decimal import Decimal
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import F
from .models import Transaction
from .serializers import CheckoutSerializer, TransactionSerializer
from apps.subscriptions.models import Plan, UserSubscription, Coupon, CouponUse
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


# ─────────────────────────────────────────────────────────────────────
# Coupon Validation
# ─────────────────────────────────────────────────────────────────────

class ValidateCouponView(APIView):
    """
    POST /api/payments/validate-coupon/
    Body: { "code": "...", "plan_id": <int> (optional) }
    Returns: { "valid", "discount_type", "discount_value", "final_price" }
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        code = request.data.get('code', '').strip()
        plan_id = request.data.get('plan_id')

        if not code:
            return Response(
                {"detail": "Código de cupón requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({
                "valid": False,
                "detail": "Cupón no encontrado.",
            })

        if not coupon.is_valid:
            return Response({
                "valid": False,
                "detail": "El cupón ha expirado o ya alcanzó su límite de usos.",
            })

        # Check plan applicability
        if plan_id and coupon.applicable_plans.exists():
            if not coupon.applicable_plans.filter(id=plan_id).exists():
                return Response({
                    "valid": False,
                    "detail": "Este cupón no aplica al plan seleccionado.",
                })

        # Calculate discount against a plan price
        final_price = None
        discount_amount = None
        if plan_id:
            try:
                plan = Plan.objects.get(id=plan_id, is_active=True)
                discount_amount = coupon.calculate_discount(plan.price)
                final_price = max(Decimal('0'), plan.price - discount_amount)
            except Plan.DoesNotExist:
                pass

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": float(coupon.discount_value),
            "discount_amount": float(discount_amount) if discount_amount else None,
            "final_price": float(final_price) if final_price is not None else None,
        })


# ─────────────────────────────────────────────────────────────────────
# Checkout (enhanced with coupon + billing_cycle)
# ─────────────────────────────────────────────────────────────────────

class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_id = serializer.validated_data['plan_id']
        payment_method = serializer.validated_data['payment_method']
        order_reference = serializer.validated_data.get('order_reference', '')
        coupon_code = serializer.validated_data.get('coupon_code', '').strip()
        billing_cycle = serializer.validated_data.get('billing_cycle', 'monthly')

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # ── Determine base price ──────────────────────────────────────
        if billing_cycle == 'annual' and plan.annual_price:
            charge_price = plan.annual_price
        else:
            charge_price = plan.price

        # ── Apply coupon ──────────────────────────────────────────────
        coupon = None
        discount_amount = Decimal('0')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
            except Coupon.DoesNotExist:
                return Response(
                    {"detail": "Cupón no válido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not coupon.is_valid:
                return Response(
                    {"detail": "El cupón ha expirado o alcanzó su límite."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if coupon.applicable_plans.exists() and not coupon.applicable_plans.filter(id=plan_id).exists():
                return Response(
                    {"detail": "El cupón no aplica a este plan."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            discount_amount = coupon.calculate_discount(charge_price)

        final_price = max(Decimal('0'), charge_price - discount_amount)

        # ── Create transaction per payment method ─────────────────────
        if payment_method == 'CREDIT_CARD':
            try:
                intent = stripe.PaymentIntent.create(
                    amount=int(final_price * 100),
                    currency='usd',
                    metadata={
                        'plan_id': plan_id,
                        'user_id': request.user.id,
                        'user_email': request.user.email,
                        'coupon_code': coupon_code or '',
                        'billing_cycle': billing_cycle,
                    }
                )

                transaction = Transaction.objects.create(
                    user=request.user,
                    plan=plan,
                    amount=final_price,
                    status='PENDING',
                    payment_method='CREDIT_CARD',
                    stripe_payment_intent_id=intent.id,
                )

                # Record coupon use (uses_count incremented on payment confirmation, not here)
                if coupon:
                    CouponUse.objects.create(
                        coupon=coupon,
                        user=request.user,
                        transaction=transaction,
                        discount_applied=discount_amount,
                    )

                return Response({
                    "transaction_id": str(transaction.id),
                    "client_secret": intent.client_secret,
                    "amount": float(final_price),
                    "original_price": float(charge_price),
                    "discount": float(discount_amount),
                    "billing_cycle": billing_cycle,
                    "payment_method": "CREDIT_CARD",
                }, status=status.HTTP_201_CREATED)

            except stripe.error.StripeError as e:
                return Response({"detail": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif payment_method == 'PAYPAL':
            transaction = Transaction.objects.create(
                user=request.user,
                plan=plan,
                amount=final_price,
                status='PENDING',
                payment_method='PAYPAL',
            )
            if coupon:
                CouponUse.objects.create(
                    coupon=coupon, user=request.user,
                    transaction=transaction, discount_applied=discount_amount,
                )

            return Response({
                "transaction_id": str(transaction.id),
                "amount": float(final_price),
                "original_price": float(charge_price),
                "discount": float(discount_amount),
                "billing_cycle": billing_cycle,
                "payment_method": "PAYPAL",
            }, status=status.HTTP_201_CREATED)

        elif payment_method == 'MANUAL_TRANSFER':
            if not order_reference:
                return Response(
                    {"order_reference": ["This field is required for manual transfers."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            transaction = Transaction.objects.create(
                user=request.user,
                plan=plan,
                amount=final_price,
                status='PENDING',
                payment_method='MANUAL_TRANSFER',
                payment_reference=order_reference,
            )
            if coupon:
                CouponUse.objects.create(
                    coupon=coupon, user=request.user,
                    transaction=transaction, discount_applied=discount_amount,
                )

            return Response({
                "transaction_id": str(transaction.id),
                "status": "PENDING_APPROVAL",
                "detail": "Transfer recorded. Waiting for administrator approval.",
            }, status=status.HTTP_201_CREATED)

        return Response({"detail": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────
# Confirm Payment (unchanged logic, kept intact)
# ─────────────────────────────────────────────────────────────────────

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
        if transaction.plan is None:
            logger.warning(f'_activate_subscription called with no plan on transaction {transaction.id}')
            return

        transaction.status = 'COMPLETED'
        transaction.save()

        # Deactivate old subscriptions
        UserSubscription.objects.filter(user=transaction.user, is_active=True).update(is_active=False)

        # Create new subscription
        from datetime import timedelta
        start = timezone.now()
        plan = transaction.plan
        end = start + timedelta(days=plan.duration_days)
        grace_end = (end + timedelta(days=plan.grace_period_days)) if plan.grace_period_days > 0 else None

        sub = UserSubscription.objects.create(
            user=transaction.user,
            plan=plan,
            start_date=start,
            end_date=end,
            grace_period_end=grace_end,
            is_active=True,
        )

        # Increment coupon uses_count now that payment is confirmed (atomic)
        coupon_use = CouponUse.objects.filter(transaction=transaction).first()
        if coupon_use:
            Coupon.objects.filter(pk=coupon_use.coupon_id).update(uses_count=F('uses_count') + 1)

        # Attach Stripe subscription ID if present in metadata
        if transaction.stripe_payment_intent_id:
            try:
                intent = stripe.PaymentIntent.retrieve(transaction.stripe_payment_intent_id)
                stripe_sub_id = (intent.get('metadata') or {}).get('stripe_subscription_id')
                if stripe_sub_id:
                    sub.stripe_subscription_id = stripe_sub_id
                    sub.save(update_fields=['stripe_subscription_id'])
            except Exception:
                pass

        # Create Invoice
        try:
            from apps.billing.services.invoice_service import create_invoice_for_transaction
            create_invoice_for_transaction(transaction)
        except Exception as e:
            logger.error(f"Invoice creation failed: {str(e)}")

        # Send notification
        try:
            from apps.notifications.helpers import send_subscription_activated_notification
            send_subscription_activated_notification(transaction.user, plan.name)
        except Exception as e:
            logger.error(f"Notification failed: {str(e)}")



# ─────────────────────────────────────────────────────────────────────
# Stripe Webhook (enhanced with invoice.paid for auto-renew)
# ─────────────────────────────────────────────────────────────────────

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
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            metadata = payment_intent.get('metadata', {})

            try:
                transaction = Transaction.objects.get(
                    stripe_payment_intent_id=payment_intent['id']
                )
            except Transaction.DoesNotExist:
                return Response(status=status.HTTP_200_OK)

            if transaction.status != 'COMPLETED':
                transaction.status = 'COMPLETED'
                transaction.save()

                if metadata.get('type') == 'book_purchase':
                    # ── Book micro-purchase ───────────────────────────
                    from apps.subscriptions.models import BookPurchase
                    from datetime import timedelta

                    book_id = metadata.get('book_id')
                    purchase_type = metadata.get('purchase_type', 'permanent')
                    valid_until_str = metadata.get('valid_until', '')
                    valid_until = None
                    if valid_until_str:
                        try:
                            valid_until = timezone.datetime.fromisoformat(valid_until_str)
                        except ValueError:
                            valid_until = timezone.now() + timedelta(days=30)

                    if book_id:
                        existing = BookPurchase.objects.filter(
                            user=transaction.user, book_id=book_id
                        ).first()
                        # Never downgrade a permanent purchase to a rental
                        if not (existing and existing.purchase_type == 'permanent' and purchase_type == 'rental'):
                            BookPurchase.objects.update_or_create(
                                user=transaction.user,
                                book_id=book_id,
                                defaults={
                                    'purchase_type': purchase_type,
                                    'price_paid': transaction.amount,
                                    'transaction': transaction,
                                    'valid_until': valid_until,
                                },
                            )
                else:
                    # ── Subscription activation ───────────────────────
                    if transaction.plan is None:
                        logger.warning(f'payment_intent.succeeded: transaction {transaction.id} has no plan.')
                        return Response(status=status.HTTP_200_OK)

                    UserSubscription.objects.filter(
                        user=transaction.user,
                        is_active=True
                    ).update(is_active=False)

                    from datetime import timedelta
                    start = timezone.now()
                    plan = transaction.plan
                    end = start + timedelta(days=plan.duration_days)
                    grace_end = (end + timedelta(days=plan.grace_period_days)) if plan.grace_period_days > 0 else None

                    UserSubscription.objects.create(
                        user=transaction.user,
                        plan=plan,
                        start_date=start,
                        end_date=end,
                        grace_period_end=grace_end,
                        is_active=True,
                    )

                    # Increment coupon uses_count (atomic, deduplication via transaction.status)
                    coupon_use = CouponUse.objects.filter(transaction=transaction).first()
                    if coupon_use:
                        Coupon.objects.filter(pk=coupon_use.coupon_id).update(uses_count=F('uses_count') + 1)

                    # Create Invoice
                    try:
                        from apps.billing.services.invoice_service import create_invoice_for_transaction
                        create_invoice_for_transaction(transaction)
                    except Exception as invoice_err:
                        logger.error(f'Invoice creation failed: {invoice_err}')

        elif event['type'] == 'invoice.paid':
            # ── Auto-renew handler (Stripe Subscriptions) ──
            invoice = event['data']['object']
            stripe_subscription_id = invoice.get('subscription')
            if stripe_subscription_id:
                user_sub = UserSubscription.objects.filter(
                    stripe_subscription_id=stripe_subscription_id,
                    is_active=True,
                ).first()
                if user_sub:
                    from datetime import timedelta
                    user_sub.end_date = timezone.now() + timedelta(days=user_sub.plan.duration_days)
                    user_sub.grace_period_end = None
                    user_sub.save(update_fields=['end_date', 'grace_period_end'])
                    Transaction.objects.create(
                        user=user_sub.user,
                        plan=user_sub.plan,
                        amount=Decimal(str(invoice['amount_paid'] / 100)),
                        status='COMPLETED',
                        payment_method='CREDIT_CARD',
                        stripe_payment_intent_id=invoice.get('payment_intent', ''),
                    )
                    logger.info(f'Auto-renewed subscription for {user_sub.user.username}')

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
