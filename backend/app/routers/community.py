import asyncio
import json
import logging
from typing import Any
import uuid

from fastapi import APIRouter, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import async_session_maker
from app.models.user import User
from app.services.signaling import signaling_manager

logger = logging.getLogger("technea.community")
from app.schemas.community import (
    CodeSnippetResponse,
    CreateQuestionReplyRequest,
    CreateQuestionRequest,
    CreateResourceRequest,
    CreateRoomRequest,
    JoinByCodeRequest,
    JoinRoomResponse,
    LearningRoomResponse,
    RoomMemberResponse,
    RoomMessageResponse,
    RoomNotificationResponse,
    RoomQuestionReplyResponse,
    RoomQuestionResponse,
    RoomResourceResponse,
    SendMessageRequest,
    SessionHistoryResponse,
    ShareContentRequest,
    SharedNoteResponse,
    StartStudySessionRequest,
    SyncContentResponse,
    UpdateCodeSnippetRequest,
    UpdateMemberRoleRequest,
    UpdateSharedNoteRequest,
    UpdateStudyStatusRequest,
    UpdateSyncContentRequest,
    UpdateWebRTCStatusRequest,
    UpdateWhiteboardRequest,
    WebRTCPeerResponse,
    WebRTCSignalRequest,
    WebRTCSignalResponse,
    WhiteboardResponse,
)
from app.services.community import community_service

router = APIRouter(tags=["Community Learning & Study Rooms"])


