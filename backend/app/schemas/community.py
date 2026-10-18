"""Pydantic schemas for Community Learning Rooms."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LearningRoomResponse(BaseModel):
    """Schema representing a peer learning room."""

    id: int
    name: str
    slug: str
    description: str
    category: str
    active_learners_count: int
    icon: str
    is_joined: bool = False
    joined_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class JoinRoomResponse(BaseModel):
    """Response after joining or leaving a room."""

    room_id: int
    is_joined: bool
    active_learners_count: int
    message: str
