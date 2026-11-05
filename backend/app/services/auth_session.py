"""Session management service for short-lived access tokens and rotating refresh tokens.

Implements token family tracking, reuse detection, and concurrency grace windows.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import logging
import secrets
import uuid

from fastapi import HTTPException, Response, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.models.refresh_token import UserRefreshToken

logger = logging.getLogger(__name__)

REFRESH_COOKIE_NAME = "technea_refresh_token"
CONCURRENCY_GRACE_SECONDS = 20  # 20 seconds for multi-tab simultaneous requests


def hash_token(raw_token: str) -> str:
    """Compute SHA-256 hex digest of a raw token."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_raw_token() -> str:
    """Generate a high-entropy 256-bit cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(32)


def set_refresh_cookie(response: Response, raw_token: str) -> None:
    """Set HttpOnly, SameSite=None refresh token cookie for cross-origin frontend-backend."""
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    is_prod = settings.ENVIRONMENT == "production"

    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_token,
        max_age=max_age,
        expires=max_age,
        path="/api/v1/auth",
        httponly=True,
        secure=is_prod,  # True on HTTPS production
        samesite="none" if is_prod else "lax",
    )


def clear_refresh_cookie(response: Response) -> None:
    """Clear refresh token cookie on logout."""
    is_prod = settings.ENVIRONMENT == "production"
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
    )


class AuthSessionService:
    """Manages active user session tokens, rotation, and revocation."""

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: uuid.UUID,
        client_ip: str | None = None,
        user_agent: str | None = None,
        family_id: uuid.UUID | None = None,
    ) -> tuple[str, UserRefreshToken]:
        """Create a new refresh token entity belonging to a token family."""
        raw_token = generate_raw_token()
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        assigned_family_id = family_id or uuid.uuid4()

        token_record = UserRefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            family_id=assigned_family_id,
            expires_at=expires_at,
            client_ip=client_ip[:45] if client_ip else None,
            user_agent=user_agent[:500] if user_agent else None,
        )
        db.add(token_record)
        await db.flush()

        return raw_token, token_record

    @staticmethod
    async def rotate_session(
        db: AsyncSession,
        raw_token: str,
        client_ip: str | None = None,
        user_agent: str | None = None,
    ) -> tuple[str, UserRefreshToken, uuid.UUID]:
        """Rotate a refresh token, validating families and handling concurrency grace windows.

        Returns (new_raw_token, new_token_record, user_id).
        """
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        stmt = select(UserRefreshToken).where(UserRefreshToken.token_hash == token_hash)
        res = await db.execute(stmt)
        token_record = res.scalar_one_or_none()

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or unrecognized refresh token.",
            )

        # 1. Check expiration
        expires_at = token_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now > expires_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired. Please sign in again.",
            )

        # 2. Check revocation (Reuse attack detection)
        if token_record.revoked_at is not None:
            logger.warning(
                "Revoked refresh token presented! Revoking entire family %s for user %s",
                token_record.family_id,
                token_record.user_id,
            )
            await AuthSessionService.revoke_family(db, token_record.family_id)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session: Token reuse detected. Please log in again.",
            )

        # 3. Check if already rotated (Race condition vs token theft)
        if token_record.rotated_at is not None:
            rotated_at = token_record.rotated_at
            if rotated_at.tzinfo is None:
                rotated_at = rotated_at.replace(tzinfo=timezone.utc)
            elapsed = (now - rotated_at).total_seconds()

            if elapsed <= CONCURRENCY_GRACE_SECONDS:
                # Concurrent request in the same browser window/tab during rotation
                logger.info(
                    "Token rotated within grace window (%.1fs ago) for family %s. Issuing sibling token.",
                    elapsed,
                    token_record.family_id,
                )
                new_raw, new_rec = await AuthSessionService.create_session(
                    db=db,
                    user_id=token_record.user_id,
                    client_ip=client_ip,
                    user_agent=user_agent,
                    family_id=token_record.family_id,
                )
                return new_raw, new_rec, token_record.user_id

            # Outside grace window -> suspected reuse!
            logger.warning(
                "Refresh token rotated %.1fs ago presented (outside %ds grace window)! Revoking family %s",
                elapsed,
                CONCURRENCY_GRACE_SECONDS,
                token_record.family_id,
            )
            await AuthSessionService.revoke_family(db, token_record.family_id)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session: Token reuse detected. Please log in again.",
            )

        # 4. Standard rotation: Mark current token rotated and issue next token in family
        token_record.rotated_at = now
        new_raw, new_rec = await AuthSessionService.create_session(
            db=db,
            user_id=token_record.user_id,
            client_ip=client_ip,
            user_agent=user_agent,
            family_id=token_record.family_id,
        )

        return new_raw, new_rec, token_record.user_id

    @staticmethod
    async def revoke_session(db: AsyncSession, raw_token: str) -> bool:
        """Revoke a single refresh token by raw value."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        stmt = (
            update(UserRefreshToken)
            .where(UserRefreshToken.token_hash == token_hash, UserRefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        res = await db.execute(stmt)
        return res.rowcount > 0

    @staticmethod
    async def revoke_family(db: AsyncSession, family_id: uuid.UUID) -> int:
        """Revoke all tokens in a family (invoked on token theft or reuse)."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserRefreshToken)
            .where(UserRefreshToken.family_id == family_id, UserRefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        res = await db.execute(stmt)
        return res.rowcount

    @staticmethod
    async def revoke_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> int:
        """Revoke all active sessions for a user (e.g. on logout-all or password change)."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserRefreshToken)
            .where(UserRefreshToken.user_id == user_id, UserRefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        res = await db.execute(stmt)
        return res.rowcount


auth_session_service = AuthSessionService()
