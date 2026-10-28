"""Email delivery service using Resend API over HTTPX with SMTP fallback."""

import asyncio
import re
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import parseaddr

import httpx

from app.core.config import settings
from app.core.logger import logger

RESEND_API_URL = "https://api.resend.com/emails"


class EmailService:
    """Service handling transactional emails via Resend API with SMTP fallback."""

    def _get_frontend_url(self) -> str:
        """Resolve frontend base URL with fallback to production."""
        if settings.FRONTEND_URL and settings.FRONTEND_URL.strip():
            return settings.FRONTEND_URL.strip().rstrip("/")
        return "https://technea.vercel.app"

    def _is_smtp_configured(self) -> bool:
        """Check if SMTP settings are configured."""
        return bool(settings.SMTP_HOST and settings.SMTP_HOST.strip())

    async def _send_smtp_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
    ) -> tuple[bool, str | None]:
        """Send an email using SMTP inside asyncio.to_thread.
        
        Supports TLS (port 587) and SSL (port 465).
        Returns (True, None) on success, (False, error_str) on failure.
        """
        if not self._is_smtp_configured():
            return (False, "SMTP is not configured (missing SMTP_HOST).")

        host = (settings.SMTP_HOST or "").strip()
        port = settings.SMTP_PORT
        user = settings.SMTP_USER.strip() if settings.SMTP_USER else None
        password = settings.SMTP_PASSWORD if settings.SMTP_PASSWORD else None
        use_tls = settings.SMTP_TLS
        use_ssl = settings.SMTP_SSL

        logger.info(
            "[EMAIL] Attempting to send OTP email to %s via SMTP (%s:%d)",
            to_email,
            host,
            port,
        )

        def _smtp_worker() -> None:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = to_email

            plain_text = re.sub(r"<[^>]+>", "", html_body).strip()
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            sender_addr = parseaddr(settings.EMAIL_FROM)[1] or settings.EMAIL_FROM

            if use_ssl:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(host, port, context=context, timeout=15) as server:
                    if user and password:
                        server.login(user, password)
                    server.sendmail(sender_addr, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(host, port, timeout=15) as server:
                    server.ehlo()
                    if use_tls:
                        context = ssl.create_default_context()
                        server.starttls(context=context)
                        server.ehlo()
                    if user and password:
                        server.login(user, password)
                    server.sendmail(sender_addr, [to_email], msg.as_string())

        try:
            await asyncio.to_thread(_smtp_worker)
            logger.info("[EMAIL] Email successfully delivered to %s via SMTP.", to_email)
            return (True, None)
        except Exception as exc:
            error_msg = f"SMTP delivery failed to {to_email}: {exc}"
            logger.error("[EMAIL] %s", error_msg)
            return (False, error_msg)

    async def _send_resend_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
    ) -> tuple[bool, str | None]:
        """Send an email via the Resend HTTP API with SMTP fallback.
        
        Returns (True, None) on success, (False, error_message) on failure.
        """
        if not settings.RESEND_API_KEY:
            if self._is_smtp_configured():
                logger.info("[EMAIL] RESEND_API_KEY not configured, falling back to SMTP.")
                return await self._send_smtp_email(to_email=to_email, subject=subject, html_body=html_body)
            if settings.ENVIRONMENT != "production":
                sanitized_subj = re.sub(r"\b\d{6}\b", "******", subject) if settings.ENVIRONMENT == "production" else subject
                logger.info("[DEV EMAIL] Email for <%s> (Subject: %s)", to_email, sanitized_subj)
                return (True, None)
            logger.critical(
                "[EMAIL] No email provider configured! Set RESEND_API_KEY or SMTP_HOST in production environment variables."
            )
            return (
                False,
                "Email delivery service is not configured in production (missing RESEND_API_KEY or SMTP credentials).",
            )

        logger.info(
            "[EMAIL] Attempting to send OTP email to %s via Resend (from: %s)",
            to_email,
            settings.EMAIL_FROM,
        )

        payload = {
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    RESEND_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                if response.is_success:
                    logger.info("[EMAIL] Email successfully delivered to %s via Resend.", to_email)
                    return (True, None)
                else:
                    error_msg = f"Resend API error {response.status_code}: {response.text}"
                    logger.error("[EMAIL] %s", error_msg)
                    if self._is_smtp_configured():
                        logger.info("[EMAIL] Falling back to SMTP delivery for %s", to_email)
                        return await self._send_smtp_email(to_email=to_email, subject=subject, html_body=html_body)

                    detail_msg = response.text
                    try:
                        content_type = response.headers.get("content-type", "")
                        if "application/json" in content_type:
                            detail_msg = response.json().get("message", response.text)
                    except Exception:
                        pass
                    return (False, f"Email provider error ({response.status_code}): {detail_msg}")
        except Exception as exc:
            logger.error("[EMAIL] Exception occurred while contacting Resend API for %s: %s", to_email, exc)
            if self._is_smtp_configured():
                logger.info("[EMAIL] Resend exception occurred, falling back to SMTP delivery for %s", to_email)
                return await self._send_smtp_email(to_email=to_email, subject=subject, html_body=html_body)
            return (False, f"Failed to contact email provider: {exc}")

    async def send_verification_email(
        self,
        to_email: str,
        full_name: str,
        token: str,
    ) -> tuple[bool, str | None]:
        """Send an account verification email containing a one-time link."""
        frontend_url = self._get_frontend_url()
        verification_link = f"{frontend_url}/verify-email?token={token}"
        display_name = full_name.strip() if full_name and full_name.strip() else "there"

        if not settings.RESEND_API_KEY and not self._is_smtp_configured():
            if settings.ENVIRONMENT != "production":
                logger.info(
                    "[DEV EMAIL] Verification email for <%s> (%s):\nVerification Link: %s",
                    to_email,
                    display_name,
                    verification_link,
                )
                return (True, None)
            else:
                logger.critical(
                    "[EMAIL] No email provider configured! Set RESEND_API_KEY or SMTP_HOST in production environment variables."
                )
                return (
                    False,
                    "Email delivery service is not configured in production (missing RESEND_API_KEY or SMTP credentials).",
                )

        subject = "Verify your Technea account"
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <tr>
            <td>
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px;">Technea</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #e2e8f0;">Hi {display_name},</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #94a3b8;">
                Welcome to Technea! Please verify your email address to confirm your account and unlock your personalized learning journey.
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="{verification_link}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px;">Verify Email Address</a>
              </div>
              <p style="margin: 24px 0 8px; font-size: 13px; line-height: 20px; color: #64748b;">
                This verification link will expire in 24 hours. If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 12px; line-height: 18px; word-break: break-all; color: #38bdf8;">
                <a href="{verification_link}" style="color: #38bdf8;">{verification_link}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                If you did not create an account on Technea, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
        return await self._send_resend_email(to_email=to_email, subject=subject, html_body=html_body)

    async def send_password_reset_email(
        self,
        to_email: str,
        full_name: str,
        token: str,
    ) -> tuple[bool, str | None]:
        """Send a password reset email containing a one-time reset link."""
        frontend_url = self._get_frontend_url()
        reset_link = f"{frontend_url}/reset-password?token={token}"
        display_name = full_name.strip() if full_name and full_name.strip() else "there"

        if not settings.RESEND_API_KEY and not self._is_smtp_configured():
            if settings.ENVIRONMENT != "production":
                logger.info(
                    "[DEV EMAIL] Password reset email for <%s> (%s):\nReset Link: %s",
                    to_email,
                    display_name,
                    reset_link,
                )
                return (True, None)
            else:
                logger.critical(
                    "[EMAIL] No email provider configured! Set RESEND_API_KEY or SMTP_HOST in production environment variables."
                )
                return (
                    False,
                    "Email delivery service is not configured in production (missing RESEND_API_KEY or SMTP credentials).",
                )

        subject = "Reset your Technea password"
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <tr>
            <td>
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px;">Technea</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #e2e8f0;">Hi {display_name},</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #94a3b8;">
                We received a request to reset your password for your Technea account. Click the button below to choose a new password.
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="{reset_link}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px;">Reset Password</a>
              </div>
              <p style="margin: 24px 0 8px; font-size: 13px; line-height: 20px; color: #64748b;">
                This link will expire in 1 hour. If you did not make this request, you can safely ignore this email and your password will remain unchanged.
              </p>
              <p style="margin: 0 0 24px; font-size: 12px; line-height: 18px; word-break: break-all; color: #38bdf8;">
                <a href="{reset_link}" style="color: #38bdf8;">{reset_link}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                Technea Security Team &bull; Keep your credentials safe.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
        return await self._send_resend_email(to_email=to_email, subject=subject, html_body=html_body)

    async def send_otp_email(
        self,
        to_email: str,
        otp: str,
        expires_minutes: int = 5,
    ) -> tuple[bool, str | None]:
        """Send a one-time password (OTP) email for passwordless authentication.

        If no email provider is configured:
        - In non-production environments: logs OTP to stdout and returns (True, None).
        - In production environment: logs critical error and returns (False, descriptive_error).
        """
        if not settings.RESEND_API_KEY and not self._is_smtp_configured():
            if settings.ENVIRONMENT != "production":
                logger.info(
                    "[DEV EMAIL] Technea OTP code for <%s>: %s (expires in %d min)",
                    to_email,
                    otp,
                    expires_minutes,
                )
                return (True, None)
            else:
                logger.critical(
                    "[EMAIL] No email provider configured! Set RESEND_API_KEY or SMTP_HOST in production environment variables."
                )
                return (
                    False,
                    "Email delivery service is not configured in production (missing RESEND_API_KEY or SMTP credentials).",
                )

        subject = f"{otp} is your Technea verification code"
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #121216; border-radius: 12px; border: 1px solid #27272a; padding: 36px 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
          <tr>
            <td>
              <!-- Branding Header -->
              <div style="margin-bottom: 28px; text-align: left;">
                <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">TECHNEA</span>
              </div>
              
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #ffffff;">Verification Code</h2>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 22px; color: #a1a1aa;">
                Use the one-time code below to authenticate your Technea account. This code is valid for <strong>{expires_minutes} minutes</strong>.
              </p>
              
              <!-- Large Legible 6-Digit Monospace OTP Code -->
              <div style="margin: 28px 0; text-align: center;">
                <div style="display: inline-block; background-color: #18181b; border: 1px solid #3f3f46; border-radius: 10px; padding: 18px 28px; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #ffffff; text-align: center;">
                  {otp}
                </div>
              </div>

              <!-- Expiry Notice -->
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 20px; color: #71717a; text-align: center;">
                This code expires in {expires_minutes} minutes.
              </p>

              <!-- Security Advisory -->
              <div style="margin: 24px 0 0; padding: 16px; background-color: #18181b; border-radius: 8px; border-left: 3px solid #71717a;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa;">
                  <strong>Security Advisory:</strong> Never share this code with anyone. Technea staff will never ask for your code.
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #27272a; margin: 28px 0 20px;" />
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #52525b; text-align: center;">
                If you did not request this verification code, please ignore this email or contact support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
        return await self._send_resend_email(to_email=to_email, subject=subject, html_body=html_body)


email_service = EmailService()
