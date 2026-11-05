import asyncio
import hashlib
import hmac
import json
import re
import secrets
import time
import urllib.parse
import uuid
from datetime import datetime, timedelta, timezone
from collections.abc import AsyncGenerator
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, File, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.responses import RedirectResponse
import jwt
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.core.config import settings
from app.core.logger import logger
from app.core.security import (
    DUMMY_BCRYPT_HASH,
    JWT_SIGNING_KEY,
    OAUTH_STATE_KEY,
    OTP_HMAC_KEY,
    async_get_password_hash,
    async_verify_password,
    create_access_token,
    get_password_hash,
    make_unusable_password_hash,
    validate_password_strength,
    verify_password,
)
from app.models.email_otp import EmailOTP
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.profile import AvatarUploadResponse
from app.schemas.user import (
    CheckUsernameResponse,
    ForgotPasswordRequest,
    GoogleAuthUrlResponse,
    GoogleCallbackResponse,
    OTPSentResponse,
    ProfileSetupRequest,
    ProfileSetupResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SendOTPRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    VerifyEmailResponse,
    VerifyOTPRequest,
)
from app.services.auth_session import (
    REFRESH_COOKIE_NAME,
    auth_session_service,
    clear_refresh_cookie,
    set_refresh_cookie,
)
from app.services.email import email_service
from app.services.google_auth import exchange_code_for_user_info, get_google_auth_url
from app.services.profile import profile_service
from app.services.rate_limiter import get_client_ip, limit_auth_action
from app.services.storage import get_storage_service
from app.services.user import user_service


def _generate_otp() -> str:
    """Generate secure 6-digit numeric OTP string using secrets."""
    return str(secrets.randbelow(900000) + 100000)


def _hash_otp(email: str = "", otp: str | None = None, purpose: str = "auth") -> str:
    """Compute HMAC-SHA256 hex digest cryptographically bound to email, purpose, and OTP.

    Supports:
      _hash_otp("123456") -> legacy
      _hash_otp(email, otp)
      _hash_otp(email="a@b.com", otp="123456")
    """
    if otp is None:
        actual_otp = email.strip()
        actual_email = ""
    else:
        actual_email = email.strip().lower()
        actual_otp = otp.strip()

    if actual_email:
        bound_payload = f"{actual_email}:{purpose}:{actual_otp}".encode("utf-8")
        key = OTP_HMAC_KEY
    else:
        bound_payload = actual_otp.encode("utf-8")
        key = settings.SECRET_KEY.encode("utf-8")

    return hmac.new(
        key=key,
        msg=bound_payload,
        digestmod=hashlib.sha256,
    ).hexdigest()


def _verify_otp_hash(
    email: str = "",
    otp: str = "",
    hashed: str | None = None,
    purpose: str = "auth",
) -> bool:
    """Verify OTP against hashed digest using constant-time comparison.

    Supports:
      _verify_otp_hash(otp, hashed) -> legacy
      _verify_otp_hash(email, otp, hashed)
      _verify_otp_hash(email="a@b.com", otp="123456", hashed="...")
    """
    if hashed is None:
        actual_otp = email.strip()
        actual_hashed = otp.strip()
        actual_email = ""
    else:
        actual_email = email.strip().lower()
        actual_otp = otp.strip()
        actual_hashed = hashed.strip()

    if actual_email:
        expected = _hash_otp(email=actual_email, otp=actual_otp, purpose=purpose)
        if hmac.compare_digest(expected, actual_hashed):
            return True

    # Legacy verify check for in-flight tokens
    legacy_hash = hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=actual_otp.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(legacy_hash, actual_hashed)


