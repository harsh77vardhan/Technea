"""Database session and engine management using SQLAlchemy 2.0 AsyncIO."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from typing import Any
from app.core.config import settings

# Engine connection pool arguments
engine_kwargs: dict[str, Any] = {
    "echo": settings.DB_ECHO,
    "future": True,
}

if "sqlite" not in str(settings.DATABASE_URL):
    engine_kwargs.update(
        {
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "pool_recycle": settings.DB_POOL_RECYCLE,
            "pool_pre_ping": settings.DB_POOL_PRE_PING,
        }
    )

# Create async engine configured with connection pooling
engine = create_async_engine(
    str(settings.DATABASE_URL),
    **engine_kwargs,
)

# Async session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an asynchronous database session.

    Yields:
        AsyncSession: An active SQLAlchemy async session.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
