import stripe
import os

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

_key = stripe.api_key or ''
STRIPE_CONFIGURED = bool(_key and 'your' not in _key.lower())


class StripeService:

    @staticmethod
    def get_or_create_customer(billing_profile, user):
        """Get existing or create new Stripe Customer, save stripe_customer_id."""
        if billing_profile.stripe_customer_id:
            return stripe.Customer.retrieve(billing_profile.stripe_customer_id)

        customer = stripe.Customer.create(
            email=user.email,
            name=billing_profile.full_name or user.username,
            metadata={'user_id': str(user.id)},
        )
        billing_profile.stripe_customer_id = customer.id
        billing_profile.save(update_fields=['stripe_customer_id'])
        return customer

    @staticmethod
    def create_setup_intent(stripe_customer_id):
        """Create a SetupIntent for saving a payment method."""
        setup_intent = stripe.SetupIntent.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
        )
        return {'client_secret': setup_intent.client_secret}

    @staticmethod
    def list_payment_methods(stripe_customer_id):
        """List all payment methods attached to a Stripe customer."""
        return stripe.PaymentMethod.list(
            customer=stripe_customer_id,
            type='card',
        )

    @staticmethod
    def detach_payment_method(stripe_pm_id):
        """Detach a payment method from its customer."""
        return stripe.PaymentMethod.detach(stripe_pm_id)

    @staticmethod
    def set_default_payment_method(stripe_customer_id, stripe_pm_id):
        """Set the default payment method for a Stripe customer."""
        return stripe.Customer.modify(
            stripe_customer_id,
            invoice_settings={'default_payment_method': stripe_pm_id},
        )

    @staticmethod
    def create_refund(payment_intent_id, amount_cents=None, reason='requested_by_customer'):
        """Create a refund for a PaymentIntent."""
        params = {
            'payment_intent': payment_intent_id,
            'reason': reason,
        }
        if amount_cents is not None:
            params['amount'] = amount_cents
        return stripe.Refund.create(**params)