def _generate_signed_oauth_state() -> str:
    """Generate signed tamper-proof OAuth state parameter valid for 15 minutes."""
    nonce = secrets.token_urlsafe(16)
    timestamp = int(time.time())
    payload = f"{nonce}:{timestamp}"
    sig = hmac.new(OAUTH_STATE_KEY, payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def _verify_signed_oauth_state(state: str | None, max_age_seconds: int = 900) -> bool:
    """Verify signed OAuth state signature and expiration."""
    if not state:
        return False
    parts = state.split(":")
    if len(parts) != 3:
        return False
    nonce, timestamp_str, sig = parts
    payload = f"{nonce}:{timestamp_str}"
    expected_sig = hmac.new(OAUTH_STATE_KEY, payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_sig, sig):
        return False
    try:
        timestamp = int(timestamp_str)
        now = int(time.time())
        if now - timestamp > max_age_seconds or timestamp > now + 60:
            return False
    except ValueError:
        return False
    return True


router = APIRouter(tags=["Authentication"])



@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def signup(
    user_in: UserCreate,
    db: DatabaseDep,
    request: Request,
    response: Response,
) -> TokenResponse:
    """Create a new user account and return an access token and rotating refresh token."""
    await limit_auth_action(request, db, action="login")

    existing_user = await user_service.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    try:
        validate_password_strength(user_in.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    user = await user_service.create(db, obj_in=user_in)
    access_token = create_access_token(subject=user.id)
    raw_refresh, _ = await auth_session_service.create_session(
        db,
        user_id=user.id,
        client_ip=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await db.commit()
    set_refresh_cookie(response, raw_refresh)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=raw_refresh,
        user=UserResponse.model_validate(user),
        profile_completed=user.profile_completed,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login with email and password",
)
async def login(
    login_data: UserLogin,
    db: DatabaseDep,
    request: Request,
    response: Response,
) -> TokenResponse:
    """Authenticate user with email and password and return access and refresh tokens."""
    clean_email = login_data.email.strip().lower()

    # Rate limiting (IP & Account)
    await limit_auth_action(request, db, action="login", email=clean_email)

    # 1. Email lookup
    user = await user_service.get_by_email(db, email=clean_email)

    # 2. Timing attack mitigation:
    # If user does not exist, run dummy verification inside threadpool so response times are indistinguishable
    if not user:
        await async_verify_password(login_data.password, DUMMY_BCRYPT_HASH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Password verification (non-blocking bounded threadpool)
    is_password_valid = await async_verify_password(
        login_data.password,
        user.hashed_password,
    )

    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Check is_active ONLY after valid password verification to prevent status leakage
    if not user.is_active:
        logger.warning(
            "[AUTH LOGIN] Account deactivated for user '%s' (id=%s)",
            user.email,
            user.id,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated.",
        )

    # 5. Token generation & session creation
    access_token = create_access_token(subject=user.id)
    raw_refresh, _ = await auth_session_service.create_session(
        db,
        user_id=user.id,
        client_ip=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await db.commit()
    set_refresh_cookie(response, raw_refresh)

    user_resp = UserResponse.model_validate(user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=raw_refresh,
        user=user_resp,
        profile_completed=user.profile_completed,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Renew short-lived access token using rotating refresh token",
)
async def refresh_token(
    request: Request,
    response: Response,
    db: DatabaseDep,
    body: RefreshTokenRequest | None = None,
) -> TokenResponse:
    """Renew access token via rotating refresh token with family tracking and grace period."""
    client_ip = get_client_ip(request)
    await limit_auth_action(request, db, action="refresh")

    # Extract refresh token: prioritize explicit request body/header over ambient cookie
    raw_refresh = None
    if body and body.refresh_token:
        raw_refresh = body.refresh_token.strip()
    elif request.headers.get("x-refresh-token"):
        raw_refresh = request.headers.get("x-refresh-token").strip()
    elif request.cookies.get(REFRESH_COOKIE_NAME):
        raw_refresh = request.cookies.get(REFRESH_COOKIE_NAME).strip()

    # Migration fallback: If client has a valid legacy access token during migration window
    if not raw_refresh:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            legacy_token = auth_header[7:].strip()
            try:
                payload = jwt.decode(
                    legacy_token,
                    JWT_SIGNING_KEY,
                    algorithms=[settings.JWT_ALGORITHM],
                    options={"verify_signature": True, "verify_exp": True, "verify_aud": False, "verify_iss": False},
                )
                user_id_str = payload.get("sub")
                if user_id_str:
                    user = await user_service.get(db, id=uuid.UUID(user_id_str))
                    if user and user.is_active:
                        new_access = create_access_token(subject=user.id)
                        new_raw_refresh, _ = await auth_session_service.create_session(
                            db,
                            user_id=user.id,
                            client_ip=client_ip,
                            user_agent=request.headers.get("user-agent"),
                        )
                        await db.commit()
                        set_refresh_cookie(response, new_raw_refresh)
                        return TokenResponse(
                            access_token=new_access,
                            token_type="bearer",
                            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                            refresh_token=new_raw_refresh,
                            user=UserResponse.model_validate(user),
                            profile_completed=user.profile_completed,
                        )
            except Exception:
                pass

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required.",
        )

    # Rotate refresh token (handles grace period & reuse detection)
    new_raw_refresh, new_token_rec, user_id = await auth_session_service.rotate_session(
        db=db,
        raw_token=raw_refresh,
        client_ip=client_ip,
        user_agent=request.headers.get("user-agent"),
    )

    user = await user_service.get(db, id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated.",
        )

    new_access_token = create_access_token(subject=user.id)
    await db.commit()
    set_refresh_cookie(response, new_raw_refresh)

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=new_raw_refresh,
        user=UserResponse.model_validate(user),
        profile_completed=user.profile_completed,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out and revoke current refresh token session",
)
async def logout(
    request: Request,
    response: Response,
    db: DatabaseDep,
    body: RefreshTokenRequest | None = None,
) -> MessageResponse:
    raw_refresh = None
    if body and body.refresh_token:
        raw_refresh = body.refresh_token.strip()
    elif request.headers.get("x-refresh-token"):
        raw_refresh = request.headers.get("x-refresh-token").strip()
    elif request.cookies.get(REFRESH_COOKIE_NAME):
        raw_refresh = request.cookies.get(REFRESH_COOKIE_NAME).strip()

    if raw_refresh:
        await auth_session_service.revoke_session(db, raw_token=raw_refresh)
        await db.commit()

    clear_refresh_cookie(response)
    return MessageResponse(message="Logged out successfully.")


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke all active sessions for current user",
)
async def logout_all(
    current_user: CurrentUserDep,
    response: Response,
    db: DatabaseDep,
) -> MessageResponse:
    """Revoke all active refresh tokens and sessions for current authenticated user."""
    await auth_session_service.revoke_user_sessions(db, user_id=current_user.id)
    await db.commit()
    clear_refresh_cookie(response)
    return MessageResponse(message="All active sessions terminated successfully.")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_me(
    current_user: CurrentUserDep,
) -> UserResponse:
    """Retrieve the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
)
async def update_profile(
    obj_in: UserUpdate,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> UserResponse:
    """Update profile information such as full name, bio, or password."""
    updated = await user_service.update(db, db_obj=current_user, obj_in=obj_in)
    return UserResponse.model_validate(updated)


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="User logout",
)
async def logout(
    current_user: CurrentUserDep,
) -> MessageResponse:
    """Inform the client of successful logout (client drops JWT token)."""
    return MessageResponse(message="Successfully logged out.")


@router.post(
    "/avatar",
    response_model=AvatarUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload user avatar image",
)
async def upload_avatar_auth(
    current_user: CurrentUserDep,
    db: DatabaseDep,
    file: Annotated[UploadFile, File(description="Avatar image file (PNG, JPEG, WebP)")],
) -> AvatarUploadResponse:
    """Upload new avatar image, validate type & size, save safely, and update user.avatar_url."""
    storage = get_storage_service()
    if current_user.avatar_url:
        try:
            await storage.delete_file(current_user.avatar_url)
        except Exception:
            pass

    avatar_url = await storage.save_file(file, subfolder="avatars")
    current_user.avatar_url = avatar_url
    await db.commit()
    await db.refresh(current_user)

    return AvatarUploadResponse(
        avatar_url=current_user.avatar_url,
        message="Avatar uploaded successfully",
    )


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Initiate password reset via email",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: DatabaseDep,
    request: Request,
) -> MessageResponse:
    """Generate password reset token and send reset link in background if user exists.

    Always returns 200 with an identical message and constant execution time.
    """
    clean_email = data.email.strip().lower()
    await limit_auth_action(request, db, action="forgot_password", email=clean_email)

    user = await user_service.get_by_email(db, email=clean_email)
    if user and user.is_active:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        user.password_reset_token = token_hash
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()

        # Send email in background task to equalize endpoint timing
        asyncio.create_task(
            email_service.send_password_reset_email(
                to_email=user.email,
                full_name=user.full_name or "",
                token=token,
            )
        )

    return MessageResponse(message="If that email exists, you'll receive a reset link.")


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password using token",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: DatabaseDep,
    request: Request,
) -> MessageResponse:
    """Validate reset token, update user password, invalidate sessions, and send confirmation."""
    await limit_auth_action(request, db, action="reset_password")

    user = await user_service.get_by_reset_token(db, token=data.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    now = datetime.now(timezone.utc)
    expires = user.password_reset_expires
    if expires is not None and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if expires is None or expires < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one.",
        )

    try:
        validate_password_strength(data.new_password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    user.hashed_password = await async_get_password_hash(data.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None

    # Revoke all active sessions on password change
    await auth_session_service.revoke_user_sessions(db, user_id=user.id)
    await db.commit()

    # Send security notification email in background
    asyncio.create_task(
        email_service.send_password_reset_confirmation(
            to_email=user.email,
            full_name=user.full_name or "",
        )
    )

    return MessageResponse(message="Password updated successfully.")


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend email verification link",
)
async def resend_verification(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> MessageResponse:
    """Generate a new verification token and email it to the authenticated user."""
    if current_user.is_email_verified:
        return MessageResponse(message="Email is already verified.")

    token = secrets.token_urlsafe(32)
    current_user.email_verification_token = token
    current_user.email_verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    await db.commit()

    await email_service.send_verification_email(
        to_email=current_user.email,
        full_name=current_user.full_name or "",
        token=token,
    )

    return MessageResponse(message="Verification email sent.")


@router.get(
    "/verify-email",
    response_model=VerifyEmailResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify user email address using token",
)
async def verify_email(
    token: Annotated[str, Query(..., description="Email verification token")],
    db: DatabaseDep,
) -> VerifyEmailResponse:
    """Validate verification token and mark user's email as verified."""
    user = await user_service.get_by_verification_token(db, token=token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    now = datetime.now(timezone.utc)
    expires = user.email_verification_expires
    if expires is not None and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if expires is None or expires < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one.",
        )

    user.is_email_verified = True
    user.email_verification_token = None
    user.email_verification_expires = None
    await db.commit()
    await db.refresh(user)

    return VerifyEmailResponse(
        message="Email verified successfully.",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/google",
    response_model=GoogleAuthUrlResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Google OAuth authorization URL",
)
async def google_auth_login() -> GoogleAuthUrlResponse:
    """Generate tamper-proof signed state and return Google OAuth authorization URL."""
    state = _generate_signed_oauth_state()
    auth_url = await get_google_auth_url(state=state)
    return GoogleAuthUrlResponse(auth_url=auth_url)


ALLOWED_FRONTEND_HOSTS = {
    "technea.vercel.app",
    "technea.in",
    "www.technea.in",
    "technea.dev",
    "www.technea.dev",
    "localhost:5173",
    "localhost:3000",
}


def _get_safe_frontend_url(target_url: str | None = None) -> str:
    """Resolve and validate frontend base URL with strict Open Redirect protection.

    Ensures destination host is in ALLOWED_FRONTEND_HOSTS and scheme is https/http.
    Defaults strictly to https://technea.vercel.app without fallback to localhost:3000.
    """
    raw = target_url or settings.get_frontend_url()
    try:
        parsed = urllib.parse.urlsplit(str(raw).strip())
        host = (parsed.netloc or parsed.hostname or "").lower()
        scheme = (parsed.scheme or "").lower()
        if host in ALLOWED_FRONTEND_HOSTS and scheme in {"http", "https"}:
            return f"{scheme}://{host}"
    except Exception:
        pass
    return "https://technea.vercel.app"


def _safe_frontend_redirect(target_url: str, status_code: int = status.HTTP_302_FOUND) -> RedirectResponse:
    """Return RedirectResponse verifying that destination host is strictly in ALLOWED_FRONTEND_HOSTS and scheme is https/http."""
    try:
        parsed = urllib.parse.urlsplit(target_url)
        host = (parsed.netloc or "").lower()
        scheme = (parsed.scheme or "").lower()
        if host in ALLOWED_FRONTEND_HOSTS and scheme in {"http", "https"}:
            return RedirectResponse(url=target_url, status_code=status_code)
    except Exception:
        pass
    parsed = urllib.parse.urlsplit(target_url)
    fallback = f"https://technea.vercel.app{parsed.path or ''}"
    if parsed.query:
        fallback = f"{fallback}?{parsed.query}"
    return RedirectResponse(url=fallback, status_code=status_code)


@router.get(
    "/google/callback",
    summary="Google OAuth callback handler",
    response_model=GoogleCallbackResponse,
)
async def google_auth_callback(
    request: Request,
    db: DatabaseDep,
    code: Annotated[str | None, Query(description="Google OAuth authorization code")] = None,
    error: Annotated[str | None, Query(description="Google OAuth error or cancellation")] = None,
    state: Annotated[str | None, Query(description="OAuth state parameter")] = None,
    format: Annotated[str | None, Query(description="Response format ('json' for raw token JSON)")] = None,
):
    """Handle Google OAuth code exchange, find/create user, and redirect or return tokens."""
    frontend_url = _get_safe_frontend_url()
    accept_header = request.headers.get("accept", "")
    is_json_request = format == "json" or ("application/json" in accept_header and "text/html" not in accept_header)

    # 1. Verify signed OAuth state to prevent OAuth CSRF / session fixation attacks
    is_prod = settings.ENVIRONMENT == "production"
    if (is_prod or state is not None) and not _verify_signed_oauth_state(state):
        logger.warning("[AUTH] Google OAuth callback received invalid or expired state: %s", state)
        if is_json_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OAuth state parameter.",
            )
        redirect_target = f"{frontend_url}/auth/callback?error=invalid_state"
        return _safe_frontend_redirect(redirect_target)

    # 2. Handle error returned by Google consent screen (e.g. error=access_denied)
    if error:
        logger.warning("Google OAuth callback received error: %s", error)
        if is_json_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth error: {error}",
            )
        redirect_target = f"{frontend_url}/auth/callback?error={urllib.parse.quote(error)}"
        return _safe_frontend_redirect(redirect_target)

    # 3. Check if authorization code is missing
    if not code:
        logger.warning("Google OAuth callback received without code")
        if is_json_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Google OAuth authorization code.",
            )
        redirect_target = f"{frontend_url}/auth/callback?error=missing_code"
        return _safe_frontend_redirect(redirect_target)

    # 4. Exchange code for user info and link/create user
    try:
        user_info = await exchange_code_for_user_info(code=code)

        # Look up user by google_id
        user = await user_service.get_by_google_id(db, google_id=user_info["google_id"])
        is_new_user = False

        if not user:
            # Look up user by email to link existing account
            existing_user = await user_service.get_by_email(db, email=user_info["email"])
            if existing_user:
                if not existing_user.google_id:
                    existing_user.google_id = user_info["google_id"]
                if not existing_user.is_email_verified:
                    # Pre-hijacking mitigation: unverified password wiped to prevent attacker retention
                    existing_user.hashed_password = make_unusable_password_hash()
                    existing_user.is_email_verified = True
                    logger.warning(
                        "[AUTH SECURITY] Pre-hijacking defense: unverified password reset for user '%s'",
                        existing_user.email,
                    )
                if not existing_user.avatar_url and user_info.get("avatar_url"):
                    existing_user.avatar_url = user_info["avatar_url"]
                await db.commit()
                await db.refresh(existing_user)
                user = existing_user
            else:
                # New user registration via Google OAuth
                user = await user_service.create_google_user(
                    db=db,
                    email=user_info["email"],
                    full_name=user_info.get("name"),
                    google_id=user_info["google_id"],
                    avatar_url=user_info.get("avatar_url"),
                )
                is_new_user = True
        else:
            # Existing user found by google_id; update avatar if not set
            if not user.avatar_url and user_info.get("avatar_url"):
                user.avatar_url = user_info["avatar_url"]
                await db.commit()
                await db.refresh(user)

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated.",
            )
    except HTTPException as exc:
        if format != "json" and "text/html" in accept_header:
            redirect_target = f"{frontend_url}/auth/callback?error={urllib.parse.quote(str(exc.detail))}"
            return _safe_frontend_redirect(redirect_target)
        raise exc

    access_token = create_access_token(subject=user.id)
    raw_refresh, _ = await auth_session_service.create_session(
        db,
        user_id=user.id,
        client_ip=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await db.commit()

    # If client explicitly requests JSON (via query param or accept header without html)
    if is_json_request:
        return GoogleCallbackResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_token=raw_refresh,
            user=UserResponse.model_validate(user),
            is_new_user=is_new_user,
            profile_completed=user.profile_completed,
        )

    # Standard browser flow redirects to frontend callback page
    completed_val = 1 if user.profile_completed else 0
    redirect_target = f"{frontend_url}/auth/callback?token={access_token}&refresh_token={raw_refresh}&profile_completed={completed_val}"
    redirect_resp = _safe_frontend_redirect(redirect_target)
    set_refresh_cookie(redirect_resp, raw_refresh)
    return redirect_resp


