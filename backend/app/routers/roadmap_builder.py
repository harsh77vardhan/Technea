"""API router for AI Roadmap Builder feature."""

from fastapi import APIRouter, HTTPException, status
from app.api.deps import CurrentUserDep, DatabaseDep
from app.schemas.common import MessageResponse
from app.schemas.learning_path import LearningPathResponse
from app.schemas.roadmap_builder import (
    RoadmapDetailResponse,
    RoadmapGenerateRequest,
    RoadmapGenerateResponse,
    RoadmapProgressToggleRequest,
    RoadmapSaveRequest,
    RoadmapUpdateRequest,
)
from app.services.learning_path import learning_path_service
from app.services.roadmap_builder import roadmap_builder_service

router = APIRouter(tags=["Roadmap Builder"])


@router.post(
    "/generate",
    response_model=RoadmapGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate personalized AI career roadmap",
)
async def generate_roadmap(
    payload: RoadmapGenerateRequest,
    db: DatabaseDep,
) -> RoadmapGenerateResponse:
    """Analyze career goal and synthesize custom phases, milestones, courses, and project blueprints."""
    return await roadmap_builder_service.generate_roadmap(
        db,
        goal=payload.goal,
        experience_level=payload.experience_level or "Beginner",
        current_level=payload.current_level,
        available_time=payload.available_time,
        main_goal=payload.main_goal,
        preferred_style=payload.preferred_style,
        preferred_language=payload.preferred_language,
        current_skills=payload.current_skills,
        target_role=payload.target_role,
    )


@router.post(
    "/save",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save generated roadmap to user account",
)
async def save_user_roadmap(
    payload: RoadmapSaveRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoadmapDetailResponse:
    """Save an AI-generated roadmap to the authenticated user's profile."""
    roadmap = await roadmap_builder_service.save_user_roadmap(
        db,
        user_id=current_user.id,
        title=payload.title,
        goal=payload.goal,
        target_role=payload.target_role,
        experience_level=payload.experience_level,
        estimated_duration=payload.estimated_duration,
        roadmap_data=payload.roadmap_data,
    )
    return RoadmapDetailResponse.model_validate(roadmap)


@router.get(
    "/my",
    response_model=list[RoadmapDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's saved roadmaps",
)
async def get_my_roadmaps(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> list[RoadmapDetailResponse]:
    """Retrieve all customized roadmaps created and saved by the current user."""
    roadmaps = await roadmap_builder_service.get_user_roadmaps(db, user_id=current_user.id)
    return [RoadmapDetailResponse.model_validate(r) for r in roadmaps]


@router.get(
    "/catalog",
    response_model=list[LearningPathResponse],
    status_code=status.HTTP_200_OK,
    summary="Get curated roadmap catalog",
    description="Retrieve curated catalog of role and skill-based roadmaps.",
)
async def get_roadmap_catalog(
    db: DatabaseDep,
    q: str | None = None,
    category: str | None = None,
    level: str | None = None,
    difficulty: str | None = None,
    is_featured: bool | None = None,
    tag: str | None = None,
    limit: int = 100,
    skip: int = 0,
) -> list[LearningPathResponse]:
    """Retrieve curated roadmap catalog without requiring user authentication."""
    diff = difficulty or level
    paths, _ = await learning_path_service.get_paginated(
        db,
        page=(skip // limit) + 1 if limit > 0 else 1,
        page_size=limit,
        q=q,
        category=category,
        difficulty=diff,
        level=diff,
        is_featured=is_featured,
        tag=tag,
    )
    return [LearningPathResponse.model_validate(path) for path in paths]


@router.get(
    "/catalog/{slug_or_id}",
    response_model=LearningPathResponse,
    status_code=status.HTTP_200_OK,
    summary="Get curated roadmap catalog entry by slug or ID",
    description="Retrieve a single curated roadmap by string slug or integer ID.",
)
async def get_roadmap_catalog_entry(
    slug_or_id: str,
    db: DatabaseDep,
) -> LearningPathResponse:
    """Retrieve a single curated roadmap by slug or ID."""
    path = await learning_path_service.get_by_slug_or_id(db, slug_or_id=slug_or_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curated roadmap '{slug_or_id}' not found in catalog",
        )
    return LearningPathResponse.model_validate(path)


@router.get(
    "/{roadmap_id}",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single generated roadmap by ID",
)
async def get_roadmap(
    roadmap_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoadmapDetailResponse:
    """Fetch details of a specific generated roadmap."""
    roadmap = await roadmap_builder_service.get_roadmap_by_id(
        db,
        roadmap_id=roadmap_id,
        user_id=current_user.id,
    )
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found or unauthorized.",
        )
    return RoadmapDetailResponse.model_validate(roadmap)


@router.put(
    "/{roadmap_id}",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update saved roadmap",
)
async def update_user_roadmap(
    roadmap_id: int,
    payload: RoadmapUpdateRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoadmapDetailResponse:
    """Update milestone titles, custom milestones, or metadata in a saved roadmap."""
    try:
        updated = await roadmap_builder_service.update_user_roadmap(
            db,
            roadmap_id=roadmap_id,
            user_id=current_user.id,
            title=payload.title,
            target_role=payload.target_role,
            roadmap_data=payload.roadmap_data,
        )
        return RoadmapDetailResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/{roadmap_id}/progress",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle milestone progress in saved roadmap",
)
async def toggle_milestone_progress(
    roadmap_id: int,
    payload: RoadmapProgressToggleRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoadmapDetailResponse:
    """Mark a milestone in a generated roadmap complete or incomplete."""
    try:
        updated = await roadmap_builder_service.toggle_milestone_progress(
            db,
            roadmap_id=roadmap_id,
            user_id=current_user.id,
            milestone_id=payload.milestone_id,
            is_completed=payload.is_completed,
        )
        return RoadmapDetailResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/{roadmap_id}/regenerate",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Regenerate an existing roadmap",
)
async def regenerate_user_roadmap(
    roadmap_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
    payload: RoadmapGenerateRequest | None = None,
) -> RoadmapDetailResponse:
    """Regenerate a saved roadmap with updated parameters or current configuration, preserving the ID."""
    try:
        updated = await roadmap_builder_service.regenerate_user_roadmap(
            db,
            roadmap_id=roadmap_id,
            user_id=current_user.id,
            goal=payload.goal if payload else None,
            experience_level=payload.experience_level if payload else None,
            current_level=payload.current_level if payload else None,
            available_time=payload.available_time if payload else None,
            main_goal=payload.main_goal if payload else None,
            preferred_style=payload.preferred_style if payload else None,
            preferred_language=payload.preferred_language if payload else None,
            current_skills=payload.current_skills if payload else None,
            target_role=payload.target_role if payload else None,
        )
        return RoadmapDetailResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/{roadmap_id}/set-active",
    response_model=RoadmapDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Set roadmap as user's main active focus",
)
async def set_active_roadmap(
    roadmap_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> RoadmapDetailResponse:
    """Set the specified roadmap as active focus, deactivating others."""
    try:
        updated = await roadmap_builder_service.set_active_roadmap(
            db,
            roadmap_id=roadmap_id,
            user_id=current_user.id,
        )
        return RoadmapDetailResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/{roadmap_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a saved roadmap",
)
async def delete_roadmap(
    roadmap_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> MessageResponse:
    """Delete a generated roadmap from user's account."""
    success = await roadmap_builder_service.delete_roadmap(
        db,
        roadmap_id=roadmap_id,
        user_id=current_user.id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found or unauthorized.",
        )
    return MessageResponse(message="Roadmap successfully removed.")

