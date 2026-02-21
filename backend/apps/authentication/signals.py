from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings

TRIAL_DAYS = getattr(settings, 'TRIAL_PERIOD_DAYS', 14)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def set_trial_end_date(sender, instance, created, **kwargs):
    if created and instance.trial_end_date is None:
        instance.trial_end_date = instance.date_joined + timezone.timedelta(days=TRIAL_DAYS)
        sender.objects.filter(pk=instance.pk).update(trial_end_date=instance.trial_end_date)
