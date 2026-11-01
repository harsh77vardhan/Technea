"""API router for Community Learning Rooms and Study Rooms."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.schemas.community import (
    CreateQuestionReplyRequest,
    CreateQuestionRequest,
    CreateResourceRequest,
    CreateRoomRequest,
    JoinByCodeRequest,
    JoinRoomResponse,
    LearningRoomResponse,
    RoomMemberResponse,
    RoomMessageResponse,
    RoomQuestionReplyResponse,
    RoomQuestionResponse,
    RoomResourceResponse,
    SendMessageRequest,
    StartStudySessionRequest,
    UpdateStudyStatusRequest,
)
from app.services.community import community_service

router = APIRouter(tags=["Community Learning & Study Rooms"])


@router.get(
    "/rooms",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    summary="List all community study rooms with search & filter",
)
async def get_rooms(
    db: DatabaseDep,
    current_user: OptionalUserDep,
    search: str | None = Query(None, description="Search by room name, topic, description, or roadmap"),
    category: str | None = Query(None, description="Filter by category"),
    topic: str | None = Query(None, description="Filter by topic"),
    roadmap: str | None = Query(None, description="Filter by related roadmap"),
    is_private: bool | None = Query(None, description="Filter by public (false) or private (true)"),
) -> list[LearningRoomResponse]:
    """Retrieve community learning rooms with member counts, search filters, and membership indicators."""
    user_id = current_user.id if current_user else None
    return await community_service.get_rooms(
        db,
        user_id=user_id,
        search=search,
        category=category,
        topic=topic,
        roadmap=roadmap,
        is_private=is_private,
    )


@router.get(
    "/rooms/recommended",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    summary="Get smart recommended study rooms",
)
async def get_recommended_rooms(
    db: DatabaseDep,
    current_user: OptionalUserDep,
    active_roadmap: str | None = Query(None, description="Current active roadmap title"),
    interests: str | None = Query(None, description="Comma-separated interests"),
) -> list[LearningRoomResponse]:
    """Return rooms recommended based on user's active roadmap, topics, and learning goals."""
    user_id = current_user.id if current_user else None
    return await community_service.get_recommended_rooms(
        db,
        user_id=user_id,
        active_roadmap=active_roadmap,
        interests=interests,
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


@router.post(
    "/rooms",
    response_model=LearningRoomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new study room",
)
async def create_room(
    room_data: CreateRoomRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> LearningRoomResponse:
    """Create a public or private study room and register the creator as member."""
    return await community_service.create_room(
        db,
        user_id=current_user.id,
        room_data=room_data,
    )


@router.post(
    "/rooms/join-by-code",
    response_model=JoinRoomResponse,
    status_code=status.HTTP_200_OK,
    summary="Join a study room via invite code or link",
)
async def join_room_by_code(
    payload: JoinByCodeRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> JoinRoomResponse:
    """Join a study room using a 6-8 character code or link."""
    try:
        return await community_service.join_room_by_code(
            db,
            user_id=current_user.id,
            code_input=payload.code,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/rooms/{room_id_or_slug}",
    response_model=LearningRoomResponse,
    status_code=status.HTTP_200_OK,
    summary="Get study room details",
)
async def get_room_detail(
    room_id_or_slug: str,
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> LearningRoomResponse:
    """Retrieve details of a single study room."""
    user_id = current_user.id if current_user else None
    try:
        return await community_service.get_room_by_id_or_slug(
            db,
            room_id_or_slug=room_id_or_slug,
            user_id=user_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


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
    "/rooms/{room_id}/members",
    response_model=list[RoomMemberResponse],
    status_code=status.HTTP_200_OK,
    summary="Get members of a study room",
)
async def get_room_members(
    room_id: int,
    db: DatabaseDep,
) -> list[RoomMemberResponse]:
    """Retrieve list of members and their study status in a room."""
    return await community_service.get_room_members(db, room_id=room_id)


@router.put(
    "/rooms/{room_id}/study-status",
    response_model=RoomMemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current study status in a room",
)
async def update_study_status(
    room_id: int,
    payload: UpdateStudyStatusRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomMemberResponse:
    """Update current user's study status message in the room."""
    try:
        return await community_service.update_study_status(
            db,
            room_id=room_id,
            user_id=current_user.id,
            study_status=payload.study_status,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/rooms/{room_id}/session/start",
    response_model=LearningRoomResponse,
    status_code=status.HTTP_200_OK,
    summary="Start a synchronized study focus session",
)
async def start_study_session(
    room_id: int,
    payload: StartStudySessionRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> LearningRoomResponse:
    """Start an active study focus session with a designated topic."""
    try:
        return await community_service.start_study_session(
            db,
            room_id=room_id,
            user_id=current_user.id,
            topic=payload.topic,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/rooms/{room_id}/session/end",
    response_model=LearningRoomResponse,
    status_code=status.HTTP_200_OK,
    summary="End an ongoing study session",
)
async def end_study_session(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> LearningRoomResponse:
    """End the ongoing study session in the room."""
    try:
        return await community_service.end_study_session(
            db,
            room_id=room_id,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/rooms/{room_id}/messages",
    response_model=list[RoomMessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Get discussion chat messages for a room",
)
async def get_room_messages(
    room_id: int,
    db: DatabaseDep,
    limit: int = Query(60, ge=1, le=200),
) -> list[RoomMessageResponse]:
    """Retrieve discussion chat history."""
    return await community_service.get_messages(db, room_id=room_id, limit=limit)


@router.post(
    "/rooms/{room_id}/messages",
    response_model=RoomMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a discussion chat message",
)
async def send_room_message(
    room_id: int,
    payload: SendMessageRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomMessageResponse:
    """Post a new message in the room's discussion thread."""
    try:
        return await community_service.create_message(
            db,
            room_id=room_id,
            user_id=current_user.id,
            content=payload.content,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/rooms/{room_id}/questions",
    response_model=list[RoomQuestionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get learning questions for a room",
)
async def get_room_questions(
    room_id: int,
    db: DatabaseDep,
) -> list[RoomQuestionResponse]:
    """Retrieve learning questions and replies in the room."""
    return await community_service.get_questions(db, room_id=room_id)


@router.post(
    "/rooms/{room_id}/questions",
    response_model=RoomQuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ask a new learning question",
)
async def create_room_question(
    room_id: int,
    payload: CreateQuestionRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomQuestionResponse:
    """Ask a question in the room Q&A section."""
    return await community_service.create_question(
        db,
        room_id=room_id,
        user_id=current_user.id,
        question_data=payload,
    )


@router.post(
    "/rooms/{room_id}/questions/{question_id}/replies",
    response_model=RoomQuestionReplyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reply to a learning question",
)
async def reply_room_question(
    room_id: int,
    question_id: int,
    payload: CreateQuestionReplyRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomQuestionReplyResponse:
    """Post an answer or response to a question."""
    try:
        return await community_service.create_question_reply(
            db,
            room_id=room_id,
            question_id=question_id,
            user_id=current_user.id,
            reply_data=payload,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put(
    "/rooms/{room_id}/questions/{question_id}/resolve",
    response_model=RoomQuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle question resolved status",
)
async def toggle_question_resolved(
    room_id: int,
    question_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomQuestionResponse:
    """Toggle a question between Open and Resolved."""
    try:
        return await community_service.toggle_question_resolved(
            db,
            room_id=room_id,
            question_id=question_id,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/rooms/{room_id}/resources",
    response_model=list[RoomResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get shared study resources in a room",
)
async def get_room_resources(
    room_id: int,
    db: DatabaseDep,
) -> list[RoomResourceResponse]:
    """Retrieve videos, links, notes, and PDFs shared in the room."""
    return await community_service.get_resources(db, room_id=room_id)


@router.post(
    "/rooms/{room_id}/resources",
    response_model=RoomResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Share a resource in the study room",
)
async def create_room_resource(
    room_id: int,
    payload: CreateResourceRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomResourceResponse:
    """Share a video, link, note, or PDF with room peers."""
    return await community_service.create_resource(
        db,
        room_id=room_id,
        user_id=current_user.id,
        resource_data=payload,
    )
