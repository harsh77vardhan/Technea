"""SQLAlchemy 2.0 database models for Community Learning Rooms and Study Rooms."""

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
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
    # Study session (MVP & Phase 2 Collaboration)
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
    study_session_host_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    study_session_host_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    study_session_timer_type: Mapped[str] = mapped_column(
        String(50),
        default="pomodoro",
        nullable=False,
    )
    study_session_timer_mode: Mapped[str] = mapped_column(
        String(50),
        default="study",
        nullable=False,
    )
    study_session_duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=25,
        nullable=False,
    )
    # Phase 3: Synchronized Content
    sync_content_title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    sync_content_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    sync_content_type: Mapped[str] = mapped_column(
        String(50),
        default="video",
        nullable=False,
    )
    sync_is_playing: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    sync_playback_time: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    sync_playback_speed: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
    )
    sync_updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    # Phase 3: Collaborative Code Space
    code_snippet_content: Mapped[str | None] = mapped_column(
        Text,
        default="",
        nullable=True,
    )
    code_snippet_language: Mapped[str] = mapped_column(
        String(50),
        default="python",
        nullable=False,
    )
    code_snippet_title: Mapped[str] = mapped_column(
        String(255),
        default="DSA Practice Snippet",
        nullable=False,
    )
    code_snippet_last_edited_by: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    # Phase 3: Learning Whiteboard
    whiteboard_data: Mapped[str | None] = mapped_column(
        Text,
        default="",
        nullable=True,
    )
    whiteboard_last_edited_by: Mapped[str | None] = mapped_column(
        String(255),
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
    session_history: Mapped[list["RoomSessionHistory"]] = relationship(
        "RoomSessionHistory",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomSessionHistory.ended_at.desc()",
    )
    shared_note: Mapped["RoomSharedNote | None"] = relationship(
        "RoomSharedNote",
        back_populates="room",
        cascade="all, delete-orphan",
        uselist=False,
    )
    notifications: Mapped[list["RoomNotification"]] = relationship(
        "RoomNotification",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomNotification.created_at.desc()",
    )
    active_peers: Mapped[list["RoomActivePeer"]] = relationship(
        "RoomActivePeer",
        back_populates="room",
        cascade="all, delete-orphan",
    )
    webrtc_signals: Mapped[list["RoomWebRTCSignal"]] = relationship(
        "RoomWebRTCSignal",
        back_populates="room",
        cascade="all, delete-orphan",
        order_by="RoomWebRTCSignal.created_at.desc()",
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
    study_state: Mapped[str] = mapped_column(
        String(50),
        default="studying",
        nullable=False,
    )  # 'studying', 'break', 'away'
    role: Mapped[str] = mapped_column(
        String(50),
        default="member",
        nullable=False,
    )  # 'owner', 'host', 'moderator', 'member'

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
    content_badge: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )  # e.g. 'Course', 'Lesson', 'Roadmap Step'
    action_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="resources")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<RoomResource(id={self.id}, room_id={self.room_id}, type='{self.resource_type}')>"


class RoomSessionHistory(Base, IntIdMixin, TimestampMixin):
    """Log of previous study sessions held in a study room."""

    __tablename__ = "room_session_history"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    host_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    host_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    topic: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    participants_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    ended_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    # Phase 3: AI Study Session Summary
    ai_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    topics_covered: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    questions_discussed_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    recommended_next_step: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="session_history")
    host_user: Mapped["User"] = relationship("User", foreign_keys=[host_user_id])

    def __repr__(self) -> str:
        return f"<RoomSessionHistory(id={self.id}, room_id={self.room_id}, topic='{self.topic}')>"


class RoomSharedNote(Base, IntIdMixin, TimestampMixin):
    """Collaborative shared notes for a study room."""

    __tablename__ = "room_shared_notes"
    __table_args__ = (
        UniqueConstraint("room_id", name="uq_room_shared_note"),
    )

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        default="Shared Notes",
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )
    last_edited_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    last_edited_by_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="shared_note")
    last_edited_by: Mapped["User"] = relationship("User", foreign_keys=[last_edited_by_id])

    def __repr__(self) -> str:
        return f"<RoomSharedNote(id={self.id}, room_id={self.room_id}, title='{self.title}')>"


class RoomNotification(Base, IntIdMixin, TimestampMixin):
    """In-app event notifications for study rooms."""

    __tablename__ = "room_notifications"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )  # Recipient; null means all room members
    actor_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    notification_type: Mapped[str] = mapped_column(
        String(50),
        default="info",
        nullable=False,
    )  # 'session_started', 'member_joined', 'question_reply', 'content_shared', 'note_updated'
    link_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="notifications")

    def __repr__(self) -> str:
        return f"<RoomNotification(id={self.id}, room_id={self.room_id}, type='{self.notification_type}')>"


class RoomActivePeer(Base, IntIdMixin):
    """Peer currently participating in live voice / video / screen call."""

    __tablename__ = "room_active_peers"
    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_room_active_peer"),
    )

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
    user_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    is_audio_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_muted: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_video_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_screen_sharing: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    last_heartbeat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="active_peers")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<RoomActivePeer(user_id={self.user_id}, room_id={self.room_id}, audio={self.is_audio_active})>"


class RoomWebRTCSignal(Base, IntIdMixin):
    """WebRTC signaling messages (offers, answers, ICE candidates, state sync)."""

    __tablename__ = "room_webrtc_signals"

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_user_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    target_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    signal_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )  # 'offer', 'answer', 'ice-candidate', 'join', 'leave', 'status'
    payload: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    room: Mapped["LearningRoom"] = relationship("LearningRoom", back_populates="webrtc_signals")

    def __repr__(self) -> str:
        return f"<RoomWebRTCSignal(id={self.id}, type='{self.signal_type}', from={self.from_user_id})>"


