"""Authentication and user account router."""

from datetime import datetime, timedelta, timezone
import secrets
from typing import Annotated
from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import RedirectResponse
from app.api.deps import CurrentUserDep, DatabaseDep
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.schemas.common import MessageResponse
from app.schemas.profile import AvatarUploadResponse
from app.schemas.user import (
    ForgotPasswordRequest,
    GoogleAuthUrlResponse,
    GoogleCallbackResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    VerifyEmailResponse,
)
from app.services.email import email_service
from app.services.google_auth import exchange_code_for_user_info, get_google_auth_url
from app.services.profile import profile_service
from app.services.storage import get_storage_service
from app.services.user import user_service


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

