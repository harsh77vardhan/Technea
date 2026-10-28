"""Tests for production auth extensions: Email verification, Password reset, and Google OAuth."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.init_db import run_auth_migrations
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User
from app.services.email import email_service
from app.services.google_auth import get_google_auth_url
from app.services.user import user_service


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_auth_migrations_idempotent():
    """Verify run_auth_migrations can be executed repeatedly without errors."""
    await run_auth_migrations(engine)
    await run_auth_migrations(engine)


@pytest.mark.asyncio
async def test_email_service_dev_mode():
    """Verify EmailService succeeds and logs in development mode when RESEND_API_KEY is not set."""
    success_verify, err_verify = await email_service.send_verification_email(
        to_email="test_dev@technea.dev",
        full_name="Dev Tester",
        token="sample-verification-token",
    )
    assert success_verify is True
    assert err_verify is None

    success_reset, err_reset = await email_service.send_password_reset_email(
        to_email="test_dev@technea.dev",
        full_name="Dev Tester",
        token="sample-reset-token",
    )
    assert success_reset is True
    assert err_reset is None


@pytest.mark.asyncio
async def test_google_auth_service_unconfigured():
    """Verify get_google_auth_url raises 503 if GOOGLE_CLIENT_ID is None."""
    original_client_id = settings.GOOGLE_CLIENT_ID
    try:
        settings.GOOGLE_CLIENT_ID = None
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/api/v1/auth/google")
            assert res.status_code == 503
    finally:
        settings.GOOGLE_CLIENT_ID = original_client_id


@pytest.mark.asyncio
async def test_google_auth_service_configured():
    """Verify get_google_auth_url builds the correct Google OAuth 2.0 URL when configured."""
    original_client_id = settings.GOOGLE_CLIENT_ID
    try:
        settings.GOOGLE_CLIENT_ID = "test-client-id-12345"
        auth_url = await get_google_auth_url(state="test-state-string")
        assert "accounts.google.com/o/oauth2/v2/auth" in auth_url
        assert "client_id=test-client-id-12345" in auth_url
        assert "state=test-state-string" in auth_url
        assert "redirect_uri=" in auth_url
    finally:
        settings.GOOGLE_CLIENT_ID = original_client_id


@pytest.mark.asyncio
async def test_signup_creates_verification_token():
    """Verify user signup creates email verification token and sets is_email_verified=False."""
    unique_email = f"auth_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Auth Test User",
            },
        )
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["is_email_verified"] is False
        assert data["user"]["auth_provider"] == "email"

        # Check DB columns directly
        async with async_session_maker() as session:
            stmt = select(User).where(User.email == unique_email)
            user = (await session.execute(stmt)).scalar_one()
            assert user.is_email_verified is False
            assert user.auth_provider == "email"
            assert user.email_verification_token is not None
            assert len(user.email_verification_token) > 20
            assert user.email_verification_expires is not None


@pytest.mark.asyncio
async def test_verify_email_flow():
    """Verify GET /api/v1/auth/verify-email validates token and marks user verified."""
    unique_email = f"verify_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Step 1: Sign up user
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Verify Tester",
            },
        )

        async with async_session_maker() as session:
            stmt = select(User).where(User.email == unique_email)
            user = (await session.execute(stmt)).scalar_one()
            token = user.email_verification_token
            assert token is not None

        # Step 2: Call verify-email with invalid token
        invalid_res = await client.get("/api/v1/auth/verify-email?token=nonexistent-token")
        assert invalid_res.status_code == 400

        # Step 3: Call verify-email with valid token
        verify_res = await client.get(f"/api/v1/auth/verify-email?token={token}")
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["message"] == "Email verified successfully."
        assert verify_data["user"]["is_email_verified"] is True

        # Step 4: Verify in DB that token was cleared and status is True
        async with async_session_maker() as session:
            stmt = select(User).where(User.email == unique_email)
            user_refreshed = (await session.execute(stmt)).scalar_one()
            assert user_refreshed.is_email_verified is True
            assert user_refreshed.email_verification_token is None


@pytest.mark.asyncio
async def test_forgot_and_reset_password_flow():
    """Verify forgot-password and reset-password flows."""
    unique_email = f"reset_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Step 1: Sign up user
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "OldPassword123!",
                "full_name": "Reset Tester",
            },
        )
        assert signup_res.status_code == 201

        # Step 2: Request forgot-password
        forgot_res = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": unique_email},
        )
        assert forgot_res.status_code == 200
        assert "message" in forgot_res.json()

        # Step 3: Forgot-password for nonexistent email also returns 200 (anti-enumeration)
        nonexistent_res = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "nonexistent@doesnotexist.domain"},
        )
        assert nonexistent_res.status_code == 200

        # Step 4: Inspect DB for reset token
        async with async_session_maker() as session:
            stmt = select(User).where(User.email == unique_email)
            user = (await session.execute(stmt)).scalar_one()
            token = user.password_reset_token
            assert token is not None
            assert user.password_reset_expires is not None

        # Step 5: Reset password with bad token -> 400
        bad_reset = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": "invalid-token", "new_password": "BrandNewPassword123!"},
        )
        assert bad_reset.status_code == 400

        # Step 6: Reset password with short password -> 422 or 400
        short_pwd = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "short"},
        )
        assert short_pwd.status_code == 422

        # Step 7: Reset password with valid token and password
        valid_reset = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "BrandNewPassword123!"},
        )
        assert valid_reset.status_code == 200
        assert valid_reset.json()["message"] == "Password updated successfully."

        # Step 8: Log in with new password
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "BrandNewPassword123!"},
        )
        assert login_res.status_code == 200

        # Step 9: Old password fails
        old_login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "OldPassword123!"},
        )
        assert old_login_res.status_code == 401


@pytest.mark.asyncio
async def test_resend_verification_flow():
    """Verify resend-verification requires authentication and updates verification token."""
    unique_email = f"resend_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Step 1: Sign up user
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Resend Tester",
            },
        )
        token_str = signup_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token_str}"}

        # Step 2: Resend verification
        resend_res = await client.post(
            "/api/v1/auth/resend-verification",
            headers=headers,
        )
        assert resend_res.status_code == 200
        assert resend_res.json()["message"] == "Verification email sent."


@pytest.mark.asyncio
async def test_create_google_user_service():
    """Verify create_google_user service method."""
    unique_email = f"google_user_{uuid.uuid4().hex[:8]}@gmail.com"
    google_id = f"gid_{uuid.uuid4().hex[:12]}"

    async with async_session_maker() as session:
        user = await user_service.create_google_user(
            db=session,
            email=unique_email,
            full_name="Google Tester",
            google_id=google_id,
            avatar_url="https://lh3.googleusercontent.com/test-avatar",
        )
        assert user.email == unique_email
        assert user.google_id == google_id
        assert user.auth_provider == "google"
        assert user.is_email_verified is True
        assert user.avatar_url == "https://lh3.googleusercontent.com/test-avatar"

        # Check lookup by google_id
        found = await user_service.get_by_google_id(session, google_id=google_id)
        assert found is not None
        assert found.id == user.id


@pytest.mark.asyncio
async def test_google_oauth_callback_302_redirect_success():
    """Verify Google OAuth callback redirects 302 to https://technea.vercel.app/auth/callback?token=..."""
    mock_email = f"google_success_{uuid.uuid4().hex[:8]}@gmail.com"
    mock_user_info = {
        "email": mock_email,
        "name": "OAuth Success User",
        "google_id": f"gid_{uuid.uuid4().hex[:12]}",
        "avatar_url": "https://lh3.googleusercontent.com/avatar.jpg",
        "verified_email": True,
    }

    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = mock_user_info
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/api/v1/auth/google/callback?code=mock_auth_code_123", follow_redirects=False)
            assert res.status_code == 302
            location = res.headers.get("location")
            assert location is not None
            assert location.startswith("https://technea.vercel.app/auth/callback?token=")
            token_part = location.split("token=")[1]
            assert len(token_part) > 20


