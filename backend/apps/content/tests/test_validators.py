"""
Tests for file validators
"""
import os
import tempfile
from io import BytesIO
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
import pytest

from apps.content.validators import (
    PDFValidator,
    ImageValidator,
    validate_pdf_file,
    validate_image_file,
    sanitize_filename,
)


class TestPDFValidator:
    """Test PDF validation"""

    def test_valid_pdf_passes(self):
        """Test that a valid PDF passes validation"""
        # Create a valid PDF >= 1KB (validator minimum)
        pdf_content = b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'  # PDF header
        pdf_content += b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
        pdf_content += b'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
        pdf_content += b'3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\n'
        pdf_content += b'xref\n0 4\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'
        pdf_content += b' ' * (1024 - len(pdf_content) + 1)  # pad to exceed 1KB minimum

        pdf_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        # Should not raise any exception
        validator(pdf_file)

    def test_pdf_too_large_fails(self):
        """Test that PDFs over 50MB are rejected"""
        # Create a file larger than 50MB
        large_content = b'%PDF-1.4\n' + (b'X' * (51 * 1024 * 1024))

        pdf_file = SimpleUploadedFile(
            "large.pdf",
            large_content,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(pdf_file)

        assert 'demasiado grande' in str(exc_info.value).lower()

    def test_pdf_too_small_fails(self):
        """Test that PDFs under 1KB are rejected"""
        tiny_content = b'%PDF-'

        pdf_file = SimpleUploadedFile(
            "tiny.pdf",
            tiny_content,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        with pytest.raises(ValidationError):
            validator(pdf_file)

    def test_wrong_extension_fails(self):
        """Test that non-PDF extensions are rejected"""
        pdf_content = b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n' + (b'X' * 2000)

        pdf_file = SimpleUploadedFile(
            "document.txt",  # Wrong extension
            pdf_content,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(pdf_file)

        assert 'extensión' in str(exc_info.value).lower()

    def test_invalid_pdf_structure_fails(self):
        """Test that files without PDF header are rejected"""
        fake_pdf = b'This is not a PDF file\n' + (b'X' * 2000)

        pdf_file = SimpleUploadedFile(
            "fake.pdf",
            fake_pdf,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(pdf_file)

        assert 'no es un pdf válido' in str(exc_info.value).lower()

    def test_encrypted_pdf_fails(self):
        """Test that encrypted PDFs are rejected"""
        # Create a PDF with /Encrypt flag
        encrypted_content = b'%PDF-1.4\n'
        encrypted_content += b'/Encrypt << /Filter /Standard >>\n'
        encrypted_content += (b'X' * 2000)

        pdf_file = SimpleUploadedFile(
            "encrypted.pdf",
            encrypted_content,
            content_type="application/pdf"
        )

        validator = PDFValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(pdf_file)

        assert 'encriptado' in str(exc_info.value).lower()


class TestImageValidator:
    """Test image validation"""

    def test_image_too_large_fails(self):
        """Test that images over 5MB are rejected"""
        # Create a fake image larger than 5MB
        large_content = b'X' * (6 * 1024 * 1024)

        image_file = SimpleUploadedFile(
            "large.jpg",
            large_content,
            content_type="image/jpeg"
        )

        validator = ImageValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(image_file)

        assert 'demasiado grande' in str(exc_info.value).lower()

    def test_wrong_image_extension_fails(self):
        """Test that non-image extensions are rejected"""
        image_content = b'fake image content' * 100

        image_file = SimpleUploadedFile(
            "image.txt",  # Wrong extension
            image_content,
            content_type="image/jpeg"
        )

        validator = ImageValidator()
        with pytest.raises(ValidationError) as exc_info:
            validator(image_file)

        assert 'extensión' in str(exc_info.value).lower()


class TestFilenameSanitization:
    """Test filename sanitization"""

    def test_removes_path_separators(self):
        """Test that path separators are removed"""
        dangerous = "../../../etc/passwd.pdf"
        result = sanitize_filename(dangerous)
        assert '/' not in result
        assert '..' not in result

    def test_removes_special_characters(self):
        """Test that special characters are replaced with underscores"""
        filename = "My File (2024) - Copy [Final].pdf"
        result = sanitize_filename(filename)
        assert '(' not in result
        assert ')' not in result
        assert '[' not in result
        assert ']' not in result
        assert result == "My_File_2024_Copy_Final.pdf"

    def test_preserves_extension(self):
        """Test that file extension is preserved"""
        filename = "document.pdf"
        result = sanitize_filename(filename)
        assert result.endswith('.pdf')

    def test_limits_length(self):
        """Test that filename length is limited"""
        long_name = "a" * 150 + ".pdf"
        result = sanitize_filename(long_name)
        assert len(result) <= 104  # 100 chars + .pdf

    def test_handles_empty_name(self):
        """Test that empty names get a random filename"""
        result = sanitize_filename("...pdf")
        assert result.endswith('.pdf')
        assert len(result) > 4  # Should have generated random name

    def test_lowercase_extension(self):
        """Test that extension is converted to lowercase"""
        filename = "Document.PDF"
        result = sanitize_filename(filename)
        assert result.endswith('.pdf')
        assert not result.endswith('.PDF')

    def test_preserves_alphanumeric(self):
        """Test that alphanumeric characters are preserved"""
        filename = "Book123.pdf"
        result = sanitize_filename(filename)
        assert 'Book123' in result

    def test_replaces_spaces_with_underscores(self):
        """Test that spaces are replaced with underscores"""
        filename = "My Book Title.pdf"
        result = sanitize_filename(filename)
        assert ' ' not in result
        assert 'My_Book_Title' in result


class TestConvenienceFunctions:
    """Test convenience validation functions"""

    def test_validate_pdf_file_function(self):
        """Test validate_pdf_file convenience function"""
        pdf_content = b'%PDF-1.4\n' + (b'X' * 2000)
        pdf_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )

        # Should not raise exception
        validate_pdf_file(pdf_file)

    def test_validate_image_file_function(self):
        """Test validate_image_file convenience function"""
        image_content = b'fake image' * 200
        image_file = SimpleUploadedFile(
            "test.jpg",
            image_content,
            content_type="image/jpeg"
        )

        # Should not raise exception (will fail MIME check in real scenario)
        # But tests the function itself
        with pytest.raises(ValidationError):
            validate_image_file(image_file)


# Integration tests with actual model
@pytest.mark.django_db
class TestModelIntegration:
    """Test validators integrated with models"""

    def test_book_model_validates_pdf(self):
        """Test that Book model validates PDF uploads"""
        from apps.content.models import Book, Author, Category

        # Create required objects
        author = Author.objects.create(name="Test Author")
        category = Category.objects.create(name="Test Category")

        # Try to create book with invalid PDF
        fake_pdf = SimpleUploadedFile(
            "fake.pdf",
            b'Not a PDF' * 100,
            content_type="application/pdf"
        )

        book = Book(
            title="Test Book",
            author=author,
            category=category,
            description="Test description",
            file=fake_pdf
        )

        # Should raise validation error when saving
        with pytest.raises(ValidationError):
            book.full_clean()  # Triggers validators

    def test_author_model_validates_image(self):
        """Test that Author model validates image uploads"""
        from apps.content.models import Author

        # Try to create author with invalid image
        fake_image = SimpleUploadedFile(
            "fake.jpg",
            b'Not an image' * 1000,
            content_type="image/jpeg"
        )

        author = Author(
            name="Test Author",
            photo=fake_image
        )

        # Should raise validation error
        with pytest.raises(ValidationError):
            author.full_clean()
