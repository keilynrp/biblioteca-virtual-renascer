"""
Celery application definition for BVS Framework.
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('bvs')

# Read config from Django settings, namespace CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks.py in all installed apps
app.autodiscover_tasks()

# ─── Periodic Tasks (beat schedule) ───────────────────────────────────
app.conf.beat_schedule = {
    # Run every day at 6:00 AM
    'process-subscription-expirations': {
        'task': 'apps.subscriptions.tasks.process_subscription_expirations',
        'schedule': crontab(hour=6, minute=0),
    },
    # Run every day at 7:00 AM
    'notify-expiring-subscriptions': {
        'task': 'apps.subscriptions.tasks.notify_expiring_subscriptions',
        'schedule': crontab(hour=7, minute=0),
    },
    # Run every day at 7:30 AM
    'notify-expiring-trials': {
        'task': 'apps.subscriptions.tasks.notify_expiring_trials',
        'schedule': crontab(hour=7, minute=30),
    },
    # Run every day at 8:00 AM  — enforce seat limits
    'sync-institution-seats': {
        'task': 'apps.subscriptions.tasks.sync_institution_seats',
        'schedule': crontab(hour=8, minute=0),
    },
}
