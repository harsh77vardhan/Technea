"""Pydantic schemas for Projects and Project Recommendations."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ProjectResponse(BaseModel):
    """Schema representing a hands-on technical project."""

    id: int
    title: str
    description: str
    difficulty: str
    estimated_time: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    related_paths: list[str] = Field(default_factory=list)
    milestones: list[str] = Field(default_factory=list)
    skill_id: int | None = None
    learning_path_id: int | None = None
    user_status: str = "not_started"  # not_started | in_progress | completed
    github_url: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserProjectStatusUpdateRequest(BaseModel):
    """Schema for updating a user's progress on a project."""

    status: str = Field(..., description="'in_progress' or 'completed'")
    github_url: str | None = Field(default=None, description="Optional GitHub repository link")
    notes: str | None = Field(default=None, description="Optional notes or deployment URL")


class ProjectRecommendationResponse(BaseModel):
    """Schema containing tailored project recommendations based on mastered skills."""

    recommended_projects: list[ProjectResponse] = Field(default_factory=list)
    trigger_reason: str = Field(..., description="Pedagogical explanation for why these projects are recommended")
    primary_skill: str = Field(..., description="Skill driving the recommendation")
