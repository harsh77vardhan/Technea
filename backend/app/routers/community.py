"""API router for Community Learning Rooms."""

from fastapi import APIRouter, HTTPException, status
from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.schemas.community import JoinRoomResponse, LearningRoomResponse
from app.services.community import community_service

router = APIRouter(tags=["Community Learning Rooms"])


@router.get(
    "/rooms",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    summary="List all community learning rooms",
)
async def get_rooms(
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> list[LearningRoomResponse]:
    """Retrieve community learning rooms with member counts and user membership indicators."""
    user_id = current_user.id if current_user else None
    return await community_service.get_rooms(db, user_id=user_id)


@router.post(
    "/rooms/{room_id}/join",
    response_model=JoinRoomResponse,
    status_code=status.HTTP_200_OK,
    summary="Join or leave a community learning room",
)
async def toggle_room_join(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> JoinRoomResponse:
    """Toggle user membership in a peer learning room."""
    try:
        return await community_service.toggle_room_membership(
            db,
            user_id=current_user.id,
            room_id=room_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/rooms/my",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's joined learning rooms",
)
async def get_my_rooms(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> list[LearningRoomResponse]:
    """Retrieve all rooms currently joined by the authenticated user."""
    return await community_service.get_user_rooms(db, user_id=current_user.id)
