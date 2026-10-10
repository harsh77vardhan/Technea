"""SQLAlchemy 2.0 database model for Lesson."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course


class Lesson(Base):
    """SQLAlchemy model representing an individual lesson/video in a course playlist."""

    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    youtube_video_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    youtube_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    thumbnail_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    duration: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    lesson_order: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="lessons",
    )

    def __repr__(self) -> str:
        return f"<Lesson(id={self.id}, course_id={self.course_id}, title='{self.title}', order={self.lesson_order})>"
