from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import SMTPConfig, EmailLog, EmailTemplate
from .serializers import SMTPConfigSerializer, EmailLogSerializer, EmailTemplateSerializer
from . import services


def _is_admin(user):
    return user.is_staff or user.is_superuser or getattr(user, 'user_type', '') == 'admin'


class SMTPConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        cfg = SMTPConfig.get_config()
        serializer = SMTPConfigSerializer(cfg)
        return Response(serializer.data)

    def put(self, request):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        cfg = SMTPConfig.get_config()
        serializer = SMTPConfigSerializer(cfg, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SMTPTestEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        to = request.data.get('to', '').strip()
        if not to:
            return Response({'detail': 'El campo "to" es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        cfg = SMTPConfig.get_config()
        if not cfg.is_active:
            return Response(
                {'detail': 'La configuración SMTP no está activa.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        success = services.send_email(
            to=to,
            subject='[BVS] Correo de prueba',
            body_text='Este es un correo de prueba enviado desde el panel de administración de BVS.',
            body_html='<p>Este es un <strong>correo de prueba</strong> enviado desde el panel de administración de BVS.</p>',
            template_key='test',
        )
        if success:
            return Response({'detail': 'Correo enviado correctamente.'})
        return Response(
            {'detail': 'Error al enviar el correo. Revisa los registros.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class EmailLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        logs = EmailLog.objects.all()[:200]
        serializer = EmailLogSerializer(logs, many=True)
        return Response(serializer.data)


class EmailTemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        templates = EmailTemplate.objects.all()
        serializer = EmailTemplateSerializer(templates, many=True)
        return Response(serializer.data)


class EmailTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, key):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        template = get_object_or_404(EmailTemplate, key=key)
        return Response(EmailTemplateSerializer(template).data)

    def put(self, request, key):
        if not _is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        template = get_object_or_404(EmailTemplate, key=key)
        serializer = EmailTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
