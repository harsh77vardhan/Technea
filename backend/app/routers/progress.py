"""User learning progress and dashboard analytics router."""

from fastapi import APIRouter, status
from app.api.deps import CurrentUserDep, DatabaseDep
from app.schemas.common import MessageResponse
from app.schemas.progress import (
    CourseProgressResponse,
    DashboardSummaryResponse,
    GuestProgressSyncRequest,
    LessonToggleRequest,
    PathProgressResponse,
    RoadmapStepToggleRequest,
)
from app.services.progress import progress_service

router = APIRouter(tags=["User Progress"])


@router.get(
    "/learning-paths/{path_id}",
    response_model=PathProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user's roadmap step progress for a learning path",
)
async def get_path_progress(
    path_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> PathProgressResponse:
    """Retrieve all completed roadmap step IDs and completion percentage for a learning path."""
    return await progress_service.get_path_progress(
        db,
        user_id=current_user.id,
        path_id=path_id,
    )


@router.post(
    "/steps/toggle",
    response_model=PathProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle milestone completion for a roadmap step",
)
async def toggle_step_progress(
    payload: RoadmapStepToggleRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> PathProgressResponse:
    """Mark a roadmap step as complete or incomplete."""
    return await progress_service.toggle_roadmap_step(
        db,
        user_id=current_user.id,
        path_id=payload.learning_path_id,
        step_id=payload.step_id,
        is_completed=payload.is_completed,
    )


@router.get(
    "/courses/{course_id}",
    response_model=CourseProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user's completed lessons for a course",
)
async def get_course_progress(
    course_id: int,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> CourseProgressResponse:
    """Retrieve all completed video lesson IDs and progress percentage for a course."""
    return await progress_service.get_course_progress(
        db,
        user_id=current_user.id,
        course_id=course_id,
    )


@router.post(
    "/lessons/toggle",
    response_model=CourseProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle lesson completion for a course video",
)
async def toggle_lesson_progress(
    payload: LessonToggleRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> CourseProgressResponse:
    """Mark a video lesson as complete or incomplete."""
    return await progress_service.toggle_lesson_progress(
        db,
        user_id=current_user.id,
        course_id=payload.course_id,
        lesson_id=payload.lesson_id,
        is_completed=payload.is_completed,
    )


@router.post(
    "/sync",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync guest localStorage progress to authenticated account",
)
async def sync_guest_progress(
    payload: GuestProgressSyncRequest,
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> MessageResponse:
    """Merge guest progress saved in browser localStorage into the user's account."""
    await progress_service.sync_guest_progress(
        db,
        user_id=current_user.id,
        path_progress=payload.path_progress,
        course_progress=payload.course_progress,
    )
    return MessageResponse(message="Guest progress successfully synchronized with user account.")


@router.get(
    "/dashboard",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user's personalized learning dashboard summary",
)
async def get_dashboard_summary(
    current_user: CurrentUserDep,
    db: DatabaseDep,
) -> DashboardSummaryResponse:
    """Retrieve overall learning metrics, active learning paths, and skill mastery breakdown."""
    return await progress_service.get_dashboard_summary(
        db,
        user_id=current_user.id,
    )
