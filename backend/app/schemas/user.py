"""Pydantic v2 schemas for User management and authentication."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user properties."""

    email: EmailStr
    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=500)
    bio: str | None = None


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password must be at least 8 characters")
    full_name: str | None = Field(default=None, max_length=255)


class UserLogin(BaseModel):
    """Schema for user login via JSON body."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=500)
    bio: str | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserResponse(UserBase):
    """Schema for user public/profile response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """Schema for JWT authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
