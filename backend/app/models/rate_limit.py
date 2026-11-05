"""SQLAlchemy 2.0 database model for PostgreSQL-backed multi-worker rate limiting."""

from datetime import datetime
from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base import UUIDIdMixin


class AuthRateLimit(Base, UUIDIdMixin):
    """Rate limit log record for sliding window rate limiting across multiple instances."""

    __tablename__ = "auth_rate_limits"

    key: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    action: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    __table_args__ = (
        Index("ix_rate_limits_key_action_time", "key", "action", "created_at"),
    )
