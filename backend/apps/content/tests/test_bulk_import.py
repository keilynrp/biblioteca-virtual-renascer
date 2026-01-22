import pytest
import io
from django.utils.text import slugify
from apps.content.models import Book, Author, Category
from apps.content.utils.import_books import import_books_from_csv
from unittest.mock import patch

@pytest.fixture
def mock_csv_file():
    """Create a mock CSV file for testing"""
    content = (
        "title,author,category,description,isbn,is_premium\n"
        "Test Book 1,Author One,Category A,Desc 1,1234567890,true\n"
        "Test Book 2,Author Two,Category B,Desc 2,0987654321,false\n"
        "Existing Book,Author One,Category A,Desc 3,1111111111,true\n"
    )
    return io.BytesIO(content.encode('utf-8'))

@pytest.mark.django_db
class TestBulkImport:
    """Tests for bulk book import utility"""

    @patch('apps.content.models.validate_pdf_file', return_value=None)
    @patch('apps.content.models.validate_image_file', return_value=None)
    def test_bulk_import_success(self, mock_pdf, mock_img, mock_csv_file):
        """Test successful import of books from CSV"""
        # Create an existing book to test "already exists" logic
        author = Author.objects.create(name="Author One")
        Book.objects.create(
            title="Existing Book",
            author=author,
            slug=slugify("Existing Book")
        )
        
        imported_count, errors = import_books_from_csv(mock_csv_file)
        
        assert imported_count == 2  # Book 1 and Book 2 should be imported
        assert len(errors) == 0
        
        # Verify Book 1
        book1 = Book.objects.get(title="Test Book 1")
        assert book1.author.name == "Author One"
        assert book1.category.name == "Category A"
        assert book1.is_premium is True
        
        # Verify Book 2
        book2 = Book.objects.get(title="Test Book 2")
        assert book2.author.name == "Author Two"
        assert book2.category.name == "Category B"
        assert book2.is_premium is False

    @patch('apps.content.models.validate_pdf_file', return_value=None)
    @patch('apps.content.models.validate_image_file', return_value=None)
    def test_bulk_import_missing_fields(self, mock_pdf, mock_img):
        """Test import with missing required fields (title/author)"""
        bad_content = (
            "title,author,category\n"
            ",Missing Title,Category A\n"
            "Missing Author,,Category B\n"
        )
        csv_file = io.BytesIO(bad_content.encode('utf-8'))
        
        imported_count, errors = import_books_from_csv(csv_file)
        
        assert imported_count == 0
        assert len(errors) == 2
        assert "Missing required fields" in errors[0]
