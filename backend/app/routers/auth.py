"""Authentication and user account router."""

from typing import Annotated
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.api.deps import CurrentUserDep, DatabaseDep
from app.core.security import create_access_token
from app.schemas.common import MessageResponse
from app.schemas.profile import AvatarUploadResponse
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
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

