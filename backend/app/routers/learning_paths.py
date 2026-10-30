from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Response, status
from app.api.deps import DatabaseDep
from app.schemas.learning_path import LearningPathPaginationResponse, LearningPathResponse
from app.services.learning_path import learning_path_service

router = APIRouter(tags=["Learning Paths"])


@router.get(
    "",
    response_model=LearningPathPaginationResponse,
    status_code=status.HTTP_200_OK,
    summary="List all learning paths",
    description="Retrieve learning paths along with their associated roadmap steps, supporting search, filtering, and pagination.",
)
async def get_learning_paths(
    db: DatabaseDep,
    response: Response,
    page: Annotated[int, Query(ge=1, description="Page number (1-based)")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    q: Annotated[str | None, Query(description="Optional search query across title, description, skills, and tags")] = None,
    category: Annotated[str | None, Query(description="Optional domain category filter")] = None,
    difficulty: Annotated[str | None, Query(description="Optional difficulty level filter")] = None,
    level: Annotated[str | None, Query(description="Optional skill level filter alias")] = None,
    is_featured: Annotated[bool | None, Query(description="Optional filter for featured roadmaps")] = None,
    tag: Annotated[str | None, Query(description="Optional filter by tag or technical skill")] = None,
    duration: Annotated[str | None, Query(description="Optional duration filter")] = None,
    goal: Annotated[str | None, Query(description="Optional goal filter")] = None,
    style: Annotated[str | None, Query(description="Optional learning style filter")] = None,
    language: Annotated[str | None, Query(description="Optional language filter")] = None,
    skip: Annotated[int | None, Query(ge=0, description="Offset for pagination (backward compatibility)")] = None,
    limit: Annotated[int | None, Query(ge=1, le=500, description="Limit for pagination (backward compatibility)")] = None,
) -> LearningPathPaginationResponse:
    """Retrieve learning paths with full pagination, filtering, and search support."""
    effective_page_size = page_size
    effective_page = page

    if limit is not None:
        effective_page_size = min(max(1, limit), 100)

    if skip is not None and skip > 0:
        effective_page = (skip // effective_page_size) + 1

    items, total = await learning_path_service.get_paginated(
        db,
        page=effective_page,
        page_size=effective_page_size,
        q=q,
        category=category,
        difficulty=difficulty,
        level=level,
        is_featured=is_featured,
        tag=tag,
        duration=duration,
        goal=goal,
        style=style,
        language=language,
    )

    total_pages = (total + effective_page_size - 1) // effective_page_size if effective_page_size > 0 else 1

    return LearningPathPaginationResponse(
        items=[LearningPathResponse.model_validate(path) for path in items],
        total=total,
        page=effective_page,
        page_size=effective_page_size,
        total_pages=total_pages,
    )


@router.get(
    "/featured",
    response_model=list[LearningPathResponse],
    status_code=status.HTTP_200_OK,
    summary="List featured learning paths",
    description="Retrieve curated featured learning paths ordered by popularity rank.",
)
async def get_featured_learning_paths(
    db: DatabaseDep,
    limit: Annotated[int, Query(ge=1, le=100, description="Limit of featured paths")] = 10,
    skip: Annotated[int, Query(ge=0, description="Offset")] = 0,
) -> list[LearningPathResponse]:
    """Retrieve top featured learning paths."""
    paths = await learning_path_service.get_featured(db, limit=limit, skip=skip)
    return [LearningPathResponse.model_validate(p) for p in paths]


@router.get(
    "/recommended",
    response_model=list[LearningPathResponse],
    status_code=status.HTTP_200_OK,
    summary="List recommended learning paths",
    description="Retrieve recommended learning paths based on popularity and featured status.",
)
async def get_recommended_learning_paths(
    db: DatabaseDep,
    limit: Annotated[int, Query(ge=1, le=100, description="Limit of recommended paths")] = 10,
    skip: Annotated[int, Query(ge=0, description="Offset")] = 0,
) -> list[LearningPathResponse]:
    """Retrieve recommended learning paths."""
    paths = await learning_path_service.get_recommended(db, limit=limit, skip=skip)
    return [LearningPathResponse.model_validate(p) for p in paths]


@router.get(
    "/{slug_or_id}",
    response_model=LearningPathResponse,
    status_code=status.HTTP_200_OK,
    summary="Get learning path by slug or ID",
    description="Retrieve a specific learning path with its ordered roadmap steps by string slug or integer ID.",
)
async def get_learning_path(
    slug_or_id: str,
    db: DatabaseDep,
) -> LearningPathResponse:
    """Retrieve a single learning path by slug or ID."""
    path = await learning_path_service.get_by_slug_or_id(db, slug_or_id=slug_or_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning path '{slug_or_id}' not found",
        )
    return LearningPathResponse.model_validate(path)
