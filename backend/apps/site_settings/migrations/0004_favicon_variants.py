from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0003_cookie_policy_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='favicon_16',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/favicons/'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='favicon_32',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/favicons/'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='apple_touch_icon',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/favicons/'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='android_chrome_192',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/favicons/'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='android_chrome_512',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/favicons/'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='safari_pinned_tab_color',
            field=models.CharField(blank=True, default='#3b82f6', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='ms_tile_color',
            field=models.CharField(blank=True, default='#3b82f6', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='theme_color',
            field=models.CharField(blank=True, default='#3b82f6', max_length=7),
        ),
    ]
