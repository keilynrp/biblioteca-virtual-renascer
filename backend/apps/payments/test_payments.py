"""
Tests for payment system
"""

import pytest
import stripe
from decimal import Decimal
from unittest.mock import patch, MagicMock
from rest_framework import status
from apps.payments.models import Transaction
from apps.subscriptions.models import UserSubscription


@pytest.mark.django_db
class TestPaymentIntentCreation:
    """Tests for creating payment intents"""

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent_success(
        self, mock_stripe_create, authenticated_client, user, basic_plan
    ):
        """Test successful payment intent creation"""
        mock_stripe_create.return_value = MagicMock(
            id='pi_test_123',
            client_secret='secret_test_123',
            status='requires_payment_method'
        )

        payload = {
            'plan_id': basic_plan.id,
            'payment_method': 'CREDIT_CARD',
        }

        response = authenticated_client.post(
            '/api/payments/checkout/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert 'client_secret' in response.data
        assert 'transaction_id' in response.data

        assert Transaction.objects.filter(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123'
        ).exists()

    def test_create_payment_intent_unauthenticated(self, api_client, basic_plan):
        """Test payment intent creation requires authentication"""
        payload = {
            'plan_id': basic_plan.id,
            'payment_method_type': 'card'
        }

        response = api_client.post(
            '/api/payments/checkout/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_payment_intent_invalid_plan(self, authenticated_client):
        """Test payment intent creation with invalid plan fails"""
        payload = {
            'plan_id': 99999,  # Non-existent plan
            'payment_method_type': 'card'
        }

        response = authenticated_client.post(
            '/api/payments/checkout/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent_stripe_error(
        self, mock_stripe_create, authenticated_client, basic_plan
    ):
        """Test handling of Stripe errors"""
        mock_stripe_create.side_effect = stripe.error.StripeError('Stripe API Error')

        payload = {
            'plan_id': basic_plan.id,
            'payment_method': 'CREDIT_CARD',
        }

        response = authenticated_client.post(
            '/api/payments/checkout/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPaymentConfirmation:
    """Tests for confirming payments"""

    @patch('stripe.PaymentIntent.retrieve')
    def test_confirm_payment_success(
        self, mock_stripe_retrieve, authenticated_client, user, basic_plan, create_transaction
    ):
        """Test successful payment confirmation"""
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123',
            status='PENDING'
        )

        mock_intent = MagicMock(status='succeeded')
        mock_intent.get.return_value = None  # intent.get('metadata') → None
        mock_stripe_retrieve.return_value = mock_intent

        payload = {
            'transaction_id': str(transaction.id),
            'payment_method': 'CREDIT_CARD',
        }

        response = authenticated_client.post(
            '/api/payments/confirm/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        transaction.refresh_from_db()
        assert transaction.status == 'COMPLETED'

        assert UserSubscription.objects.filter(
            user=user,
            plan=basic_plan,
            is_active=True
        ).exists()

    def test_confirm_payment_invalid_intent_id(self, authenticated_client):
        """Test payment confirmation with non-existent transaction ID returns 404"""
        payload = {
            'transaction_id': '00000000-0000-0000-0000-000000000000',
            'payment_method': 'CREDIT_CARD',
        }

        response = authenticated_client.post(
            '/api/payments/confirm/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_confirm_payment_already_completed(
        self, authenticated_client, user, basic_plan, create_transaction
    ):
        """Test confirming an already completed payment"""
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123',
            status='COMPLETED'
        )

        payload = {
            'payment_intent_id': 'pi_test_123'
        }

        response = authenticated_client.post(
            '/api/payments/confirm/',
            payload,
            format='json'
        )

        # Should handle gracefully
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]


@pytest.mark.django_db
class TestStripeWebhook:
    """Tests for Stripe webhook handling"""

    @patch('stripe.Webhook.construct_event')
    def test_webhook_payment_succeeded(
        self, mock_construct_event, api_client, user, basic_plan, create_transaction
    ):
        """Test webhook for successful payment"""
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123',
            status='PENDING'
        )

        mock_construct_event.return_value = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_test_123',
                    'metadata': {},
                }
            }
        }

        response = api_client.post(
            '/api/payments/webhook/',
            data='{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='test_signature'
        )

        assert response.status_code == status.HTTP_200_OK

        transaction.refresh_from_db()
        assert transaction.status == 'COMPLETED'

    @patch('stripe.Webhook.construct_event')
    def test_webhook_payment_failed(
        self, mock_construct_event, api_client, user, basic_plan, create_transaction
    ):
        """Test webhook for failed payment"""
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123',
            status='PENDING'
        )

        mock_construct_event.return_value = {
            'type': 'payment_intent.payment_failed',
            'data': {
                'object': {
                    'id': 'pi_test_123',
                    'metadata': {},
                }
            }
        }

        response = api_client.post(
            '/api/payments/webhook/',
            data='{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='test_signature'
        )

        assert response.status_code == status.HTTP_200_OK

        transaction.refresh_from_db()
        assert transaction.status == 'FAILED'

    def test_webhook_invalid_signature(self, api_client):
        """Test webhook with invalid signature is rejected"""
        response = api_client.post(
            '/api/payments/webhook/',
            data={},
            format='json',
            HTTP_STRIPE_SIGNATURE='invalid_signature'
        )

        # Webhook should reject invalid signatures
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN]


