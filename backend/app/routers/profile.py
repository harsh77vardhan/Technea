"""Router for User Profile Viewer, Profile Editor, and Follow System."""

from typing import Annotated
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.schemas.profile import (
    AvatarUploadResponse,
    FollowActionResponse,
    FollowUserItem,
    ProfileUpdateRequest,
    UserProfilePublicResponse,
    UserStatsResponse,
)
from app.services.profile import profile_service
from app.services.storage import get_storage_service

router = APIRouter(tags=["User Profiles & Community"])


@router.get(
    "/me/profile",
    response_model=UserProfilePublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's full developer profile",
)
async def get_my_profile(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> UserProfilePublicResponse:
    """Retrieve authenticated user's own developer profile."""
    return await profile_service.get_public_profile(db, username_or_id=str(current_user.id), viewer_id=current_user.id)


@router.put(
    "/me/profile",
    response_model=UserProfilePublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Update authenticated user's profile details",
)
async def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> UserProfilePublicResponse:
    """Edit user full name, unique username, bio, location, and social developer URLs."""
    return await profile_service.update_profile(db, user_id=current_user.id, payload=payload)


@router.get(
    "/me/stats",
    response_model=UserStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's learning statistics",
)
async def get_my_stats(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> UserStatsResponse:
    """Retrieve authenticated user's learning statistics and developer progress metrics."""
    return await profile_service.get_user_stats(db, user_id=current_user.id)


@router.post(
    "/avatar",
    response_model=AvatarUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and update user profile avatar",
)
@router.post(
    "/me/avatar",
    response_model=AvatarUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and update user profile avatar (alias)",
)
async def upload_avatar(
    current_user: CurrentUserDep,
    db: DatabaseDep,
    file: Annotated[UploadFile, File(description="Avatar image file (PNG, JPEG, WebP)")],
) -> AvatarUploadResponse:
    """Upload new avatar image, validate type & size, save safely, update user.avatar_url and return URL."""
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
        avatar_url=avatar_url,
        message="Profile photo updated successfully.",
    )


@router.post(
    "/{username}/follow",
    response_model=FollowActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Follow a Technea user",
)
async def follow_user(
    username: str,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> FollowActionResponse:
    """Follow another developer and increment their follower community count."""
    return await profile_service.follow_user(db, follower_id=current_user.id, target_username=username)


@router.delete(
    "/{username}/follow",
    response_model=FollowActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Unfollow a Technea user",
)
async def unfollow_user_delete(
    username: str,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> FollowActionResponse:
    """Unfollow a developer and update relationship counts."""
    return await profile_service.unfollow_user(db, follower_id=current_user.id, target_username=username)


@router.post(
    "/{username}/unfollow",
    response_model=FollowActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Unfollow a Technea user (POST alias)",
)
async def unfollow_user_post(
    username: str,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> FollowActionResponse:
    """Convenience POST endpoint to unfollow a developer."""
    return await profile_service.unfollow_user(db, follower_id=current_user.id, target_username=username)


@router.get(
    "/{username}/followers",
    response_model=list[FollowUserItem],
    status_code=status.HTTP_200_OK,
    summary="Get list of followers for a user",
)
async def get_user_followers(
    username: str,
    db: DatabaseDep,
    optional_user: OptionalUserDep,
) -> list[FollowUserItem]:
    """Retrieve list of developers following this user."""
    viewer_id = optional_user.id if optional_user else None
    return await profile_service.get_followers(db, target_username=username, viewer_id=viewer_id)


@router.get(
    "/{username}/following",
    response_model=list[FollowUserItem],
    status_code=status.HTTP_200_OK,
    summary="Get list of users that this user follows",
)
async def get_user_following(
    username: str,
    db: DatabaseDep,
    optional_user: OptionalUserDep,
) -> list[FollowUserItem]:
    """Retrieve list of developers this user follows."""
    viewer_id = optional_user.id if optional_user else None
    return await profile_service.get_following(db, target_username=username, viewer_id=viewer_id)


@router.get(
    "/{username}",
    response_model=UserProfilePublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get public developer profile by username",
)
@router.get(
    "/profile/{username}",
    response_model=UserProfilePublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get public developer profile by username (backward compatibility)",
)
async def get_public_profile(
    username: str,
    db: DatabaseDep,
    optional_user: OptionalUserDep,
) -> UserProfilePublicResponse:
    """Retrieve public developer portfolio, verified learning metrics, projects, and social stats."""
    viewer_id = optional_user.id if optional_user else None
    return await profile_service.get_public_profile(db, username_or_id=username, viewer_id=viewer_id)

