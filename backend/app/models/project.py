"""SQLAlchemy 2.0 database models for Projects and User Project Tracking."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IntIdMixin, TableNameMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.learning_path import LearningPath
    from app.models.skill import Skill
    from app.models.user import User


class Project(Base, IntIdMixin, TimestampMixin):
    """Catalog of hands-on practice projects connected with skills and learning paths."""

    __tablename__ = "projects"

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    difficulty: Mapped[str] = mapped_column(
        String(50),
        default="Beginner",
        nullable=False,
        index=True,
    )  # Beginner, Intermediate, Advanced
    estimated_time: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )  # e.g. "3-5 days", "1-2 weeks"
    required_skills: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )  # e.g. ["Functions", "File handling", "Data structures"]
    technologies: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )  # e.g. ["Python", "CLI", "JSON"]
    related_paths: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )  # e.g. ["Python Fundamentals", "Backend Development"]
    milestones: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )  # Step-by-step deliverable milestones
    skill_id: Mapped[int | None] = mapped_column(
        ForeignKey("skills.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    learning_path_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_paths.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    skill: Mapped["Skill | None"] = relationship(
        "Skill",
        foreign_keys=[skill_id],
    )
    learning_path: Mapped["LearningPath | None"] = relationship(
        "LearningPath",
        foreign_keys=[learning_path_id],
    )
    user_projects: Mapped[list["UserProject"]] = relationship(
        "UserProject",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, title='{self.title}', difficulty='{self.difficulty}')>"


class UserProject(Base, IntIdMixin):
    """User tracking for hands-on project deliverables."""

    __tablename__ = "user_projects"
    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_user_project"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="in_progress",
        nullable=False,
        index=True,
    )  # in_progress, completed
    github_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="projects",
    )
    project: Mapped["Project"] = relationship(
        "Project",
        foreign_keys=[project_id],
        back_populates="user_projects",
    )

    def __repr__(self) -> str:
        return f"<UserProject(user_id={self.user_id}, project_id={self.project_id}, status='{self.status}')>"
