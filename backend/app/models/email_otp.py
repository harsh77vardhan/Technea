"""SQLAlchemy 2.0 database model for Email OTP authentication."""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base import UUIDIdMixin


class EmailOTP(Base, UUIDIdMixin):
    """Email OTP entity for passwordless authentication."""

    __tablename__ = "email_otps"

    email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    hashed_otp: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<EmailOTP(id={self.id}, email={self.email}, attempts={self.attempts}, is_used={self.is_used})>"