@router.post(
    "/send-otp",
    response_model=OTPSentResponse,
    status_code=status.HTTP_200_OK,
    summary="Send OTP verification code to email",
)
async def send_otp(
    data: SendOTPRequest,
    db: DatabaseDep,
    request: Request,
) -> OTPSentResponse:
    """Send a secure 6-digit one-time password to the user's email."""
    email = data.email.strip().lower()
    await limit_auth_action(request, db, action="send_otp", email=email)
    now = datetime.now(timezone.utc)

    # Cooldown check: Check if an unexpired, unused OTP was created for this email within cooldown window
    stmt = (
        select(EmailOTP)
        .where(
            EmailOTP.email == email,
            EmailOTP.is_used.is_(False),
            EmailOTP.expires_at > now,
        )
        .order_by(EmailOTP.created_at.desc())
    )
    result = await db.execute(stmt)
    latest_otp = result.scalars().first()

    if latest_otp and latest_otp.created_at:
        created_at = latest_otp.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        elapsed = (now - created_at).total_seconds()
        if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
            wait_seconds = max(1, int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait_seconds} seconds before requesting a new code.",
            )

    # Invalidate previous unused OTP records for this email
    await db.execute(
        update(EmailOTP)
        .where(
            EmailOTP.email == email,
            EmailOTP.is_used.is_(False),
        )
        .values(is_used=True)
    )

    otp = _generate_otp()
    hashed_otp = _hash_otp(email=email, otp=otp, purpose="auth")
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    otp_record = EmailOTP(
        email=email,
        hashed_otp=hashed_otp,
        expires_at=expires_at,
        attempts=0,
        is_used=False,
    )
    db.add(otp_record)
    await db.commit()

    try:
        success, error_msg = await email_service.send_otp_email(
            to_email=email,
            otp=otp,
            expires_minutes=settings.OTP_EXPIRE_MINUTES,
        )
    except Exception as exc:
        await db.delete(otp_record)
        await db.commit()
        logger.error("[AUTH] Exception while sending OTP email to %s: %s", email, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to deliver verification email. Please check email settings or contact support.",
        )

    if not success:
        # Remove the undelivered OTP record so cooldown doesn't block retry
        await db.delete(otp_record)
        await db.commit()
        logger.error("[AUTH] Failed to dispatch OTP to %s: %s", email, error_msg)

        # Sanitize error message to prevent leaking internal credentials, secrets, or API keys
        sanitized_msg = str(error_msg or "Service temporarily unavailable")
        sanitized_msg = re.sub(r"re_[a-zA-Z0-9_\-\.]{8,}", "re_***", sanitized_msg)
        sanitized_msg = re.sub(
            r"(password|secret|key)=['\"][^'\"]+['\"]", r"\1=***", sanitized_msg, flags=re.IGNORECASE
        )
        sanitized_msg = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]+", "Bearer ***", sanitized_msg, flags=re.IGNORECASE)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to deliver verification email: {sanitized_msg}. Please check email settings or contact support.",
        )

    return OTPSentResponse(
        message="Verification code sent to your email.",
        expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60,
        cooldown_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS,
    )


