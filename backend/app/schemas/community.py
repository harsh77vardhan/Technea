"""Pydantic schemas for Community Learning Rooms and Study Rooms."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field


class LearningRoomResponse(BaseModel):
    """Schema representing a peer learning room."""

    id: int
    name: str
    slug: str
    description: str
    category: str
    topic: str = "General"
    roadmap_name: str | None = None
    is_private: bool = False
    invite_code: str | None = None
    max_members: int = 50
    created_by_id: uuid.UUID | None = None
    active_learners_count: int = 0
    icon: str = "users"
    is_joined: bool = False
    joined_at: datetime | None = None
    # Study session status
    study_session_active: bool = False
    study_session_topic: str | None = None
    study_session_started_at: datetime | None = None
    study_session_host_id: uuid.UUID | None = None
    study_session_host_name: str | None = None
    study_session_timer_type: str = "pomodoro"
    study_session_timer_mode: str = "study"
    study_session_duration_minutes: int = 25
    # Smart recommendation match reason
    recommendation_reason: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CreateRoomRequest(BaseModel):
    """Request payload to create a new study room."""

    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field("", max_length=1000)
    topic: str = Field(..., min_length=1, max_length=100)
    roadmap_name: str | None = Field(None, max_length=255)
    is_private: bool = False
    max_members: int = Field(50, ge=2, le=500)
    category: str = Field("General", max_length=100)
    icon: str = Field("users", max_length=50)


class JoinByCodeRequest(BaseModel):
    """Request payload to join a private or public room via invite code / link."""

    code: str = Field(..., min_length=2, max_length=100)


class JoinRoomResponse(BaseModel):
    """Response after joining or leaving a room."""

    room_id: int
    is_joined: bool
    active_learners_count: int
    message: str
    room: LearningRoomResponse | None = None


class RoomMemberResponse(BaseModel):
    """Schema representing a member inside a study room."""

    user_id: uuid.UUID
    full_name: str | None = None
    email: str
    avatar_url: str | None = None
    joined_at: datetime
    study_status: str | None = None
    study_state: str = "studying"  # 'studying', 'break', 'away'

    model_config = ConfigDict(from_attributes=True)


class UpdateStudyStatusRequest(BaseModel):
    """Request payload to update current study status and state."""

    study_status: str | None = Field(None, max_length=255)
    study_state: str = Field("studying", pattern="^(studying|break|away)$")


class StartStudySessionRequest(BaseModel):
    """Request payload to initiate a synchronized study focus session."""

    topic: str = Field(..., min_length=1, max_length=255)
    timer_type: str = Field("pomodoro", pattern="^(pomodoro|stopwatch)$")
    timer_mode: str = Field("study", pattern="^(study|break)$")
    duration_minutes: int = Field(25, ge=1, le=180)


class RoomMessageResponse(BaseModel):
    """Schema for a discussion chat message."""

    id: int
    room_id: int
    user_id: uuid.UUID
    user_name: str
    user_avatar: str | None = None
    content: str
    message_type: str = "chat"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SendMessageRequest(BaseModel):
    """Request payload to send a discussion message."""

    content: str = Field(..., min_length=1, max_length=4000)


class RoomQuestionReplyResponse(BaseModel):
    """Schema for a reply to a learning question."""

    id: int
    question_id: int
    user_id: uuid.UUID
    user_name: str
    user_avatar: str | None = None
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoomQuestionResponse(BaseModel):
    """Schema for a learning question with replies."""

    id: int
    room_id: int
    user_id: uuid.UUID
    user_name: str
    user_avatar: str | None = None
    title: str
    content: str
    is_resolved: bool = False
    created_at: datetime
    replies_count: int = 0
    replies: list[RoomQuestionReplyResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CreateQuestionRequest(BaseModel):
    """Request payload to post a new learning question."""

    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=3, max_length=5000)


class CreateQuestionReplyRequest(BaseModel):
    """Request payload to reply to a learning question."""

    content: str = Field(..., min_length=1, max_length=3000)


class RoomResourceResponse(BaseModel):
    """Schema for a shared study resource (video, link, note, PDF, or Technea content)."""

    id: int
    room_id: int
    user_id: uuid.UUID
    user_name: str
    user_avatar: str | None = None
    title: str
    resource_type: str  # 'video', 'link', 'note', 'pdf', 'course', 'lesson', 'roadmap_step'
    url_or_content: str
    description: str | None = None
    content_badge: str | None = None
    action_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateResourceRequest(BaseModel):
    """Request payload to share a learning resource."""

    title: str = Field(..., min_length=2, max_length=255)
    resource_type: str = Field(..., pattern="^(video|link|note|pdf|course|lesson|roadmap_step)$")
    url_or_content: str = Field(..., min_length=1, max_length=10000)
    description: str | None = Field(None, max_length=1000)
    content_badge: str | None = Field(None, max_length=100)
    action_url: str | None = Field(None, max_length=500)


class ShareContentRequest(BaseModel):
    """Request payload to share Technea learning content (Course, Lesson, Roadmap step)."""

    title: str = Field(..., min_length=2, max_length=255)
    content_type: str = Field(..., pattern="^(course|lesson|roadmap_step)$")
    content_badge: str = Field(..., min_length=1, max_length=100)
    action_url: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(None, max_length=1000)


class SharedNoteResponse(BaseModel):
    """Schema for collaborative room notes."""

    id: int
    room_id: int
    title: str = "Shared Notes"
    content: str = ""
    last_edited_by_id: uuid.UUID | None = None
    last_edited_by_name: str | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateSharedNoteRequest(BaseModel):
    """Request payload to update collaborative room notes."""

    title: str | None = Field(None, max_length=255)
    content: str = Field(..., max_length=50000)


class SessionHistoryResponse(BaseModel):
    """Schema for a historical study session record."""

    id: int
    room_id: int
    host_user_id: uuid.UUID | None = None
    host_name: str
    topic: str
    duration_minutes: int
    participants_count: int
    ended_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoomNotificationResponse(BaseModel):
    """Schema for an in-app room notification."""

    id: int
    room_id: int
    user_id: uuid.UUID | None = None
    actor_name: str
    title: str
    message: str
    notification_type: str = "info"  # 'session_started', 'member_joined', 'question_reply', 'content_shared', 'note_updated'
    link_url: str | None = None
    is_read: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
