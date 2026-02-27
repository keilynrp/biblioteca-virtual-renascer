from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0010_category_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='doi',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='book',
            name='is_open_access',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='book',
            name='source',
            field=models.CharField(
                choices=[('manual', 'Manual'), ('openlibrary', 'OpenLibrary'), ('doab', 'DOAB')],
                default='manual',
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name='book',
            name='external_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['doi'], name='book_doi_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['source', '-created_at'], name='book_source_created_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['is_open_access', '-created_at'], name='book_oa_created_idx'),
        ),
    ]
