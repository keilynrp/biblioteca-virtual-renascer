"""
Tests for payment system
"""

import pytest
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
        # Mock Stripe response
        mock_stripe_create.return_value = MagicMock(
            id='pi_test_123',
            client_secret='secret_test_123',
            status='requires_payment_method'
        )

        payload = {
            'plan_id': basic_plan.id,
            'payment_method_type': 'card'
        }

        response = authenticated_client.post(
            '/api/payments/create-payment-intent/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        assert 'client_secret' in response.data
        assert 'payment_intent_id' in response.data

        # Verify transaction was created
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
            '/api/payments/create-payment-intent/',
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
            '/api/payments/create-payment-intent/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent_stripe_error(
        self, mock_stripe_create, authenticated_client, basic_plan
    ):
        """Test handling of Stripe errors"""
        # Mock Stripe error
        mock_stripe_create.side_effect = Exception('Stripe API Error')

        payload = {
            'plan_id': basic_plan.id,
            'payment_method_type': 'card'
        }

        response = authenticated_client.post(
            '/api/payments/create-payment-intent/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPaymentConfirmation:
    """Tests for confirming payments"""

    def test_confirm_payment_success(
        self, authenticated_client, user, basic_plan, create_transaction
    ):
        """Test successful payment confirmation"""
        # Create a pending transaction
        transaction = create_transaction(
            user=user,
            plan=basic_plan,
            stripe_payment_intent_id='pi_test_123',
            status='PENDING'
        )

        payload = {
            'payment_intent_id': 'pi_test_123'
        }

        response = authenticated_client.post(
            '/api/payments/confirm-payment/',
            payload,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify transaction status updated
        transaction.refresh_from_db()
        assert transaction.status == 'COMPLETED'

        # Verify subscription created
        assert UserSubscription.objects.filter(
            user=user,
            plan=basic_plan,
            is_active=True
        ).exists()

    def test_confirm_payment_invalid_intent_id(self, authenticated_client):
        """Test payment confirmation with invalid intent ID"""
        payload = {
            'payment_intent_id': 'invalid_id'
        }

        response = authenticated_client.post(
            '/api/payments/confirm-payment/',
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
            '/api/payments/confirm-payment/',
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

        # Mock Stripe event
        mock_event = MagicMock()
        mock_event.type = 'payment_intent.succeeded'
        mock_event.data.object.id = 'pi_test_123'
        mock_construct_event.return_value = mock_event

        response = api_client.post(
            '/api/payments/webhook/',
            data={},
            format='json',
            HTTP_STRIPE_SIGNATURE='test_signature'
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify transaction updated
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

        # Mock Stripe event
        mock_event = MagicMock()
        mock_event.type = 'payment_intent.payment_failed'
        mock_event.data.object.id = 'pi_test_123'
        mock_construct_event.return_value = mock_event

        response = api_client.post(
            '/api/payments/webhook/',
            data={},
            format='json',
            HTTP_STRIPE_SIGNATURE='test_signature'
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify transaction marked as failed
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
