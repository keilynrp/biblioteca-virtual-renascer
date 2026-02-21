from rest_framework import serializers
from .models import SMTPConfig, EmailLog, EmailTemplate
from . import services


class SMTPConfigSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, default=''
    )

    class Meta:
        model = SMTPConfig
        fields = [
            'id', 'host', 'port', 'use_tls', 'use_ssl',
            'username', 'password', 'from_email', 'from_name',
            'is_active', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Never expose the encrypted password; indicate whether one is set
        data['password_is_set'] = bool(instance.password_encrypted)
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', '')
        if password:
            instance.password_encrypted = services.encrypt_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def create(self, validated_data):
        password = validated_data.pop('password', '')
        instance = SMTPConfig(**validated_data)
        if password:
            instance.password_encrypted = services.encrypt_password(password)
        instance.save()
        return instance


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = [
            'id', 'recipient', 'subject', 'template_key',
            'status', 'error_message', 'sent_at',
        ]
        read_only_fields = fields


class EmailTemplateSerializer(serializers.ModelSerializer):
    key_display = serializers.CharField(source='get_key_display', read_only=True)

    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'key', 'key_display', 'subject',
            'body_html', 'body_text', 'is_active', 'updated_at',
        ]
        read_only_fields = ['id', 'key_display', 'updated_at']
