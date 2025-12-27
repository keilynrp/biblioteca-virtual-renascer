"""
Fixtures for content tests
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.content.models import Book, Author, Category


@pytest.fixture
def category(db):
    """Fixture for a category"""
    return Category.objects.create(
        name='Fiction',
        description='Fictional books'
    )


@pytest.fixture
def another_category(db):
    """Fixture for another category"""
    return Category.objects.create(
        name='Non-Fiction',
        description='Non-fictional books'
    )


@pytest.fixture
def author(db):
    """Fixture for an author"""
    return Author.objects.create(
        name='Test Author',
        bio='A test author bio'
    )


@pytest.fixture
def another_author(db):
    """Fixture for another author"""
    return Author.objects.create(
        name='Another Author',
        bio='Another author bio'
    )


@pytest.fixture
def create_book(db):
    """Fixture factory for creating books"""
    def make_book(title='Test Book', author=None, category=None, **kwargs):
        if author is None:
            author = Author.objects.create(name='Default Author')
        if category is None:
            category = Category.objects.create(name='Default Category')

        # Create a simple test file
        test_file = SimpleUploadedFile(
            'test_book.pdf',
            b'Test PDF content',
            content_type='application/pdf'
        )

        defaults = {
            'title': title,
            'author': author,
            'category': category,
            'description': 'A test book description',
            'file': test_file,
            'is_premium': False,
        }
        defaults.update(kwargs)

        return Book.objects.create(**defaults)

    return make_book


@pytest.fixture
def book(author, category, create_book):
    """Fixture for a standard book"""
    return create_book(
        title='Sample Book',
        author=author,
        category=category,
        description='A sample book for testing'
    )


@pytest.fixture
def premium_book(author, category, create_book):
    """Fixture for a premium book"""
    return create_book(
        title='Premium Book',
        author=author,
        category=category,
        description='A premium book for testing',
        is_premium=True
    )
