"""Learning paths API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.learning_path import LearningPathResponse
from app.services.learning_path import learning_path_service

router = APIRouter(tags=["Learning Paths"])


@router.get(
    "",
    response_model=list[LearningPathResponse],
    status_code=status.HTTP_200_OK,
    summary="List all learning paths",
    description="Retrieve all learning paths along with their associated roadmap steps.",
)
async def get_learning_paths(
    db: DatabaseDep,
    skip: int = Query(default=0, ge=0, description="Offset for pagination"),
    limit: int = Query(default=100, ge=1, le=100, description="Limit for pagination"),
) -> list[LearningPathResponse]:
    """Retrieve all learning paths."""
    paths = await learning_path_service.get_multi_with_steps(db, skip=skip, limit=limit)
    return [LearningPathResponse.model_validate(path) for path in paths]


@router.get(
    "/{path_id}",
    response_model=LearningPathResponse,
    status_code=status.HTTP_200_OK,
    summary="Get learning path by ID",
    description="Retrieve a specific learning path with its ordered roadmap steps.",
)
async def get_learning_path(
    path_id: int,
    db: DatabaseDep,
) -> LearningPathResponse:
    """Retrieve a single learning path by ID."""
    path = await learning_path_service.get_with_steps(db, id=path_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning path with ID {path_id} not found",
        )
    return LearningPathResponse.model_validate(path)
