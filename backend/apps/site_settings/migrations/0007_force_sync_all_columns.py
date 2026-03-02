"""
Force-sync ALL site_settings columns using raw SQL with IF NOT EXISTS.
This fixes any desync between Django migration state and the actual database.
"""

from django.db import migrations

SQL_FORWARD = """
-- 0002: Google fields
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS ga_id varchar(50) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS gtm_id varchar(50) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS gsc_id varchar(200) DEFAULT '' NOT NULL;

-- 0003: Cookie & privacy fields
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookie_consent_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS privacy_policy_url varchar(200) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS terms_of_service_url varchar(200) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookie_policy_url varchar(200) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookies_analytics_enabled boolean DEFAULT true NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookies_marketing_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookies_functional_enabled boolean DEFAULT true NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS compliance_gdpr boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS compliance_lgpd boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS compliance_hipaa boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS compliance_ccpa boolean DEFAULT false NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookie_banner_title varchar(200) DEFAULT 'Utilizamos cookies' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS cookie_banner_description text DEFAULT '' NOT NULL;

-- 0004: Favicon variants
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS favicon_16 varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS favicon_32 varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS apple_touch_icon varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS android_chrome_192 varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS android_chrome_512 varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS safari_pinned_tab_color varchar(7) DEFAULT '#3b82f6' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS ms_tile_color varchar(7) DEFAULT '#3b82f6' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS theme_color varchar(7) DEFAULT '#3b82f6' NOT NULL;

-- 0005: Logo small
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS logo_small varchar(100) DEFAULT '' NOT NULL;

-- 0006: OG / Social fields
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS og_image varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS og_description text DEFAULT '' NOT NULL;
ALTER TABLE site_settings_sitesettings ADD COLUMN IF NOT EXISTS twitter_handle varchar(50) DEFAULT '' NOT NULL;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0006_sitesettings_og_fields'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SQL_FORWARD,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
