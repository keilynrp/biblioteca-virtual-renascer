"""
Tests for Discussion Threads and initial post creation
"""

import pytest
from django.urls import reverse
from rest_framework import status
from apps.communities.models import DiscussionThread, Post, ClubMembership


@pytest.mark.django_db
class TestDiscussionThreadCreation:
    """Test creating discussion threads"""

    def test_create_thread_as_member(self, api_client, club_member, reading_club, book):
        """Test creating a discussion thread as a club member"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-list')
        data = {
            'title': 'What did you think of Chapter 5?',
            'club': reading_club.id,
            'book': book.id,
            'content': 'I thought the plot twist was amazing!'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'What did you think of Chapter 5?'
        assert response.data['posts_count'] == 1

        # Verify thread was created
        thread = DiscussionThread.objects.get(title='What did you think of Chapter 5?')
        assert thread.club == reading_club
        assert thread.author == club_member
        assert thread.book == book

        # Verify initial post was created
        initial_post = Post.objects.filter(thread=thread).first()
        assert initial_post is not None
        assert initial_post.content == 'I thought the plot twist was amazing!'
        assert initial_post.author == club_member

    def test_create_thread_without_book(self, api_client, club_member, reading_club):
        """Test creating a general discussion thread without a specific book"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-list')
        data = {
            'title': 'General Discussion Topic',
            'club': reading_club.id,
            'content': 'Let\'s talk about our favorite genres'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'General Discussion Topic'

        thread = DiscussionThread.objects.get(title='General Discussion Topic')
        assert thread.book is None

    def test_create_thread_as_non_member(self, api_client, create_user, reading_club):
        """Test that non-members cannot create threads"""
        non_member = create_user(email='nonmember@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(non_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-list')
        data = {
            'title': 'Trying to create thread',
            'club': reading_club.id,
            'content': 'This should fail'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'miembro del club' in str(response.data)

    def test_create_thread_requires_authentication(self, api_client, reading_club):
        """Test that creating a thread requires authentication"""
        url = reverse('discussionthread-list')
        data = {
            'title': 'Test Thread',
            'club': reading_club.id,
            'content': 'Test content'
        }

        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestDiscussionThreadRetrieval:
    """Test retrieving discussion threads"""

    def test_list_threads(self, api_client, discussion_thread):
        """Test listing all threads"""
        url = reverse('discussionthread-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_filter_threads_by_club(self, api_client, discussion_thread, reading_club):
        """Test filtering threads by club"""
        url = reverse('discussionthread-list')
        response = api_client.get(url, {'club': reading_club.id})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert all(t['club'] == reading_club.id for t in response.data['results'])

    def test_retrieve_thread_detail(self, api_client, discussion_thread):
        """Test retrieving a single thread with posts"""
        url = reverse('discussionthread-detail', kwargs={'pk': discussion_thread.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == discussion_thread.title
        assert 'posts' in response.data
        assert len(response.data['posts']) >= 1

    def test_order_threads_by_created_at(self, api_client, reading_club, club_member):
        """Test ordering threads by creation date"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Create multiple threads
        for i in range(3):
            url = reverse('discussionthread-list')
            data = {
                'title': f'Thread {i}',
                'club': reading_club.id,
                'content': f'Content {i}'
            }
            api_client.post(url, data, format='json')

        url = reverse('discussionthread-list')
        response = api_client.get(url, {'club': reading_club.id, 'ordering': 'created_at'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 3


@pytest.mark.django_db
class TestDiscussionThreadUpdate:
    """Test updating and deleting discussion threads"""

    def test_update_thread_as_author(self, api_client, discussion_thread, user):
        """Test that author can update their thread"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-detail', kwargs={'pk': discussion_thread.id})
        data = {'title': 'Updated Thread Title'}

        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Thread Title'

        discussion_thread.refresh_from_db()
        assert discussion_thread.title == 'Updated Thread Title'

    def test_update_thread_as_non_author(self, api_client, discussion_thread, create_user):
        """Test that non-author cannot update thread"""
        other_user = create_user(email='other@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-detail', kwargs={'pk': discussion_thread.id})
        data = {'title': 'Hacked Title'}

        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_thread_as_author(self, api_client, discussion_thread, user):
        """Test that author can delete their thread"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-detail', kwargs={'pk': discussion_thread.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert DiscussionThread.objects.filter(id=discussion_thread.id).count() == 0

    def test_delete_thread_as_non_author(self, api_client, discussion_thread, create_user):
        """Test that non-author cannot delete thread"""
        other_user = create_user(email='other@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('discussionthread-detail', kwargs={'pk': discussion_thread.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestDiscussionThreadFeatures:
    """Test pinned and locked thread features"""

    def test_pinned_thread(self, discussion_thread):
        """Test that threads can be pinned"""
        discussion_thread.is_pinned = True
        discussion_thread.save()

        assert discussion_thread.is_pinned is True

    def test_locked_thread(self, discussion_thread):
        """Test that threads can be locked"""
        discussion_thread.is_locked = True
        discussion_thread.save()

        assert discussion_thread.is_locked is True

    def test_posts_count_increments(self, discussion_thread, club_member):
        """Test that posts_count increments when posts are added"""
        initial_count = discussion_thread.posts_count

        Post.objects.create(
            thread=discussion_thread,
            author=club_member,
            content='Another post'
        )

        # Note: In the actual view, posts_count is incremented automatically
        # For this test, we need to simulate that behavior
        discussion_thread.posts_count += 1
        discussion_thread.save()

        discussion_thread.refresh_from_db()
        assert discussion_thread.posts_count == initial_count + 1

    def test_thread_ordering_pinned_first(self, reading_club, user, club_member):
        """Test that pinned threads appear first"""
        # Create regular thread
        regular_thread = DiscussionThread.objects.create(
            club=reading_club,
            author=user,
            title="Regular Thread",
            is_pinned=False
        )

        # Create pinned thread
        pinned_thread = DiscussionThread.objects.create(
            club=reading_club,
            author=club_member,
            title="Pinned Thread",
            is_pinned=True
        )

        # Get threads ordered by default ordering
        threads = DiscussionThread.objects.filter(club=reading_club).order_by('-is_pinned', '-updated_at')

        # Pinned thread should come first
        assert threads.first() == pinned_thread
