"""Common FastAPI dependencies for dependency injection across routers."""

from collections.abc import AsyncGenerator
from typing import Annotated
import uuid
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import PaginationParams
from app.services.user import user_service


# Database dependency alias
DatabaseDep = Annotated[AsyncSession, Depends(get_db)]


def get_pagination_params(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(
        default=20, ge=1, le=100, description="Items per page"
    ),
) -> PaginationParams:
    """Dependency that extracts and validates pagination parameters from query string."""
    return PaginationParams(page=page, page_size=page_size)


PaginationDep = Annotated[PaginationParams, Depends(get_pagination_params)]


# OAuth2 Password Bearer for OpenAPI docs and token extraction
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_user(
    db: DatabaseDep,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User:
    """Dependency that extracts and validates the JWT access token and returns the active User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id_str: str | None = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = await user_service.get(db, id=user_id)
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


async def get_optional_current_user(
    db: DatabaseDep,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User | None:
    """Dependency that returns the current User if a valid token is provided, or None if guest."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        user_id = uuid.UUID(payload["sub"])
        user = await user_service.get(db, id=user_id)
        if user and user.is_active:
            return user
        return None
    except Exception:
        return None


CurrentUserDep = Annotated[User, Depends(get_current_user)]
OptionalUserDep = Annotated[User | None, Depends(get_optional_current_user)]
