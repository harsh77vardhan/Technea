"""Comprehensive test suite for Phase 5 authentication security and performance improvements."""

from datetime import datetime, timedelta, timezone
import json
import uuid
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient
import jwt
import pytest
from sqlalchemy import select

from app.core.config import settings
from app.core.security import (
    JWT_SIGNING_KEY,
    async_get_password_hash,
    create_access_token,
    make_unusable_password_hash,
)
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.refresh_token import UserRefreshToken
from app.models.user import User
from app.services.auth_session import hash_token
from app.services.email import email_service
from app.services.user import user_service


from sqlalchemy import delete, select

from app.models.rate_limit import AuthRateLimit
from app.services.rate_limiter import reset_rate_limits_cache

@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections and rate limit records are cleared per test."""
    reset_rate_limits_cache()
    async with async_session_maker() as db:
        await db.execute(delete(AuthRateLimit))
        await db.commit()
    await engine.dispose()
    yield
    reset_rate_limits_cache()
    async with async_session_maker() as db:
        await db.execute(delete(AuthRateLimit))
        await db.commit()
    await engine.dispose()


@pytest.mark.asyncio
async def test_refresh_token_issuance_and_rotation():
    """Verify login issues refresh token and /refresh rotates it properly."""
    email = f"refresh_user_{uuid.uuid4().hex[:8]}@technea.dev"
    raw_password = "SecurePassword123!"

    async with async_session_maker() as db:
        user = User(
            email=email,
            hashed_password=await async_get_password_hash(raw_password),
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Login
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": raw_password})
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        initial_refresh = data["refresh_token"]

        # 2. Call /refresh using request body
        refresh_res = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh},
            headers={"X-Technea-CSRF": "1"},
        )
        assert refresh_res.status_code == 200
        refreshed_data = refresh_res.json()
        assert "access_token" in refreshed_data
        assert "refresh_token" in refreshed_data
        second_refresh = refreshed_data["refresh_token"]

        # Tokens must be different after rotation
        assert initial_refresh != second_refresh

        # Check in DB that initial token is marked rotated
        async with async_session_maker() as db:
            stmt = select(UserRefreshToken).where(UserRefreshToken.token_hash == hash_token(initial_refresh))
            res = await db.execute(stmt)
            token_rec = res.scalar_one_or_none()
            assert token_rec is not None
            assert token_rec.rotated_at is not None


@pytest.mark.asyncio
async def test_refresh_token_concurrency_grace_window():
    """Verify that using an already rotated token within the 20s grace period succeeds."""
    email = f"grace_user_{uuid.uuid4().hex[:8]}@technea.dev"
    raw_password = "SecurePassword123!"

    async with async_session_maker() as db:
        user = User(
            email=email,
            hashed_password=await async_get_password_hash(raw_password),
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": raw_password})
        initial_refresh = login_res.json()["refresh_token"]

        # First refresh rotation
        res1 = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh},
            headers={"X-Technea-CSRF": "1"},
        )
        assert res1.status_code == 200

        # Immediate second refresh with the SAME old token (simulating concurrent tab)
        res2 = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh},
            headers={"X-Technea-CSRF": "1"},
        )
        assert res2.status_code == 200
        assert "access_token" in res2.json()


@pytest.mark.asyncio
async def test_refresh_token_reuse_detection_revokes_family():
    """Verify that presenting a token rotated outside the grace window triggers family revocation."""
    email = f"theft_user_{uuid.uuid4().hex[:8]}@technea.dev"
    raw_password = "SecurePassword123!"

    async with async_session_maker() as db:
        user = User(
            email=email,
            hashed_password=await async_get_password_hash(raw_password),
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": raw_password})
        token_v1 = login_res.json()["refresh_token"]

        # Rotate v1 -> v2
        res_v2 = await client.post("/api/v1/auth/refresh", json={"refresh_token": token_v1})
        token_v2 = res_v2.json()["refresh_token"]

        # Simulate time passing beyond 20s grace period for token_v1
        async with async_session_maker() as db:
            stmt = select(UserRefreshToken).where(UserRefreshToken.token_hash == hash_token(token_v1))
            res = await db.execute(stmt)
            rec_v1 = res.scalar_one()
            rec_v1.rotated_at = datetime.now(timezone.utc) - timedelta(seconds=60)
            await db.commit()

        # Attacker tries to use old token_v1 outside grace window
        async with AsyncClient(transport=transport, base_url="http://testserver") as attacker_client:
            theft_res = await attacker_client.post("/api/v1/auth/refresh", json={"refresh_token": token_v1})
            assert theft_res.status_code == 401
            assert "Token reuse detected" in theft_res.json()["detail"]

        # Now legitimate user tries to use token_v2 — must be rejected because entire family was revoked!
        legit_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": token_v2})
        assert legit_res.status_code == 401


@pytest.mark.asyncio
async def test_logout_and_logout_all():
    """Verify single-session logout and global logout-all."""
    email = f"logout_user_{uuid.uuid4().hex[:8]}@technea.dev"
    raw_password = "SecurePassword123!"

    async with async_session_maker() as db:
        user = User(
            email=email,
            hashed_password=await async_get_password_hash(raw_password),
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": raw_password})
        token = login_res.json()["access_token"]
        refresh_tok = login_res.json()["refresh_token"]

        # Single logout
        logout_res = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": refresh_tok},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_res.status_code == 200

        # Trying to refresh with revoked token must fail
        refresh_after = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_tok})
        assert refresh_after.status_code == 401

        # Login again and test logout-all
        login_res2 = await client.post("/api/v1/auth/login", json={"email": email, "password": raw_password})
        token2 = login_res2.json()["access_token"]
        refresh2 = login_res2.json()["refresh_token"]

        logout_all_res = await client.post(
            "/api/v1/auth/logout-all",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert logout_all_res.status_code == 200

        refresh2_after = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh2})
        assert refresh2_after.status_code == 401


@pytest.mark.asyncio
async def test_jwt_algorithm_confusion_rejection():
    """Verify alg: none and invalid algorithms are rejected."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # None algorithm forged header
        unsecured_token = jwt.encode(
            {"sub": str(uuid.uuid4()), "exp": datetime.now(timezone.utc) + timedelta(minutes=15)},
            key="",
            algorithm="none",
        )
        res_none = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {unsecured_token}"})
        assert res_none.status_code == 401

        # Wrong secret key
        forged_token = jwt.encode(
            {"sub": str(uuid.uuid4()), "exp": datetime.now(timezone.utc) + timedelta(minutes=15)},
            key="attacker-secret-key-1234567890-at-least-32-bytes",
            algorithm="HS256",
        )
        res_wrong = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {forged_token}"})
        assert res_wrong.status_code == 401


