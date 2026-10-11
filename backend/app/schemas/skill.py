from typing import Any
from datetime import datetime
from pydantic import Field, field_validator

from app.schemas.common import CustomBaseModel


class SkillBase(CustomBaseModel):
    """Base fields for Skill schema."""

    name: str = Field(description="Skill name", max_length=255)
    category: str = Field(description="Skill category", max_length=255)
    description: str | None = Field(default=None, description="Optional skill description")
    tags: list[str] = Field(default_factory=list, description="Associated skill tags")
    keywords: list[str] = Field(default_factory=list, description="Search keywords")
    aliases: list[str] = Field(default_factory=list, description="Alternative names / aliases")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisite skill names")
    recommended_next: list[str] = Field(default_factory=list, description="Recommended next skills")

    @field_validator("tags", "keywords", "aliases", "prerequisites", "recommended_next", mode="before")
    @classmethod
    def ensure_lists(cls, v: Any) -> list[str]:
        return v if v is not None else []


class SkillCreate(SkillBase):
    """Schema for creating a Skill."""

    pass


class SkillUpdate(CustomBaseModel):
    """Schema for updating a Skill."""

    name: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=255)
    description: str | None = None
    tags: list[str] | None = None
    keywords: list[str] | None = None
    aliases: list[str] | None = None
    prerequisites: list[str] | None = None
    recommended_next: list[str] | None = None


class SkillResponse(SkillBase):
    """Schema for Skill response."""

    id: int = Field(description="Unique skill ID")
    created_at: datetime = Field(description="Timestamp when skill was created")
