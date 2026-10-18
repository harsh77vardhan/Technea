"""Storage service abstraction layer for Technea.

Provides unified file storage interfaces and local filesystem implementations,
ready for pluggable cloud storage extensions (Cloudinary, AWS S3, Supabase).
"""

from app.services.storage.base import BaseStorageService
from app.services.storage.local_storage import LocalStorageService

_storage_service: BaseStorageService | None = None


def get_storage_service() -> BaseStorageService:
    """Retrieve or initialize the active storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = LocalStorageService()
    return _storage_service


__all__ = [
    "BaseStorageService",
    "LocalStorageService",
    "get_storage_service",
]
