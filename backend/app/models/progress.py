"""SQLAlchemy 2.0 database models for user progress tracking."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.learning_path import LearningPath
    from app.models.lesson import Lesson
    from app.models.roadmap_step import RoadmapStep
    from app.models.user import User


class UserLearningPath(Base):
    """Tracks a user's enrollment and overall progress in a learning path."""

    __tablename__ = "user_learning_paths"
    __table_args__ = (
        UniqueConstraint("user_id", "learning_path_id", name="uq_user_learning_path"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learning_path_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_paths.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
    )  # 'active', 'completed', 'bookmarked'
    progress_percent: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="learning_paths",
    )
    learning_path: Mapped["LearningPath"] = relationship(
        "LearningPath",
    )

    def __repr__(self) -> str:
        return f"<UserLearningPath(user_id={self.user_id}, path_id={self.learning_path_id}, progress={self.progress_percent}%)>"


# Alias for backward compatibility and clean referencing
UserLearningPathProgress = UserLearningPath



class UserRoadmapProgress(Base):
    """Tracks completion of individual roadmap steps/milestones for a user."""

    __tablename__ = "user_roadmap_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "step_id", name="uq_user_roadmap_step"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learning_path_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_paths.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("roadmap_steps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="roadmap_progress",
    )
    step: Mapped["RoadmapStep"] = relationship(
        "RoadmapStep",
    )
    learning_path: Mapped["LearningPath"] = relationship(
        "LearningPath",
    )

    def __repr__(self) -> str:
        return f"<UserRoadmapProgress(user_id={self.user_id}, step_id={self.step_id}, completed={self.is_completed})>"


class UserLessonProgress(Base):
    """Tracks completion of individual course video lessons for a user."""

    __tablename__ = "user_lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lesson_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="lesson_progress",
    )
    course: Mapped["Course"] = relationship(
        "Course",
    )
    lesson: Mapped["Lesson"] = relationship(
        "Lesson",
    )

    def __repr__(self) -> str:
        return f"<UserLessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, completed={self.is_completed})>"
