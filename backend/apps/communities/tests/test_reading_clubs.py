"""
Tests for Reading Club CRUD operations and actions
"""

import pytest
from django.urls import reverse
from rest_framework import status
from apps.communities.models import ReadingClub, ClubMembership


@pytest.mark.django_db
class TestReadingClubLifecycle:
    """Test ReadingClub creation, retrieval, update, and deletion"""

    def test_create_reading_club(self, authenticated_client, user):
        """Test creating a reading club"""
        url = reverse('readingclub-list')
        data = {
            'name': 'Book Lovers Club',
            'description': 'A club for book lovers',
            'is_private': False
        }

        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Book Lovers Club'
        assert response.data['slug'] == 'book-lovers-club'
        assert response.data['is_private'] is False

        # Verify club was created in database
        club = ReadingClub.objects.get(name='Book Lovers Club')
        assert club.creator == user

        # Verify creator was added as ADMIN
        membership = ClubMembership.objects.get(club=club, user=user)
        assert membership.role == 'ADMIN'

    def test_create_private_club(self, authenticated_client):
        """Test creating a private club"""
        url = reverse('readingclub-list')
        data = {
            'name': 'Secret Readers',
            'description': 'A private book club',
            'is_private': True
        }

        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['is_private'] is True

    def test_create_club_requires_authentication(self, api_client):
        """Test that creating a club requires authentication"""
        url = reverse('readingclub-list')
        data = {
            'name': 'Test Club',
            'description': 'Test description',
        }

        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_slug_auto_generation(self, authenticated_client):
        """Test that slug is auto-generated from name"""
        url = reverse('readingclub-list')
        data = {
            'name': 'My Awesome Reading Club',
            'description': 'Test description',
        }

        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['slug'] == 'my-awesome-reading-club'

    def test_list_reading_clubs(self, api_client, reading_club, private_club):
        """Test listing all reading clubs"""
        url = reverse('readingclub-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2

    def test_retrieve_reading_club(self, api_client, reading_club):
        """Test retrieving a single club by slug"""
        url = reverse('readingclub-detail', kwargs={'slug': reading_club.slug})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == reading_club.name
        assert 'creator' in response.data
        assert 'recent_threads' in response.data

    def test_update_club_as_creator(self, authenticated_client, reading_club):
        """Test that creator can update their club"""
        url = reverse('readingclub-detail', kwargs={'slug': reading_club.slug})
        data = {
            'name': 'Updated Club Name',
            'description': 'Updated description',
        }

        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Club Name'

        # Verify in database
        reading_club.refresh_from_db()
        assert reading_club.name == 'Updated Club Name'

    def test_update_club_as_non_creator(self, api_client, create_user, reading_club):
        """Test that non-creator cannot update club"""
        other_user = create_user(email='other@example.com')

        # Authenticate as other user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-detail', kwargs={'slug': reading_club.slug})
        data = {'name': 'Hacked Name'}

        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_club_as_creator(self, authenticated_client, reading_club):
        """Test that creator can delete their club"""
        url = reverse('readingclub-detail', kwargs={'slug': reading_club.slug})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert ReadingClub.objects.filter(id=reading_club.id).count() == 0

    def test_delete_club_as_non_creator(self, api_client, create_user, reading_club):
        """Test that non-creator cannot delete club"""
        other_user = create_user(email='other@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-detail', kwargs={'slug': reading_club.slug})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert ReadingClub.objects.filter(id=reading_club.id).count() == 1


@pytest.mark.django_db
class TestClubJoinLeave:
    """Test joining and leaving clubs"""

    def test_join_public_club(self, api_client, create_user, reading_club):
        """Test joining a public club"""
        new_user = create_user(email='newmember@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(new_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-join', kwargs={'slug': reading_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_201_CREATED
        assert 'exitosamente' in response.data['detail']

        # Verify membership was created
        membership = ClubMembership.objects.get(club=reading_club, user=new_user)
        assert membership.role == 'MEMBER'

    def test_join_private_club_returns_mock_message(self, api_client, create_user, private_club):
        """Test joining a private club returns mock approval message"""
        new_user = create_user(email='newmember@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(new_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-join', kwargs={'slug': private_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'privado' in response.data['detail']

    def test_cannot_join_same_club_twice(self, api_client, create_user, reading_club):
        """Test that user cannot join the same club twice"""
        new_user = create_user(email='newmember@example.com')

        # First join
        ClubMembership.objects.create(user=new_user, club=reading_club, role='MEMBER')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(new_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-join', kwargs={'slug': reading_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Ya eres miembro' in response.data['detail']

    def test_join_requires_authentication(self, api_client, reading_club):
        """Test that joining requires authentication"""
        url = reverse('readingclub-join', kwargs={'slug': reading_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_leave_club(self, api_client, club_member, reading_club):
        """Test leaving a club"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Verify member exists
        assert ClubMembership.objects.filter(club=reading_club, user=club_member).exists()

        url = reverse('readingclub-leave', kwargs={'slug': reading_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'salido del club' in response.data['detail']

        # Verify membership was deleted
        assert not ClubMembership.objects.filter(club=reading_club, user=club_member).exists()

    def test_leave_club_not_member(self, api_client, create_user, reading_club):
        """Test leaving a club when not a member"""
        non_member = create_user(email='nonmember@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(non_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('readingclub-leave', kwargs={'slug': reading_club.slug})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'No eres miembro' in response.data['detail']


@pytest.mark.django_db
class TestClubSearchAndFilters:
    """Test search and filtering functionality"""

    def test_search_clubs_by_name(self, api_client, reading_club):
        """Test searching clubs by name"""
        # Create another club
        from apps.communities.models import ReadingClub
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.first()

        ReadingClub.objects.create(
            name='Python Programmers',
            description='Learn Python together',
            creator=user
        )

        url = reverse('readingclub-list')
        response = api_client.get(url, {'search': 'Python'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['name'] == 'Python Programmers'

    def test_filter_private_clubs(self, api_client, reading_club, private_club):
        """Test filtering private clubs"""
        url = reverse('readingclub-list')
        response = api_client.get(url, {'is_private': 'true'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['is_private'] is True

    def test_filter_public_clubs(self, api_client, reading_club, private_club):
        """Test filtering public clubs"""
        url = reverse('readingclub-list')
        response = api_client.get(url, {'is_private': 'false'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['is_private'] is False
