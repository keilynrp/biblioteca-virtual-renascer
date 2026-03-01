from rest_framework import serializers
from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = (
            'site_name', 'tagline', 'logo_url', 'favicon_url',
            'ga_id', 'gtm_id', 'gsc_id',
            'cookie_consent_enabled', 'privacy_policy_url', 'terms_of_service_url', 'cookie_policy_url',
            'cookies_analytics_enabled', 'cookies_marketing_enabled', 'cookies_functional_enabled',
            'compliance_gdpr', 'compliance_lgpd', 'compliance_hipaa', 'compliance_ccpa',
            'cookie_banner_title', 'cookie_banner_description',
            'updated_at',
        )

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url

    def get_favicon_url(self, obj):
        if not obj.favicon:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.favicon.url)
        return obj.favicon.url


class SiteSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = (
            'site_name', 'tagline', 'logo', 'favicon',
            'ga_id', 'gtm_id', 'gsc_id',
            'cookie_consent_enabled', 'privacy_policy_url', 'terms_of_service_url', 'cookie_policy_url',
            'cookies_analytics_enabled', 'cookies_marketing_enabled', 'cookies_functional_enabled',
            'compliance_gdpr', 'compliance_lgpd', 'compliance_hipaa', 'compliance_ccpa',
            'cookie_banner_title', 'cookie_banner_description',
        )