@router.post(
    "/verify-otp",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify email OTP code and authenticate user",
)
async def verify_otp(
    data: VerifyOTPRequest,
    db: DatabaseDep,
    request: Request,
    response: Response,
) -> TokenResponse:
    """Verify one-time password code, auto-register or authenticate user, and return JWT and refresh token."""
    email = data.email.strip().lower()
    otp = data.otp.strip()
    await limit_auth_action(request, db, action="verify_otp", email=email)
    now = datetime.now(timezone.utc)

    # Fetch latest unexpired, unused EmailOTP record for this email
    stmt = (
        select(EmailOTP)
        .where(
            EmailOTP.email == email,
            EmailOTP.is_used.is_(False),
            EmailOTP.expires_at > now,
        )
        .order_by(EmailOTP.created_at.desc())
        .with_for_update()
    )
    result = await db.execute(stmt)
    otp_record = result.scalars().first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new one.",
        )

    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    if not _verify_otp_hash(email=email, otp=otp, hashed=otp_record.hashed_otp, purpose="auth"):
        otp_record.attempts += 1
        remaining = max(0, settings.OTP_MAX_ATTEMPTS - otp_record.attempts)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incorrect code. {remaining} attempt(s) remaining.",
        )

    # Valid OTP verified: mark used
    otp_record.is_used = True

    # Look up user by email
    user = await user_service.get_by_email(db, email=email)
    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated.",
            )
        if not user.is_email_verified:
            # Pre-hijacking defense: unverified password wiped
            user.hashed_password = make_unusable_password_hash()
            user.is_email_verified = True
            logger.warning(
                "[AUTH SECURITY] Pre-hijacking defense: unverified password reset on OTP verification for '%s'",
                email,
            )
        await db.commit()
        await db.refresh(user)
    else:
        # Race-safe auto-provisioning with IntegrityError catch
        try:
            user = User(
                email=email,
                hashed_password=make_unusable_password_hash(),
                auth_provider="otp",
                is_email_verified=True,
                is_active=True,
                is_superuser=False,
                profile_completed=False,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            await db.rollback()
            user = await user_service.get_by_email(db, email=email)
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error during user account resolution.",
                )

    access_token = create_access_token(subject=user.id)
    raw_refresh, _ = await auth_session_service.create_session(
        db,
        user_id=user.id,
        client_ip=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await db.commit()
    set_refresh_cookie(response, raw_refresh)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=raw_refresh,
        user=UserResponse.model_validate(user),
        profile_completed=user.profile_completed,
    )


USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]+$")
RESERVED_USERNAMES: frozenset[str] = frozenset({
    "admin", "administrator", "root", "api", "auth", "technea", "support",
    "dashboard", "help", "system", "moderator", "superuser", "guest", "null",
})


def _is_safe_avatar_url(url: str | None) -> bool:
    """Validate avatar URL protocol to prevent javascript: or malicious URI injection."""
    if not url:
        return True
    trimmed = url.strip()
    return (
        trimmed.startswith("https://")
        or trimmed.startswith("data:image/svg+xml")
        or trimmed.startswith("/uploads/")
        or trimmed.startswith("/static/")
    )


@router.get(
    "/check-username",
    response_model=CheckUsernameResponse,
    status_code=status.HTTP_200_OK,
    summary="Check username availability",
)
async def check_username(
    db: DatabaseDep,
    username: Annotated[str, Query(..., min_length=3, max_length=30, description="Username to check")],
    current_user: OptionalUserDep = None,
) -> CheckUsernameResponse:
    """Check if a username is available (case-insensitive) excluding current user if authenticated."""
    if not USERNAME_REGEX.match(username):
        return CheckUsernameResponse(
            username=username,
            available=False,
            message="Username may only contain letters, numbers, and underscores.",
        )

    clean_username = username.strip().lower()
    if clean_username in RESERVED_USERNAMES:
        return CheckUsernameResponse(
            username=username,
            available=False,
            message="This username is reserved by the platform. Please pick another handle.",
        )

    stmt = select(User.id).where(func.lower(User.username) == clean_username)
    if current_user is not None:
        stmt = stmt.where(User.id != current_user.id)

    result = await db.execute(stmt)
    existing_user_id = result.scalar_one_or_none()

    if existing_user_id:
        return CheckUsernameResponse(
            username=username,
            available=False,
            message=f"Username '{username}' is already taken.",
        )

    return CheckUsernameResponse(
        username=username,
        available=True,
        message=f"Username '{username}' is available.",
    )


