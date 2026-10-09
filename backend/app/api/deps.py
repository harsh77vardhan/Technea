"""Common FastAPI dependencies for dependency injection across routers."""

from collections.abc import AsyncGenerator
from typing import Annotated
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import PaginationParams

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
