from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.content.models import Book

class UserActivity(models.Model):
    """
    Tracks generic user actions for analytics.
    """
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('view_book', 'View Book'),
        ('start_reading', 'Start Reading'),
        ('finish_reading', 'Finish Reading'),
        ('download', 'Download'),
        ('search', 'Search'),
        ('profile_update', 'Profile Update'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user} - {self.action} - {self.created_at}"


class BookView(models.Model):
    """
    Tracks distinct views on book detail pages.
    """
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='analytics_views'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['book', 'created_at']),
        ]

    def __str__(self):
        return f"{self.book.title} viewed by {self.user or 'Anonymous'}"


class SearchQuery(models.Model):
    """
    Tracks search terms and result counts.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    query = models.CharField(max_length=255)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"'{self.query}' ({self.results_count})"
