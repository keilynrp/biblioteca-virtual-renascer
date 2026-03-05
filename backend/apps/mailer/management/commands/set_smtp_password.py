from django.core.management.base import BaseCommand
from apps.mailer.models import SMTPConfig
from apps.mailer.services import encrypt_password


class Command(BaseCommand):
    help = 'Set the SMTP password for the mailer configuration'

    def add_arguments(self, parser):
        parser.add_argument('password', type=str, help='Plain text SMTP password')

    def handle(self, *args, **options):
        cfg = SMTPConfig.get_config()
        cfg.password_encrypted = encrypt_password(options['password'])
        cfg.save(update_fields=['password_encrypted', 'updated_at'])
        self.stdout.write(self.style.SUCCESS(
            f'SMTP password updated for {cfg.username} ({cfg.host})'
        ))
