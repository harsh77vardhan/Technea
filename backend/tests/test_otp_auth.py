"""Comprehensive test suite for Technea Email OTP Passwordless Authentication."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, update

from app.core.config import settings
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.email_otp import EmailOTP
from app.models.user import User
from app.routers.auth import _generate_otp, _hash_otp, _verify_otp_hash
from app.services.email import email_service


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


# -----------------------------------------------------------------------------
# 1. Cryptographic OTP Helper Tests
# -----------------------------------------------------------------------------


def test_otp_generation_format_and_uniformity():
    """Verify generated OTPs are strictly 6 digits with valid numeric range."""
    generated_codes = set()
    for _ in range(500):
        code = _generate_otp()
        assert len(code) == 6
        assert code.isdigit()
        val = int(code)
        assert 100000 <= val <= 999999
        generated_codes.add(code)

    # Uniformity check: 500 random 6-digit codes should produce at least 450 distinct values
    assert len(generated_codes) > 450


def test_otp_hashing_and_verification():
    """Verify HMAC-SHA256 hashing is deterministic and constant-time verify works."""
    otp = "482915"
    hashed = _hash_otp(otp)

    assert isinstance(hashed, str)
    assert len(hashed) == 64  # SHA-256 hex digest length
    assert hashed == _hash_otp(otp)  # Deterministic

    # Distinct OTPs must produce distinct hashes
    other_hash = _hash_otp("482916")
    assert hashed != other_hash

    # Constant-time verification
    assert _verify_otp_hash(otp, hashed) is True
    assert _verify_otp_hash("000000", hashed) is False
    assert _verify_otp_hash("482916", hashed) is False
    assert _verify_otp_hash("", hashed) is False


# -----------------------------------------------------------------------------
# 2. Email Service OTP Unit Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_email_service_send_otp_dev_mode():
    """Verify send_otp_email logs and returns True when RESEND_API_KEY is unset."""
    original_key = settings.RESEND_API_KEY
    try:
        settings.RESEND_API_KEY = None
        success, error_msg = await email_service.send_otp_email(
            to_email="dev_otp_test@technea.dev",
            otp="654321",
            expires_minutes=5,
        )
        assert success is True
        assert error_msg is None
    finally:
        settings.RESEND_API_KEY = original_key


@pytest.mark.asyncio
async def test_email_service_send_otp_with_resend_mock():
    """Verify send_otp_email formats monochrome luxury HTML email with branding and security notice."""
    original_key = settings.RESEND_API_KEY
    try:
        settings.RESEND_API_KEY = "re_test_dummy_key_12345"
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_post.return_value = AsyncMock(status_code=200, is_success=True, text="ok")
            success, error_msg = await email_service.send_otp_email(
                to_email="branded@technea.dev",
                otp="839201",
                expires_minutes=5,
            )
            assert success is True
            assert error_msg is None
            assert mock_post.called
            call_kwargs = mock_post.call_args.kwargs
            payload = call_kwargs["json"]
            assert payload["to"] == ["branded@technea.dev"]
            assert "839201" in payload["subject"]
            assert "TECHNEA" in payload["html"]
            assert "839201" in payload["html"]
            assert "5 minutes" in payload["html"]
            assert "Security Advisory" in payload["html"]
            assert "Never share this code with anyone" in payload["html"]
    finally:
        settings.RESEND_API_KEY = original_key


# -----------------------------------------------------------------------------
# 3. POST /auth/send-otp Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_otp_success():
    """Verify POST /auth/send-otp creates an unexpired EmailOTP and sends verification code."""
    test_email = f"otp_send_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post("/auth/send-otp", json={"email": test_email})
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Verification code sent to your email."
            assert data["expires_in_seconds"] == 300
            assert data["cooldown_seconds"] == 60

            mock_send.assert_called_once()
            call_args = mock_send.call_args.kwargs
            sent_otp = call_args["otp"]
            assert len(sent_otp) == 6

        # Check DB record
        async with async_session_maker() as session:
            stmt = select(EmailOTP).where(EmailOTP.email == test_email.lower())
            result = await session.execute(stmt)
            otp_record = result.scalars().first()
            assert otp_record is not None
            assert otp_record.is_used is False
            assert otp_record.attempts == 0
            assert _verify_otp_hash(sent_otp, otp_record.hashed_otp) is True


@pytest.mark.asyncio
async def test_send_otp_cooldown_rate_limit():
    """Verify requesting OTP again within 60s cooldown raises HTTP 429."""
    test_email = f"cooldown_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # First request succeeds
        res1 = await client.post("/auth/send-otp", json={"email": test_email})
        assert res1.status_code == 200

        # Second request immediately triggers 429
        res2 = await client.post("/auth/send-otp", json={"email": test_email})
        assert res2.status_code == 429
        detail = res2.json()["detail"]
        assert "Please wait" in detail
        assert "seconds before requesting a new code" in detail


# -----------------------------------------------------------------------------
# 4. POST /auth/verify-otp Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_verify_otp_existing_user_login():
    """Verify valid OTP authenticates existing user, sets is_email_verified=True, and returns JWT."""
    test_email = f"existing_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    # 1. Pre-create user with is_email_verified=False
    async with async_session_maker() as session:
        user = User(
            email=test_email,
            hashed_password="some_hashed_password",
            full_name="Existing OTP User",
            is_email_verified=False,
            is_active=True,
            is_superuser=False,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id

    # 2. Request OTP
    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res_send = await client.post("/auth/send-otp", json={"email": test_email})
            assert res_send.status_code == 200
            otp_code = mock_send.call_args.kwargs["otp"]

            # 3. Verify OTP
            res_verify = await client.post(
                "/auth/verify-otp",
                json={"email": test_email, "otp": otp_code},
            )
            assert res_verify.status_code == 200
            token_data = res_verify.json()
            assert "access_token" in token_data
            assert token_data["token_type"] == "bearer"
            assert token_data["user"]["email"] == test_email
            assert token_data["user"]["is_email_verified"] is True
            assert str(token_data["user"]["id"]) == str(user_id)

    # 4. Verify in DB that is_email_verified is True and OTP record is marked is_used=True
    async with async_session_maker() as session:
        db_user = await session.get(User, user_id)
        assert db_user.is_email_verified is True

        otp_result = await session.execute(select(EmailOTP).where(EmailOTP.email == test_email))
        db_otp = otp_result.scalars().first()
        assert db_otp.is_used is True


@pytest.mark.asyncio
async def test_verify_otp_new_user_auto_signup():
    """Verify valid OTP for new email automatically signs up user with auth_provider='otp'."""
    test_email = f"new_signup_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res_send = await client.post("/auth/send-otp", json={"email": test_email})
            assert res_send.status_code == 200
            otp_code = mock_send.call_args.kwargs["otp"]

            res_verify = await client.post(
                "/auth/verify-otp",
                json={"email": test_email, "otp": otp_code},
            )
            assert res_verify.status_code == 200
            token_data = res_verify.json()
            assert "access_token" in token_data
            assert token_data["user"]["email"] == test_email
            assert token_data["user"]["is_email_verified"] is True
            assert token_data["user"]["auth_provider"] == "otp"

    # Confirm user created in DB
    async with async_session_maker() as session:
        user_result = await session.execute(select(User).where(User.email == test_email))
        user = user_result.scalars().first()
        assert user is not None
        assert user.auth_provider == "otp"
        assert user.is_email_verified is True
        assert user.is_active is True


@pytest.mark.asyncio
async def test_verify_otp_wrong_code_decrements_remaining():
    """Verify submitting incorrect OTP increments attempts and reports remaining count."""
    test_email = f"wrong_otp_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            await client.post("/auth/send-otp", json={"email": test_email})
            actual_otp = mock_send.call_args.kwargs["otp"]
            wrong_otp = "000000" if actual_otp != "000000" else "111111"

            # 1st wrong attempt -> 4 remaining
            res1 = await client.post("/auth/verify-otp", json={"email": test_email, "otp": wrong_otp})
            assert res1.status_code == 400
            assert "Incorrect code. 4 attempt(s) remaining." in res1.json()["detail"]

            # 2nd wrong attempt -> 3 remaining
            res2 = await client.post("/auth/verify-otp", json={"email": test_email, "otp": wrong_otp})
            assert res2.status_code == 400
            assert "Incorrect code. 3 attempt(s) remaining." in res2.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_max_attempts_exceeded_locks_otp():
    """Verify exceeding OTP_MAX_ATTEMPTS locks the OTP record with is_used=True."""
    test_email = f"max_attempts_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            await client.post("/auth/send-otp", json={"email": test_email})
            actual_otp = mock_send.call_args.kwargs["otp"]
            wrong_otp = "000000" if actual_otp != "000000" else "111111"

            # Attempts 1 to 4
            for i in range(1, 5):
                res = await client.post("/auth/verify-otp", json={"email": test_email, "otp": wrong_otp})
                assert res.status_code == 400
                expected_remaining = 5 - i
                assert f"{expected_remaining} attempt(s) remaining" in res.json()["detail"]

            # Attempt 5 -> 0 remaining
            res5 = await client.post("/auth/verify-otp", json={"email": test_email, "otp": wrong_otp})
            assert res5.status_code == 400
            assert "0 attempt(s) remaining" in res5.json()["detail"]

            # Attempt 6 (attempts now >= 5) -> OTP is locked
            res6 = await client.post("/auth/verify-otp", json={"email": test_email, "otp": wrong_otp})
            assert res6.status_code == 400
            assert "Too many incorrect attempts. Please request a new code." in res6.json()["detail"]

    # Verify is_used is marked True in DB
    async with async_session_maker() as session:
        result = await session.execute(select(EmailOTP).where(EmailOTP.email == test_email))
        otp_rec = result.scalars().first()
        assert otp_rec.attempts >= 5
        assert otp_rec.is_used is True


@pytest.mark.asyncio
async def test_verify_otp_expired_or_used():
    """Verify expired, previously used, or non-existent OTPs are rejected."""
    test_email = f"expired_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Non-existent OTP
        res_nonexistent = await client.post(
            "/auth/verify-otp",
            json={"email": "nonexistent@technea.dev", "otp": "123456"},
        )
        assert res_nonexistent.status_code == 400
        assert "Invalid or expired verification code" in res_nonexistent.json()["detail"]

    # 2. Used OTP
    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            await client.post("/auth/send-otp", json={"email": test_email})
            valid_otp = mock_send.call_args.kwargs["otp"]

            # First verify succeeds
            res_first = await client.post(
                "/auth/verify-otp",
                json={"email": test_email, "otp": valid_otp},
            )
            assert res_first.status_code == 200

            # Second verify fails as used
            res_second = await client.post(
                "/auth/verify-otp",
                json={"email": test_email, "otp": valid_otp},
            )
            assert res_second.status_code == 400
            assert "Invalid or expired verification code" in res_second.json()["detail"]

    # 3. Expired OTP
    expired_email = f"expired_record_{uuid.uuid4().hex[:8]}@technea.dev"
    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            await client.post("/auth/send-otp", json={"email": expired_email})
            otp_val = mock_send.call_args.kwargs["otp"]

    # Manually expire the record in DB
    async with async_session_maker() as session:
        await session.execute(
            update(EmailOTP)
            .where(EmailOTP.email == expired_email)
            .values(expires_at=datetime.now(timezone.utc) - timedelta(minutes=10))
        )
        await session.commit()

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res_expired = await client.post(
            "/auth/verify-otp",
            json={"email": expired_email, "otp": otp_val},
        )
        assert res_expired.status_code == 400
        assert "Invalid or expired verification code" in res_expired.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_deactivated_user():
    """Verify deactivated user cannot authenticate via OTP (returns 403 Forbidden)."""
    deactivated_email = f"deactivated_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    async with async_session_maker() as session:
        user = User(
            email=deactivated_email,
            hashed_password="some_password_hash",
            is_active=False,
            is_email_verified=True,
            is_superuser=False,
        )
        session.add(user)
        await session.commit()

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            await client.post("/auth/send-otp", json={"email": deactivated_email})
            otp_code = mock_send.call_args.kwargs["otp"]

            res = await client.post(
                "/auth/verify-otp",
                json={"email": deactivated_email, "otp": otp_code},
            )
            assert res.status_code == 403
            assert "This account has been deactivated." in res.json()["detail"]


@pytest.mark.asyncio
async def test_send_and_verify_otp_via_api_v1_prefix():
    """Verify OTP endpoints work seamlessly via /api/v1/auth prefix as well."""
    test_email = f"v1_prefix_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(email_service, "send_otp_email", wraps=email_service.send_otp_email) as mock_send:
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res_send = await client.post("/api/v1/auth/send-otp", json={"email": test_email})
            assert res_send.status_code == 200
            otp_code = mock_send.call_args.kwargs["otp"]

            res_verify = await client.post(
                "/api/v1/auth/verify-otp",
                json={"email": test_email, "otp": otp_code},
            )
            assert res_verify.status_code == 200
            assert "access_token" in res_verify.json()