@router.post(
    "/profile-setup",
    response_model=ProfileSetupResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete user onboarding and profile setup",
)
async def setup_profile(
    data: ProfileSetupRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> ProfileSetupResponse:
    """Complete initial profile setup during onboarding with validation and race protection."""
    clean_username = data.username.strip().lower()

    if clean_username in RESERVED_USERNAMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The handle '{clean_username}' is reserved. Please pick another handle.",
        )

    # Validate avatar URL security
    if data.avatar_url and not _is_safe_avatar_url(data.avatar_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid avatar URL protocol. Only secure HTTPS or platform SVG avatars are permitted.",
        )

    # Validate username uniqueness against other users
    conflict_stmt = select(User.id).where(
        func.lower(User.username) == clean_username,
        User.id != current_user.id,
    )
    conflict_res = await db.execute(conflict_stmt)
    if conflict_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The username '{data.username}' is already taken.",
        )

    # Update profile fields
    if data.full_name and data.full_name.strip():
        current_user.full_name = data.full_name.strip()
    elif not current_user.full_name:
        current_user.full_name = clean_username or "Technea Engineer"
    current_user.username = clean_username
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url.strip() if data.avatar_url else None
    if data.bio is not None:
        current_user.bio = data.bio.strip() if data.bio else None
    if data.learning_goal is not None:
        current_user.learning_goal = data.learning_goal.strip() if data.learning_goal else None
    if data.current_skill_level is not None:
        current_user.current_skill_level = data.current_skill_level.strip() if data.current_skill_level else None

    # Serialize interests
    if data.interests is not None:
        cleaned_interests = [str(item).strip() for item in data.interests if str(item).strip()]
        current_user.interests = json.dumps(cleaned_interests)

    # Mark profile completed
    current_user.profile_completed = True

    try:
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"The username '{clean_username}' was just claimed by another user. Please choose another.",
        )

    return ProfileSetupResponse(
        user=UserResponse.model_validate(current_user),
        profile_completed=True,
        message="Profile setup completed successfully.",
    )


