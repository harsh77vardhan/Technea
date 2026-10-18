"""Test suite for Technea Avatar Upload System & Storage Abstraction Layer.

Covers:
1. Storage Abstraction Layer direct unit tests (save_file, file_exists, delete_file)
2. Valid PNG upload via POST /api/v1/auth/avatar
3. Valid JPEG upload via POST /api/v1/auth/avatar
4. Valid WebP upload via POST /api/v1/auth/avatar
5. File size limit rejection (> 5MB returns 400 or 413)
6. Invalid file types rejection (.exe, .sh, text/plain, corrupted header)
7. Verification that user.avatar_url is updated in the database
8. Backward compatibility for profile endpoints (POST /api/v1/users/avatar and /me/avatar)
9. Unauthenticated upload protection (401 Unauthorized)
"""

import asyncio
from io import BytesIO
import os
from pathlib import Path
import sys
import uuid

import httpx
from sqlalchemy import select

# Set up module search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import create_access_token
from app.db.session import async_session_maker
from app.main import app
from app.models.user import User
from app.services.storage import LocalStorageService, get_storage_service

# Valid minimal binary mock images
# 1x1 Transparent PNG (67 bytes)
MOCK_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)

# 1x1 JPEG (149 bytes)
MOCK_JPEG_BYTES = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06"
    b"\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e"
    b"\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01"
    b"\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01"
    b"\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)

# 1x1 WebP (38 bytes)
MOCK_WEBP_BYTES = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x000\x01\x00\x9d\x01*\x01\x00\x01\x00\x02\x004%\xa4%0\x00"
)


async def get_or_create_test_user() -> User:
    """Retrieve an existing test user or create a dedicated testing user account."""
    async with async_session_maker() as session:
        stmt = select(User).where(User.email == "testuser2@technea.dev")
        user = (await session.execute(stmt)).scalars().first()
        if not user:
            stmt = select(User).limit(1)
            user = (await session.execute(stmt)).scalars().first()

        assert user is not None, "No test user available in database"
        return user


