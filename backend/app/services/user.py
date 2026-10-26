"""User service providing database operations for users."""

from datetime import datetime, timedelta, timezone
import secrets
import uuid
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service handling user account operations."""

    async def get(self, db: AsyncSession, id: uuid.UUID | str) -> User | None:
        """Retrieve user by UUID."""
        if isinstance(id, str):
            try:
                id = uuid.UUID(id)
            except ValueError:
                return None
        stmt = select(User).where(User.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Retrieve user by normalized email address."""
        normalized_email = email.strip().lower()
        stmt = select(User).where(User.email == normalized_email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        """Register a new user with hashed password and verification token."""
        normalized_email = obj_in.email.strip().lower()
        hashed_password = get_password_hash(obj_in.password)
        verification_token = secrets.token_urlsafe(32)
        verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)

        db_user = User(
            email=normalized_email,
            hashed_password=hashed_password,
            full_name=obj_in.full_name.strip() if obj_in.full_name else None,
            username=obj_in.username.strip().lower() if obj_in.username else None,
            is_active=True,
            is_superuser=False,
            auth_provider="email",
            is_email_verified=False,
            email_verification_token=verification_token,
            email_verification_expires=verification_expires,
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        # Non-blocking verification email dispatch
        try:
            from app.services.email import email_service
            await email_service.send_verification_email(
                to_email=db_user.email,
                full_name=db_user.full_name or "",
                token=verification_token,
            )
        except Exception as exc:
            logger.warning("Failed to send verification email for %s: %s", db_user.email, exc)

        return db_user

    async def authenticate(self, db: AsyncSession, email: str, password: str) -> User | None:
        """Authenticate user by email and plaintext password."""
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def update(self, db: AsyncSession, db_obj: User, obj_in: UserUpdate) -> User:
        """Update user profile information, links, visibility, and optional password."""
        if obj_in.username is not None:
            clean_username = obj_in.username.strip().lower()
            if clean_username != (db_obj.username or "").lower():
                conflict_stmt = select(User.id).where(
                    func.lower(User.username) == clean_username,
                    User.id != db_obj.id,
                )
                conflict_res = await db.execute(conflict_stmt)
                if conflict_res.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"The username '{clean_username}' is already taken.",
                    )
                db_obj.username = clean_username

        if obj_in.full_name is not None:
            db_obj.full_name = obj_in.full_name.strip() if obj_in.full_name else None
        if obj_in.avatar_url is not None:
            db_obj.avatar_url = obj_in.avatar_url.strip() if obj_in.avatar_url else None
        if obj_in.bio is not None:
            db_obj.bio = obj_in.bio.strip() if obj_in.bio else None
        if obj_in.location is not None:
            db_obj.location = obj_in.location.strip() if obj_in.location else None
        if obj_in.github_url is not None:
            db_obj.github_url = obj_in.github_url.strip() if obj_in.github_url else None
        if obj_in.linkedin_url is not None:
            db_obj.linkedin_url = obj_in.linkedin_url.strip() if obj_in.linkedin_url else None
        if obj_in.portfolio_url is not None:
            db_obj.portfolio_url = obj_in.portfolio_url.strip() if obj_in.portfolio_url else None
        if obj_in.website_url is not None:
            db_obj.website_url = obj_in.website_url.strip() if obj_in.website_url else None
        if "profile_visibility" in obj_in.model_fields_set and obj_in.profile_visibility is not None:
            db_obj.profile_visibility = obj_in.profile_visibility.strip().lower()
        if obj_in.password is not None and len(obj_in.password) >= 8:
            db_obj.hashed_password = get_password_hash(obj_in.password)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def create_google_user(
        self,
        db: AsyncSession,
        email: str,
        full_name: str | None,
        google_id: str,
        avatar_url: str | None = None,
    ) -> User:
        """Create a new user authenticated via Google OAuth."""
        normalized_email = email.strip().lower()
        random_password = secrets.token_urlsafe(32)
        hashed_password = get_password_hash(random_password)

        db_user = User(
            email=normalized_email,
            hashed_password=hashed_password,
            full_name=full_name.strip() if full_name else None,
            avatar_url=avatar_url.strip() if avatar_url else None,
            google_id=google_id,
            auth_provider="google",
            is_email_verified=True,
            is_active=True,
            is_superuser=False,
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def get_by_google_id(self, db: AsyncSession, google_id: str) -> User | None:
        """Retrieve user by Google OAuth identifier."""
        stmt = select(User).where(User.google_id == google_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, db: AsyncSession, token: str) -> User | None:
        """Retrieve user by password reset token."""
        stmt = select(User).where(User.password_reset_token == token)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, db: AsyncSession, token: str) -> User | None:
        """Retrieve user by email verification token."""
        stmt = select(User).where(User.email_verification_token == token)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


user_service = UserService()
