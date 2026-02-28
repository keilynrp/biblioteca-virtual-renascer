"""
Migrate local media files to MinIO (S3) storage.
Uploads all files from MEDIA_ROOT to the configured MinIO bucket.
"""
import os
import mimetypes
import boto3
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Migrate local media files to MinIO bucket'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='List files without uploading')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        media_root = settings.MEDIA_ROOT

        if not os.path.exists(media_root):
            self.stderr.write(self.style.ERROR(f'MEDIA_ROOT does not exist: {media_root}'))
            return

        endpoint_url = getattr(settings, 'AWS_S3_ENDPOINT_URL', None) or os.getenv('MINIO_ENDPOINT_URL', 'http://minio:9000')
        access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None) or os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None) or os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) or os.getenv('MINIO_BUCKET_NAME', 'biblioteca')

        self.stdout.write(f'MinIO endpoint: {endpoint_url}, bucket: {bucket}')

        s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='us-east-1',
        )

        uploaded = 0
        skipped = 0
        errors = 0

        for root, dirs, files in os.walk(media_root):
            for filename in files:
                local_path = os.path.join(root, filename)
                # Key = relative path from media root
                key = os.path.relpath(local_path, media_root).replace('\\', '/')

                if dry_run:
                    self.stdout.write(f'  [DRY RUN] {key}')
                    uploaded += 1
                    continue

                # Check if already exists in MinIO
                try:
                    s3.head_object(Bucket=bucket, Key=key)
                    skipped += 1
                    continue
                except Exception:
                    pass

                # Upload
                try:
                    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
                    s3.upload_file(
                        local_path, bucket, key,
                        ExtraArgs={'ContentType': content_type},
                    )
                    uploaded += 1
                    self.stdout.write(f'  Uploaded: {key}')
                except Exception as e:
                    errors += 1
                    self.stderr.write(self.style.ERROR(f'  Failed: {key} — {e}'))

        action = 'Would upload' if dry_run else 'Uploaded'
        self.stdout.write(self.style.SUCCESS(
            f'\n{action}: {uploaded} | Skipped (exists): {skipped} | Errors: {errors}'
        ))