@pytest.mark.asyncio
async def test_google_oauth_callback_error_access_denied_redirect():
    """Verify Google OAuth callback with error=access_denied redirects cleanly to /auth/callback?error=access_denied."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/auth/google/callback?error=access_denied", follow_redirects=False)
        assert res.status_code == 302
        location = res.headers.get("location")
        assert location == "https://technea.vercel.app/auth/callback?error=access_denied"


@pytest.mark.asyncio
async def test_google_oauth_callback_missing_code_redirect():
    """Verify Google OAuth callback without code or error redirects cleanly to /auth/callback?error=missing_code."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/auth/google/callback", follow_redirects=False)
        assert res.status_code == 302
        location = res.headers.get("location")
        assert location == "https://technea.vercel.app/auth/callback?error=missing_code"


@pytest.mark.asyncio
async def test_google_oauth_callback_json_response_format():
    """Verify JSON response format when requested via format=json or Accept: application/json."""
    mock_email = f"google_json_{uuid.uuid4().hex[:8]}@gmail.com"
    mock_user_info = {
        "email": mock_email,
        "name": "JSON Format User",
        "google_id": f"gid_{uuid.uuid4().hex[:12]}",
        "avatar_url": "https://lh3.googleusercontent.com/avatar_json.jpg",
        "verified_email": True,
    }

    # Test via query parameter format=json
    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = mock_user_info
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/api/v1/auth/google/callback?code=mock_json_code&format=json")
            assert res.status_code == 200
            data = res.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
            assert data["user"]["email"] == mock_email
            assert data["user"]["auth_provider"] == "google"

    # Test via header Accept: application/json
    mock_email_header = f"google_hdr_{uuid.uuid4().hex[:8]}@gmail.com"
    mock_user_info["email"] = mock_email_header
    mock_user_info["google_id"] = f"gid_{uuid.uuid4().hex[:12]}"
    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = mock_user_info
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get(
                "/api/v1/auth/google/callback?code=mock_hdr_code",
                headers={"Accept": "application/json"},
            )
            assert res.status_code == 200
            data = res.json()
            assert "access_token" in data
            assert data["user"]["email"] == mock_email_header


