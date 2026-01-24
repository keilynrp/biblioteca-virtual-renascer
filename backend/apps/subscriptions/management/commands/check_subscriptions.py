from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.subscriptions.models import UserSubscription, InstitutionSubscription
from datetime import timedelta

class Command(BaseCommand):
    help = 'Check for expiring subscriptions and send alerts'

    def handle(self, *args, **kwargs):
        self.stdout.write('Checking for expiring subscriptions...')
        
        today = timezone.now()
        warning_window = today + timedelta(days=7)
        
        # 1. Check User Subscriptions
        # Find subscriptions expiring exactly 7 days from now (or within the range if running daily)
        # For simplicity, we check for subscriptions expiring between now and 7 days that haven't been alerted (flag needed? or just log)
        # We will just list them for now.
        
        expiring_subs = UserSubscription.objects.filter(
            is_active=True,
            end_date__date=warning_window.date()
        )
        
        for sub in expiring_subs:
            self.stdout.write(self.style.WARNING(f"User Subscription expiring soon: {sub.user.email} (Plan: {sub.plan.name}) on {sub.end_date}"))
            # Here we would send an email
            # send_mail(...)
            
        # 2. Check Institution Subscriptions
        expiring_inst_subs = InstitutionSubscription.objects.filter(
            is_active=True,
            end_date__date=warning_window.date()
        )
        
        for sub in expiring_inst_subs:
            self.stdout.write(self.style.WARNING(f"Institution Subscription expiring soon: {sub.institution.name} (Plan: {sub.plan.name}) on {sub.end_date}"))

        self.stdout.write(self.style.SUCCESS(f'Checked {UserSubscription.objects.filter(is_active=True).count()} active user subscriptions.'))
