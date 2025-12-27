"""
Fixtures for payment tests
"""

import pytest
from decimal import Decimal
from apps.subscriptions.models import Plan
from apps.payments.models import Transaction


@pytest.fixture
def basic_plan(db):
    """Fixture for a basic subscription plan"""
    return Plan.objects.create(
        name='Basic Plan',
        description='Basic features',
        price=Decimal('9.99'),
        duration_days=30,
        features=['feature1', 'feature2'],
        is_active=True
    )


@pytest.fixture
def premium_plan(db):
    """Fixture for a premium subscription plan"""
    return Plan.objects.create(
        name='Premium Plan',
        description='All features',
        price=Decimal('19.99'),
        duration_days=30,
        features=['feature1', 'feature2', 'feature3', 'premium_content'],
        is_active=True
    )


@pytest.fixture
def create_transaction(db):
    """Fixture factory for creating transactions"""
    def make_transaction(user, plan, **kwargs):
        defaults = {
            'amount': plan.price,
            'currency': 'USD',
            'status': 'PENDING',
            'payment_method': 'CREDIT_CARD',
        }
        defaults.update(kwargs)

        return Transaction.objects.create(
            user=user,
            plan=plan,
            **defaults
        )

    return make_transaction
