"""
Tests for BookCopy model and management
"""

import pytest
from django.db import IntegrityError
from apps.loans.models import BookCopy


@pytest.mark.django_db
class TestBookCopyModel:
    """Test BookCopy model creation and constraints"""

    def test_create_book_copy(self, book):
        """Test creating a book copy"""
        copy = BookCopy.objects.create(
            book=book,
            copy_number=1,
            is_available=True,
            condition=BookCopy.Condition.NEW,
            barcode="COPY001"
        )

        assert copy.book == book
        assert copy.copy_number == 1
        assert copy.is_available is True
        assert copy.condition == BookCopy.Condition.NEW
        assert copy.barcode == "COPY001"

    def test_book_copy_default_condition(self, book):
        """Test default condition is GOOD"""
        copy = BookCopy.objects.create(
            book=book,
            copy_number=1
        )

        assert copy.condition == BookCopy.Condition.GOOD

    def test_book_copy_default_availability(self, book):
        """Test default availability is True"""
        copy = BookCopy.objects.create(
            book=book,
            copy_number=1
        )

        assert copy.is_available is True

    def test_book_copy_unique_barcode(self, book):
        """Test that barcode must be unique"""
        BookCopy.objects.create(
            book=book,
            copy_number=1,
            barcode="UNIQUE001"
        )

        # Try to create another copy with same barcode
        with pytest.raises(IntegrityError):
            BookCopy.objects.create(
                book=book,
                copy_number=2,
                barcode="UNIQUE001"
            )

    def test_book_copy_unique_together_book_copy_number(self, book):
        """Test that (book, copy_number) must be unique"""
        BookCopy.objects.create(
            book=book,
            copy_number=1
        )

        # Try to create another copy with same book and copy_number
        with pytest.raises(IntegrityError):
            BookCopy.objects.create(
                book=book,
                copy_number=1
            )

    def test_book_copy_str_representation(self, book_copy):
        """Test string representation of book copy"""
        expected = f"{book_copy.book.title} - Copia #{book_copy.copy_number}"
        assert str(book_copy) == expected

    def test_book_copy_conditions(self, book):
        """Test all condition choices"""
        conditions = [
            BookCopy.Condition.NEW,
            BookCopy.Condition.GOOD,
            BookCopy.Condition.FAIR,
            BookCopy.Condition.POOR
        ]

        for i, condition in enumerate(conditions, start=1):
            copy = BookCopy.objects.create(
                book=book,
                copy_number=i,
                condition=condition
            )
            assert copy.condition == condition

    def test_mark_copy_unavailable(self, book_copy):
        """Test marking a copy as unavailable"""
        assert book_copy.is_available is True

        book_copy.is_available = False
        book_copy.save()

        book_copy.refresh_from_db()
        assert book_copy.is_available is False

    def test_mark_copy_available(self, unavailable_book_copy):
        """Test marking a copy as available"""
        assert unavailable_book_copy.is_available is False

        unavailable_book_copy.is_available = True
        unavailable_book_copy.save()

        unavailable_book_copy.refresh_from_db()
        assert unavailable_book_copy.is_available is True


@pytest.mark.django_db
class TestBookCopyQueries:
    """Test querying book copies"""

    def test_filter_available_copies(self, book_copy, unavailable_book_copy):
        """Test filtering available copies"""
        available = BookCopy.objects.filter(is_available=True)

        assert book_copy in available
        assert unavailable_book_copy not in available

    def test_filter_copies_by_book(self, book, book_copy, second_book_copy):
        """Test filtering copies by book"""
        copies = BookCopy.objects.filter(book=book)

        assert copies.count() == 2
        assert book_copy in copies
        assert second_book_copy in copies

    def test_filter_copies_by_condition(self, book_copy, second_book_copy):
        """Test filtering copies by condition"""
        # book_copy is GOOD, second_book_copy is NEW
        good_copies = BookCopy.objects.filter(condition=BookCopy.Condition.GOOD)
        new_copies = BookCopy.objects.filter(condition=BookCopy.Condition.NEW)

        assert book_copy in good_copies
        assert second_book_copy in new_copies
        assert second_book_copy not in good_copies

    def test_book_copies_relation(self, book, book_copy, second_book_copy):
        """Test the reverse relation from book to copies"""
        copies = book.copies.all()

        assert copies.count() == 2
        assert book_copy in copies
        assert second_book_copy in copies

    def test_available_copies_count(self, book, book_copy, second_book_copy):
        """Test counting available copies for a book"""
        available_count = book.copies.filter(is_available=True).count()

        assert available_count == 2

        # Mark one as unavailable
        book_copy.is_available = False
        book_copy.save()

        available_count = book.copies.filter(is_available=True).count()
        assert available_count == 1


@pytest.mark.django_db
class TestBookCopyNotes:
    """Test book copy notes and metadata"""

    def test_add_notes_to_copy(self, book_copy):
        """Test adding notes to a book copy"""
        notes = "This copy has water damage on page 45"
        book_copy.notes = notes
        book_copy.save()

        book_copy.refresh_from_db()
        assert book_copy.notes == notes

    def test_empty_notes_by_default(self, book_copy):
        """Test that notes are empty by default"""
        assert book_copy.notes == ""

    def test_update_copy_condition_with_notes(self, book_copy):
        """Test updating condition and adding notes"""
        book_copy.condition = BookCopy.Condition.FAIR
        book_copy.notes = "Cover is worn but pages are intact"
        book_copy.save()

        book_copy.refresh_from_db()
        assert book_copy.condition == BookCopy.Condition.FAIR
        assert "worn" in book_copy.notes
