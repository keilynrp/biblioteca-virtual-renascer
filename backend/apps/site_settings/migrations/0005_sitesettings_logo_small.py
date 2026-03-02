from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0004_favicon_variants'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='logo_small',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/',
                                    verbose_name='Logo reducido (para scroll/móvil)'),
        ),
    ]
