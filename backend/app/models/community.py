"""SQLAlchemy 2.0 database models for Community Learning Rooms."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IntIdMixin, TableNameMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class LearningRoom(Base, IntIdMixin, TimestampMixin):
    """Community learning rooms where peers collaborate on shared tech stacks."""

    __tablename__ = "learning_rooms"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    active_learners_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    icon: Mapped[str] = mapped_column(
        String(50),
        default="code",
        nullable=False,
    )

    members: Mapped[list["UserLearningRoom"]] = relationship(
        "UserLearningRoom",
        back_populates="room",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<LearningRoom(id={self.id}, name='{self.name}', slug='{self.slug}')>"


class UserLearningRoom(Base, IntIdMixin):
    """Junction table recording a user's membership in a learning room."""

    __tablename__ = "user_learning_rooms"
    __table_args__ = (
        UniqueConstraint("user_id", "room_id", name="uq_user_learning_room"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="learning_rooms",
    )
    room: Mapped["LearningRoom"] = relationship(
        "LearningRoom",
        foreign_keys=[room_id],
        back_populates="members",
    )

    def __repr__(self) -> str:
        return f"<UserLearningRoom(user_id={self.user_id}, room_id={self.room_id})>"
