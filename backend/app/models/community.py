"""SQLAlchemy 2.0 database models for Community Learning Rooms and Study Rooms."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IntIdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class LearningRoom(Base, IntIdMixin, TimestampMixin):
    """Community learning & study rooms where peers collaborate on shared learning paths."""

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
        default="General",
        nullable=False,
        index=True,
    )
    topic: Mapped[str] = mapped_column(
        String(100),
        default="General",
        nullable=False,
    )
    roadmap_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    is_private: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    invite_code: Mapped[str | None] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=True,
    )
    max_members: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    active_learners_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    icon: Mapped[str] = mapped_column(
        String(50),
        default="users",
        nullable=False,
    )
    # Study session (MVP)
    study_session_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    study_session_topic: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    study_session_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    members: Mapped[list["UserLearningRoom"]] = relationship(
        "UserLearningRoom",
        back_populates="room",
        cascade="all, delete-orphan",
    )
    messages: Mapped[list["RoomMessage"]] = relationship(
        "RoomMessage",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomMessage.created_at",
    )
    questions: Mapped[list["RoomQuestion"]] = relationship(
        "RoomQuestion",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomQuestion.created_at.desc()",
    )
    resources: Mapped[list["RoomResource"]] = relationship(
        "RoomResource",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomResource.created_at.desc()",
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
    study_status: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
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


class RoomMessage(Base, IntIdMixin, TimestampMixin):
    """Discussion chat message in a study room."""

    __tablename__ = "room_messages"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    message_type: Mapped[str] = mapped_column(
        String(20),
        default="chat",
        nullable=False,
    )  # 'chat', 'system'

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="messages")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<RoomMessage(id={self.id}, room_id={self.room_id}, user_id={self.user_id})>"


class RoomQuestion(Base, IntIdMixin, TimestampMixin):
    """Learning question posted inside a study room."""

    __tablename__ = "room_questions"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="questions")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    replies: Mapped[list["RoomQuestionReply"]] = relationship(
        "RoomQuestionReply",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="RoomQuestionReply.created_at",
    )

    def __repr__(self) -> str:
        return f"<RoomQuestion(id={self.id}, room_id={self.room_id}, title='{self.title[:20]}')>"


class RoomQuestionReply(Base, IntIdMixin, TimestampMixin):
    """Reply to a study room learning question."""

    __tablename__ = "room_question_replies"

    question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("room_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    question: Mapped["RoomQuestion"] = relationship("RoomQuestion", back_populates="replies")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<RoomQuestionReply(id={self.id}, question_id={self.question_id})>"


class RoomResource(Base, IntIdMixin, TimestampMixin):
    """Shared learning resource (video, link, note, PDF)."""

    __tablename__ = "room_resources"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    resource_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )  # 'video', 'link', 'note', 'pdf'
    url_or_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="resources")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<RoomResource(id={self.id}, room_id={self.room_id}, type='{self.resource_type}')>"
