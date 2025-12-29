
from django.db import models
from django.utils.text import slugify
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Author(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='authors/', null=True, blank=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    description = models.TextField()
    publication_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=13, blank=True)
    cover_image = models.ImageField(upload_to='books/covers/', null=True, blank=True)
    file = models.FileField(upload_to='books/files/', null=True, blank=True)
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Más recientes primero

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
