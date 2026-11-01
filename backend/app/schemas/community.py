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

    model_config = ConfigDict(from_attributes=True)


class UpdateStudyStatusRequest(BaseModel):
    """Request payload to update current study status."""

    study_status: str = Field(..., min_length=1, max_length=255)


class StartStudySessionRequest(BaseModel):
    """Request payload to initiate a synchronized study focus session."""

    topic: str = Field(..., min_length=1, max_length=255)


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
    """Schema for a shared study resource (video, link, note, PDF)."""

    id: int
    room_id: int
    user_id: uuid.UUID
    user_name: str
    user_avatar: str | None = None
    title: str
    resource_type: str  # 'video', 'link', 'note', 'pdf'
    url_or_content: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateResourceRequest(BaseModel):
    """Request payload to share a learning resource."""

    title: str = Field(..., min_length=2, max_length=255)
    resource_type: str = Field(..., pattern="^(video|link|note|pdf)$")
    url_or_content: str = Field(..., min_length=1, max_length=10000)
    description: str | None = Field(None, max_length=1000)
