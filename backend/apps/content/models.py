
from django.db import models
from django.utils.text import slugify
from django.conf import settings
from .validators import validate_pdf_file, validate_image_file, sanitize_filename

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        indexes = [
            models.Index(fields=['slug'], name='category_slug_idx'),
            models.Index(fields=['name'], name='category_name_idx'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

def author_photo_upload_path(instance, filename):
    """Generate upload path for author photos with sanitized filename"""
    sanitized = sanitize_filename(filename)
    return f'authors/{sanitized}'


class Author(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    photo = models.ImageField(
        upload_to=author_photo_upload_path,
        null=True,
        blank=True,
        validators=[validate_image_file],
        help_text='Formatos permitidos: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB'
    )

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='author_name_idx'),
        ]

    def __str__(self):
        return self.name

def book_cover_upload_path(instance, filename):
    """Generate upload path for book covers with sanitized filename"""
    sanitized = sanitize_filename(filename)
    return f'books/covers/{sanitized}'


def book_file_upload_path(instance, filename):
    """Generate upload path for book PDF files with sanitized filename"""
    sanitized = sanitize_filename(filename)
    return f'books/files/{sanitized}'


class Book(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    description = models.TextField()
    publication_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=13, blank=True)
    cover_image = models.ImageField(
        upload_to=book_cover_upload_path,
        null=True,
        blank=True,
        validators=[validate_image_file],
        help_text='Formatos permitidos: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB'
    )
    file = models.FileField(
        upload_to=book_file_upload_path,
        null=True,
        blank=True,
        validators=[validate_pdf_file],
        help_text='Formato: PDF. Tamaño máximo: 50MB'
    )
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Más recientes primero
        indexes = [
            # Frequently queried fields
            models.Index(fields=['category', '-created_at'], name='book_cat_created_idx'),
            models.Index(fields=['author', '-created_at'], name='book_auth_created_idx'),
            models.Index(fields=['is_premium', '-created_at'], name='book_prem_created_idx'),
            models.Index(fields=['-created_at'], name='book_created_idx'),
            # Search and filtering
            models.Index(fields=['slug'], name='book_slug_idx'),
            models.Index(fields=['title'], name='book_title_idx'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def average_rating(self):
        """Calculate average rating from reviews"""
        from django.db.models import Avg
        avg = self.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    @property
    def review_count(self):
        """Count total reviews"""
        return self.reviews.count()

    @property
    def favorite_count(self):
        """Count total favorites"""
        return self.favorited_by.count()


class Review(models.Model):
    """Book reviews and ratings from users"""
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_reader = models.BooleanField(default=False)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = [['book', 'user']]
        indexes = [
            models.Index(fields=['book', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.rating}/5)"


class ReviewHelpful(models.Model):
    """Track which users found a review helpful"""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_helpful'
        unique_together = [['review', 'user']]

    def __str__(self):
        return f"{self.user.username} found review #{self.review.id} helpful"


class Favorite(models.Model):
    """User's favorite books (reading list)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'favorites'
        ordering = ['-created_at']
        unique_together = [['user', 'book']]
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title}"


class ReadingHistory(models.Model):
    """Track user reading history and status"""
    STATUS_CHOICES = [
        ('reading', 'Leyendo'),
        ('completed', 'Completado'),
        ('want_to_read', 'Quiero leer'),
        ('abandoned', 'Abandonado'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reading_history')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='readers')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='want_to_read')
    progress_percentage = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_read_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reading_history'
        ordering = ['-last_read_at']
        unique_together = [['user', 'book']]
        verbose_name_plural = 'Reading histories'
        indexes = [
            models.Index(fields=['user', 'status', '-last_read_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"


class Reading(models.Model):
    """Track detailed reading progress (page-by-page) for PDF viewer"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='readings')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reading_sessions')
    current_page = models.IntegerField(default=1)
    total_pages = models.IntegerField(null=True, blank=True)
    progress_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Progress percentage based on current_page / total_pages"
    )
    zoom_level = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.00,
        help_text="User's preferred zoom level (1.00 = 100%)"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(auto_now=True)
    total_reading_time = models.IntegerField(
        default=0,
        help_text="Total reading time in seconds"
    )

    class Meta:
        db_table = 'readings'
        ordering = ['-last_read_at']
        unique_together = [['user', 'book']]
        verbose_name = 'Reading Session'
        verbose_name_plural = 'Reading Sessions'
        indexes = [
            models.Index(fields=['user', '-last_read_at']),
            models.Index(fields=['book', '-last_read_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} (Page {self.current_page}/{self.total_pages or '?'})"

    def save(self, *args, **kwargs):
        """Auto-calculate progress percentage when saving"""
        if self.total_pages and self.total_pages > 0:
            self.progress_percentage = round(
                (self.current_page / self.total_pages) * 100,
                2
            )
        super().save(*args, **kwargs)

    @property
    def is_finished(self):
        """Check if user finished reading the book"""
        if not self.total_pages:
            return False
        return self.current_page >= self.total_pages

    @property
    def pages_remaining(self):
        """Calculate pages remaining"""
        if not self.total_pages:
            return None
        return max(0, self.total_pages - self.current_page)


# =============================================================================
# Annotation Models - Sprint 10
# =============================================================================

class Bookmark(models.Model):
    """User bookmarks for specific pages in books"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='bookmarks')
    page_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_number', '-created_at']
        unique_together = ['user', 'book', 'page_number']
        indexes = [
            models.Index(fields=['user', 'book']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} - Page {self.page_number}"


class Highlight(models.Model):
    """Text highlights in books"""
    COLOR_CHOICES = [
        ('yellow', 'Amarillo'),
        ('green', 'Verde'),
        ('blue', 'Azul'),
        ('pink', 'Rosa'),
        ('purple', 'Púrpura'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='highlights')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='highlights')
    page_number = models.PositiveIntegerField()
    selected_text = models.TextField()
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='yellow')

    # Position data for rendering
    position_data = models.JSONField(default=dict, help_text="JSON with coordinates and selection info")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_number', 'created_at']
        indexes = [
            models.Index(fields=['user', 'book']),
            models.Index(fields=['page_number']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        text_preview = self.selected_text[:50] + '...' if len(self.selected_text) > 50 else self.selected_text
        return f"{self.user.username} - {self.book.title} - Page {self.page_number}: {text_preview}"


class Annotation(models.Model):
    """User annotations/notes on specific parts of books"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='annotations')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='annotations')
    page_number = models.PositiveIntegerField()

    # Optional: can be linked to a highlight
    highlight = models.ForeignKey(Highlight, on_delete=models.SET_NULL, null=True, blank=True, related_name='annotations')

    # The actual note content
    content = models.TextField()

    # Optional: selected text this annotation refers to
    selected_text = models.TextField(blank=True, default='')

    # Position data for rendering
    position_data = models.JSONField(default=dict, help_text="JSON with coordinates and selection info")

    # Privacy
    is_private = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_number', 'created_at']
        indexes = [
            models.Index(fields=['user', 'book']),
            models.Index(fields=['page_number']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_private']),
        ]

    def __str__(self):
        content_preview = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{self.user.username} - {self.book.title} - Page {self.page_number}: {content_preview}"
