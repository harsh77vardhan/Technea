"""Comprehensive tests for Technea Email Delivery Pipeline, Resend API, SMTP Fallback, and Health Endpoint."""

import logging
import smtplib
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.config import settings
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.email_otp import EmailOTP
from app.services.email import EmailService, email_service


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


# -----------------------------------------------------------------------------
# 1. POST /auth/send-otp Error Handling & Database Cleanup Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_send_otp_failure_returns_502_and_cleans_up_record():
    """Verify that email delivery failure returns HTTP 502 and deletes OTP record to permit retries."""
    test_email = f"fail_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    with patch.object(
        email_service,
        "send_otp_email",
        return_value=(False, "Resend API error 403: Domain not verified"),
    ):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post("/auth/send-otp", json={"email": test_email})
            assert response.status_code == 502
            data = response.json()
            assert "Failed to deliver verification email" in data["detail"]
            assert "Domain not verified" in data["detail"]

    # Verify that the OTP record was removed from the database
    async with async_session_maker() as session:
        result = await session.execute(select(EmailOTP).where(EmailOTP.email == test_email.lower()))
        otp_record = result.scalars().first()
        assert otp_record is None

    # Verify that retry is NOT blocked by cooldown since the failed record was removed
    with patch.object(
        email_service,
        "send_otp_email",
        return_value=(True, None),
    ):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            retry_res = await client.post("/auth/send-otp", json={"email": test_email})
            assert retry_res.status_code == 200
            assert retry_res.json()["message"] == "Verification code sent to your email."


# -----------------------------------------------------------------------------
# 2. Email Service Provider & Environment Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_email_service_production_without_providers_fails():
    """Verify EmailService rejects sends in production if no provider credentials exist."""
    orig_env = settings.ENVIRONMENT
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.ENVIRONMENT = "production"
        settings.RESEND_API_KEY = None
        settings.SMTP_HOST = None

        service = EmailService()

        # OTP send
        success, error_msg = await service.send_otp_email(
            to_email="user@technea.dev",
            otp="123456",
            expires_minutes=5,
        )
        assert success is False
        assert "not configured in production" in (error_msg or "")

        # Verification send
        success_v, error_v = await service.send_verification_email(
            to_email="user@technea.dev",
            full_name="User",
            token="token123",
        )
        assert success_v is False
        assert "not configured in production" in (error_v or "")

        # Password reset send
        success_r, error_r = await service.send_password_reset_email(
            to_email="user@technea.dev",
            full_name="User",
            token="token123",
        )
        assert success_r is False
        assert "not configured in production" in (error_r or "")
    finally:
        settings.ENVIRONMENT = orig_env
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


@pytest.mark.asyncio
async def test_resend_api_error_response_handling():
    """Verify Resend error responses are cleanly extracted without swallowing errors."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = "re_test_key"
        settings.SMTP_HOST = None

        mock_resp = MagicMock()
        mock_resp.status_code = 422
        mock_resp.is_success = False
        mock_resp.text = '{"message": "The email address is invalid."}'
        mock_resp.headers = {"content-type": "application/json"}
        mock_resp.json.return_value = {"message": "The email address is invalid."}

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_resp

            success, error_msg = await email_service.send_otp_email(
                to_email="invalid-email",
                otp="555666",
            )
            assert success is False
            assert "422" in error_msg
            assert "The email address is invalid." in error_msg
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


@pytest.mark.asyncio
async def test_resend_api_network_exception_handling():
    """Verify network exceptions contacting Resend return descriptive failure."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = "re_test_key"
        settings.SMTP_HOST = None

        with patch("httpx.AsyncClient.post", side_effect=Exception("Connection timed out")):
            success, error_msg = await email_service.send_otp_email(
                to_email="timeout@technea.dev",
                otp="999888",
            )
            assert success is False
            assert "Failed to contact email provider" in error_msg
            assert "Connection timed out" in error_msg
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


