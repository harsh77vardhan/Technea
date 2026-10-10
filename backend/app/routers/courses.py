"""Courses API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.course import CourseResponse
from app.schemas.lesson import LessonResponse
from app.services.course import course_service

router = APIRouter(tags=["Courses"])


@router.get(
    "",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK,
    summary="List all courses",
    description="Retrieve all available courses, optionally filtered by skill ID or learning path ID.",
)
async def get_courses(
    db: DatabaseDep,
    skill_id: int | None = Query(default=None, description="Filter courses by associated skill ID"),
    learning_path_id: int | None = Query(default=None, description="Filter courses by associated learning path ID"),
    skip: int = Query(default=0, ge=0, description="Offset for pagination"),
    limit: int = Query(default=200, ge=1, le=500, description="Limit for pagination"),
) -> list[CourseResponse]:
    """Retrieve courses."""
    if skill_id is not None or learning_path_id is not None:
        courses = await course_service.get_filtered(
            db,
            skill_id=skill_id,
            learning_path_id=learning_path_id,
            skip=skip,
            limit=limit,
        )
        return [CourseResponse.model_validate(course) for course in courses]

    courses = await course_service.get_multi_with_lessons(db, skip=skip, limit=limit)
    return [CourseResponse.model_validate(course) for course in courses]


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get course by ID",
    description="Retrieve details for a specific course by its unique identifier, including lessons.",
)
async def get_course(
    course_id: int,
    db: DatabaseDep,
) -> CourseResponse:
    """Retrieve a single course by ID with its lessons."""
    course = await course_service.get_with_lessons(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found",
        )
    return CourseResponse.model_validate(course)


@router.get(
    "/{course_id}/lessons",
    response_model=list[LessonResponse],
    status_code=status.HTTP_200_OK,
    summary="Get course lessons",
    description="Retrieve ordered lessons/playlist items for a course.",
)
async def get_course_lessons(
    course_id: int,
    db: DatabaseDep,
) -> list[LessonResponse]:
    """Retrieve all lessons for a specific course."""
    course = await course_service.get_with_lessons(db, id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found",
        )
    return [LessonResponse.model_validate(lesson) for lesson in course.lessons]


@router.get(
    "/{course_id}/related",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK,
    summary="Get related courses",
    description="Retrieve related courses in the same track or skill.",
)
async def get_related_courses(
    course_id: int,
    db: DatabaseDep,
    limit: int = Query(default=4, ge=1, le=10, description="Max related courses to return"),
) -> list[CourseResponse]:
    """Retrieve related courses for recommendations."""
    related = await course_service.get_related(db, course_id=course_id, limit=limit)
    return [CourseResponse.model_validate(course) for course in related]

