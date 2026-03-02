from rest_framework import serializers
from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    logo_small_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    favicon_16_url = serializers.SerializerMethodField()
    favicon_32_url = serializers.SerializerMethodField()
    apple_touch_icon_url = serializers.SerializerMethodField()
    android_chrome_192_url = serializers.SerializerMethodField()
    android_chrome_512_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = (
            'site_name', 'tagline', 'logo_url', 'logo_small_url', 'favicon_url',
            'favicon_16_url', 'favicon_32_url', 'apple_touch_icon_url',
            'android_chrome_192_url', 'android_chrome_512_url',
            'safari_pinned_tab_color', 'ms_tile_color', 'theme_color',
            'ga_id', 'gtm_id', 'gsc_id',
            'cookie_consent_enabled', 'privacy_policy_url', 'terms_of_service_url', 'cookie_policy_url',
            'cookies_analytics_enabled', 'cookies_marketing_enabled', 'cookies_functional_enabled',
            'compliance_gdpr', 'compliance_lgpd', 'compliance_hipaa', 'compliance_ccpa',
            'cookie_banner_title', 'cookie_banner_description',
            'updated_at',
        )

    def _build_url(self, field):
        if not field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(field.url)
        return field.url

    def get_logo_url(self, obj):
        return self._build_url(obj.logo)

    def get_logo_small_url(self, obj):
        return self._build_url(obj.logo_small)

    def get_favicon_url(self, obj):
        return self._build_url(obj.favicon)

    def get_favicon_16_url(self, obj):
        return self._build_url(obj.favicon_16)

    def get_favicon_32_url(self, obj):
        return self._build_url(obj.favicon_32)

    def get_apple_touch_icon_url(self, obj):
        return self._build_url(obj.apple_touch_icon)

    def get_android_chrome_192_url(self, obj):
        return self._build_url(obj.android_chrome_192)

    def get_android_chrome_512_url(self, obj):
        return self._build_url(obj.android_chrome_512)


class SiteSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = (
            'site_name', 'tagline', 'logo', 'logo_small', 'favicon',
            'safari_pinned_tab_color', 'ms_tile_color', 'theme_color',
            'ga_id', 'gtm_id', 'gsc_id',
            'cookie_consent_enabled', 'privacy_policy_url', 'terms_of_service_url', 'cookie_policy_url',
            'cookies_analytics_enabled', 'cookies_marketing_enabled', 'cookies_functional_enabled',
            'compliance_gdpr', 'compliance_lgpd', 'compliance_hipaa', 'compliance_ccpa',
            'cookie_banner_title', 'cookie_banner_description',
        )
