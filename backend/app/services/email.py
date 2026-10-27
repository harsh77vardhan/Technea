"""Email delivery service using Resend API over HTTPX."""

import re
import httpx
from app.core.config import settings
from app.core.logger import logger

RESEND_API_URL = "https://api.resend.com/emails"


class EmailService:
    """Service handling transactional emails via Resend API."""

    def _get_frontend_url(self) -> str:
        """Resolve frontend base URL with fallback to local development."""
        if settings.FRONTEND_URL and settings.FRONTEND_URL.strip():
            return settings.FRONTEND_URL.strip().rstrip("/")
        return "http://localhost:3000"

    async def _send_resend_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
    ) -> bool:
        """Send an email via the Resend HTTP API.
        
        Returns True on success, False on failure. Never raises exceptions.
        """
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
                    sanitized_subject = re.sub(r"\b\d{6}\b", "******", subject)
                    logger.info("Email '%s' successfully sent to %s via Resend.", sanitized_subject, to_email)
                    return True
                else:
                    logger.error(
                        "Resend API returned error status %d for %s: %s",
                        response.status_code,
                        to_email,
                        response.text,
                    )
                    return False
        except Exception as exc:
            logger.error("Exception occurred while contacting Resend API for %s: %s", to_email, exc)
            return False

    async def send_verification_email(
        self,
        to_email: str,
        full_name: str,
        token: str,
    ) -> bool:
        """Send an account verification email containing a one-time link.
        
        If RESEND_API_KEY is not configured, logs the link for development use and returns True.
        """
        frontend_url = self._get_frontend_url()
        verification_link = f"{frontend_url}/verify-email?token={token}"
        display_name = full_name.strip() if full_name and full_name.strip() else "there"

        # Development / fallback mode when Resend is unconfigured
        if not settings.RESEND_API_KEY:
            logger.info(
                "[DEV EMAIL] Verification email for <%s> (%s):\nVerification Link: %s",
                to_email,
                display_name,
                verification_link,
            )
            return True

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
    ) -> bool:
        """Send a password reset email containing a one-time reset link.
        
        If RESEND_API_KEY is not configured, logs the link for development use and returns True.
        """
        frontend_url = self._get_frontend_url()
        reset_link = f"{frontend_url}/reset-password?token={token}"
        display_name = full_name.strip() if full_name and full_name.strip() else "there"

        # Development / fallback mode when Resend is unconfigured
        if not settings.RESEND_API_KEY:
            logger.info(
                "[DEV EMAIL] Password reset email for <%s> (%s):\nReset Link: %s",
                to_email,
                display_name,
                reset_link,
            )
            return True

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
    ) -> bool:
        """Send a one-time password (OTP) email for passwordless authentication.

        If RESEND_API_KEY is not configured, logs the OTP for development use and returns True.
        """
        if not settings.RESEND_API_KEY:
            logger.info(
                "[DEV EMAIL] Technea OTP code for <%s>: %s (expires in %d min)",
                to_email,
                otp,
                expires_minutes,
            )
            return True

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

