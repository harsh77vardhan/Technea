from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.course import CourseResponse
from app.schemas.lesson import LessonResponse
from app.services.course import course_service
from app.services.search import search_service

router = APIRouter(tags=["Courses"])


@router.get(
    "",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK,
    summary="List all courses",
    description="Retrieve all available courses, optionally filtered by skill ID, learning path ID, or search query.",
)
async def get_courses(
    db: DatabaseDep,
    q: Annotated[str | None, Query(description="Search term for fuzzy or synonym course matching")] = None,
    level: Annotated[str | None, Query(description="Optional difficulty level filter")] = None,
    skill_id: Annotated[int | None, Query(description="Filter courses by associated skill ID")] = None,
    learning_path_id: Annotated[int | None, Query(description="Filter courses by associated learning path ID")] = None,
    skip: Annotated[int, Query(ge=0, description="Offset for pagination")] = 0,
    limit: Annotated[int, Query(ge=1, le=2000, description="Limit for pagination")] = 200,
) -> list[CourseResponse]:
    """Retrieve courses."""
    if q and isinstance(q, str):
        courses = await search_service.search_courses(db, query=q, level=level, limit=limit)
        return [CourseResponse.model_validate(course) for course in courses]

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
    limit: Annotated[int, Query(ge=1, le=10, description="Max related courses to return")] = 4,
) -> list[CourseResponse]:
    """Retrieve related courses for recommendations."""
    lim = limit if isinstance(limit, int) else 4
    related = await course_service.get_related(db, course_id=course_id, limit=lim)
    return [CourseResponse.model_validate(course) for course in related]

