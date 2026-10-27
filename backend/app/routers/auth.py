import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select, update
from app.api.deps import CurrentUserDep, DatabaseDep
from app.core.config import settings
from app.core.logger import logger
from app.core.security import create_access_token, get_password_hash
from app.models.email_otp import EmailOTP
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.profile import AvatarUploadResponse
from app.schemas.user import (
    ForgotPasswordRequest,
    GoogleAuthUrlResponse,
    GoogleCallbackResponse,
    OTPSentResponse,
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
from app.services.email import email_service
from app.services.google_auth import exchange_code_for_user_info, get_google_auth_url
from app.services.profile import profile_service
from app.services.storage import get_storage_service
from app.services.user import user_service


def _generate_otp() -> str:
    """Generate secure 6-digit numeric OTP string using secrets."""
    return str(secrets.randbelow(900000) + 100000)


def _hash_otp(otp: str) -> str:
    """Compute HMAC-SHA256 hex digest of the OTP code using settings.SECRET_KEY."""
    return hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=otp.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()


def _verify_otp_hash(otp: str, hashed: str) -> bool:
    """Verify OTP against hashed digest using constant-time comparison."""
    expected_hash = _hash_otp(otp)
    return hmac.compare_digest(expected_hash, hashed)


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
) -> TokenResponse:
    """Create a new user account and return an access token."""
    existing_user = await user_service.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user = await user_service.create(db, obj_in=user_in)
    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
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
) -> TokenResponse:
    """Authenticate user with email and password and return an access token."""
    user = await user_service.authenticate(
        db,
        email=login_data.email,
        password=login_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated.",
        )

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


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
) -> MessageResponse:
    """Generate password reset token and send reset link if user exists.

    Always returns 200 with a generic message to prevent email enumeration attacks.
    """
    user = await user_service.get_by_email(db, email=data.email)
    if user and user.is_active:
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()

        await email_service.send_password_reset_email(
            to_email=user.email,
            full_name=user.full_name or "",
            token=token,
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
) -> MessageResponse:
    """Validate reset token and update user's password."""
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

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )

    user.hashed_password = get_password_hash(data.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    await db.commit()

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
    """Generate secure state and return Google OAuth authorization URL."""
    state = secrets.token_urlsafe(16)
    auth_url = await get_google_auth_url(state=state)
    return GoogleAuthUrlResponse(auth_url=auth_url)


@router.get(
    "/google/callback",
    summary="Google OAuth callback handler",
    response_model=GoogleCallbackResponse,
)
async def google_auth_callback(
    request: Request,
    db: DatabaseDep,
    code: Annotated[str, Query(..., description="Google OAuth authorization code")],
    state: Annotated[str | None, Query(description="OAuth state parameter")] = None,
    format: Annotated[str | None, Query(description="Response format ('json' for raw token JSON)")] = None,
):
    """Handle Google OAuth code exchange, find/create user, and redirect or return tokens."""
    user_info = await exchange_code_for_user_info(code=code)

    # 1. Look up user by google_id
    user = await user_service.get_by_google_id(db, google_id=user_info["google_id"])
    is_new_user = False

    if not user:
        # 2. Look up user by email to link existing account
        existing_user = await user_service.get_by_email(db, email=user_info["email"])
        if existing_user:
            if not existing_user.google_id:
                existing_user.google_id = user_info["google_id"]
            if not existing_user.is_email_verified:
                existing_user.is_email_verified = True
            if not existing_user.avatar_url and user_info.get("avatar_url"):
                existing_user.avatar_url = user_info["avatar_url"]
            await db.commit()
            await db.refresh(existing_user)
            user = existing_user
        else:
            # 3. New user registration via Google OAuth
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

    access_token = create_access_token(subject=user.id)

    # If client explicitly requests JSON (via query param or accept header without html)
    accept_header = request.headers.get("accept", "")
    if format == "json" or ("application/json" in accept_header and "text/html" not in accept_header):
        return GoogleCallbackResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
            is_new_user=is_new_user,
        )

    # Standard browser flow redirects to frontend callback page
    frontend_url = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    redirect_target = f"{frontend_url}/auth/callback?token={access_token}"
    return RedirectResponse(url=redirect_target, status_code=status.HTTP_302_FOUND)


@router.post(
    "/send-otp",
    response_model=OTPSentResponse,
    status_code=status.HTTP_200_OK,
    summary="Send OTP verification code to email",
)
async def send_otp(
    data: SendOTPRequest,
    db: DatabaseDep,
) -> OTPSentResponse:
    """Send a secure 6-digit one-time password to the user's email."""
    email = data.email.strip().lower()
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
    hashed_otp = _hash_otp(otp)
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

    success, error_msg = await email_service.send_otp_email(
        to_email=email,
        otp=otp,
        expires_minutes=settings.OTP_EXPIRE_MINUTES,
    )
    if not success:
        # Remove the undelivered OTP record so cooldown doesn't block retry
        await db.delete(otp_record)
        await db.commit()
        logger.error("[AUTH] Failed to dispatch OTP to %s: %s", email, error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to deliver verification email: {error_msg}. Please check email settings or contact support.",
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
) -> TokenResponse:
    """Verify one-time password code, auto-register or authenticate user, and return JWT."""
    email = data.email.strip().lower()
    otp = data.otp.strip()
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

    if not _verify_otp_hash(otp, otp_record.hashed_otp):
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
            user.is_email_verified = True
        await db.commit()
        await db.refresh(user)
    else:
        random_password = secrets.token_urlsafe(32)
        user = User(
            email=email,
            hashed_password=get_password_hash(random_password),
            auth_provider="otp",
            is_email_verified=True,
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


