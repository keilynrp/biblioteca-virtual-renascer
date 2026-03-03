from rest_framework import serializers
from django.core.validators import validate_email as django_validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Form, FormField, FormSubmission, FormNotificationRecipient


# ---------------------------------------------------------------------------
# FormField
# ---------------------------------------------------------------------------

class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = (
            'id', 'label', 'field_type', 'placeholder', 'help_text',
            'is_required', 'validation_rules', 'options', 'default_value', 'order',
        )


class FormFieldWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = FormField
        fields = (
            'id', 'label', 'field_type', 'placeholder', 'help_text',
            'is_required', 'validation_rules', 'options', 'default_value', 'order',
        )


# ---------------------------------------------------------------------------
# FormNotificationRecipient
# ---------------------------------------------------------------------------

class FormNotificationRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormNotificationRecipient
        fields = ('id', 'email', 'name', 'is_active')


class FormNotificationRecipientWriteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(required=False, default='', allow_blank=True)
    is_active = serializers.BooleanField(default=True)


# ---------------------------------------------------------------------------
# Form — List / Detail / Write
# ---------------------------------------------------------------------------

class FormListSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(read_only=True)
    unread_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Form
        fields = (
            'id', 'uuid', 'title', 'slug', 'status', 'version',
            'submission_count', 'unread_count',
            'created_at', 'updated_at',
        )


class FormDetailSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    notification_recipients = FormNotificationRecipientSerializer(many=True, read_only=True)
    submission_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Form
        fields = (
            'id', 'uuid', 'title', 'slug', 'description', 'status',
            'honeypot_field_name', 'success_message', 'redirect_url',
            'captcha_provider', 'captcha_site_key', 'captcha_secret_key',
            'captcha_min_seconds', 'captcha_score_threshold',
            'version', 'fields', 'notification_recipients',
            'submission_count', 'created_at', 'updated_at',
        )


class FormWriteSerializer(serializers.ModelSerializer):
    fields = FormFieldWriteSerializer(many=True, required=False)
    notification_recipients = FormNotificationRecipientWriteSerializer(
        many=True, required=False,
    )

    class Meta:
        model = Form
        fields = (
            'title', 'slug', 'description', 'status',
            'honeypot_field_name', 'success_message', 'redirect_url',
            'captcha_provider', 'captcha_site_key', 'captcha_secret_key',
            'captcha_min_seconds', 'captcha_score_threshold',
            'fields', 'notification_recipients',
        )
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
        }

    # ----- helpers -----
    def _sync_fields(self, form, fields_data):
        existing_ids = set(form.fields.values_list('id', flat=True))
        incoming_ids = {f['id'] for f in fields_data if 'id' in f and f['id']}

        # delete removed
        form.fields.exclude(id__in=incoming_ids).delete()

        for idx, field_data in enumerate(fields_data):
            field_id = field_data.pop('id', None)
            field_data.pop('order', None)  # order is determined by position
            if field_id and field_id in existing_ids:
                form.fields.filter(id=field_id).update(order=idx, **field_data)
            else:
                FormField.objects.create(form=form, order=idx, **field_data)

    def _sync_recipients(self, form, recipients_data):
        form.notification_recipients.all().delete()
        for r in recipients_data:
            FormNotificationRecipient.objects.create(form=form, **r)

    # ----- create / update -----
    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        recipients_data = validated_data.pop('notification_recipients', [])
        validated_data['created_by'] = self.context['request'].user

        form = Form.objects.create(**validated_data)

        for idx, fd in enumerate(fields_data):
            fd.pop('id', None)
            fd.pop('order', None)  # order is determined by position
            FormField.objects.create(form=form, order=idx, **fd)

        for r in recipients_data:
            FormNotificationRecipient.objects.create(form=form, **r)

        if form.status == Form.Status.PUBLISHED:
            form.snapshot_fields()

        return form

    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields', None)
        recipients_data = validated_data.pop('notification_recipients', None)
        was_published = instance.status

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if (instance.status == Form.Status.PUBLISHED
                and was_published != Form.Status.PUBLISHED):
            instance.version += 1

        instance.save()

        if fields_data is not None:
            self._sync_fields(instance, fields_data)

        if recipients_data is not None:
            self._sync_recipients(instance, recipients_data)

        if instance.status == Form.Status.PUBLISHED:
            instance.snapshot_fields()

        return instance


# ---------------------------------------------------------------------------
# Public — read-only form for rendering
# ---------------------------------------------------------------------------

class PublicFormSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Form
        fields = (
            'uuid', 'title', 'description', 'fields',
            'honeypot_field_name', 'success_message',
            'captcha_provider', 'captcha_site_key', 'captcha_min_seconds',
            'captcha_score_threshold',
        )
        # NEVER expose captcha_secret_key to the public


# ---------------------------------------------------------------------------
# Public — submit
# ---------------------------------------------------------------------------

class PublicFormSubmitSerializer(serializers.Serializer):
    data = serializers.DictField(child=serializers.CharField(allow_blank=True))
    honeypot = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, attrs):
        form = self.context['form']
        data = attrs['data']

        for field in form.fields.all():
            value = data.get(field.label, '')

            if field.is_required and not value:
                raise serializers.ValidationError(
                    {field.label: f'{field.label} es requerido.'}
                )

            if value and field.field_type == 'email':
                try:
                    django_validate_email(value)
                except DjangoValidationError:
                    raise serializers.ValidationError(
                        {field.label: 'Email inválido.'}
                    )

        return attrs


# ---------------------------------------------------------------------------
# FormSubmission — admin read
# ---------------------------------------------------------------------------

class FormSubmissionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        fields = (
            'id', 'uuid', 'form_version', 'data',
            'is_spam', 'is_read', 'ip_address', 'created_at',
        )


class FormSubmissionDetailSerializer(serializers.ModelSerializer):
    form_title = serializers.CharField(source='form.title', read_only=True)
    field_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = FormSubmission
        fields = (
            'id', 'uuid', 'form', 'form_title', 'form_version',
            'data', 'file_uploads', 'field_snapshot',
            'ip_address', 'user_agent', 'is_spam', 'is_read', 'created_at',
        )

    def get_field_snapshot(self, obj):
        snapshots = obj.form.field_snapshots or {}
        return snapshots.get(str(obj.form_version), [])
