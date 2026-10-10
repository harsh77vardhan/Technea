"""Pydantic schemas for Lesson entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel


class LessonBase(CustomBaseModel):
    """Base fields for Lesson schema."""

    title: str = Field(description="Lesson title", max_length=255)
    description: str | None = Field(default=None, description="Lesson description")
    youtube_video_id: str = Field(description="YouTube Video ID (11 characters)", max_length=100)
    youtube_url: str | None = Field(default=None, description="Direct YouTube video URL", max_length=500)
    thumbnail_url: str | None = Field(default=None, description="Thumbnail URL", max_length=500)
    duration: str | None = Field(default=None, description="Lesson duration (e.g. 15 mins)", max_length=100)
    lesson_order: int = Field(default=1, description="Sequential order within the course/playlist")
    course_id: int = Field(description="ID of associated course")


class LessonCreate(LessonBase):
    """Schema for creating a Lesson."""

    pass


class LessonUpdate(CustomBaseModel):
    """Schema for updating a Lesson."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    youtube_video_id: str | None = Field(default=None, max_length=100)
    youtube_url: str | None = Field(default=None, max_length=500)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    duration: str | None = Field(default=None, max_length=100)
    lesson_order: int | None = None
    course_id: int | None = None


class LessonResponse(LessonBase):
    """Schema for Lesson response."""

    id: int = Field(description="Unique lesson ID")
    created_at: datetime = Field(description="Timestamp when lesson was created")