@pytest.mark.django_db
class TestTransactionModel:
    """Tests for Transaction model"""

    def test_create_transaction(self, user, basic_plan):
        """Test creating a transaction"""
        transaction = Transaction.objects.create(
            user=user,
            plan=basic_plan,
            amount=basic_plan.price,
            currency='USD',
            status='PENDING'
        )

        assert transaction.id is not None
        assert transaction.user == user
        assert transaction.plan == basic_plan
        assert transaction.amount == basic_plan.price
        assert transaction.status == 'PENDING'

    def test_transaction_str_representation(self, user, basic_plan, create_transaction):
        """Test transaction string representation"""
        transaction = create_transaction(user=user, plan=basic_plan)

        str_repr = str(transaction)
        assert user.email in str_repr or 'user' in str_repr.lower()
        assert str(transaction.amount) in str_repr
        assert transaction.status in str_repr


@pytest.mark.django_db
class TestSubscriptionCreation:
    """Tests for subscription creation after payment"""

    def test_create_subscription_from_transaction(self, user, basic_plan, create_transaction):
        """Test subscription is created from completed transaction"""
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            status='COMPLETED'
        )

        # Simulate subscription creation (would be done in payment confirmation)
        subscription = UserSubscription.objects.create(
            user=user,
            plan=basic_plan,
            is_active=True
        )

        assert subscription.user == user
        assert subscription.plan == basic_plan
        assert subscription.is_active is True
        assert subscription.end_date is not None

    def test_subscription_end_date_calculation(self, user, basic_plan):
        """Test subscription end date is calculated correctly"""
        subscription = UserSubscription.objects.create(
            user=user,
            plan=basic_plan,
            is_active=True
        )

        # End date should be start_date + plan duration
        expected_duration = (subscription.end_date - subscription.start_date).days
        assert expected_duration == basic_plan.duration_days


@pytest.mark.django_db
class TestPlanModel:
    """Tests for Plan model"""

    def test_create_plan(self, basic_plan):
        """Test plan creation"""
        assert basic_plan.name == 'Basic Plan'
        assert basic_plan.price == Decimal('9.99')
        assert basic_plan.duration_days == 30
        assert basic_plan.is_active is True

    def test_plan_features_json(self, basic_plan):
        """Test plan features are stored as JSON"""
        assert isinstance(basic_plan.features, list)
        assert 'feature1' in basic_plan.features

    def test_plan_str_representation(self, basic_plan):
        """Test plan string representation"""
        str_repr = str(basic_plan)
        assert basic_plan.name in str_repr
        assert str(basic_plan.price) in str_repr
@pytest.mark.django_db
class TestSubscriptionRenewal:
    """Tests for subscription renewal (deactivate old, create new)"""

    def test_renewal_deactivates_old_subscription(
        self, authenticated_client, user, basic_plan, premium_plan, create_transaction
    ):
        """Test that paying for a new plan deactivates the existing one"""
        # 1. Create initial active subscription
        old_sub = UserSubscription.objects.create(
            user=user,
            plan=basic_plan,
            is_active=True
        )

        # 2. Create and confirm a new transaction for a different plan
        transaction = create_transaction(
            user=user,
            plan=premium_plan,
            stripe_payment_intent_id='pi_renewal_123',
            status='PENDING'
        )

        payload = {
            'transaction_id': str(transaction.id),
            'payment_method': 'CREDIT_CARD',
        }

        with patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            mock_intent = MagicMock(status='succeeded')
            mock_intent.get.return_value = None  # intent.get('metadata') → None
            mock_retrieve.return_value = mock_intent

            response = authenticated_client.post(
                '/api/payments/confirm/',
                payload,
                format='json'
            )

        assert response.status_code == status.HTTP_200_OK

        # 3. Verify old subscription is deactivated
        old_sub.refresh_from_db()
        assert old_sub.is_active is False

        # 4. Verify new subscription is active
        new_sub = UserSubscription.objects.get(user=user, plan=premium_plan, is_active=True)
        assert new_sub.id != old_sub.id
        assert new_sub.is_active is True
        assert new_sub.start_date > old_sub.start_date