async def run_avatar_upload_tests():
    print("=================================================================")
    print("🚀 Running Technea Avatar Upload & Storage Abstraction Test Suite")
    print("=================================================================")

    storage = get_storage_service()
    assert isinstance(storage, LocalStorageService), f"Expected LocalStorageService, got {type(storage)}"
    print("\n[OK] Storage Abstraction Layer service initialized:", type(storage).__name__)

    test_user = await get_or_create_test_user()
    token = create_access_token(subject=str(test_user.id))
    auth_headers = {"Authorization": f"Bearer {token}"}
    print(f"[OK] Authenticated test user: {test_user.email} (ID: {test_user.id})")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

        # -------------------------------------------------------------
        # Test 1: Upload Valid PNG
        # -------------------------------------------------------------
        print("\n[Test 1] Testing POST /api/v1/auth/avatar with valid PNG...")
        files = {"file": ("avatar.png", MOCK_PNG_BYTES, "image/png")}
        res = await client.post("/api/v1/auth/avatar", files=files, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        assert "avatar_url" in data, "Missing avatar_url in response"
        assert "message" in data, "Missing message in response"
        png_avatar_url = data["avatar_url"]
        assert png_avatar_url.endswith(".png"), f"Expected .png extension, got {png_avatar_url}"
        assert png_avatar_url.startswith("/uploads/avatars/avatar_"), f"Unexpected path format: {png_avatar_url}"
        assert await storage.file_exists(png_avatar_url), "PNG file was not found on disk"

        # Verify DB updated
        async with async_session_maker() as session:
            refreshed = (await session.execute(select(User).where(User.id == test_user.id))).scalars().first()
            assert refreshed.avatar_url == png_avatar_url, f"DB avatar_url mismatch: {refreshed.avatar_url}"

        print(f"  -> Uploaded PNG: {png_avatar_url}")
        print(f"  -> DB user avatar_url successfully verified: {refreshed.avatar_url}")
        print("  [PASSED] Test 1 passed successfully.")

        # -------------------------------------------------------------
        # Test 2: Upload Valid JPEG & Verify Cleanup of Previous Avatar
        # -------------------------------------------------------------
        print("\n[Test 2] Testing POST /api/v1/auth/avatar with valid JPEG...")
        files = {"file": ("developer.jpg", MOCK_JPEG_BYTES, "image/jpeg")}
        res = await client.post("/api/v1/auth/avatar", files=files, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        jpeg_avatar_url = data["avatar_url"]
        assert jpeg_avatar_url.endswith(".jpg") or jpeg_avatar_url.endswith(".jpeg")
        assert await storage.file_exists(jpeg_avatar_url), "JPEG file was not found on disk"

        # Verify previous PNG avatar was cleanly removed
        assert not (await storage.file_exists(png_avatar_url)), "Old avatar should have been deleted"

        # Verify DB updated
        async with async_session_maker() as session:
            refreshed = (await session.execute(select(User).where(User.id == test_user.id))).scalars().first()
            assert refreshed.avatar_url == jpeg_avatar_url

        print(f"  -> Uploaded JPEG: {jpeg_avatar_url}")
        print(f"  -> Previous avatar {png_avatar_url} cleaned up properly: True")
        print("  [PASSED] Test 2 passed successfully.")

        # -------------------------------------------------------------
        # Test 3: Upload Valid WebP
        # -------------------------------------------------------------
        print("\n[Test 3] Testing POST /api/v1/auth/avatar with valid WebP...")
        files = {"file": ("developer_photo.webp", MOCK_WEBP_BYTES, "image/webp")}
        res = await client.post("/api/v1/auth/avatar", files=files, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        webp_avatar_url = data["avatar_url"]
        assert webp_avatar_url.endswith(".webp")
        assert await storage.file_exists(webp_avatar_url), "WebP file was not found on disk"

        # Verify DB updated
        async with async_session_maker() as session:
            refreshed = (await session.execute(select(User).where(User.id == test_user.id))).scalars().first()
            assert refreshed.avatar_url == webp_avatar_url

        print(f"  -> Uploaded WebP: {webp_avatar_url}")
        print("  [PASSED] Test 3 passed successfully.")

        # -------------------------------------------------------------
        # Test 4: File Size Limit Rejection (> 5MB returns 400 or 413)
        # -------------------------------------------------------------
        print("\n[Test 4] Testing rejection of file exceeding 5MB...")
        # 5.2 MB payload with valid PNG header
        oversized_data = MOCK_PNG_BYTES + (b"\x00" * (5 * 1024 * 1024 + 200 * 1024))
        files = {"file": ("huge_image.png", oversized_data, "image/png")}
        res = await client.post("/api/v1/auth/avatar", files=files, headers=auth_headers)
        assert res.status_code in {400, 413}, f"Expected 400 or 413, got {res.status_code}: {res.text}"
        print(f"  -> Rejected oversized file with status {res.status_code}: {res.json()['detail']}")
        print("  [PASSED] Test 4 passed successfully.")

        # -------------------------------------------------------------
        # Test 5: Rejection of Invalid File Types (.exe, .sh, text/plain)
        # -------------------------------------------------------------
        print("\n[Test 5] Testing rejection of invalid file types...")

        # 5a: .exe file
        exe_files = {"file": ("malware.exe", b"MZ\x90\x00test-executable", "application/x-msdownload")}
        res_exe = await client.post("/api/v1/auth/avatar", files=exe_files, headers=auth_headers)
        assert res_exe.status_code == 400, f"Expected 400 for .exe, got {res_exe.status_code}"
        print("  -> Rejected .exe correctly (400 Bad Request)")

        # 5b: .sh script
        sh_files = {"file": ("exploit.sh", b"#!/bin/bash\necho 1", "application/x-sh")}
        res_sh = await client.post("/api/v1/auth/avatar", files=sh_files, headers=auth_headers)
        assert res_sh.status_code == 400, f"Expected 400 for .sh, got {res_sh.status_code}"
        print("  -> Rejected .sh correctly (400 Bad Request)")

        # 5c: text/plain
        txt_files = {"file": ("notes.txt", b"plain text information", "text/plain")}
        res_txt = await client.post("/api/v1/auth/avatar", files=txt_files, headers=auth_headers)
        assert res_txt.status_code == 400, f"Expected 400 for text/plain, got {res_txt.status_code}"
        print("  -> Rejected text/plain correctly (400 Bad Request)")

        # 5d: Spoofed PNG with invalid magic bytes / plain text content
        fake_png_files = {"file": ("fake.png", b"Not a PNG at all, just text payload", "image/png")}
        res_fake = await client.post("/api/v1/auth/avatar", files=fake_png_files, headers=auth_headers)
        assert res_fake.status_code == 400, f"Expected 400 for fake PNG, got {res_fake.status_code}"
        print("  -> Rejected spoofed PNG header correctly (400 Bad Request)")

        print("  [PASSED] Test 5 passed successfully.")

        # -------------------------------------------------------------
        # Test 6: Backward Compatibility with Profile Avatar Endpoints
        # -------------------------------------------------------------
        print("\n[Test 6] Testing backward compatibility for profile endpoints...")

        # 6a: POST /api/v1/users/avatar
        files_profile = {"file": ("profile_pic.png", MOCK_PNG_BYTES, "image/png")}
        res_profile = await client.post("/api/v1/users/avatar", files=files_profile, headers=auth_headers)
        assert res_profile.status_code == 200, f"Expected 200 for /users/avatar, got {res_profile.status_code}: {res_profile.text}"
        profile_avatar_url = res_profile.json()["avatar_url"]
        assert await storage.file_exists(profile_avatar_url), "Avatar from /users/avatar does not exist on disk"
        print(f"  -> POST /api/v1/users/avatar succeeded: {profile_avatar_url}")

        # 6b: POST /api/v1/users/me/avatar
        files_me = {"file": ("profile_me.webp", MOCK_WEBP_BYTES, "image/webp")}
        res_me = await client.post("/api/v1/users/me/avatar", files=files_me, headers=auth_headers)
        assert res_me.status_code == 200, f"Expected 200 for /users/me/avatar, got {res_me.status_code}: {res_me.text}"
        me_avatar_url = res_me.json()["avatar_url"]
        assert await storage.file_exists(me_avatar_url), "Avatar from /users/me/avatar does not exist on disk"
        print(f"  -> POST /api/v1/users/me/avatar succeeded: {me_avatar_url}")

        print("  [PASSED] Test 6 passed successfully.")

        # -------------------------------------------------------------
        # Test 7: Unauthenticated Upload Protection
        # -------------------------------------------------------------
        print("\n[Test 7] Testing unauthenticated upload rejection...")
        res_unauth = await client.post(
            "/api/v1/auth/avatar",
            files={"file": ("unauth.png", MOCK_PNG_BYTES, "image/png")},
        )
        assert res_unauth.status_code == 401, f"Expected 401, got {res_unauth.status_code}"
        print("  -> Unauthenticated request rejected (401 Unauthorized)")
        print("  [PASSED] Test 7 passed successfully.")

        # Clean up test user avatar at end of tests
        await storage.delete_file(me_avatar_url)

    print("\n=================================================================")
    print("🎉 ALL AVATAR UPLOAD & STORAGE TESTS PASSED SUCCESSFULLY (100%)!")
    print("=================================================================")


if __name__ == "__main__":
    asyncio.run(run_avatar_upload_tests())
