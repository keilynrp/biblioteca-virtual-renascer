import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.test import RequestFactory
from apps.content.views import BookExportView
import traceback

factory = RequestFactory()
request = factory.get('/api/content/books/export/?export_format=xlsx&ids=1,2,3,4,5')

# Monkey-patch DRF exception handler to print traceback
from rest_framework.views import APIView
original_handle_exception = APIView.handle_exception

def patched_handle_exception(self, exc):
    print("Caught exception inside APIView:", type(exc).__name__, exc)
    traceback.print_exc()
    return original_handle_exception(self, exc)

APIView.handle_exception = patched_handle_exception

view_func = BookExportView.as_view(permission_classes=[])
print("Calling view...")
try:
    response = view_func(request)
    print("======== RESPONSE ========")
    print("Status code:", response.status_code)
except Exception as e:
    traceback.print_exc()
