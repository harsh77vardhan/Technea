"""Pydantic v2 schemas for User management and authentication."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user properties."""

    email: EmailStr
    username: str | None = Field(default=None, max_length=50)
    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=500)
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
    avatar_url: str | None = Field(default=None, max_length=500)
    bio: str | None = None
    location: str | None = Field(default=None, max_length=100)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)
    profile_visibility: str = Field(default="public", max_length=20)
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


class TokenResponse(BaseModel):
    """Schema for JWT authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


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

