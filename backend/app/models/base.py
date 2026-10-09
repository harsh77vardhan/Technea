"""Common model mixins and base configurations using SQLAlchemy 2.0 type mapping."""

from datetime import datetime, timezone
import uuid
import re

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, declared_attr, mapped_column


class TableNameMixin:
    """Automatically generates __tablename__ in snake_case from model class name."""

    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Convert CamelCase to snake_case
        return re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()


class TimestampMixin:
    """Mixin providing created_at and updated_at UTC timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDIdMixin:
    """Mixin providing a UUID v4 primary key."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )


class IntIdMixin:
    """Mixin providing an auto-incrementing integer primary key."""

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
        nullable=False,
    )
