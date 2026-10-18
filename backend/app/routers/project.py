"""API router for Projects and Project Recommendation Engine."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import CurrentUserDep, DatabaseDep, OptionalUserDep
from app.schemas.project import (
    ProjectRecommendationResponse,
    ProjectResponse,
    UserProjectStatusUpdateRequest,
)
from app.services.project import project_service

router = APIRouter(tags=["Project Recommendation Engine"])


@router.get(
    "/recommended",
    response_model=ProjectRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get tailored project recommendations",
)
async def get_recommended_projects(
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> ProjectRecommendationResponse:
    """Recommend hands-on projects directly connecting with mastered skills and career goals."""
    user_id = current_user.id if current_user else None
    return await project_service.get_recommended_projects(db, user_id=user_id)


@router.get(
    "/my",
    response_model=list[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's started and completed projects",
)
async def get_my_projects(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> list[ProjectResponse]:
    """Retrieve all hands-on projects being built or completed by the authenticated user."""
    return await project_service.get_user_projects(db, user_id=current_user.id)


@router.get(
    "",
    response_model=list[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List all hands-on technical projects",
)
async def get_projects(
    db: DatabaseDep,
    current_user: OptionalUserDep,
    difficulty: str | None = Query(default=None, description="Beginner, Intermediate, or Advanced"),
    skill_name: str | None = Query(default=None, description="Skill filter (e.g. Python, React)"),
    search: str | None = Query(default=None, description="Search term in title or description"),
) -> list[ProjectResponse]:
    """Browse the complete engineering project catalog."""
    user_id = current_user.id if current_user else None
    return await project_service.get_projects(
        db,
        difficulty=difficulty,
        skill_name=skill_name,
        search=search,
        user_id=user_id,
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project detail by ID",
)
async def get_project(
    project_id: int,
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> ProjectResponse:
    """Fetch structured milestones, requirements, and tech stack for a specific project."""
    user_id = current_user.id if current_user else None
    proj = await project_service.get_project_by_id(db, project_id=project_id, user_id=user_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    return proj


@router.post(
    "/{project_id}/status",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Start project or update completion status",
)
async def update_project_status(
    project_id: int,
    payload: UserProjectStatusUpdateRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> ProjectResponse:
    """Mark a project as 'in_progress' or 'completed' and attach GitHub repository link."""
    try:
        return await project_service.update_user_project_status(
            db,
            user_id=current_user.id,
            project_id=project_id,
            status=payload.status,
            github_url=payload.github_url,
            notes=payload.notes,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
