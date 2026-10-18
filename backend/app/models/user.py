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
    from app.models.progress import UserLearningPath, UserRoadmapProgress, UserLessonProgress


class User(Base, UUIDIdMixin, TimestampMixin):
    """User account entity for Technea platform."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
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

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
