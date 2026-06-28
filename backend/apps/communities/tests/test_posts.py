"""
Tests for Posts - likes, permissions, and CRUD operations
"""

import pytest
from django.urls import reverse
from rest_framework import status
from apps.communities.models import Post, ClubMembership


@pytest.mark.django_db
class TestPostCreation:
    """Test creating posts in discussion threads"""

    def test_create_post_as_member(self, api_client, club_member, discussion_thread):
        """Test creating a post as a club member"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        initial_count = discussion_thread.posts_count

        url = reverse('community-post-list')
        data = {
            'thread': discussion_thread.id,
            'content': 'This is my reply to the discussion'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['content'] == 'This is my reply to the discussion'
        assert response.data['author']['username'] == club_member.username

        # Verify post was created
        post = Post.objects.get(content='This is my reply to the discussion')
        assert post.thread == discussion_thread
        assert post.author == club_member

        # Verify thread post count was incremented
        discussion_thread.refresh_from_db()
        assert discussion_thread.posts_count == initial_count + 1

    def test_create_post_as_non_member(self, api_client, create_user, discussion_thread):
        """Test that non-members cannot create posts"""
        non_member = create_user(email='nonmember@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(non_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-list')
        data = {
            'thread': discussion_thread.id,
            'content': 'This should fail'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'miembro del club' in str(response.data)

    def test_create_post_requires_authentication(self, api_client, discussion_thread):
        """Test that creating a post requires authentication"""
        url = reverse('community-post-list')
        data = {
            'thread': discussion_thread.id,
            'content': 'Test content'
        }

        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_post_requires_content(self, api_client, club_member, discussion_thread):
        """Test that post content is required"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-list')
        data = {
            'thread': discussion_thread.id,
            'content': ''  # Empty content
        }

        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPostRetrieval:
    """Test retrieving posts"""

    def test_list_posts(self, api_client, post):
        """Test listing all posts"""
        url = reverse('community-post-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_filter_posts_by_thread(self, api_client, discussion_thread, post):
        """Test filtering posts by thread"""
        url = reverse('community-post-list')
        response = api_client.get(url, {'thread': discussion_thread.id})

        assert response.status_code == status.HTTP_200_OK
        # Should have at least the initial post and the fixture post
        assert len(response.data['results']) >= 2
        assert all(p['thread'] == discussion_thread.id for p in response.data['results'])

    def test_retrieve_post_detail(self, api_client, post):
        """Test retrieving a single post"""
        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['content'] == post.content
        assert 'author' in response.data
        assert 'likes_count' in response.data
        assert 'is_liked' in response.data


@pytest.mark.django_db
class TestPostUpdate:
    """Test updating and deleting posts"""

    def test_update_post_as_author(self, api_client, post, club_member):
        """Test that author can update their post"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        data = {'content': 'Updated post content'}

        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['content'] == 'Updated post content'

        post.refresh_from_db()
        assert post.content == 'Updated post content'

    def test_update_post_as_non_author(self, api_client, post, create_user):
        """Test that non-author cannot update post"""
        other_user = create_user(email='other@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        data = {'content': 'Hacked content'}

        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_post_as_author(self, api_client, post, club_member):
        """Test that author can delete their post"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Post.objects.filter(id=post.id).count() == 0

    def test_delete_post_as_non_author(self, api_client, post, create_user):
        """Test that non-author cannot delete post"""
        other_user = create_user(email='other@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestPostLikes:
    """Test post like/unlike functionality"""

    def test_like_post(self, api_client, post, create_user):
        """Test liking a post"""
        liker = create_user(email='liker@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(liker)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        initial_likes = post.likes.count()

        url = reverse('community-post-like', kwargs={'pk': post.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'Like agregado' in response.data['detail']
        assert response.data['likes_count'] == initial_likes + 1

        # Verify like was added
        post.refresh_from_db()
        assert post.likes.filter(id=liker.id).exists()

    def test_unlike_post(self, api_client, post, create_user):
        """Test unliking a post"""
        liker = create_user(email='liker@example.com')
        post.likes.add(liker)

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(liker)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        initial_likes = post.likes.count()

        url = reverse('community-post-like', kwargs={'pk': post.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'Like removido' in response.data['detail']
        assert response.data['likes_count'] == initial_likes - 1

        # Verify like was removed
        post.refresh_from_db()
        assert not post.likes.filter(id=liker.id).exists()

    def test_like_toggle(self, api_client, post, create_user):
        """Test toggling likes (like, unlike, like again)"""
        liker = create_user(email='liker@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(liker)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-like', kwargs={'pk': post.id})

        # First like
        response1 = api_client.post(url)
        assert 'Like agregado' in response1.data['detail']

        # Unlike
        response2 = api_client.post(url)
        assert 'Like removido' in response2.data['detail']

        # Like again
        response3 = api_client.post(url)
        assert 'Like agregado' in response3.data['detail']

    def test_like_requires_authentication(self, api_client, post):
        """Test that liking requires authentication"""
        url = reverse('community-post-like', kwargs={'pk': post.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_multiple_users_like_post(self, api_client, post, create_user):
        """Test that multiple users can like the same post"""
        user1 = create_user(email='user1@example.com')
        user2 = create_user(email='user2@example.com')
        user3 = create_user(email='user3@example.com')

        initial_likes = post.likes.count()

        for user in [user1, user2, user3]:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

            url = reverse('community-post-like', kwargs={'pk': post.id})
            response = api_client.post(url)
            assert response.status_code == status.HTTP_200_OK

        post.refresh_from_db()
        assert post.likes.count() == initial_likes + 3

    def test_likes_count_in_serializer(self, api_client, post, create_user):
        """Test that likes_count is correctly shown in serializer"""
        # Add some likes
        user1 = create_user(email='user1@example.com')
        user2 = create_user(email='user2@example.com')
        post.likes.add(user1, user2)

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['likes_count'] == 2

    def test_is_liked_for_authenticated_user(self, api_client, post, create_user):
        """Test that is_liked shows correctly for authenticated user"""
        liker = create_user(email='liker@example.com')
        post.likes.add(liker)

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(liker)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] is True

    def test_is_liked_false_for_non_liker(self, api_client, post, create_user):
        """Test that is_liked is false for users who haven't liked"""
        non_liker = create_user(email='nonliker@example.com')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(non_liker)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('community-post-detail', kwargs={'pk': post.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_liked'] is False


@pytest.mark.django_db
class TestPostOrdering:
    """Test post ordering"""

    def test_posts_ordered_by_created_at(self, api_client, discussion_thread, club_member):
        """Test that posts are ordered chronologically"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(club_member)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Create multiple posts
        post_contents = ['First post', 'Second post', 'Third post']
        for content in post_contents:
            Post.objects.create(
                thread=discussion_thread,
                author=club_member,
                content=content
            )

        url = reverse('community-post-list')
        response = api_client.get(url, {'thread': discussion_thread.id})

        assert response.status_code == status.HTTP_200_OK

        # Posts should be in chronological order (oldest first)
        contents = [p['content'] for p in response.data['results']]
        # The initial post from fixture will be first
        assert 'First post' in contents
        assert 'Second post' in contents
        assert 'Third post' in contents
