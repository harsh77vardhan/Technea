"""Global test configuration and fixtures for Technea backend tests."""

import pytest
from sqlalchemy import delete

from app.db.session import async_session_maker
from app.models.rate_limit import AuthRateLimit
from app.services.rate_limiter import reset_rate_limits_cache


@pytest.fixture(autouse=True)
async def cleanup_test_rate_limits():
    """Ensure rate limits and in-memory caches are completely reset between test runs."""
    reset_rate_limits_cache()
    try:
        async with async_session_maker() as session:
            await session.execute(delete(AuthRateLimit))
            await session.commit()
    except Exception:
        pass

    yield

    reset_rate_limits_cache()
    try:
        async with async_session_maker() as session:
            await session.execute(delete(AuthRateLimit))
            await session.commit()
    except Exception:
        pass
