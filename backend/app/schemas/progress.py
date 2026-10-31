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


class DailyTaskItem(BaseModel):
    """An actionable daily learning goal item."""

    id: str
    label: str
    completed: bool


class WeeklyActivityDay(BaseModel):
    """Activity state for a single day in the weekly streak view."""

    date: str
    day_name: str
    completed_tasks_count: int
    is_active: bool


class DailyActivityResponse(BaseModel):
    """Comprehensive daily productivity and streak response."""

    activity_date: str
    streak_count: int
    completed_tasks: list[str]
    task_count: int
    minutes_spent: int
    today_checklist: list[DailyTaskItem]
    weekly_history: list[WeeklyActivityDay]


class DailyTaskToggleRequest(BaseModel):
    """Request schema for toggling a daily goal task."""

    task_id: str = Field(..., description="Task identifier, e.g. 'lesson' or 'code'")
    is_completed: bool = Field(..., description="Target completion status")
    activity_date: str | None = Field(default=None, description="Optional YYYY-MM-DD date")


class AIBuddyResponse(BaseModel):
    """Personalized AI mentor guidance and pedagogical next steps."""

    current_goal: str
    last_activity: str
    next_milestone: str
    reasoning: str
    weak_areas: list[str] = Field(default_factory=list)
    mentor_tip: str
    quick_prompts: list[str] = Field(default_factory=list)


class AIMentorChatRequest(BaseModel):
    """User message sent to AI technical mentor."""

    message: str = Field(..., min_length=1, max_length=2000, description="User's query or prompt")
    context_skill: str | None = Field(default=None, description="Optional active skill context")
    context_milestone: str | None = Field(default=None, description="Optional active milestone context")


class AIMentorChatResponse(BaseModel):
    """Personalized context-aware AI mentor reply."""

    reply: str
    detected_milestone: str | None = None
    prerequisite_warning: str | None = None
    suggested_next_step: str | None = None
    recommended_project: str | None = None
    action_items: list[str] = Field(default_factory=list)
    quick_prompts: list[str] = Field(default_factory=list)


class UserBadge(BaseModel):
    """Achievement badge earned by the learner."""

    id: str
    title: str
    description: str
    icon: str
    earned: bool
    earned_at: str | None = None


class UserProfileResponse(BaseModel):
    """Learner portfolio and skills mastery profile."""

    user_id: uuid.UUID
    full_name: str
    email: str
    account_level: str
    total_milestones: int
    total_lessons: int
    total_projects: int
    streak_count: int
    overall_mastery: int
    xp_points: int = 0
    developer_level: str = "Junior Developer"
    next_level_xp: int = 500
    level_progress_percent: int = 0
    skills: list[SkillProgressBadge] = Field(default_factory=list)
    badges: list[UserBadge] = Field(default_factory=list)
    completed_projects: list[dict] = Field(default_factory=list)
    learning_rooms: list[str] = Field(default_factory=list)


class DashboardSummaryResponse(BaseModel):
    """Comprehensive user learning dashboard summary."""

    user_id: uuid.UUID
    total_completed_milestones: int
    total_completed_lessons: int
    total_active_paths: int
    overall_progress_percent: int
    streak_count: int = 1
    xp_points: int = 0
    developer_level: str = "Junior Developer"
    next_level_xp: int = 500
    level_progress_percent: int = 0
    completed_projects_count: int = 0
    active_projects_count: int = 0
    joined_rooms_count: int = 0
    current_path: DashboardEnrolledPath | None = None
    enrolled_paths: list[DashboardEnrolledPath] = Field(default_factory=list)
    skills_overview: list[SkillProgressBadge] = Field(default_factory=list)
    ai_buddy: AIBuddyResponse | None = None
    daily_activity: DailyActivityResponse | None = None


class AchievementItemResponse(BaseModel):
    """Developer achievement badge displayed in achievements showcase and dashboard."""

    id: str
    achievement_id: str
    title: str
    description: str
    icon: str
    category: str = "General"
    xp_reward: int = 50
    criteria: str | None = None
    unlocked: bool = False
    earned: bool = False
    unlocked_at: str | None = None


class DashboardWorkspaceResponse(BaseModel):
    """Consolidated workspace bootstrap payload for instant single-request dashboard initialization."""

    summary: DashboardSummaryResponse
    daily_activity: DailyActivityResponse
    achievements: list[AchievementItemResponse] = Field(default_factory=list)
    saved_roadmaps: list[dict] = Field(default_factory=list)
    recommended_projects: list[dict] = Field(default_factory=list)
    my_projects: list[dict] = Field(default_factory=list)




