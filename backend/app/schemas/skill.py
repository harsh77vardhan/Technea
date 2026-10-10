"""Pydantic schemas for Skill entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel


class SkillBase(CustomBaseModel):
    """Base fields for Skill schema."""

    name: str = Field(description="Skill name", max_length=255)
    category: str = Field(description="Skill category", max_length=255)
    description: str | None = Field(default=None, description="Optional skill description")


class SkillCreate(SkillBase):
    """Schema for creating a Skill."""

    pass


class SkillUpdate(CustomBaseModel):
    """Schema for updating a Skill."""

    name: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=255)
    description: str | None = None


class SkillResponse(SkillBase):
    """Schema for Skill response."""

    id: int = Field(description="Unique skill ID")
    created_at: datetime = Field(description="Timestamp when skill was created")
