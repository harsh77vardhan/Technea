"""Skills API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate
from app.services.skill import skill_service

router = APIRouter(tags=["Skills"])


@router.get(
    "",
    response_model=list[SkillResponse],
    status_code=status.HTTP_200_OK,
    summary="List all skills",
    description="Retrieve all available skills across technical tracks.",
)
async def get_skills(
    db: DatabaseDep,
    skip: int = Query(default=0, ge=0, description="Offset for pagination"),
    limit: int = Query(default=100, ge=1, le=100, description="Limit for pagination"),
) -> list[SkillResponse]:
    """Retrieve all skills."""
    skills = await skill_service.get_multi(db, skip=skip, limit=limit)
    return [SkillResponse.model_validate(skill) for skill in skills]


@router.get(
    "/{skill_id}",
    response_model=SkillResponse,
    status_code=status.HTTP_200_OK,
    summary="Get skill by ID",
    description="Retrieve details for a specific skill by its unique identifier.",
)
async def get_skill(
    skill_id: int,
    db: DatabaseDep,
) -> SkillResponse:
    """Retrieve a single skill by ID."""
    skill = await skill_service.get(db, id=skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with ID {skill_id} not found",
        )
    return SkillResponse.model_validate(skill)
