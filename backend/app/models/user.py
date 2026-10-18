"""SQLAlchemy 2.0 database model for User."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, UUIDIdMixin

if TYPE_CHECKING:
    from app.models.achievement import UserAchievement
    from app.models.community import UserLearningRoom
    from app.models.follow import Follow
    from app.models.progress import UserLearningPath, UserRoadmapProgress, UserLessonProgress
    from app.models.project import UserProject
    from app.models.user_roadmap import UserGeneratedRoadmap, DailyLearningActivity


class User(Base, UUIDIdMixin, TimestampMixin):
    """User account entity for Technea platform."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    github_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    linkedin_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    portfolio_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    website_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    profile_visibility: Mapped[str] = mapped_column(
        String(20),
        default="public",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships to user progress
    learning_paths: Mapped[list["UserLearningPath"]] = relationship(
        "UserLearningPath",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    roadmap_progress: Mapped[list["UserRoadmapProgress"]] = relationship(
        "UserRoadmapProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    lesson_progress: Mapped[list["UserLessonProgress"]] = relationship(
        "UserLessonProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    generated_roadmaps: Mapped[list["UserGeneratedRoadmap"]] = relationship(
        "UserGeneratedRoadmap",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    daily_activities: Mapped[list["DailyLearningActivity"]] = relationship(
        "DailyLearningActivity",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    projects: Mapped[list["UserProject"]] = relationship(
        "UserProject",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    learning_rooms: Mapped[list["UserLearningRoom"]] = relationship(
        "UserLearningRoom",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(
        "UserAchievement",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    followers: Mapped[list["Follow"]] = relationship(
        "Follow",
        foreign_keys="[Follow.following_id]",
        back_populates="following",
        cascade="all, delete-orphan",
    )
    following: Mapped[list["Follow"]] = relationship(
        "Follow",
        foreign_keys="[Follow.follower_id]",
        back_populates="follower",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
