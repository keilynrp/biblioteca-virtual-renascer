"""
Pytest fixtures for Loans tests
"""

import pytest
from django.utils import timezone
from datetime import timedelta
from apps.loans.models import BookCopy, Loan, LoanQueue
from apps.content.models import Book, Category, Author


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
        title="Test Book for Loans",
        description="Test description",
        category=category,
        author=author,
        isbn="9781234567890",
        publication_date="2024-01-01"
    )


@pytest.fixture
def second_book(db, category, author):
    """Create a second test book"""
    return Book.objects.create(
        title="Second Test Book",
        description="Second book description",
        category=category,
        author=author,
        isbn="9789876543210",
        publication_date="2024-02-01"
    )


@pytest.fixture
def book_copy(db, book):
    """Create an available book copy"""
    return BookCopy.objects.create(
        book=book,
        copy_number=1,
        is_available=True,
        condition=BookCopy.Condition.GOOD,
        barcode="BC001"
    )


@pytest.fixture
def second_book_copy(db, book):
    """Create a second available book copy"""
    return BookCopy.objects.create(
        book=book,
        copy_number=2,
        is_available=True,
        condition=BookCopy.Condition.NEW,
        barcode="BC002"
    )


@pytest.fixture
def unavailable_book_copy(db, second_book):
    """Create an unavailable book copy"""
    return BookCopy.objects.create(
        book=second_book,
        copy_number=1,
        is_available=False,
        condition=BookCopy.Condition.GOOD,
        barcode="BC003"
    )


@pytest.fixture
def active_loan(db, user, book, book_copy):
    """Create an active loan"""
    book_copy.is_available = False
    book_copy.save()

    return Loan.objects.create(
        user=user,
        book=book,
        book_copy=book_copy,
        status=Loan.LoanStatus.ACTIVE,
        due_date=timezone.now().date() + timedelta(days=14),
        renewals_count=0,
        max_renewals=2
    )


@pytest.fixture
def overdue_loan(db, create_user, second_book, unavailable_book_copy):
    """Create an overdue loan"""
    overdue_user = create_user(
        email='overdue@example.com',
        username='overdueuser',
        password='TestPass123!'
    )

    return Loan.objects.create(
        user=overdue_user,
        book=second_book,
        book_copy=unavailable_book_copy,
        status=Loan.LoanStatus.ACTIVE,
        due_date=timezone.now().date() - timedelta(days=5),  # 5 days overdue
        renewals_count=0,
        max_renewals=2
    )


@pytest.fixture
def returned_loan(db, create_user, book, second_book_copy):
    """Create a returned loan"""
    returned_user = create_user(
        email='returned@example.com',
        username='returneduser',
        password='TestPass123!'
    )

    loan = Loan.objects.create(
        user=returned_user,
        book=book,
        book_copy=second_book_copy,
        status=Loan.LoanStatus.RETURNED,
        due_date=timezone.now().date() - timedelta(days=10),
        returned_at=timezone.now() - timedelta(days=3),
        renewals_count=1,
        max_renewals=2
    )

    # Make sure copy is available again
    second_book_copy.is_available = True
    second_book_copy.save()

    return loan


@pytest.fixture
def loan_queue_entry(db, user, second_book):
    """Create a loan queue entry"""
    return LoanQueue.objects.create(
        user=user,
        book=second_book,
        position=1,
        notified=False
    )


@pytest.fixture
def notified_queue_entry(db, create_user, book):
    """Create a notified queue entry"""
    notified_user = create_user(
        email='notified@example.com',
        username='notifieduser',
        password='TestPass123!'
    )

    return LoanQueue.objects.create(
        user=notified_user,
        book=book,
        position=1,
        notified=True,
        notified_at=timezone.now(),
        expires_at=timezone.now() + timedelta(days=3)
    )
