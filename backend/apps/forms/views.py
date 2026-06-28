import uuid as uuid_mod
import csv
import logging

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.db.models import Count, Q
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.core.decorators import get_client_ip
from apps.core.permissions import IsAdminType

from .models import Form, FormSubmission
from .serializers import (
    FormListSerializer, FormDetailSerializer, FormWriteSerializer,
    FormSubmissionListSerializer, FormSubmissionDetailSerializer,
    PublicFormSerializer, PublicFormSubmitSerializer,
)
from .notifications import send_form_notification
from .captcha import verify_captcha

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Admin — Form CRUD
# ---------------------------------------------------------------------------

class FormViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for forms.

    GET    /api/forms/                  list
    POST   /api/forms/                  create
    GET    /api/forms/<slug>/           retrieve
    PATCH  /api/forms/<slug>/           update
    DELETE /api/forms/<slug>/           delete
    POST   /api/forms/<slug>/publish/   publish
    POST   /api/forms/<slug>/archive/   archive
    """
    lookup_field = 'slug'
    permission_classes = [IsAdminType]

    def get_queryset(self):
        return Form.objects.annotate(
            submission_count=Count('submissions'),
            unread_count=Count(
                'submissions',
                filter=Q(submissions__is_read=False, submissions__is_spam=False),
            ),
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return FormListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return FormWriteSerializer
        return FormDetailSerializer

    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        form = self.get_object()
        if form.fields.count() == 0:
            return Response(
                {'error': 'No se puede publicar un formulario sin campos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        form.status = Form.Status.PUBLISHED
        form.version += 1
        form.save(update_fields=['status', 'version'])
        form.snapshot_fields()
        return Response(FormDetailSerializer(form).data)

    @action(detail=True, methods=['post'])
    def archive(self, request, slug=None):
        form = self.get_object()
        form.status = Form.Status.ARCHIVED
        form.save(update_fields=['status'])
        return Response(FormDetailSerializer(form).data)


# ---------------------------------------------------------------------------
# Admin — Submissions
# ---------------------------------------------------------------------------

class FormSubmissionViewSet(viewsets.GenericViewSet):
    """
    Admin read + actions for submissions of a specific form.

    GET   /api/forms/<slug>/submissions/
    GET   /api/forms/<slug>/submissions/<pk>/
    PATCH /api/forms/<slug>/submissions/<pk>/mark-read/
    PATCH /api/forms/<slug>/submissions/<pk>/mark-spam/
    GET   /api/forms/<slug>/submissions/export/
    """
    permission_classes = [IsAdminType]

    def get_queryset(self):
        return FormSubmission.objects.filter(
            form__slug=self.kwargs['form_slug'],
        ).select_related('form')

    def get_serializer_class(self):
        if self.action == 'list':
            return FormSubmissionListSerializer
        return FormSubmissionDetailSerializer

    def list(self, request, **kwargs):
        qs = self.get_queryset()
        filter_type = request.query_params.get('filter')
        if filter_type == 'unread':
            qs = qs.filter(is_read=False, is_spam=False)
        elif filter_type == 'spam':
            qs = qs.filter(is_spam=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, **kwargs):
        submission = get_object_or_404(self.get_queryset(), pk=kwargs['pk'])
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_read(self, request, **kwargs):
        submission = get_object_or_404(self.get_queryset(), pk=kwargs['pk'])
        submission.is_read = True
        submission.save(update_fields=['is_read'])
        return Response({'status': 'ok'})

    @action(detail=True, methods=['patch'], url_path='mark-spam')
    def mark_spam(self, request, **kwargs):
        submission = get_object_or_404(self.get_queryset(), pk=kwargs['pk'])
        submission.is_spam = not submission.is_spam
        submission.save(update_fields=['is_spam'])
        return Response({'is_spam': submission.is_spam})

    def destroy(self, request, **kwargs):
        submission = get_object_or_404(self.get_queryset(), pk=kwargs['pk'])
        submission.delete()
        return Response(status=204)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request, **kwargs):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=400)
        deleted, _ = self.get_queryset().filter(id__in=ids).delete()
        return Response({'deleted': deleted})

    @action(detail=False, methods=['get'])
    def export(self, request, **kwargs):
        qs = self.get_queryset().filter(is_spam=False)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="submissions.csv"'

        # collect all field keys
        all_keys: list[str] = []
        seen: set[str] = set()
        for sub in qs:
            for k in sub.data.keys():
                if k not in seen:
                    all_keys.append(k)
                    seen.add(k)

        writer = csv.writer(response)
        writer.writerow(['ID', 'Fecha', 'IP'] + all_keys)
        for sub in qs:
            row = [str(sub.uuid), str(sub.created_at), sub.ip_address or '']
            row += [sub.data.get(k, '') for k in all_keys]
            writer.writerow(row)

        return response


# ---------------------------------------------------------------------------
# Public — Retrieve form schema
# ---------------------------------------------------------------------------

class PublicFormRetrieveView(generics.RetrieveAPIView):
    """GET /api/forms/public/<uuid>/ — public form schema for rendering."""
    permission_classes = [AllowAny]
    serializer_class = PublicFormSerializer
    lookup_field = 'uuid'
    queryset = Form.objects.filter(status=Form.Status.PUBLISHED)


class PublicFormBySlugView(generics.RetrieveAPIView):
    """GET /api/forms/public/by-slug/<slug>/ — public form schema by slug."""
    permission_classes = [AllowAny]
    serializer_class = PublicFormSerializer
    lookup_field = 'slug'
    queryset = Form.objects.filter(status=Form.Status.PUBLISHED)


# ---------------------------------------------------------------------------
# Public — Submit
# ---------------------------------------------------------------------------

class PublicFormSubmitView(generics.GenericAPIView):
    """POST /api/forms/submit/<uuid>/ — public form submission."""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = PublicFormSubmitSerializer

    @method_decorator(ratelimit(key='ip', rate='10/m', block=True))
    def post(self, request, form_uuid):
        form = get_object_or_404(
            Form, uuid=form_uuid, status=Form.Status.PUBLISHED,
        )

        # If multipart, data comes as JSON string in 'data' field
        raw_data = request.data.get('data', request.data)
        if isinstance(raw_data, str):
            import json
            try:
                raw_data = json.loads(raw_data)
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid JSON in data field.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        honeypot_value = request.data.get('honeypot', '')

        # --- Captcha verification ---
        client_ip = get_client_ip(request)
        captcha_data = {
            'captcha_token': request.data.get('captcha_token', ''),
            'captcha_answer': request.data.get('captcha_answer', ''),
            'captcha_expected': request.data.get('captcha_expected', ''),
            'form_loaded_at': request.data.get('form_loaded_at', 0),
        }
        captcha_ok, captcha_reason = verify_captcha(
            form, captcha_data, ip=client_ip,
        )
        if not captcha_ok:
            return Response(
                {'error': captcha_reason, 'captcha_failed': True},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data={'data': raw_data, 'honeypot': honeypot_value},
            context={'form': form, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        # File uploads
        file_uploads = {}
        for field in form.fields.filter(field_type='file'):
            file_obj = request.FILES.get(field.label)
            if file_obj:
                upload_path = (
                    f'form_uploads/{form.uuid}/{uuid_mod.uuid4()}/{file_obj.name}'
                )
                saved_path = default_storage.save(upload_path, file_obj)
                file_uploads[field.label] = saved_path

        is_spam = bool(honeypot_value)

        submission = FormSubmission.objects.create(
            form=form,
            form_version=form.version,
            data=serializer.validated_data['data'],
            file_uploads=file_uploads,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            submitted_by=request.user if request.user.is_authenticated else None,
            is_spam=is_spam,
        )

        if not is_spam:
            try:
                send_form_notification(form, submission)
            except Exception:
                logger.exception('Error sending form notification')

        return Response(
            {
                'success': True,
                'message': form.success_message,
                'redirect_url': form.redirect_url or None,
            },
            status=status.HTTP_201_CREATED,
        )
