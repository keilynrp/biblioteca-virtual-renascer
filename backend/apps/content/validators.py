"""
File validators for content uploads (PDFs, images, etc.)
"""
import os
import magic
from django.core.exceptions import ValidationError
from django.template.defaultfilters import filesizeformat


class FileValidator:
    """Base file validator with common validation logic"""

    error_messages = {
        'max_size': "El archivo es demasiado grande. Tamaño máximo: %(max_size)s. Tamaño actual: %(size)s.",
        'min_size': "El archivo es demasiado pequeño. Tamaño mínimo: %(min_size)s. Tamaño actual: %(size)s.",
        'content_type': "Tipo de archivo no permitido. Tipos permitidos: %(allowed_types)s.",
        'extension': "Extensión de archivo no permitida. Extensiones permitidas: %(allowed_extensions)s.",
    }

    def __init__(self, max_size=None, min_size=None, allowed_types=None, allowed_extensions=None):
        self.max_size = max_size
        self.min_size = min_size
        self.allowed_types = allowed_types or []
        self.allowed_extensions = allowed_extensions or []

    def __call__(self, file):
        """Validate the file"""
        # Validate file size
        if self.max_size is not None and file.size > self.max_size:
            raise ValidationError(
                self.error_messages['max_size'],
                code='max_size',
                params={
                    'max_size': filesizeformat(self.max_size),
                    'size': filesizeformat(file.size),
                }
            )

        if self.min_size is not None and file.size < self.min_size:
            raise ValidationError(
                self.error_messages['min_size'],
                code='min_size',
                params={
                    'min_size': filesizeformat(self.min_size),
                    'size': filesizeformat(file.size),
                }
            )

        # Validate file extension
        if self.allowed_extensions:
            ext = os.path.splitext(file.name)[1].lower()
            if ext not in self.allowed_extensions:
                raise ValidationError(
                    self.error_messages['extension'],
                    code='extension',
                    params={
                        'allowed_extensions': ', '.join(self.allowed_extensions),
                    }
                )

        # Validate MIME type using python-magic
        if self.allowed_types:
            # Read first chunk for MIME detection
            file.seek(0)
            file_content = file.read(2048)
            file.seek(0)  # Reset file pointer

            try:
                mime_type = magic.from_buffer(file_content, mime=True)
            except Exception:
                # Fallback to file extension if magic fails
                mime_type = None

            if mime_type and mime_type not in self.allowed_types:
                raise ValidationError(
                    self.error_messages['content_type'],
                    code='content_type',
                    params={
                        'allowed_types': ', '.join(self.allowed_types),
                    }
                )


class PDFValidator(FileValidator):
    """Specific validator for PDF files"""

    # 50 MB max size for PDFs
    MAX_PDF_SIZE = 50 * 1024 * 1024  # 50MB in bytes
    MIN_PDF_SIZE = 1024  # 1KB minimum (prevent empty files)

    ALLOWED_PDF_TYPES = [
        'application/pdf',
        'application/x-pdf',
    ]

    ALLOWED_PDF_EXTENSIONS = ['.pdf']

    error_messages = {
        **FileValidator.error_messages,
        'invalid_pdf': "El archivo no es un PDF válido o está corrupto.",
        'encrypted': "El PDF está encriptado. Por favor, sube una versión sin protección.",
    }

    def __init__(self, max_size=None, min_size=None):
        super().__init__(
            max_size=max_size or self.MAX_PDF_SIZE,
            min_size=min_size or self.MIN_PDF_SIZE,
            allowed_types=self.ALLOWED_PDF_TYPES,
            allowed_extensions=self.ALLOWED_PDF_EXTENSIONS,
        )

    def __call__(self, file):
        """Validate PDF file with additional PDF-specific checks"""
        # Run base validation first
        super().__call__(file)

        # Additional PDF-specific validation
        self._validate_pdf_structure(file)

    def _validate_pdf_structure(self, file):
        """Validate that the file is a valid PDF by checking its structure"""
        file.seek(0)
        header = file.read(5)
        file.seek(0)

        # Check PDF header signature
        if header != b'%PDF-':
            raise ValidationError(
                self.error_messages['invalid_pdf'],
                code='invalid_pdf',
            )

        # Check for encrypted PDFs (basic check)
        file.seek(0)
        content = file.read(4096)
        file.seek(0)

        if b'/Encrypt' in content:
            raise ValidationError(
                self.error_messages['encrypted'],
                code='encrypted',
            )


class ImageValidator(FileValidator):
    """Specific validator for image files (covers, avatars, etc.)"""

    # 5 MB max size for images
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
    MIN_IMAGE_SIZE = 1024  # 1KB minimum

    ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
    ]

    ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

    def __init__(self, max_size=None, min_size=None):
        super().__init__(
            max_size=max_size or self.MAX_IMAGE_SIZE,
            min_size=min_size or self.MIN_IMAGE_SIZE,
            allowed_types=self.ALLOWED_IMAGE_TYPES,
            allowed_extensions=self.ALLOWED_IMAGE_EXTENSIONS,
        )


def validate_pdf_file(file):
    """Convenience function for PDF validation"""
    validator = PDFValidator()
    return validator(file)


def validate_image_file(file):
    """Convenience function for image validation"""
    validator = ImageValidator()
    return validator(file)


def sanitize_filename(filename):
    """
    Sanitize filename to prevent directory traversal and other security issues.

    - Removes path separators
    - Removes special characters
    - Limits length
    - Preserves extension
    """
    # Get filename without path
    filename = os.path.basename(filename)

    # Split name and extension
    name, ext = os.path.splitext(filename)

    # Remove special characters and keep only alphanumeric, dash, underscore
    import re
    name = re.sub(r'[^a-zA-Z0-9\-_]', '_', name)

    # Limit length (max 100 chars for name)
    name = name[:100]

    # Ensure extension is lowercase
    ext = ext.lower()

    # Reconstruct filename
    sanitized = f"{name}{ext}"

    # Prevent empty filenames
    if not name:
        sanitized = f"file_{os.urandom(8).hex()}{ext}"

    return sanitized
