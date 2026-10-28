"""Pydantic v2 schemas for User management and authentication."""

from datetime import datetime
import json
from typing import Any
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UserBase(BaseModel):
    """Base user properties."""

    email: EmailStr
    username: str | None = Field(default=None, max_length=50)
    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = Field(default=None, max_length=100)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)
    profile_visibility: str = Field(default="public", max_length=20)


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password must be at least 8 characters")
    full_name: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=50)


class UserLogin(BaseModel):
    """Schema for user login via JSON body."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    full_name: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=50)
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = Field(default=None, max_length=100)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)
    profile_visibility: str = Field(default="public", max_length=20)
    learning_goal: str | None = Field(default=None, max_length=255)
    current_skill_level: str | None = Field(default=None, max_length=50)
    interests: list[str] | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserResponse(UserBase):
    """Schema for user public/profile response."""

    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    website_url: str | None = Field(default=None, max_length=500)
    profile_visibility: str = Field(default="public", max_length=20)
    is_email_verified: bool = False
    auth_provider: str = "email"
    profile_completed: bool = False
    learning_goal: str | None = None
    current_skill_level: str | None = None
    interests: list[str] | None = None

    @field_validator("interests", mode="before")
    @classmethod
    def parse_interests(cls, v: Any) -> list[str] | None:
        """Parse interests from JSON string, comma-separated string, or list."""
        if v is None:
            return None
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        if isinstance(v, str):
            stripped = v.strip()
            if not stripped:
                return []
            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            # Fallback: comma-separated
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return None


class TokenResponse(BaseModel):
    """Schema for JWT authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    profile_completed: bool = False


class ForgotPasswordRequest(BaseModel):
    """Schema for requesting a password reset email."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for executing a password reset with token."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class GoogleCallbackResponse(BaseModel):
    """Schema for Google OAuth callback token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    is_new_user: bool
    profile_completed: bool = False


class CheckUsernameResponse(BaseModel):
    """Schema for username availability check response."""

    username: str
    available: bool
    message: str


class ProfileSetupRequest(BaseModel):
    """Schema for initial profile setup during onboarding."""

    full_name: str | None = Field(default=None, max_length=255)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    avatar_url: str | None = None
    bio: str | None = Field(default=None, max_length=500)
    learning_goal: str | None = Field(default=None, max_length=255)
    goal: str | None = Field(default=None, max_length=255)
    current_skill_level: str | None = Field(default=None, max_length=50)
    level: str | None = Field(default=None, max_length=50)
    experience_level: str | None = Field(default=None, max_length=50)
    interests: list[str] | None = None
    primary_focus: list[str] | None = None
    profile_completed: bool | None = True

    @model_validator(mode="before")
    @classmethod
    def normalize_onboarding_payload(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize goal/learning_goal
            if not data.get("learning_goal") and data.get("goal"):
                data["learning_goal"] = data.get("goal")
            # Normalize level/experience_level/current_skill_level
            if not data.get("current_skill_level"):
                data["current_skill_level"] = data.get("level") or data.get("experience_level")
            # Normalize primary_focus/interests
            if not data.get("interests") and data.get("primary_focus"):
                data["interests"] = data.get("primary_focus")
            # Fallback full_name if empty or missing
            if not data.get("full_name") or not str(data.get("full_name")).strip():
                clean_user = str(data.get("username", "")).strip().replace("@", "")
                data["full_name"] = clean_user if clean_user else "Technea Engineer"
        return data


class ProfileSetupResponse(BaseModel):
    """Schema for profile setup response."""

    user: UserResponse
    profile_completed: bool = True
    message: str


class VerifyEmailResponse(BaseModel):
    """Schema for email verification confirmation response."""

    message: str
    user: UserResponse


class GoogleAuthUrlResponse(BaseModel):
    """Schema for Google OAuth authorization redirect URL."""

    auth_url: str


class UserStatsResponse(BaseModel):
    """Schema for user learning statistics response."""

    xp_points: int
    developer_level: str
    learning_streak: int
    completed_roadmaps_count: int
    completed_milestones_count: int
    completed_lessons_count: int
    completed_projects_count: int


class SendOTPRequest(BaseModel):
    """Schema for requesting an email OTP."""

    email: EmailStr


class VerifyOTPRequest(BaseModel):
    """Schema for verifying an email OTP."""

    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class OTPSentResponse(BaseModel):
    """Schema for OTP dispatch confirmation response."""

    message: str
    expires_in_seconds: int = 300
    cooldown_seconds: int = 60


