"""
Pytest fixtures for Communities tests
"""

import pytest
from django.contrib.auth import get_user_model
from apps.communities.models import ReadingClub, ClubMembership, DiscussionThread, Post
from apps.content.models import Book, Category, Author

User = get_user_model()


@pytest.fixture
def category(db):
    """Create a test category"""
    return Category.objects.create(
        name="Fiction",
        slug="fiction",
        description="Fiction books"
    )


@pytest.fixture
def author(db):
    """Create a test author"""
    return Author.objects.create(
        name="Test Author",
        bio="Test bio"
    )


@pytest.fixture
def book(db, category, author):
    """Create a test book"""
    return Book.objects.create(
        title="Test Book",
        description="Test description",
        category=category,
        author=author,
        isbn="1234567890123",
        publication_date="2024-01-01"
    )


@pytest.fixture
def reading_club(db, user):
    """Create a public reading club"""
    club = ReadingClub.objects.create(
        name="Test Reading Club",
        description="A test reading club for testing",
        creator=user,
        is_private=False
    )
    # Creator is automatically added as ADMIN in the view, but in tests we need to do it manually
    ClubMembership.objects.create(
        user=user,
        club=club,
        role='ADMIN'
    )
    return club


@pytest.fixture
def private_club(db, user):
    """Create a private reading club"""
    club = ReadingClub.objects.create(
        name="Private Reading Club",
        description="A private reading club",
        creator=user,
        is_private=True
    )
    ClubMembership.objects.create(
        user=user,
        club=club,
        role='ADMIN'
    )
    return club


@pytest.fixture
def club_member(create_user, reading_club):
    """Create a user who is a member of the club"""
    member = create_user(
        email='member@example.com',
        username='clubmember',
        password='TestPass123!'
    )
    ClubMembership.objects.create(
        user=member,
        club=reading_club,
        role='MEMBER'
    )
    return member


@pytest.fixture
def club_moderator(create_user, reading_club):
    """Create a user who is a moderator of the club"""
    moderator = create_user(
        email='moderator@example.com',
        username='moderator',
        password='TestPass123!'
    )
    ClubMembership.objects.create(
        user=moderator,
        club=reading_club,
        role='MODERATOR'
    )
    return moderator


@pytest.fixture
def discussion_thread(db, reading_club, user, book):
    """Create a discussion thread with initial post"""
    thread = DiscussionThread.objects.create(
        club=reading_club,
        author=user,
        title="Test Discussion",
        book=book,
        posts_count=1
    )
    # Create initial post
    Post.objects.create(
        thread=thread,
        author=user,
        content="This is the initial post content"
    )
    return thread


@pytest.fixture
def post(db, discussion_thread, club_member):
    """Create a post in a discussion thread"""
    return Post.objects.create(
        thread=discussion_thread,
        author=club_member,
        content="This is a test post"
    )
