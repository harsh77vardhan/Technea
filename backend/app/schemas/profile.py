"""Pydantic v2 schemas for User Profile Viewer, Profile Editor, and Follow System."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field


class ProfileSkillItem(BaseModel):
    """Skill mastery entry for user profile."""

    skill_id: int
    skill_name: str
    mastery_percent: int
    completed_milestones: int


class ProfileProjectItem(BaseModel):
    """Project item in public user portfolio."""

    id: int
    title: str
    description: str | None = None
    difficulty: str = "Beginner"
    category: str | None = None
    tech_stack: list[str] = Field(default_factory=list)
    status: str = "completed"
    github_url: str | None = None
    completed_at: str | None = None


class ProfileAchievementBadge(BaseModel):
    """Developer achievement badge displayed on public profile."""

    id: str
    title: str
    description: str
    icon: str
    category: str = "general"
    unlocked: bool = True
    unlocked_at: str | None = None


class UserProfilePublicResponse(BaseModel):
    """Comprehensive public developer portfolio profile response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    website_url: str | None = None
    profile_visibility: str = "public"
    joined_date: str

    # Follow counts & state
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    is_own_profile: bool = False

    # Developer Progression & Gamification
    developer_level: str = "Junior Developer"
    xp_points: int = 0
    next_level_xp: int = 500
    level_progress_percent: int = 0
    learning_streak: int = 1

    # Learning Statistics
    completed_milestones_count: int = 0
    completed_courses_count: int = 0
    completed_projects_count: int = 0
    joined_rooms_count: int = 0

    # Rich Sections
    skills: list[ProfileSkillItem] = Field(default_factory=list)
    projects: list[ProfileProjectItem] = Field(default_factory=list)
    achievements: list[ProfileAchievementBadge] = Field(default_factory=list)


class ProfileUpdateRequest(BaseModel):
    """Schema for updating own profile."""

    full_name: str = Field(..., min_length=1, max_length=255)
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-z0-9_]{3,20}$",
        description="Lowercase letters, numbers, and underscores only. 3-20 characters.",
    )
    bio: str | None = Field(default=None, max_length=500)
    location: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)
    profile_visibility: str | None = Field(default="public", max_length=20)


class UserStatsResponse(BaseModel):
    """User learning statistics and progression summary."""

    xp_points: int
    developer_level: str
    learning_streak: int
    completed_roadmaps_count: int
    completed_milestones_count: int
    completed_lessons_count: int
    completed_projects_count: int


class FollowUserItem(BaseModel):
    """User item returned in followers and following lists."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    developer_level: str = "Junior Developer"
    is_following: bool = False
    is_self: bool = False


class FollowActionResponse(BaseModel):
    """Response returned when following or unfollowing a user."""

    status: str
    is_following: bool
    followers_count: int
    following_count: int
    message: str


class AvatarUploadResponse(BaseModel):
    """Response returned when uploading a profile avatar image."""

    avatar_url: str
    message: str