# -----------------------------------------------------------------------------
# 3. SMTP Delivery & Fallback Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_smtp_fallback_when_resend_api_fails():
    """Verify that when Resend returns an error, email falls back to SMTP if configured."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp_host = settings.SMTP_HOST
    orig_smtp_port = settings.SMTP_PORT
    try:
        settings.RESEND_API_KEY = "re_test_key"
        settings.SMTP_HOST = "smtp.fallback-provider.com"
        settings.SMTP_PORT = 587
        settings.SMTP_TLS = True
        settings.SMTP_SSL = False

        resend_error_resp = MagicMock()
        resend_error_resp.status_code = 500
        resend_error_resp.is_success = False
        resend_error_resp.text = "Resend internal server error"
        resend_error_resp.headers = {"content-type": "text/plain"}

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = resend_error_resp

            with patch("smtplib.SMTP") as mock_smtp_cls:
                smtp_mock_instance = MagicMock()
                mock_smtp_cls.return_value.__enter__.return_value = smtp_mock_instance

                success, error_msg = await email_service.send_otp_email(
                    to_email="fallback_test@technea.dev",
                    otp="777111",
                )
                assert success is True
                assert error_msg is None
                assert smtp_mock_instance.sendmail.called
                assert smtp_mock_instance.starttls.called
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp_host
        settings.SMTP_PORT = orig_smtp_port


@pytest.mark.asyncio
async def test_smtp_fallback_when_resend_raises_exception():
    """Verify that when Resend raises an exception, email falls back to SMTP if configured."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp_host = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = "re_test_key"
        settings.SMTP_HOST = "smtp.fallback-provider.com"
        settings.SMTP_PORT = 587
        settings.SMTP_TLS = True
        settings.SMTP_SSL = False

        with patch("httpx.AsyncClient.post", side_effect=Exception("Network drop")):
            with patch("smtplib.SMTP") as mock_smtp_cls:
                smtp_mock_instance = MagicMock()
                mock_smtp_cls.return_value.__enter__.return_value = smtp_mock_instance

                success, error_msg = await email_service.send_otp_email(
                    to_email="exc_fallback@technea.dev",
                    otp="333222",
                )
                assert success is True
                assert error_msg is None
                assert smtp_mock_instance.sendmail.called
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp_host


@pytest.mark.asyncio
async def test_smtp_ssl_delivery():
    """Verify SMTP SSL mode (port 465) connects using SMTP_SSL and sends message."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp_host = settings.SMTP_HOST
    orig_smtp_port = settings.SMTP_PORT
    orig_ssl = settings.SMTP_SSL
    try:
        settings.RESEND_API_KEY = None
        settings.SMTP_HOST = "smtp.ssl-provider.com"
        settings.SMTP_PORT = 465
        settings.SMTP_SSL = True
        settings.SMTP_TLS = False

        with patch("smtplib.SMTP_SSL") as mock_smtp_ssl_cls:
            smtp_mock_instance = MagicMock()
            mock_smtp_ssl_cls.return_value.__enter__.return_value = smtp_mock_instance

            success, error_msg = await email_service.send_otp_email(
                to_email="ssl_test@technea.dev",
                otp="444111",
            )
            assert success is True
            assert error_msg is None
            assert smtp_mock_instance.sendmail.called
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp_host
        settings.SMTP_PORT = orig_smtp_port
        settings.SMTP_SSL = orig_ssl


@pytest.mark.asyncio
async def test_smtp_delivery_failure_returns_error():
    """Verify SMTP failures return clean error message."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp_host = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = None
        settings.SMTP_HOST = "smtp.failing-host.com"
        settings.SMTP_PORT = 587
        settings.SMTP_SSL = False
        settings.SMTP_TLS = True

        with patch("smtplib.SMTP", side_effect=smtplib.SMTPConnectError(554, "Connection refused")):
            success, error_msg = await email_service.send_otp_email(
                to_email="smtp_fail@technea.dev",
                otp="111999",
            )
            assert success is False
            assert "SMTP delivery failed" in error_msg
            assert "Connection refused" in error_msg
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp_host


# -----------------------------------------------------------------------------
# 4. Health Check Endpoint Email Fields Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_health_check_email_fields_unconfigured():
    """Verify /health returns unconfigured email service when no credentials provided."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = None
        settings.SMTP_HOST = None
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/health")
            assert res.status_code == 200
            data = res.json()
            assert data["email_service"] == "unconfigured"
            assert data["email_configured"] is False
            assert data["email_sender"] == "Technea <noreply@technea.in>"
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


@pytest.mark.asyncio
async def test_health_check_email_fields_resend():
    """Verify /health reports 'resend' when RESEND_API_KEY is configured."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = "re_test_dummy_key"
        settings.SMTP_HOST = None
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/health")
            assert res.status_code == 200
            data = res.json()
            assert data["email_service"] == "resend"
            assert data["email_configured"] is True
            assert data["email_sender"] == "Technea <noreply@technea.in>"
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


