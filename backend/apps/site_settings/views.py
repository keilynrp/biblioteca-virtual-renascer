from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, AllowAny
from .models import SiteSettings
from .serializers import SiteSettingsSerializer, SiteSettingsUpdateSerializer


class IsAdminType(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_staff or getattr(request.user, 'user_type', None) == 'admin')
        )


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
        obj = SiteSettings.get_settings()
        serializer = SiteSettingsUpdateSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SiteSettingsSerializer(serializer.instance, context={'request': request}).data)
