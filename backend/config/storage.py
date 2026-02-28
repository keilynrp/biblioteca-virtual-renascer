from storages.backends.s3boto3 import S3Boto3Storage


class MinIOProxyStorage(S3Boto3Storage):
    """
    Stores files in MinIO (S3) but returns /media/ URLs so they go
    through Django's media proxy instead of the internal MinIO endpoint.
    """

    def url(self, name):
        return f'/media/{name}'
