"""
Tests for authentication endpoints
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Tests for user registration endpoint"""

    def test_register_user_success(self, api_client, user_data):
        """Test successful user registration"""
        response = api_client.post('/api/auth/register/', user_data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email=user_data['email']).exists()

        user = User.objects.get(email=user_data['email'])
        assert user.first_name == user_data['first_name']
        assert user.last_name == user_data['last_name']
        assert user.user_type == user_data['user_type']
        assert user.check_password(user_data['password'])

    def test_register_user_duplicate_email(self, api_client, user_data, create_user):
        """Test registration with existing email fails"""
        # Create user first
        create_user(email=user_data['email'])

        # Try to register with same email
        response = api_client.post('/api/auth/register/', user_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_invalid_email(self, api_client, user_data):
        """Test registration with invalid email fails"""
        user_data['email'] = 'invalid-email'

        response = api_client.post('/api/auth/register/', user_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_weak_password(self, api_client, user_data):
        """Test registration with weak password fails"""
        user_data['password'] = '123'  # Too short

        response = api_client.post('/api/auth/register/', user_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_missing_fields(self, api_client):
        """Test registration with missing required fields fails"""
        incomplete_data = {
            'email': 'test@example.com'
            # Missing password and other fields
        }

        response = api_client.post('/api/auth/register/', incomplete_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_invalid_user_type(self, api_client, user_data):
        """Test registration with invalid user type fails"""
        user_data['user_type'] = 'INVALID_TYPE'

        response = api_client.post('/api/auth/register/', user_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Tests for user login endpoint"""

    def test_login_success(self, api_client, user):
        """Test successful login with correct credentials"""
        login_data = {
            'username': user.username,
            'password': 'Strong!Password123'
        }

        response = api_client.post('/api/auth/login/', login_data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_wrong_password(self, api_client, user):
        """Test login with incorrect password fails"""
        login_data = {
            'username': user.username,
            'password': 'WrongPassword123!'
        }

        response = api_client.post('/api/auth/login/', login_data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent user fails"""
        login_data = {
            'username': 'nonexistent_user',
            'password': 'SomePassword123!'
        }

        response = api_client.post('/api/auth/login/', login_data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_credentials(self, api_client):
        """Test login with missing credentials fails"""
        # Missing password
        login_data = {
            'email': 'test@example.com'
        }

        response = api_client.post('/api/auth/login/', login_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_empty_password(self, api_client, user):
        """Test login with empty password fails"""
        login_data = {
            'email': user.email,
            'password': ''
        }

        response = api_client.post('/api/auth/login/', login_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestTokenRefresh:
    """Tests for token refresh endpoint"""

    def test_refresh_token_success(self, api_client, user, get_tokens_for_user):
        """Test successful token refresh"""
        tokens = get_tokens_for_user(user)

        response = api_client.post(
            '/api/auth/refresh/',
            {'refresh': tokens['refresh']},
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        # Verify new access token is different
        assert response.data['access'] != tokens['access']

    def test_refresh_token_invalid(self, api_client):
        """Test refresh with invalid token fails"""
        response = api_client.post(
            '/api/auth/refresh/',
            {'refresh': 'invalid-token'},
            format='json'
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token_missing(self, api_client):
        """Test refresh with missing token fails"""
        response = api_client.post('/api/auth/refresh/', {}, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserProfile:
    """Tests for user profile endpoints"""

    def test_get_profile_authenticated(self, authenticated_client, user):
        """Test authenticated user can get their profile"""
        response = authenticated_client.get('/api/auth/user/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert response.data['first_name'] == user.first_name
        assert response.data['last_name'] == user.last_name

    def test_get_profile_unauthenticated(self, api_client):
        """Test unauthenticated user cannot get profile"""
        response = api_client.get('/api/auth/user/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile_success(self, authenticated_client, user):
        """Test user can update their profile"""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }

        response = authenticated_client.patch(
            '/api/auth/user/update/',
            update_data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.first_name == 'Updated'
        assert user.last_name == 'Name'

    def test_update_profile_unauthenticated(self, api_client):
        """Test unauthenticated user cannot update profile"""
        update_data = {
            'first_name': 'Updated'
        }

        response = api_client.patch(
            '/api/auth/user/update/',
            update_data,
            format='json'
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPasswordChange:
    """Tests for password change endpoint"""

    def test_change_password_success(self, authenticated_client, user):
        """Test user can change password with correct old password"""
        password_data = {
            'old_password': 'Strong!Password123',
            'new_password': 'NewTestPass123!'
        }

        response = authenticated_client.put(
            '/api/auth/password/change/',
            password_data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password('NewTestPass123!')

    def test_change_password_wrong_old_password(self, authenticated_client, user):
        """Test password change fails with incorrect old password"""
        password_data = {
            'old_password': 'WrongPassword123!',
            'new_password': 'NewTestPass123!'
        }

        response = authenticated_client.put(
            '/api/auth/password/change/',
            password_data,
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        user.refresh_from_db()
        assert user.check_password('Strong!Password123')  # Password unchanged

    def test_change_password_weak_new_password(self, authenticated_client, user):
        """Test password change fails with weak new password"""
        password_data = {
            'old_password': 'Strong!Password123',
            'new_password': '123'  # Too weak
        }

        response = authenticated_client.put(
            '/api/auth/password/change/',
            password_data,
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_unauthenticated(self, api_client):
        """Test unauthenticated user cannot change password"""
        password_data = {
            'old_password': 'Strong!Password123',
            'new_password': 'NewTestPass123!'
        }

        response = api_client.put(
            '/api/auth/password/change/',
            password_data,
            format='json'
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
