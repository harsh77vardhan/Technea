"""Pydantic v2 schemas for user progress and learning dashboard."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field


class RoadmapStepToggleRequest(BaseModel):
    """Request schema for marking a roadmap step complete or incomplete."""

    step_id: int = Field(..., description="ID of the roadmap step")
    learning_path_id: int = Field(..., description="ID of the learning path")
    is_completed: bool = Field(default=True, description="Target completion status")


class LessonToggleRequest(BaseModel):
    """Request schema for marking a video lesson complete or incomplete."""

    lesson_id: int = Field(..., description="ID of the lesson")
    course_id: int = Field(..., description="ID of the course")
    is_completed: bool = Field(default=True, description="Target completion status")


class PathProgressResponse(BaseModel):
    """Response containing roadmap step progress for a specific learning path."""

    learning_path_id: int
    completed_step_ids: list[int]
    total_steps: int
    progress_percent: int


class CourseProgressResponse(BaseModel):
    """Response containing lesson progress for a specific course."""

    course_id: int
    completed_lesson_ids: list[int]
    total_lessons: int
    progress_percent: int


class GuestProgressSyncRequest(BaseModel):
    """Request schema for migrating guest localStorage progress to the user's account."""

    # Key is string path_id / course_id (e.g. "1"), value is list of completed step/lesson integer IDs
    path_progress: dict[str, list[int]] = Field(
        default_factory=dict,
        description="Map of path_id to completed step ID arrays",
    )
    course_progress: dict[str, list[int]] = Field(
        default_factory=dict,
        description="Map of course_id to completed lesson ID arrays",
    )


class DashboardEnrolledPath(BaseModel):
    """Summary of an enrolled learning path for the user dashboard."""

    id: int
    title: str
    category: str
    level: str
    duration: str | None = None
    progress_percent: int
    completed_steps_count: int
    total_steps_count: int
    next_step_title: str | None = None
    last_accessed_at: datetime


class SkillProgressBadge(BaseModel):
    """Summary of user skill exposure and mastery."""

    skill_name: str
    category: str
    mastery_percent: int
    completed_milestones: int


class DashboardSummaryResponse(BaseModel):
    """Comprehensive user learning dashboard summary."""

    user_id: uuid.UUID
    total_completed_milestones: int
    total_completed_lessons: int
    total_active_paths: int
    overall_progress_percent: int
    current_path: DashboardEnrolledPath | None = None
    enrolled_paths: list[DashboardEnrolledPath] = Field(default_factory=list)
    skills_overview: list[SkillProgressBadge] = Field(default_factory=list)
