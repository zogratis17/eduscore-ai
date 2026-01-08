import os
import io
import logging
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile
from app.core.config import settings

logger = logging.getLogger(__name__)

class MinioStorageService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created MinIO bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring MinIO bucket exists: {e}")

    async def save_file(self, file: UploadFile, object_name: str) -> str:
        """
        Uploads a file to MinIO.
        Returns the object_name (path).
        """
        try:
            # Read file content
            content = await file.read()
            file_data = io.BytesIO(content)
            
            # Upload
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_data,
                len(content),
                content_type=file.content_type
            )
            
            return object_name
        except S3Error as e:
            logger.error(f"Error uploading to MinIO: {e}")
            raise e
        finally:
            await file.seek(0) # Reset file pointer if needed elsewhere

    def delete_file(self, object_name: str):
        try:
            self.client.remove_object(self.bucket_name, object_name)
        except S3Error as e:
            logger.error(f"Error deleting from MinIO: {e}")

    def get_file_url(self, object_name: str) -> str:
        """Generates a presigned URL for the file"""
        try:
            return self.client.get_presigned_url(
                "GET",
                self.bucket_name,
                object_name,
            )
        except S3Error as e:
            logger.error(f"Error generating presigned URL: {e}")
            return ""

    def download_file(self, object_name: str, file_path: str):
        """Downloads file from MinIO to local path"""
        try:
            self.client.fget_object(self.bucket_name, object_name, file_path)
        except S3Error as e:
            logger.error(f"Error downloading from MinIO: {e}")
            raise e

minio_storage = MinioStorageService()