@router.get(
    "/rooms",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    summary="List all community study rooms with search & filter",
)
@router.get(
    "/rooms/",
    response_model=list[LearningRoomResponse],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
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
    current_milestone: str | None = Query(None, description="Current active milestone or module title"),
    skills: str | None = Query(None, description="Comma-separated skills"),
    interests: str | None = Query(None, description="Comma-separated interests"),
) -> list[LearningRoomResponse]:
    """Return rooms recommended based on user's active roadmap, current milestone, skills, and learning goals."""
    user_id = current_user.id if current_user else None
    return await community_service.get_recommended_rooms(
        db,
        user_id=user_id,
        active_roadmap=active_roadmap,
        current_milestone=current_milestone,
        skills=skills,
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
@router.post(
    "/rooms/",
    response_model=LearningRoomResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
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
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=err_msg,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
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
    summary="Update current study status and presence in a room",
)
async def update_study_status(
    room_id: int,
    payload: UpdateStudyStatusRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomMemberResponse:
    """Update current user's study status message and presence state in the room."""
    try:
        return await community_service.update_study_status(
            db,
            room_id=room_id,
            user_id=current_user.id,
            study_status=payload.study_status,
            study_state=payload.study_state,
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
    summary="Start a synchronized study focus session with Pomodoro timer",
)
async def start_study_session(
    room_id: int,
    payload: StartStudySessionRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> LearningRoomResponse:
    """Start an active study focus session with a designated topic, host, and Pomodoro timer."""
    try:
        return await community_service.start_study_session(
            db,
            room_id=room_id,
            user_id=current_user.id,
            topic=payload.topic,
            timer_type=payload.timer_type,
            timer_mode=payload.timer_mode,
            duration_minutes=payload.duration_minutes,
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


@router.get(
    "/rooms/{room_id}/history",
    response_model=list[SessionHistoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get room previous study sessions history",
)
async def get_room_session_history(
    room_id: int,
    db: DatabaseDep,
) -> list[SessionHistoryResponse]:
    """Retrieve historical log of study focus sessions held in the room."""
    return await community_service.get_session_history(db, room_id=room_id)


@router.get(
    "/rooms/{room_id}/notes",
    response_model=SharedNoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Get room collaborative shared notes",
)
async def get_room_shared_notes(
    room_id: int,
    db: DatabaseDep,
) -> SharedNoteResponse:
    """Retrieve the collaborative shared notes document for the room."""
    return await community_service.get_shared_note(db, room_id=room_id)


@router.put(
    "/rooms/{room_id}/notes",
    response_model=SharedNoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Update room collaborative shared notes",
)
async def update_room_shared_notes(
    room_id: int,
    payload: UpdateSharedNoteRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> SharedNoteResponse:
    """Save updates to collaborative shared notes in the room."""
    return await community_service.save_shared_note(
        db,
        room_id=room_id,
        user_id=current_user.id,
        note_data=payload,
    )


@router.post(
    "/rooms/{room_id}/share-content",
    response_model=RoomResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Share Technea learning content (Course, Lesson, Roadmap step)",
)
async def share_room_content(
    room_id: int,
    payload: ShareContentRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomResourceResponse:
    """Share a Technea learning module, lesson, or roadmap step card inside the room."""
    return await community_service.share_learning_content(
        db,
        room_id=room_id,
        user_id=current_user.id,
        content_data=payload,
    )


@router.get(
    "/rooms/{room_id}/notifications",
    response_model=list[RoomNotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get recent room in-app notifications",
)
async def get_room_notifications(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> list[RoomNotificationResponse]:
    """Retrieve recent notifications for the room."""
    return await community_service.get_room_notifications(
        db,
        room_id=room_id,
        user_id=current_user.id,
    )


@router.post(
    "/rooms/{room_id}/notifications/read",
    status_code=status.HTTP_200_OK,
    summary="Mark room notifications as read",
)
async def mark_room_notifications_read(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> dict:
    """Mark all unread notifications in this room as read."""
    return await community_service.mark_room_notifications_read(
        db,
        room_id=room_id,
        user_id=current_user.id,
    )


# ==========================================
# Phase 3: Collaborative Learning Endpoints
# ==========================================


@router.put(
    "/rooms/{room_id}/members/{user_id}/role",
    response_model=RoomMemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Update room member role (owner, host, moderator, member)",
)
async def update_member_role(
    room_id: int,
    user_id: uuid.UUID,
    payload: UpdateMemberRoleRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoomMemberResponse:
    """Update role for a member with permission gating."""
    try:
        return await community_service.update_member_role(
            db,
            room_id=room_id,
            target_user_id=user_id,
            role=payload.role,
            requester_id=current_user.id,
        )
    except ValueError as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=err_msg,
            )
        if "permission denied" in err_msg.lower() or "not a member" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=err_msg,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )


@router.get(
    "/rooms/{room_id}/sync-content",
    response_model=SyncContentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current synchronized content playback state",
)
async def get_sync_content(
    room_id: int,
    db: DatabaseDep,
) -> SyncContentResponse:
    """Get playback state (video url, is_playing, timestamp, speed)."""
    try:
        return await community_service.get_sync_content(db, room_id=room_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/rooms/{room_id}/sync-content",
    response_model=SyncContentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update synchronized content playback",
)
async def update_sync_content(
    room_id: int,
    payload: UpdateSyncContentRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> SyncContentResponse:
    """Update synchronized playback status (play/pause/seek/speed)."""
    try:
        return await community_service.update_sync_content(
            db,
            room_id=room_id,
            user_id=current_user.id,
            data=payload,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/rooms/{room_id}/code",
    response_model=CodeSnippetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get collaborative code snippet",
)
async def get_code_snippet(
    room_id: int,
    db: DatabaseDep,
) -> CodeSnippetResponse:
    """Fetch collaborative room code snippet."""
    try:
        return await community_service.get_code_snippet(db, room_id=room_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/rooms/{room_id}/code",
    response_model=CodeSnippetResponse,
    status_code=status.HTTP_200_OK,
    summary="Update collaborative code snippet",
)
async def update_code_snippet(
    room_id: int,
    payload: UpdateCodeSnippetRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> CodeSnippetResponse:
    """Update collaborative code snippet."""
    try:
        return await community_service.update_code_snippet(
            db,
            room_id=room_id,
            user_id=current_user.id,
            data=payload,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/rooms/{room_id}/whiteboard",
    response_model=WhiteboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get collaborative whiteboard state",
)
async def get_whiteboard(
    room_id: int,
    db: DatabaseDep,
) -> WhiteboardResponse:
    """Fetch collaborative whiteboard state."""
    try:
        return await community_service.get_whiteboard(db, room_id=room_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/rooms/{room_id}/whiteboard",
    response_model=WhiteboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Update collaborative whiteboard state",
)
async def update_whiteboard(
    room_id: int,
    payload: UpdateWhiteboardRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> WhiteboardResponse:
    """Update collaborative whiteboard state."""
    try:
        return await community_service.update_whiteboard(
            db,
            room_id=room_id,
            user_id=current_user.id,
            data=payload,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/rooms/{room_id}/webrtc/join",
    response_model=WebRTCPeerResponse,
    status_code=status.HTTP_200_OK,
    summary="Join live voice/video session",
)
async def join_webrtc_call(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> WebRTCPeerResponse:
    """Join live voice/video session as an active peer."""
    return await community_service.join_webrtc_call(
        db,
        room_id=room_id,
        user_id=current_user.id,
    )


@router.post(
    "/rooms/{room_id}/webrtc/leave",
    status_code=status.HTTP_200_OK,
    summary="Leave live voice/video session",
)
async def leave_webrtc_call(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> dict:
    """Leave live voice/video session."""
    return await community_service.leave_webrtc_call(
        db,
        room_id=room_id,
        user_id=current_user.id,
    )


@router.post(
    "/rooms/{room_id}/webrtc/status",
    response_model=WebRTCPeerResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user voice/video/screen share status",
)
async def update_webrtc_status(
    room_id: int,
    payload: UpdateWebRTCStatusRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> WebRTCPeerResponse:
    """Update audio mute, camera on/off, screen share state."""
    return await community_service.update_webrtc_status(
        db,
        room_id=room_id,
        user_id=current_user.id,
        data=payload,
    )


@router.get(
    "/rooms/{room_id}/webrtc/peers",
    response_model=list[WebRTCPeerResponse],
    status_code=status.HTTP_200_OK,
    summary="Get active live voice/video peers",
)
async def get_webrtc_peers(
    room_id: int,
    db: DatabaseDep,
) -> list[WebRTCPeerResponse]:
    """Retrieve all peers currently in the live session."""
    return await community_service.get_active_peers(db, room_id=room_id)


@router.post(
    "/rooms/{room_id}/webrtc/signal",
    response_model=WebRTCSignalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send WebRTC signaling message",
)
async def send_webrtc_signal(
    room_id: int,
    payload: WebRTCSignalRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> WebRTCSignalResponse:
    """Relay WebRTC signaling message (SDP offer/answer, candidate)."""
    return await community_service.send_webrtc_signal(
        db,
        room_id=room_id,
        sender_id=current_user.id,
        data=payload,
    )


@router.get(
    "/rooms/{room_id}/webrtc/signals",
    response_model=list[WebRTCSignalResponse],
    status_code=status.HTTP_200_OK,
    summary="Get pending WebRTC signaling messages",
)
async def get_webrtc_signals(
    room_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
    since_id: int = Query(0, ge=0),
) -> list[WebRTCSignalResponse]:
    """Poll for incoming WebRTC signaling messages."""
    return await community_service.get_webrtc_signals(
        db,
        room_id=room_id,
        user_id=current_user.id,
        since_id=since_id,
    )


@router.get(
    "/rooms/{room_id}/ice-servers",
    summary="Get STUN/TURN ICE servers for WebRTC",
)
async def get_room_ice_servers(
    room_id: int,
) -> dict[str, Any]:
    """Returns standard public STUN servers and optional TURN servers configured via environment."""
    return {"iceServers": settings.get_ice_servers()}


@router.websocket("/rooms/{room_id}/signal")
@router.websocket("/rooms/{room_id}/ws")
async def websocket_signaling_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str | None = Query(None),
):
    """Full-duplex WebSocket signaling server for WebRTC mesh calls in Study Rooms."""
    # 1. Authenticate token
    raw_token = token
    if not raw_token:
        auth_hdr = websocket.headers.get("authorization")
        if auth_hdr and auth_hdr.startswith("Bearer "):
            raw_token = auth_hdr.split(" ")[1]

    if not raw_token:
        await websocket.accept()
        try:
            first_msg_raw = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
            first_msg = json.loads(first_msg_raw)
            if first_msg.get("type") == "auth" and first_msg.get("token"):
                raw_token = first_msg["token"]
            else:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    token_payload = decode_access_token(raw_token)
    if not token_payload or "sub" not in token_payload:
        try:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        except Exception:
            pass
        return

    try:
        user_id = uuid.UUID(str(token_payload["sub"]))
    except (ValueError, TypeError):
        try:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        except Exception:
            pass
        return

    # 2. Fetch user information and record room join in DB
    user_info = {"full_name": "Learner", "avatar_url": None}
    try:
        async with async_session_maker() as db:
            user_stmt = select(User).where(User.id == user_id)
            res = await db.execute(user_stmt)
            user = res.scalar_one_or_none()
            if user:
                user_info["full_name"] = user.full_name or "Learner"
                user_info["avatar_url"] = user.avatar_url
            await community_service.join_webrtc_call(db, room_id=room_id, user_id=user_id)
    except Exception as exc:
        logger.warning(f"Could not update DB for webrtc join: {exc}")

    # 3. Register in signaling manager
    if websocket.client_state.name != "CONNECTED":
        await signaling_manager.connect(room_id, user_id, websocket, user_info)
    else:
        async with signaling_manager._lock:
            if room_id not in signaling_manager._rooms:
                signaling_manager._rooms[room_id] = {}
                signaling_manager._peer_meta[room_id] = {}
            signaling_manager._rooms[room_id][user_id] = websocket
            signaling_manager._peer_meta[room_id][user_id] = {
                "user_id": str(user_id),
                "user_name": user_info["full_name"],
                "avatar_url": user_info.get("avatar_url"),
                "is_audio_active": True,
                "is_muted": False,
                "is_video_active": False,
                "is_screen_sharing": False,
            }

    # 4. Fetch existing peers in room and send 'welcome' to connecting user
    existing_peers = await signaling_manager.get_room_peers(room_id, exclude_user_id=user_id)
    welcome_msg = {
        "type": "welcome",
        "user_id": str(user_id),
        "user_name": user_info["full_name"],
        "peers": existing_peers,
    }
    await websocket.send_text(json.dumps(welcome_msg))

    # 5. Broadcast 'peer-joined' to all other peers in the room
    peer_joined_msg = {
        "type": "peer-joined",
        "user_id": str(user_id),
        "user_name": user_info["full_name"],
        "avatar_url": user_info.get("avatar_url"),
        "is_audio_active": True,
        "is_muted": False,
        "is_video_active": False,
        "is_screen_sharing": False,
    }
    await signaling_manager.broadcast(room_id, peer_joined_msg, exclude_user_id=user_id)

    # 6. Event loop to process WebRTC signals
    try:
        while True:
            text = await websocket.receive_text()
            try:
                data = json.loads(text)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            elif msg_type == "offer":
                target_id_str = data.get("target_user_id")
                if target_id_str:
                    try:
                        target_uid = uuid.UUID(target_id_str)
                        await signaling_manager.send_to_peer(
                            room_id,
                            target_uid,
                            {
                                "type": "offer",
                                "from_user_id": str(user_id),
                                "from_user_name": user_info["full_name"],
                                "target_user_id": str(target_uid),
                                "sdp": data.get("sdp"),
                            },
                        )
                    except (ValueError, TypeError) as exc:
                        logger.warning(f"Invalid target UUID in offer: {exc}")

            elif msg_type == "answer":
                target_id_str = data.get("target_user_id")
                if target_id_str:
                    try:
                        target_uid = uuid.UUID(target_id_str)
                        await signaling_manager.send_to_peer(
                            room_id,
                            target_uid,
                            {
                                "type": "answer",
                                "from_user_id": str(user_id),
                                "from_user_name": user_info["full_name"],
                                "target_user_id": str(target_uid),
                                "sdp": data.get("sdp"),
                            },
                        )
                    except (ValueError, TypeError) as exc:
                        logger.warning(f"Invalid target UUID in answer: {exc}")

            elif msg_type == "ice-candidate":
                target_id_str = data.get("target_user_id")
                if target_id_str:
                    try:
                        target_uid = uuid.UUID(target_id_str)
                        await signaling_manager.send_to_peer(
                            room_id,
                            target_uid,
                            {
                                "type": "ice-candidate",
                                "from_user_id": str(user_id),
                                "target_user_id": str(target_uid),
                                "candidate": data.get("candidate"),
                            },
                        )
                    except (ValueError, TypeError) as exc:
                        logger.warning(f"Invalid target UUID in candidate: {exc}")

            elif msg_type == "media-status":
                is_audio = bool(data.get("is_audio_active", True))
                is_muted = bool(data.get("is_muted", False))
                is_video = bool(data.get("is_video_active", False))
                is_screen = bool(data.get("is_screen_sharing", False))

                await signaling_manager.update_peer_media_status(
                    room_id=room_id,
                    user_id=user_id,
                    is_audio_active=is_audio,
                    is_muted=is_muted,
                    is_video_active=is_video,
                    is_screen_sharing=is_screen,
                )

                status_msg = {
                    "type": "media-status",
                    "user_id": str(user_id),
                    "is_audio_active": is_audio,
                    "is_muted": is_muted,
                    "is_video_active": is_video,
                    "is_screen_sharing": is_screen,
                }
                await signaling_manager.broadcast(room_id, status_msg, exclude_user_id=user_id)

            elif msg_type == "leave":
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: user {user_id} in room {room_id}")
    except Exception as exc:
        logger.warning(f"Signaling loop error for user {user_id}: {exc}")
    finally:
        await signaling_manager.disconnect(room_id, user_id)
        leave_msg = {
            "type": "peer-left",
            "user_id": str(user_id),
        }
        await signaling_manager.broadcast(room_id, leave_msg)

        try:
            async with async_session_maker() as db:
                await community_service.leave_webrtc_call(db, room_id=room_id, user_id=user_id)
        except Exception as exc:
            logger.warning(f"Could not remove peer from DB on disconnect: {exc}")

