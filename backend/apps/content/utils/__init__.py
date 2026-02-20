# =============================================================================
# Content Utilities - BVS Backend
# =============================================================================

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def get_pdf_page_count(file_path: str) -> int | None:
    """
    Extract the total page count from a PDF file using PyPDF2.

    Args:
        file_path: Path to the PDF file

    Returns:
        Number of pages in the PDF, or None if unable to determine
    """
    try:
        from PyPDF2 import PdfReader

        path = Path(file_path)
        if not path.exists():
            logger.warning(f"PDF file not found: {file_path}")
            return None

        if not path.suffix.lower() == '.pdf':
            logger.warning(f"File is not a PDF: {file_path}")
            return None

        reader = PdfReader(str(path))
        page_count = len(reader.pages)

        logger.debug(f"PDF {file_path} has {page_count} pages")
        return page_count

    except ImportError:
        logger.error("PyPDF2 is not installed. Run: pip install PyPDF2>=3.0")
        return None
    except Exception as e:
        logger.error(f"Error reading PDF page count from {file_path}: {str(e)}")
        return None
