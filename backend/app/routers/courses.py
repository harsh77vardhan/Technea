"""Courses API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.course import CourseResponse
from app.services.course import course_service

router = APIRouter(tags=["Courses"])


@router.get(
    "",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK,
    summary="List all courses",
    description="Retrieve all available courses, optionally filtered by skill ID.",
)
async def get_courses(
    db: DatabaseDep,
    skill_id: int | None = Query(default=None, description="Filter courses by associated skill ID"),
    skip: int = Query(default=0, ge=0, description="Offset for pagination"),
    limit: int = Query(default=100, ge=1, le=100, description="Limit for pagination"),
) -> list[CourseResponse]:
    """Retrieve courses."""
    if skill_id is not None:
        courses = await course_service.get_by_skill(db, skill_id=skill_id)
        return [CourseResponse.model_validate(course) for course in courses]

    courses = await course_service.get_multi(db, skip=skip, limit=limit)
    return [CourseResponse.model_validate(course) for course in courses]


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get course by ID",
    description="Retrieve details for a specific course by its unique identifier.",
)
async def get_course(
    course_id: int,
    db: DatabaseDep,
) -> CourseResponse:
    """Retrieve a single course by ID."""
    course = await course_service.get(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found",
        )
    return CourseResponse.model_validate(course)
