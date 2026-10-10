"""SQLAlchemy 2.0 database model for LearningPath."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.roadmap_step import RoadmapStep
    from app.models.skill import Skill


class LearningPath(Base):
    """SQLAlchemy model representing a curated learning path or roadmap."""

    __tablename__ = "learning_paths"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    duration: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    skill_id: Mapped[int | None] = mapped_column(
        ForeignKey("skills.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    skill: Mapped["Skill | None"] = relationship(
        "Skill",
        back_populates="learning_paths",
    )

    roadmap_steps: Mapped[list["RoadmapStep"]] = relationship(
        "RoadmapStep",
        back_populates="learning_path",
        cascade="all, delete-orphan",
        order_by="RoadmapStep.step_number",
    )

    courses: Mapped[list["Course"]] = relationship(
        "Course",
        back_populates="learning_path",
    )

    def __repr__(self) -> str:
        return f"<LearningPath(id={self.id}, title='{self.title}', category='{self.category}')>"
