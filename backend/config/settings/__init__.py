import os

# Determinar qué configuración usar basado en DJANGO_ENV
env = os.getenv('DJANGO_ENV', 'development')

if env == 'production':
    from .production import *
elif env == 'staging':
    from .staging import *
else:
    from .development import *
