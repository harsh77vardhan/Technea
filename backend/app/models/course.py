"""SQLAlchemy 2.0 database model for Course."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.skill import Skill


class Course(Base):
    """SQLAlchemy model representing a course connected to a skill."""

    __tablename__ = "courses"

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
    platform: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    instructor: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    duration: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="courses",
    )

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, title='{self.title}', skill_id={self.skill_id})>"
