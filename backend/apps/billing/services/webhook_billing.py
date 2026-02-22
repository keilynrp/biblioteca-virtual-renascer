import logging

logger = logging.getLogger(__name__)


def handle_setup_intent_succeeded(setup_intent):
    """
    Handle the setup_intent.succeeded webhook event.
    Creates or updates a StoredPaymentMethod record in the database.
    """
    from apps.billing.models import BillingProfile, StoredPaymentMethod

    customer_id = setup_intent.get('customer')
    payment_method_id = setup_intent.get('payment_method')

    if not customer_id or not payment_method_id:
        logger.warning('setup_intent.succeeded missing customer or payment_method')
        return

    try:
        profile = BillingProfile.objects.get(stripe_customer_id=customer_id)
    except BillingProfile.DoesNotExist:
        logger.warning(f'No BillingProfile found for Stripe customer {customer_id}')
        return

    # Retrieve payment method details from Stripe
    import stripe
    import os
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

    try:
        pm = stripe.PaymentMethod.retrieve(payment_method_id)
    except stripe.error.StripeError as e:
        logger.error(f'Failed to retrieve payment method {payment_method_id}: {e}')
        return

    card = pm.get('card', {})
    brand = card.get('brand', '')
    last4 = card.get('last4', '')
    exp_month = card.get('exp_month')
    exp_year = card.get('exp_year')

    _, created = StoredPaymentMethod.objects.get_or_create(
        stripe_pm_id=payment_method_id,
        defaults={
            'user': profile.user,
            'brand': brand,
            'last4': last4,
            'exp_month': exp_month,
            'exp_year': exp_year,
            'is_default': False,
        },
    )
    if created:
        logger.info(f'StoredPaymentMethod created: {payment_method_id} for user {profile.user}')
    else:
        logger.info(f'StoredPaymentMethod already exists: {payment_method_id}')
