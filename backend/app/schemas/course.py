"""Pydantic schemas for Course entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel


class CourseBase(CustomBaseModel):
    """Base fields for Course schema."""

    title: str = Field(description="Course title", max_length=255)
    description: str | None = Field(default=None, description="Course description")
    platform: str | None = Field(default=None, description="Hosting platform or source", max_length=100)
    instructor: str | None = Field(default=None, description="Instructor name", max_length=255)
    duration: str | None = Field(default=None, description="Course duration", max_length=100)
    skill_id: int = Field(description="ID of associated skill")


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
    skill_id: int | None = None


class CourseResponse(CourseBase):
    """Schema for Course response."""

    id: int = Field(description="Unique course ID")
    created_at: datetime = Field(description="Timestamp when course was created")
