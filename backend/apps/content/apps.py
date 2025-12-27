
from django.apps import AppConfig


class ContentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.content'

    def ready(self):
        """
        Importa signals cuando la app está lista.
        """
        import apps.content.signals  # noqa