@pytest.mark.asyncio
async def test_health_check_email_fields_smtp():
    """Verify /health reports 'smtp' when only SMTP_HOST is configured."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = None
        settings.SMTP_HOST = "smtp.sendgrid.net"
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/health")
            assert res.status_code == 200
            data = res.json()
            assert data["email_service"] == "smtp"
            assert data["email_configured"] is True
            assert data["email_sender"] == "Technea <noreply@technea.in>"
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


# -----------------------------------------------------------------------------
# 5. Resend 403 Test Mode Restriction & Sender Formatting Tests
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_resend_403_test_mode_detection_without_smtp(caplog):
    """Verify Resend 403 test mode logs warning and returns helpful, actionable error message."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp = settings.SMTP_HOST
    try:
        settings.RESEND_API_KEY = "re_test_dummy_key"
        settings.SMTP_HOST = None

        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.is_success = False
        mock_resp.text = (
            '{"statusCode": 403, "message": "You can only send testing emails to your own email address (owner@example.com). '
            'To send to other recipients, verify a custom domain at resend.com/domains.", "name": "validation_error"}'
        )
        mock_resp.headers = {"content-type": "application/json"}
        mock_resp.json.return_value = {
            "statusCode": 403,
            "message": "You can only send testing emails to your own email address (owner@example.com)...",
        }

        with caplog.at_level(logging.WARNING):
            with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
                mock_post.return_value = mock_resp

                success, error_msg = await email_service.send_otp_email(
                    to_email="unregistered_user@example.com",
                    otp="789012",
                )

                assert success is False
                assert (
                    error_msg
                    == "Email provider is in sandbox/testing mode: sending is restricted to verified accounts. "
                    "To send to all users in production, add and verify a custom domain in your Resend Dashboard "
                    "and configure EMAIL_FROM, or provide SMTP credentials."
                )
                assert (
                    "[EMAIL] Resend returned 403 (Test mode restriction: sending only allowed to registered account owner). "
                    "Attempting SMTP fallback or providing actionable resolution."
                ) in caplog.text
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp


@pytest.mark.asyncio
async def test_resend_403_automatic_smtp_fallback():
    """Verify that when Resend returns 403, email service automatically falls back to SMTP if configured."""
    orig_key = settings.RESEND_API_KEY
    orig_smtp_host = settings.SMTP_HOST
    orig_smtp_port = settings.SMTP_PORT
    try:
        settings.RESEND_API_KEY = "re_test_key"
        settings.SMTP_HOST = "smtp.fallback-mail.com"
        settings.SMTP_PORT = 587
        settings.SMTP_TLS = True
        settings.SMTP_SSL = False

        resend_403_resp = MagicMock()
        resend_403_resp.status_code = 403
        resend_403_resp.is_success = False
        resend_403_resp.text = "You can only send testing emails to your own email address"
        resend_403_resp.headers = {"content-type": "application/json"}

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = resend_403_resp

            with patch("smtplib.SMTP") as mock_smtp_cls:
                smtp_mock_instance = MagicMock()
                mock_smtp_cls.return_value.__enter__.return_value = smtp_mock_instance

                success, error_msg = await email_service.send_otp_email(
                    to_email="external_recipient@technea.dev",
                    otp="888222",
                )
                assert success is True
                assert error_msg is None
                assert smtp_mock_instance.sendmail.called
                assert smtp_mock_instance.starttls.called
    finally:
        settings.RESEND_API_KEY = orig_key
        settings.SMTP_HOST = orig_smtp_host
        settings.SMTP_PORT = orig_smtp_port


def test_sender_address_formatting_robustness():
    """Verify _get_sender_address handles name+email, pure email, quotes, and whitespace cleanly."""
    service = EmailService()

    # Default fallback
    assert service._get_sender_address("") == "Technea <noreply@technea.in>"
    assert service._get_sender_address("   ") == "Technea <noreply@technea.in>"

    # Standard "Name <email@domain.com>"
    assert (
        service._get_sender_address("Technea <noreply@technea.in>")
        == "Technea <noreply@technea.in>"
    )

    # Pure email format
    assert service._get_sender_address("noreply@technea.dev") == "noreply@technea.dev"
    assert service._get_sender_address("  noreply@technea.dev  ") == "noreply@technea.dev"

    # Excess quotes wrapping name or whole string
    assert (
        service._get_sender_address('"Technea" <noreply@technea.in>')
        == "Technea <noreply@technea.in>"
    )
    assert (
        service._get_sender_address('"Technea Support" <support@technea.dev>')
        == "Technea Support <support@technea.dev>"
    )
    assert (
        service._get_sender_address('  "Technea Team" <auth@technea.dev>  ')
        == "Technea Team <auth@technea.dev>"
    )
    assert service._get_sender_address('"noreply@technea.dev"') == "noreply@technea.dev"
    assert service._get_sender_address("'noreply@technea.dev'") == "noreply@technea.dev"


@pytest.mark.asyncio
async def test_send_otp_failure_masks_internal_credentials():
    """Verify /auth/send-otp sanitizes internal API keys and secrets upon delivery error."""
    test_email = f"sanitize_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)

    leaked_detail = "Resend error with key re_1234567890abcdef123 and password='super_secret_password'"
    with patch.object(
        email_service,
        "send_otp_email",
        return_value=(False, leaked_detail),
    ):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post("/auth/send-otp", json={"email": test_email})
            assert response.status_code == 502
            detail = response.json()["detail"]
            assert "re_***" in detail
            assert "re_1234567890abcdef123" not in detail
            assert "password=***" in detail
            assert "super_secret_password" not in detail

    # Confirm OTP record is deleted
    async with async_session_maker() as session:
        result = await session.execute(select(EmailOTP).where(EmailOTP.email == test_email.lower()))
        assert result.scalars().first() is None

