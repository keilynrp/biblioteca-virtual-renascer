"""
Configuración para entorno de staging (pre-producción)
"""

import os
from .production import *

# Permitir DEBUG en staging si es necesario
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Menos restrictivo que producción para pruebas
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Logging más verbose que producción
LOGGING['root']['level'] = 'DEBUG'
LOGGING['loggers']['apps']['level'] = 'DEBUG'
