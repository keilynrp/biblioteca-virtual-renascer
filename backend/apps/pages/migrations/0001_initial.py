from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID')),
                ('slug',         models.SlugField(max_length=100, unique=True)),
                ('title',        models.CharField(max_length=200)),
                ('page_type',    models.CharField(
                    choices=[
                        ('marketing', 'Marketing'),
                        ('dashboard', 'Dashboard'),
                        ('custom',    'Custom Landing Page'),
                    ],
                    default='marketing',
                    max_length=20,
                )),
                ('is_published', models.BooleanField(default=False)),
                ('content',      models.JSONField(blank=True, default=dict)),
                ('created_at',   models.DateTimeField(auto_now_add=True)),
                ('updated_at',   models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Página',
                'verbose_name_plural': 'Páginas',
                'ordering': ['slug'],
            },
        ),
    ]
