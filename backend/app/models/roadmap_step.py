"""SQLAlchemy 2.0 database model for RoadmapStep."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.learning_path import LearningPath


class RoadmapStep(Base):
    """SQLAlchemy model representing a sequential step in a learning path roadmap."""

    __tablename__ = "roadmap_steps"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    learning_path_id: Mapped[int] = mapped_column(
        ForeignKey("learning_paths.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_number: Mapped[int] = mapped_column(
        Integer,
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    learning_path: Mapped["LearningPath"] = relationship(
        "LearningPath",
        back_populates="roadmap_steps",
    )

    def __repr__(self) -> str:
        return f"<RoadmapStep(id={self.id}, step={self.step_number}, title='{self.title}')>"
