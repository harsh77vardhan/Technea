"""Pydantic schemas for Course entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel
from app.schemas.lesson import LessonResponse


class CourseBase(CustomBaseModel):
    """Base fields for Course schema."""

    title: str = Field(description="Course title", max_length=255)
    description: str | None = Field(default=None, description="Course description")
    platform: str | None = Field(default=None, description="Hosting platform or source", max_length=100)
    instructor: str | None = Field(default=None, description="Instructor name", max_length=255)
    duration: str | None = Field(default=None, description="Course duration", max_length=100)
    youtube_url: str | None = Field(default=None, description="Direct YouTube video or playlist URL", max_length=500)
    youtube_video_id: str | None = Field(default=None, description="YouTube Video ID for embedded player", max_length=100)
    thumbnail_url: str | None = Field(default=None, description="Thumbnail image URL", max_length=500)
    playlist_url: str | None = Field(default=None, description="Optional playlist URL", max_length=500)
    lesson_order: int | None = Field(default=None, description="Order within track")
    skill_id: int = Field(description="ID of associated skill")
    learning_path_id: int | None = Field(default=None, description="Optional ID of associated learning path")


class CourseCreate(CourseBase):
    """Schema for creating a Course."""

    pass


class CourseUpdate(CustomBaseModel):
    """Schema for updating a Course."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    platform: str | None = Field(default=None, max_length=100)
    instructor: str | None = Field(default=None, max_length=255)
    duration: str | None = Field(default=None, max_length=100)
    youtube_url: str | None = Field(default=None, max_length=500)
    youtube_video_id: str | None = Field(default=None, max_length=100)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    playlist_url: str | None = Field(default=None, max_length=500)
    lesson_order: int | None = None
    skill_id: int | None = None
    learning_path_id: int | None = None


class CourseResponse(CourseBase):
    """Schema for Course response."""

    id: int = Field(description="Unique course ID")
    created_at: datetime = Field(description="Timestamp when course was created")
    lessons: list[LessonResponse] = Field(default_factory=list, description="Ordered lessons in this course")