@pytest.mark.asyncio
async def test_guest_progress_sync_size_caps():
    """Verify payload size caps on guest progress synchronization."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create user
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": f"caps_{uuid.uuid4().hex[:8]}@technea.dev", "password": "SecurePassword123!"},
        )
        token = signup_res.json()["access_token"]

        # Payload with 51 paths (> 50 cap)
        oversized_paths = {str(i): [1, 2] for i in range(55)}
        res_oversized = await client.post(
            "/api/v1/progress/sync",
            json={"path_progress": oversized_paths, "course_progress": {}},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res_oversized.status_code == 422


@pytest.mark.asyncio
async def test_rate_limiting_login_burst():
    """Verify rate limiter blocks brute force bursts with 429 and Retry-After."""
    target_email = f"burst_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 5 failed logins allowed per 5 minutes per email
        for _ in range(5):
            r = await client.post(
                "/api/v1/auth/login",
                json={"email": target_email, "password": "WrongPassword123!"},
                headers={"X-Forwarded-For": "198.51.100.1"},
            )
            assert r.status_code == 401

        # 6th attempt should be blocked by rate limiter
        blocked_r = await client.post(
            "/api/v1/auth/login",
            json={"email": target_email, "password": "WrongPassword123!"},
            headers={"X-Forwarded-For": "198.51.100.1"},
        )
        assert blocked_r.status_code == 429
        assert "Retry-After" in blocked_r.headers
        assert "Too many requests" in blocked_r.json()["detail"]


@pytest.mark.asyncio
async def test_pre_hijacking_password_wipe():
    """Verify unverified password is wiped when user authenticates via verified OTP."""
    target_email = f"hijack_{uuid.uuid4().hex[:8]}@technea.dev"
    attacker_password = "AttackerPassword123!"

    async with async_session_maker() as db:
        # Attacker registers account first with password but email is unverified
        user = User(
            email=target_email,
            hashed_password=await async_get_password_hash(attacker_password),
            is_active=True,
            is_email_verified=False,
        )
        db.add(user)
        await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Legitimate owner logs in via OTP
        with patch.object(email_service, "send_otp_email", return_value=(True, None)):
            send_res = await client.post("/api/v1/auth/send-otp", json={"email": target_email})
            assert send_res.status_code == 200

        # Retrieve generated OTP from DB
        from app.models.email_otp import EmailOTP
        from app.routers.auth import _verify_otp_hash

        async with async_session_maker() as db:
            otp_record = (
                await db.execute(
                    select(EmailOTP).where(EmailOTP.email == target_email).order_by(EmailOTP.created_at.desc())
                )
            ).scalar_one()

            # Verify OTP hash matches some test code or verify via helper
            # We can test verify_otp by setting an known hash
            from app.routers.auth import _hash_otp
            otp_record.hashed_otp = _hash_otp(email=target_email, otp="654321", purpose="auth")
            await db.commit()

        verify_res = await client.post("/api/v1/auth/verify-otp", json={"email": target_email, "otp": "654321"})
        assert verify_res.status_code == 200

        # Check that user's password was wiped to unusable hash
        async with async_session_maker() as db:
            refreshed_user = (await db.execute(select(User).where(User.email == target_email))).scalar_one()
            assert refreshed_user.is_email_verified is True
            assert refreshed_user.hashed_password.startswith("!unusable_sentinel_")

        # Attacker can no longer log in with previous password
        attacker_login = await client.post(
            "/api/v1/auth/login",
            json={"email": target_email, "password": attacker_password},
            headers={"X-Forwarded-For": "198.51.100.99"},
        )
        assert attacker_login.status_code == 401
