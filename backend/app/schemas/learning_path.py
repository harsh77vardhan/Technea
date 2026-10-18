from typing import Any
from datetime import datetime
from pydantic import Field, field_validator

from app.schemas.common import CustomBaseModel
from app.schemas.roadmap_step import RoadmapStepResponse


class LearningPathBase(CustomBaseModel):
    """Base fields for LearningPath schema."""

    title: str = Field(description="Learning path title", max_length=255)
    description: str | None = Field(default=None, description="Optional path description")
    category: str = Field(description="Category (e.g. Programming, AI & ML)", max_length=100)
    level: str = Field(description="Skill level (e.g. Beginner, Intermediate)", max_length=50)
    difficulty: str | None = Field(default=None, description="Difficulty level alias (synced with level)", max_length=50)
    duration: str | None = Field(default=None, description="Estimated duration (e.g. 4 weeks)", max_length=100)
    projects: list[dict] = Field(default_factory=list, description="Capstone projects")
    search_terms: list[str] = Field(default_factory=list, description="Searchable keywords and terms")
    related_concepts: list[str] = Field(default_factory=list, description="Related technical concepts")
    goal: str | None = Field(default="Job", description="Primary goal", max_length=50)
    goals: list[str] = Field(default_factory=list, description="Applicable goals")
    style: str | None = Field(default="Projects", description="Primary learning style", max_length=50)
    styles: list[str] = Field(default_factory=list, description="Applicable styles")
    language: str | None = Field(default="English", description="Primary language", max_length=50)
    languages: list[str] = Field(default_factory=list, description="Supported languages")
    skill_id: int | None = Field(default=None, description="Optional associated skill ID")

    @field_validator("projects", "search_terms", "related_concepts", "goals", "styles", "languages", mode="before")
    @classmethod
    def ensure_lists(cls, v: Any) -> list:
        return v if v is not None else []


class LearningPathCreate(LearningPathBase):
    """Schema for creating a LearningPath."""

    pass


class LearningPathUpdate(CustomBaseModel):
    """Schema for updating a LearningPath."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    level: str | None = Field(default=None, max_length=50)
    difficulty: str | None = Field(default=None, max_length=50)
    duration: str | None = Field(default=None, max_length=100)
    projects: list[dict] | None = None
    search_terms: list[str] | None = None
    related_concepts: list[str] | None = None
    goal: str | None = None
    goals: list[str] | None = None
    style: str | None = None
    styles: list[str] | None = None
    language: str | None = None
    languages: list[str] | None = None
    skill_id: int | None = None


class LearningPathResponse(LearningPathBase):
    """Schema for LearningPath response."""

    id: int = Field(description="Unique learning path ID")
    created_at: datetime = Field(description="Timestamp when path was created")
    roadmap_steps: list[RoadmapStepResponse] = Field(
        default_factory=list,
        description="Sequential steps belonging to this learning path",
    )
