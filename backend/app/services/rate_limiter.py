"""PostgreSQL-backed sliding window rate limiter for authentication endpoints.

Prevents brute-force attacks, credential stuffing, and OTP flooding while
safely parsing client IP addresses behind reverse proxies and CDNs.
"""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
import ipaddress
import logging
import random
import time
import uuid

from fastapi import HTTPException, Request, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import async_session_maker
from app.models.rate_limit import AuthRateLimit

logger = logging.getLogger(__name__)

# In-memory fallback sliding window cache: key -> list of float timestamps
_MEMORY_CACHE: dict[str, list[float]] = defaultdict(list)


def get_client_ip(request: Request) -> str:
    """Extract and validate the genuine client IP address from request headers.

    Safely handles X-Forwarded-For, X-Real-IP, and CF-Connecting-IP headers.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Leftmost entry is the client's original IP
        raw_ip = forwarded_for.split(",")[0].strip()
        try:
            ipaddress.ip_address(raw_ip)
            return raw_ip
        except ValueError:
            pass

    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        raw_ip = cf_ip.strip()
        try:
            ipaddress.ip_address(raw_ip)
            return raw_ip
        except ValueError:
            pass

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        raw_ip = real_ip.strip()
        try:
            ipaddress.ip_address(raw_ip)
            return raw_ip
        except ValueError:
            pass

    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


class RateLimiter:
    """Sliding-window rate limiter utilizing PostgreSQL with memory fallback."""

    @staticmethod
    async def check(
        db: AsyncSession,
        key: str,
        action: str,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        """Check if request is within limits; raises HTTP 429 if limit is exceeded."""
        if not settings.RATE_LIMIT_ENABLED:
            return

        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=window_seconds)

        try:
            # Use autonomous session so rate limiting commits independently of route transaction rollbacks
            async with async_session_maker() as session:
                # 1. Count requests in window
                count_stmt = select(func.count(AuthRateLimit.id)).where(
                    AuthRateLimit.key == key,
                    AuthRateLimit.action == action,
                    AuthRateLimit.created_at >= window_start,
                )
                count_res = await session.execute(count_stmt)
                count = count_res.scalar() or 0

                if count >= max_requests:
                    # Find oldest entry in window to determine retry-after
                    oldest_stmt = (
                        select(AuthRateLimit.created_at)
                        .where(
                            AuthRateLimit.key == key,
                            AuthRateLimit.action == action,
                            AuthRateLimit.created_at >= window_start,
                        )
                        .order_by(AuthRateLimit.created_at.asc())
                        .limit(1)
                    )
                    oldest_res = await session.execute(oldest_stmt)
                    oldest_dt = oldest_res.scalar()
                    if oldest_dt:
                        if oldest_dt.tzinfo is None:
                            oldest_dt = oldest_dt.replace(tzinfo=timezone.utc)
                        elapsed = (now - oldest_dt).total_seconds()
                        retry_after = max(1, int(window_seconds - elapsed))
                    else:
                        retry_after = window_seconds

                    logger.warning(
                        "Rate limit exceeded: key=%s action=%s (%d/%d in %ds). Retry after %ds",
                        key,
                        action,
                        count,
                        max_requests,
                        window_seconds,
                        retry_after,
                    )
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Too many requests. Please try again in {retry_after} seconds.",
                        headers={"Retry-After": str(retry_after)},
                    )

                # 2. Record new entry and commit immediately
                entry = AuthRateLimit(
                    id=uuid.uuid4(),
                    key=key,
                    action=action,
                    created_at=now,
                )
                session.add(entry)
                await session.commit()

                # 3. Probabilistic cleanup of entries older than 2 hours (5% of requests)
                if random.random() < 0.05:
                    cleanup_threshold = now - timedelta(hours=2)
                    await session.execute(
                        delete(AuthRateLimit).where(AuthRateLimit.created_at < cleanup_threshold)
                    )
                    await session.commit()

        except HTTPException:
            raise
        except Exception as exc:
            # Fallback to in-memory limiter if DB table does not exist or transient error
            logger.debug("Database rate limiter fallback to in-memory: %s", exc)
            RateLimiter._check_memory(key, action, max_requests, window_seconds)

        except HTTPException:
            raise
        except Exception as exc:
            # Fallback to in-memory limiter if DB table does not exist or transient error
            logger.debug("Database rate limiter fallback to in-memory: %s", exc)
            RateLimiter._check_memory(key, action, max_requests, window_seconds)

    @staticmethod
    def _check_memory(
        key: str,
        action: str,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        """In-memory sliding window fallback."""
        cache_key = f"{key}:{action}"
        now_ts = time.time()
        cutoff = now_ts - window_seconds

        timestamps = [ts for ts in _MEMORY_CACHE[cache_key] if ts > cutoff]
        if len(timestamps) >= max_requests:
            oldest = timestamps[0]
            retry_after = max(1, int(window_seconds - (now_ts - oldest)))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        timestamps.append(now_ts)
        _MEMORY_CACHE[cache_key] = timestamps


async def limit_auth_action(
    request: Request,
    db: AsyncSession,
    action: str,
    email: str | None = None,
) -> None:
    """Convenience helper applying targeted IP and account rate limits."""
    client_ip = get_client_ip(request)
    normalized_email = email.lower().strip() if email else None

    if action == "login":
        # IP limit: 15 per minute
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="login:ip",
            max_requests=15,
            window_seconds=60,
        )
        if normalized_email:
            # Email limit: 5 per 5 minutes
            await RateLimiter.check(
                db=db,
                key=f"email:{normalized_email}",
                action="login:email",
                max_requests=5,
                window_seconds=300,
            )

    elif action == "send_otp":
        # IP limit: 15 per 10 minutes
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="send_otp:ip",
            max_requests=15,
            window_seconds=600,
        )
        if normalized_email:
            # Email limit: 5 per 10 minutes
            await RateLimiter.check(
                db=db,
                key=f"email:{normalized_email}",
                action="send_otp:email",
                max_requests=5,
                window_seconds=600,
            )

    elif action == "verify_otp":
        # IP limit: 20 per 10 minutes
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="verify_otp:ip",
            max_requests=20,
            window_seconds=600,
        )
        if normalized_email:
            # Email limit: 10 per 10 minutes
            await RateLimiter.check(
                db=db,
                key=f"email:{normalized_email}",
                action="verify_otp:email",
                max_requests=10,
                window_seconds=600,
            )

    elif action == "forgot_password":
        # IP limit: 10 per 15 minutes
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="forgot_pw:ip",
            max_requests=10,
            window_seconds=900,
        )
        if normalized_email:
            # Email limit: 3 per 15 minutes
            await RateLimiter.check(
                db=db,
                key=f"email:{normalized_email}",
                action="forgot_pw:email",
                max_requests=3,
                window_seconds=900,
            )

    elif action == "reset_password":
        # IP limit: 10 per 15 minutes
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="reset_pw:ip",
            max_requests=10,
            window_seconds=900,
        )

    elif action == "refresh":
        # IP limit for token refresh: 60 per minute
        await RateLimiter.check(
            db=db,
            key=f"ip:{client_ip}",
            action="refresh:ip",
            max_requests=60,
            window_seconds=60,
        )


def reset_rate_limits_cache() -> None:
    """Clear memory cache for test isolation."""
    _MEMORY_CACHE.clear()
