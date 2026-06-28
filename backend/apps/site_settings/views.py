import logging

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from apps.core.permissions import IsAdminType

from .models import SiteSettings
from .serializers import SiteSettingsSerializer, SiteSettingsUpdateSerializer

logger = logging.getLogger(__name__)


class SiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminType()]

    def get(self, request):
        obj = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(obj, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        try:
            obj = SiteSettings.get_settings()
            serializer = SiteSettingsUpdateSerializer(obj, data=request.data, partial=True)
            if not serializer.is_valid():
                logger.warning('SiteSettings validation errors: %s', serializer.errors)
                return Response(
                    {'error': {'code': 'validation_error', 'message': str(serializer.errors)}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer.save()
        except Exception as e:
            logger.error('SiteSettings PATCH failed: %s: %s', e.__class__.__name__, e, exc_info=True)
            return Response(
                {'error': {'code': 'save_failed', 'message': f'{e.__class__.__name__}: {e}'}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(SiteSettingsSerializer(serializer.instance, context={'request': request}).data)


class WebManifestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        obj = SiteSettings.get_settings()

        icons = []
        if obj.android_chrome_192:
            icons.append({
                'src': request.build_absolute_uri(obj.android_chrome_192.url),
                'sizes': '192x192',
                'type': 'image/png',
            })
        if obj.android_chrome_512:
            icons.append({
                'src': request.build_absolute_uri(obj.android_chrome_512.url),
                'sizes': '512x512',
                'type': 'image/png',
            })

        manifest = {
            'name': obj.site_name,
            'short_name': obj.site_name[:12],
            'icons': icons,
            'theme_color': obj.theme_color or '#3b82f6',
            'background_color': '#ffffff',
            'display': 'standalone',
            'start_url': '/',
        }
        return JsonResponse(manifest, content_type='application/manifest+json')