@pytest.mark.asyncio
async def test_google_oauth_callback_browser_flow_http_exception():
    """Verify browser flow (Accept: text/html) catches HTTPException and redirects to error page."""
    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.side_effect = HTTPException(
            status_code=400,
            detail="Failed to exchange authorization code with Google.",
        )
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get(
                "/api/v1/auth/google/callback?code=invalid_token_code",
                headers={"Accept": "text/html,application/xhtml+xml"},
                follow_redirects=False,
            )
            assert res.status_code == 302
            location = res.headers.get("location")
            assert location is not None
            assert location.startswith("https://technea.vercel.app/auth/callback?error=")
            assert "Failed%20to%20exchange" in location


@pytest.mark.asyncio
async def test_google_oauth_open_redirect_protection():
    """Verify open redirect protection prevents redirects to unapproved external domains."""
    from app.routers.auth import _safe_frontend_redirect

    # Allowed domain redirects successfully
    allowed_resp = _safe_frontend_redirect("https://technea.vercel.app/auth/callback?token=abc")
    assert allowed_resp.headers["location"] == "https://technea.vercel.app/auth/callback?token=abc"

    # Disallowed external malicious domain is safely redirected to technea.vercel.app
    malicious_resp = _safe_frontend_redirect("https://evil-phishing.com/auth/callback?token=stolen")
    assert malicious_resp.headers["location"] == "https://technea.vercel.app/auth/callback?token=stolen"

