"""Comprehensive security audit and hardening test suite for Technea."""

import uuid
import warnings
from datetime import datetime, timedelta, timezone
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.main import app
from app.schemas.profile import FollowUserItem, UserProfilePublicResponse
from app.schemas.user import UserResponse


@pytest.mark.asyncio
async def test_security_headers_present():
    """Verify that all hardened security headers are present on HTTP responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/")
        assert res.status_code == 200

        headers = res.headers
        assert headers.get("x-frame-options") == "DENY"
        assert headers.get("x-content-type-options") == "nosniff"
        assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
        assert "strict-transport-security" in headers
        assert "max-age=31536000" in headers.get("strict-transport-security", "")
        assert "content-security-policy" in headers
        assert "frame-ancestors 'none'" in headers.get("content-security-policy", "")


@pytest.mark.asyncio
async def test_health_check_security_headers():
    """Verify security headers are attached to infrastructure health endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.headers.get("x-frame-options") == "DENY"
        assert res.headers.get("x-content-type-options") == "nosniff"


def test_password_hashing_bcrypt():
    """Verify bcrypt salt rounds, hashing, and password verification."""
    password = "SuperSecurePassword123!"
    hashed = get_password_hash(password)

    # Verify bcrypt signature and cost factor 12
    assert hashed.startswith("$2b$12$")
    assert hashed != password

    # Verify password verification
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False


def test_jwt_token_creation_and_expiration():
    """Verify JWT token claims, expiration, and invalid token handling."""
    subject_id = str(uuid.uuid4())
    token = create_access_token(subject=subject_id, expires_delta=timedelta(minutes=15))

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == subject_id
    assert "exp" in payload
    assert "iat" in payload

    # Verify expired token is rejected
    expired_token = create_access_token(subject=subject_id, expires_delta=timedelta(seconds=-10))
    expired_payload = decode_access_token(expired_token)
    assert expired_payload is None

    # Verify malformed token is rejected
    assert decode_access_token("invalid.token.signature") is None


def test_user_response_excludes_hashed_password():
    """Ensure user response schemas never leak hashed_password or password fields."""
    user_data = {
        "id": uuid.uuid4(),
        "email": "developer@technea.dev",
        "username": "devhero",
        "full_name": "Dev Hero",
        "hashed_password": "$2b$12$fakehashedpasswordleaktest1234567890",
        "password": "plain_password_leak_test",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "profile_visibility": "public",
        "website_url": "https://technea.dev",
    }

    user_resp = UserResponse.model_validate(user_data)
    dumped = user_resp.model_dump()

    assert "hashed_password" not in dumped
    assert "password" not in dumped
    assert "fakehashedpasswordleaktest" not in str(dumped)

    # Check UserProfilePublicResponse
    profile_data = {
        "id": uuid.uuid4(),
        "username": "devhero",
        "joined_date": "October 2026",
        "hashed_password": "$2b$12$fakehashedpasswordleaktest1234567890",
        "password": "plain_password_leak_test",
    }
    profile_resp = UserProfilePublicResponse.model_validate(profile_data)
    profile_dumped = profile_resp.model_dump()
    assert "hashed_password" not in profile_dumped
    assert "password" not in profile_dumped

    # Check FollowUserItem
    follow_data = {
        "id": uuid.uuid4(),
        "username": "devhero",
        "hashed_password": "$2b$12$fakehashedpasswordleaktest1234567890",
    }
    follow_resp = FollowUserItem.model_validate(follow_data)
    follow_dumped = follow_resp.model_dump()
    assert "hashed_password" not in follow_dumped


def test_production_secret_key_warnings():
    """Verify Settings issues warnings if default keys are used in production environment."""
    with warnings.catch_warnings(record=True) as recorded_warnings:
        warnings.simplefilter("always")
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="generate-a-secure-random-secret-key-for-production",
            POSTGRES_PASSWORD="postgres_password",
        )

        warning_messages = [str(w.message) for w in recorded_warnings]
        assert any("Insecure default or weak SECRET_KEY" in msg for msg in warning_messages)
        assert any("Default or common database password" in msg for msg in warning_messages)


def test_cors_frontend_url_inclusion():
    """Verify FRONTEND_URL is normalized and included into CORS_ORIGINS."""
    cfg = Settings(
        ENVIRONMENT="development",
        FRONTEND_URL="https://app.technea.dev/",
        CORS_ORIGINS=["http://localhost:3000/"],
    )
    assert "https://app.technea.dev" in cfg.CORS_ORIGINS
    assert "http://localhost:3000" in cfg.CORS_ORIGINS
    # Ensure no trailing slashes remain
    for origin in cfg.CORS_ORIGINS:
        assert not origin.endswith("/")


@pytest.mark.asyncio
async def test_unhandled_exception_generic_500_response():
    """Verify unhandled exceptions return sanitized 500 responses without stack traces in production."""
    from fastapi import FastAPI
    from app.core.config import settings
    from app.utils.exceptions import setup_exception_handlers

    test_app = FastAPI()
    setup_exception_handlers(test_app)

    @test_app.get("/trigger-crash")
    async def trigger_crash():
        raise RuntimeError("Database connection string postgres://secret_user:super_secret_pw@internal.db:5432 leaked!")

    transport = ASGITransport(app=test_app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Simulate production mode
        orig_env = settings.ENVIRONMENT
        orig_debug = settings.DEBUG
        try:
            settings.ENVIRONMENT = "production"
            settings.DEBUG = False

            res = await client.get("/trigger-crash")
            assert res.status_code == 500
            data = res.json()

            assert "error" in data
            assert data["error"]["status_code"] == 500
            assert "An unexpected server error occurred" in data["error"]["message"]
            assert data["error"]["details"] is None
            # Ensure sensitive error string is NOT in the response
            assert "postgres://" not in res.text
            assert "super_secret_pw" not in res.text
        finally:
            settings.ENVIRONMENT = orig_env
            settings.DEBUG = orig_debug
