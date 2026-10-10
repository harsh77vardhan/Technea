"""Pydantic schemas for RoadmapStep entity."""

from datetime import datetime
from pydantic import Field

from app.schemas.common import CustomBaseModel


class RoadmapStepBase(CustomBaseModel):
    """Base fields for RoadmapStep schema."""

    step_number: int = Field(ge=1, description="Sequential step number")
    title: str = Field(description="Step title", max_length=255)
    description: str | None = Field(default=None, description="Optional step description")


class RoadmapStepCreate(RoadmapStepBase):
    """Schema for creating a RoadmapStep."""

    learning_path_id: int = Field(description="Associated learning path ID")


class RoadmapStepResponse(RoadmapStepBase):
    """Schema for RoadmapStep response."""

    id: int = Field(description="Unique step ID")
    learning_path_id: int = Field(description="Associated learning path ID")
    created_at: datetime = Field(description="Timestamp when step was created")
