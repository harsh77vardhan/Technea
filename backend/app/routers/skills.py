from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate
from app.schemas.search import SkillRelationshipResponse
from app.services.skill import skill_service

router = APIRouter(tags=["Skills"])


@router.get(
    "",
    response_model=list[SkillResponse],
    status_code=status.HTTP_200_OK,
    summary="List all skills",
    description="Retrieve all available skills across technical tracks with optional query or category filter.",
)
async def get_skills(
    db: DatabaseDep,
    q: Annotated[str | None, Query(description="Optional search term for fuzzy or synonym matching")] = None,
    category: Annotated[str | None, Query(description="Optional domain category filter")] = None,
    skip: Annotated[int, Query(ge=0, description="Offset for pagination")] = 0,
    limit: Annotated[int, Query(ge=1, le=300, description="Limit for pagination")] = 150,
) -> list[SkillResponse]:
    """Retrieve all skills with optional query search and filtering."""
    if q or category:
        skills = await skill_service.get_multi_filtered(db, skip=skip, limit=limit, q=q, category=category)
    else:
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


@router.get(
    "/{skill_id}/relationships",
    response_model=SkillRelationshipResponse,
    status_code=status.HTTP_200_OK,
    summary="Get skill relationships graph",
    description="Retrieve skill prerequisite graph, recommended next skills, and associated learning paths.",
)
async def get_skill_relationships(
    skill_id: int,
    db: DatabaseDep,
) -> SkillRelationshipResponse:
    """Retrieve graph relationships for a skill."""
    rel = await skill_service.get_relationships(db, skill_id=skill_id)
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with ID {skill_id} not found",
        )
    return rel
