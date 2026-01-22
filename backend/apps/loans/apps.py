from django.apps import AppConfig


class LoansConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.loans'
    verbose_name = 'Préstamos'
    
    def ready(self):
        """Import signals when the app is ready."""
        import apps.loans.signals  # noqa
