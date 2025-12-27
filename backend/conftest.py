"""
Pytest configuration and shared fixtures
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """
    Fixture for DRF API client
    """
    return APIClient()


@pytest.fixture
def user_data():
    """
    Fixture for user registration data
    """
    return {
        'email': 'test@example.com',
        'password': 'TestPass123!',
        'first_name': 'Test',
        'last_name': 'User',
        'user_type': 'STUDENT',
    }


@pytest.fixture
def create_user(db):
    """
    Fixture factory for creating users
    """
    def make_user(**kwargs):
        if 'email' not in kwargs:
            kwargs['email'] = 'testuser@example.com'
        if 'password' not in kwargs:
            password = 'TestPass123!'
        else:
            password = kwargs.pop('password')

        user = User.objects.create_user(**kwargs)
        user.set_password(password)
        user.save()
        return user

    return make_user


@pytest.fixture
def user(create_user):
    """
    Fixture for a standard user
    """
    return create_user(
        email='user@example.com',
        password='TestPass123!',
        first_name='Regular',
        last_name='User',
        user_type='STUDENT'
    )


@pytest.fixture
def admin_user(db):
    """
    Fixture for an admin user
    """
    return User.objects.create_superuser(
        email='admin@example.com',
        password='AdminPass123!',
        first_name='Admin',
        last_name='User'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """
    Fixture for authenticated API client with regular user
    """
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """
    Fixture for authenticated API client with admin user
    """
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def get_tokens_for_user():
    """
    Fixture factory for generating JWT tokens
    """
    def _get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
    return _get_tokens
