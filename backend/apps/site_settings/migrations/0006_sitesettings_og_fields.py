from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0005_sitesettings_logo_small'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='og_image',
            field=models.ImageField(blank=True, null=True, upload_to='site_settings/', verbose_name='Imagen Open Graph (1200x630)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='og_description',
            field=models.TextField(blank=True, verbose_name='Descripción para redes sociales'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='twitter_handle',
            field=models.CharField(blank=True, max_length=50, verbose_name='Handle de Twitter/X (@usuario)'),
        ),
    ]
