"""Pydantic schemas for LearningPath entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel
from app.schemas.roadmap_step import RoadmapStepResponse


class LearningPathBase(CustomBaseModel):
    """Base fields for LearningPath schema."""

    title: str = Field(description="Learning path title", max_length=255)
    description: str | None = Field(default=None, description="Optional path description")
    category: str = Field(description="Category (e.g. Programming, AI & ML)", max_length=100)
    level: str = Field(description="Skill level (e.g. Beginner, Intermediate)", max_length=50)
    duration: str | None = Field(default=None, description="Estimated duration (e.g. 4 weeks)", max_length=100)
    skill_id: int | None = Field(default=None, description="Optional associated skill ID")


class LearningPathCreate(LearningPathBase):
    """Schema for creating a LearningPath."""

    pass


class LearningPathUpdate(CustomBaseModel):
    """Schema for updating a LearningPath."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    level: str | None = Field(default=None, max_length=50)
    duration: str | None = Field(default=None, max_length=100)
    skill_id: int | None = None


class LearningPathResponse(LearningPathBase):
    """Schema for LearningPath response."""

    id: int = Field(description="Unique learning path ID")
    created_at: datetime = Field(description="Timestamp when path was created")
    roadmap_steps: list[RoadmapStepResponse] = Field(
        default_factory=list,
        description="Sequential steps belonging to this learning path",
    )
