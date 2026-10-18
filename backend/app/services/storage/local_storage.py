"""Local filesystem storage service implementation."""

import os
from pathlib import Path
import urllib.parse
import uuid

from fastapi import HTTPException, UploadFile, status

from app.core.logger import logger
from app.services.storage.base import BaseStorageService

# File validation constraints
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB (5,242,880 bytes)


def _detect_magic_bytes_extension(content: bytes) -> str | None:
    """Detect image type from magic byte signatures / file header.

    Supported signatures:
    - PNG: 89 50 4E 47 0D 0A 1A 0A (\x89PNG\r\n\x1a\n)
    - JPEG: FF D8 (SOI marker)
    - WebP: RIFF (bytes 0..4) and WEBP (bytes 8..12)

    Returns:
        Canonical file extension ('.png', '.jpg', '.webp') or None if unrecognized.
    """
    if len(content) < 12:
        return None

    # Check PNG signature
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"

    # Check JPEG SOI marker (\xff\xd8)
    if content.startswith(b"\xff\xd8"):
        return ".jpg"

    # Check WebP signature (RIFF + WEBP)
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return ".webp"

    return None


class LocalStorageService(BaseStorageService):
    """Local filesystem storage service.

    Stores uploaded files in the local filesystem under backend/uploads and
    backend/static/uploads (with mirror copy in backend/static for backward compatibility).
    """

    def __init__(self, backend_dir: Path | None = None):
        if backend_dir is None:
            # Resolve to backend root directory
            self.backend_dir = Path(__file__).resolve().parent.parent.parent.parent
        else:
            self.backend_dir = Path(backend_dir).resolve()

        self.uploads_dir = self.backend_dir / "uploads"
        self.static_dir = self.backend_dir / "static"
        self.static_uploads_dir = self.static_dir / "uploads"

        # Ensure root storage directories exist
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.static_dir.mkdir(parents=True, exist_ok=True)
        self.static_uploads_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_candidate_paths(self, file_path_or_url: str, default_subfolder: str = "avatars") -> list[Path]:
        """Resolve all possible filesystem paths corresponding to a given URL or path."""
        if not file_path_or_url or not file_path_or_url.strip():
            return []

        # Strip query strings and parse URL path
        clean_url = file_path_or_url.split("?")[0].strip()
        parsed_path = urllib.parse.urlparse(clean_url).path

        # Prevent directory traversal
        filename = os.path.basename(parsed_path)
        if not filename or ".." in filename or filename.startswith("."):
            return []

        # Determine subfolder from path if possible, else use default_subfolder
        parts = [p for p in parsed_path.split("/") if p]
        subfolder = default_subfolder
        if "uploads" in parts:
            idx = parts.index("uploads")
            if idx + 2 < len(parts):  # e.g. /static/uploads/<subfolder>/<filename>
                subfolder = parts[idx + 1]
            elif idx + 1 < len(parts) - 1:
                subfolder = parts[idx + 1]
        elif "static" in parts:
            idx = parts.index("static")
            if idx + 1 < len(parts) - 1:  # e.g. /static/<subfolder>/<filename>
                subfolder = parts[idx + 1]

        candidates = [
            self.uploads_dir / subfolder / filename,
            self.static_uploads_dir / subfolder / filename,
            self.static_dir / subfolder / filename,
            self.uploads_dir / filename,
            self.static_dir / filename,
        ]

        # Also support absolute paths within backend dir
        try:
            direct_path = Path(clean_url)
            if direct_path.is_absolute() and self.backend_dir in direct_path.parents:
                candidates.append(direct_path)
        except Exception:
            pass

        # Return unique ordered list of Paths
        unique_paths: list[Path] = []
        for path in candidates:
            if path not in unique_paths:
                unique_paths.append(path)

        return unique_paths

    async def save_file(self, file: UploadFile, subfolder: str = "avatars") -> str:
        """Validate, store uploaded file into local storage directories, and return public URL.

        Args:
            file: FastAPI UploadFile.
            subfolder: Destination subfolder (default 'avatars').

        Returns:
            str: Relative public URL path (e.g. '/uploads/avatars/avatar_<uuid>.jpg').

        Raises:
            HTTPException: 400 on invalid MIME/extension, invalid magic bytes, or file > 5MB.
        """
        raw_filename = file.filename or "avatar.png"
        raw_ext = Path(raw_filename).suffix.lower()
        content_type = (file.content_type or "").lower().strip()

        # 1. Validate file extension and MIME type
        if raw_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension '{raw_ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            )

        if content_type and content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type '{content_type}'. Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
            )

        # 2. Read and validate file size
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is 5MB ({MAX_FILE_SIZE} bytes).",
            )

        # 3. Magic bytes / header inspection to verify image integrity
        detected_ext = _detect_magic_bytes_extension(contents)
        if not detected_ext:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image content or corrupted file header. Allowed formats: PNG, JPEG, WebP.",
            )

        # Ensure detected extension matches declared extension family
        if raw_ext in {".jpg", ".jpeg"} and detected_ext != ".jpg":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatched file content: declared JPEG file does not match JPEG header signature.",
            )
        elif raw_ext == ".png" and detected_ext != ".png":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatched file content: declared PNG file does not match PNG header signature.",
            )
        elif raw_ext == ".webp" and detected_ext != ".webp":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatched file content: declared WebP file does not match WebP header signature.",
            )

        # Use canonical extension matching detected format
        clean_ext = raw_ext if raw_ext in {".jpg", ".jpeg"} and detected_ext == ".jpg" else detected_ext

        # 4. Secure filename generation (UUIDv4)
        unique_name = f"avatar_{uuid.uuid4().hex}{clean_ext}"

        # 5. Destination directories
        uploads_target_dir = self.uploads_dir / subfolder
        static_uploads_target_dir = self.static_uploads_dir / subfolder
        static_target_dir = self.static_dir / subfolder

        uploads_target_dir.mkdir(parents=True, exist_ok=True)
        static_uploads_target_dir.mkdir(parents=True, exist_ok=True)
        static_target_dir.mkdir(parents=True, exist_ok=True)

        # 6. Write file to primary upload destination
        primary_dest = uploads_target_dir / unique_name
        with open(primary_dest, "wb") as f:
            f.write(contents)

        # Mirror file to static/uploads and static/ for backward compatibility
        try:
            with open(static_uploads_target_dir / unique_name, "wb") as f:
                f.write(contents)
        except Exception as e:
            logger.warning("Failed to mirror avatar to %s: %s", static_uploads_target_dir, e)

        try:
            with open(static_target_dir / unique_name, "wb") as f:
                f.write(contents)
        except Exception as e:
            logger.warning("Failed to mirror avatar to %s: %s", static_target_dir, e)

        # 7. Return relative URL path
        return f"/uploads/{subfolder}/{unique_name}"

    async def delete_file(self, file_path_or_url: str) -> bool:
        """Delete an existing file from all local storage directories.

        Args:
            file_path_or_url: Path or URL pointing to the file.

        Returns:
            bool: True if at least one file copy was deleted, False otherwise.
        """
        candidates = self._resolve_candidate_paths(file_path_or_url)
        deleted = False

        for path in candidates:
            try:
                if path.is_file():
                    path.unlink(missing_ok=True)
                    deleted = True
            except Exception as e:
                logger.warning("Error deleting file %s: %s", path, e)

        return deleted

    async def file_exists(self, file_path_or_url: str) -> bool:
        """Check whether a file exists in any of the local storage locations.

        Args:
            file_path_or_url: Path or URL pointing to the file.

        Returns:
            bool: True if the file exists on disk, False otherwise.
        """
        candidates = self._resolve_candidate_paths(file_path_or_url)
        return any(path.is_file() for path in candidates)
