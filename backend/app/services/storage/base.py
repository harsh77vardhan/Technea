"""Base storage service interface defining the storage abstraction layer."""

from abc import ABC, abstractmethod
from fastapi import UploadFile


class BaseStorageService(ABC):
    """Abstract Base Class for file storage services.

    Defines the contract for persistent file storage across Technea.
    This abstraction layer isolates file handling from storage backends,
    making it ready for seamless drop-in extensions for future cloud providers:
    - Cloudinary: CDN-optimized media delivery and transformations
    - AWS S3: Scalable distributed object storage with presigned URLs
    - Supabase Storage: S3-compatible bucket storage with row-level security
    """

    @abstractmethod
    async def save_file(self, file: UploadFile, subfolder: str = "avatars") -> str:
        """Persist an uploaded file and return its accessible URL or relative path.

        Args:
            file: The FastAPI UploadFile stream to persist.
            subfolder: Subdirectory / bucket prefix for organization (default: 'avatars').

        Returns:
            str: Publicly accessible URL or relative path to the stored file.

        Raises:
            HTTPException: If the file fails validation (e.g. invalid type, size limit).
        """
        pass

    @abstractmethod
    async def delete_file(self, file_path_or_url: str) -> bool:
        """Delete an existing file by path or URL.

        Args:
            file_path_or_url: Relative static path, filename, or absolute URL.

        Returns:
            bool: True if the file existed and was successfully deleted, False otherwise.
        """
        pass

    @abstractmethod
    async def file_exists(self, file_path_or_url: str) -> bool:
        """Check whether a file exists in the storage backend.

        Args:
            file_path_or_url: Relative static path, filename, or absolute URL.

        Returns:
            bool: True if file exists in storage, False otherwise.
        """
        pass
