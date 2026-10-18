"""Pydantic schemas for AI Roadmap Builder."""

from datetime import datetime
import uuid
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ProjectSpec(BaseModel):
    """Hands-on project blueprint recommendation for a roadmap phase or milestone."""

    title: str = Field(..., description="Project name")
    description: str = Field(..., description="Project overview and objective")
    tech_stack: list[str] = Field(default_factory=list, description="Technologies and libraries used")
    key_features: list[str] = Field(default_factory=list, description="Core deliverable features")
    difficulty: str = Field(default="Intermediate", description="Project complexity tier")


class RoadmapCourseRef(BaseModel):
    """Course reference attached to a milestone."""

    id: int | None = None
    title: str
    instructor: str | None = None
    platform: str | None = None
    url: str | None = None
    duration: str | None = None
    lesson_count: int = 0


class RoadmapMilestone(BaseModel):
    """An individual actionable learning milestone inside a roadmap phase."""

    id: str = Field(..., description="Unique milestone identifier (e.g. m1-1)")
    step_number: int = Field(..., description="Sequential position in phase")
    title: str = Field(..., description="Milestone title")
    description: str = Field(..., description="Learning outcome and rationale")
    estimated_weeks: str = Field(..., description="Estimated time (e.g. 2 Weeks)")
    category: str = Field(..., description="Skill category")
    key_skills: list[str] = Field(default_factory=list, description="Skills acquired")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisite skills")
    action_items: list[str] = Field(default_factory=list, description="Step-by-step practical tasks")
    learning_path_id: int | None = Field(default=None, description="Linked catalog learning path ID")
    learning_path_title: str | None = None
    courses: list[RoadmapCourseRef] = Field(default_factory=list, description="Catalog courses for this milestone")
    project: ProjectSpec | None = None


class RoadmapPhase(BaseModel):
    """A thematic progression phase in the learning journey."""

    phase_number: int = Field(..., description="Phase sequence index (1-based)")
    title: str = Field(..., description="Phase title (e.g. Phase 1: Web Foundations)")
    description: str = Field(..., description="Phase theme and strategic purpose")
    estimated_duration: str = Field(..., description="Phase duration (e.g. 4 Weeks)")
    milestones: list[RoadmapMilestone] = Field(default_factory=list, description="Milestones in this phase")


class GeneratedRoadmapData(BaseModel):
    """Structured data payload representing the complete generated roadmap."""

    target_role: str
    goal: str
    experience_level: str
    summary: str
    estimated_total_duration: str
    total_milestones: int
    total_courses: int
    total_projects: int
    phases: list[RoadmapPhase]
    capstone_project: ProjectSpec | None = None


class RoadmapGenerateRequest(BaseModel):
    """User input prompt to generate a tailored roadmap."""

    goal: str = Field(..., min_length=2, max_length=500, description="Career goal or desire (e.g. 'I want to become a Full Stack Developer')")
    experience_level: str | None = Field(default="Beginner", description="Optional experience tier")


class RoadmapGenerateResponse(BaseModel):
    """API response for newly generated roadmap."""

    title: str
    goal: str
    target_role: str
    experience_level: str
    estimated_duration: str
    roadmap_data: GeneratedRoadmapData


class RoadmapSaveRequest(BaseModel):
    """Payload to save a generated roadmap to authenticated user account."""

    title: str
    goal: str
    target_role: str | None = None
    experience_level: str = "Beginner"
    estimated_duration: str | None = None
    roadmap_data: dict[str, Any]


class RoadmapDetailResponse(BaseModel):
    """Full detail of a saved roadmap entity."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: uuid.UUID | None = None
    title: str
    goal: str
    target_role: str | None = None
    experience_level: str
    estimated_duration: str | None = None
    progress_percent: int
    is_active: bool
    completed_milestone_ids: list[str] = Field(default_factory=list)
    roadmap_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class RoadmapProgressToggleRequest(BaseModel):
    """Toggle completion status for a specific milestone in a generated roadmap."""

    milestone_id: str
    is_completed: bool
