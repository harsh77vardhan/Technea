"""User service providing database operations for users."""

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
        """Register a new user with hashed password."""
        normalized_email = obj_in.email.strip().lower()
        hashed_password = get_password_hash(obj_in.password)
        db_user = User(
            email=normalized_email,
            hashed_password=hashed_password,
            full_name=obj_in.full_name.strip() if obj_in.full_name else None,
            is_active=True,
            is_superuser=False,
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
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
        """Update user profile information and optional password."""
        if obj_in.full_name is not None:
            db_obj.full_name = obj_in.full_name.strip() if obj_in.full_name else None
        if obj_in.avatar_url is not None:
            db_obj.avatar_url = obj_in.avatar_url.strip() if obj_in.avatar_url else None
        if obj_in.bio is not None:
            db_obj.bio = obj_in.bio.strip() if obj_in.bio else None
        if obj_in.password is not None and len(obj_in.password) >= 8:
            db_obj.hashed_password = get_password_hash(obj_in.password)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


user_service = UserService()
