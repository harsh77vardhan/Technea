"""Pydantic schemas for RoadmapStep entity."""

from typing import Any
from datetime import datetime
from pydantic import Field, field_validator, model_validator

from app.schemas.common import CustomBaseModel


class RoadmapStepBase(CustomBaseModel):
    """Base fields for RoadmapStep schema."""

    step_number: int = Field(ge=1, description="Sequential step number")
    title: str = Field(description="Step title", max_length=255)
    description: str | None = Field(default=None, description="Optional step description")
    topics: list[str] = Field(default_factory=list, description="Subtopics or concepts covered in this step")
    topics_covered: list[str] = Field(default_factory=list, description="Backward-compatible alias for topics")
    duration: str | None = Field(default=None, description="Estimated duration for step", max_length=100)
    project_idea: str | None = Field(default=None, description="Suggested practical project idea or exercise")
    resources: list[dict] = Field(default_factory=list, description="Curated resources for this step")

    @field_validator("topics", "topics_covered", "resources", mode="before")
    @classmethod
    def ensure_lists(cls, v: Any) -> list:
        return v if v is not None else []

    @model_validator(mode="before")
    @classmethod
    def sync_topics(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "topics" in data and not data.get("topics_covered"):
                data["topics_covered"] = data["topics"]
            elif "topics_covered" in data and not data.get("topics"):
                data["topics"] = data["topics_covered"]
        return data


class RoadmapStepCreate(RoadmapStepBase):
    """Schema for creating a RoadmapStep."""

    learning_path_id: int = Field(description="Associated learning path ID")


class RoadmapStepUpdate(CustomBaseModel):
    """Schema for updating a RoadmapStep."""

    step_number: int | None = Field(default=None, ge=1)
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    topics: list[str] | None = None
    duration: str | None = Field(default=None, max_length=100)
    project_idea: str | None = None
    resources: list[dict] | None = None


class RoadmapStepResponse(RoadmapStepBase):
    """Schema for RoadmapStep response."""

    id: int = Field(description="Unique step ID")
    learning_path_id: int = Field(description="Associated learning path ID")
    created_at: datetime = Field(description="Timestamp when step was created")
