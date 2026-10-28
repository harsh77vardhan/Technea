"""SQLAlchemy 2.0 database models for Gamification and Developer Achievements."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IntIdMixin, TableNameMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserAchievement(Base, IntIdMixin):
    """Developer achievement unlocked by user activity and milestones."""

    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    achievement_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    icon: Mapped[str] = mapped_column(
        String(50),
        default="award",
        nullable=False,
    )
    xp_reward: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="achievements",
    )

    def __repr__(self) -> str:
        return f"<UserAchievement(user_id={self.user_id}, achievement='{self.achievement_id}')>"


class Achievement(Base, IntIdMixin):
    """Developer achievement catalog item."""

    __tablename__ = "achievements"

    achievement_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    icon: Mapped[str] = mapped_column(
        String(50),
        default="award",
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        default="General",
        nullable=False,
    )
    xp_reward: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )
    criteria: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Achievement(id={self.id}, achievement_id='{self.achievement_id}', title='{self.title}')>"

