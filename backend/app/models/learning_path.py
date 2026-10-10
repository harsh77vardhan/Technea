"""SQLAlchemy 2.0 database model for LearningPath."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.roadmap_step import RoadmapStep


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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    roadmap_steps: Mapped[list["RoadmapStep"]] = relationship(
        "RoadmapStep",
        back_populates="learning_path",
        cascade="all, delete-orphan",
        order_by="RoadmapStep.step_number",
    )

    def __repr__(self) -> str:
        return f"<LearningPath(id={self.id}, title='{self.title}', category='{self.category}')>"
