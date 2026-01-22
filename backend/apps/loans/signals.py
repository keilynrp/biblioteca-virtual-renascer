"""
Signal handlers for loan management.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Loan
import logging

logger = logging.getLogger(__name__)


# Placeholder for signals - can be expanded later
# For now, we handle notifications directly in views and utils


# Future: Add signals for automatic fine calculation
# Future: Add signals for automated email sending
