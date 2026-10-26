"""Google OAuth 2.0 integration service using HTTPX."""

import urllib.parse
from fastapi import HTTPException, status
import httpx

from app.core.config import settings
from app.core.logger import logger

GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def get_google_auth_url(state: str) -> str:
    """Build and return Google OAuth 2.0 authorization URL.
    
    Raises 503 if GOOGLE_CLIENT_ID is not configured.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on this server.",
        )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "select_account",
    }
    return f"{GOOGLE_AUTH_BASE}?{urllib.parse.urlencode(params)}"


async def exchange_code_for_user_info(code: str) -> dict:
    """Exchange authorization code for user profile information from Google.
    
    Returns a dict containing:
        - email: str
        - name: str
        - google_id: str
        - avatar_url: str | None
        - verified_email: bool
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth credentials are not configured on this server.",
        )

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Step 1: Exchange authorization code for Google access token
        token_payload = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        try:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data=token_payload,
                headers={"Accept": "application/json"},
            )
        except Exception as exc:
            logger.error("Failed to reach Google OAuth token endpoint: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to reach Google OAuth token server.",
            )

        if not token_response.is_success:
            logger.error(
                "Google token exchange failed with status %d: %s",
                token_response.status_code,
                token_response.text,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code with Google.",
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            logger.error("Google token response did not contain access_token: %s", token_data)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token response received from Google.",
            )

        # Step 2: Fetch user profile using access token
        try:
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        except Exception as exc:
            logger.error("Failed to reach Google OAuth userinfo endpoint: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to reach Google userinfo server.",
            )

        if not userinfo_response.is_success:
            logger.error(
                "Google userinfo fetch failed with status %d: %s",
                userinfo_response.status_code,
                userinfo_response.text,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve user profile from Google.",
            )

        user_data = userinfo_response.json()
        email = user_data.get("email")
        google_id = user_data.get("sub")

        if not email or not google_id:
            logger.error("Google profile missing email or sub identifier: %s", user_data)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account did not provide required email or identifier.",
            )

        return {
            "email": email.strip().lower(),
            "name": user_data.get("name") or user_data.get("given_name") or email.split("@")[0],
            "google_id": str(google_id),
            "avatar_url": user_data.get("picture"),
            "verified_email": bool(user_data.get("email_verified", True)),
        }
