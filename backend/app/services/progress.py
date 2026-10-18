"""Service handling user learning progress and dashboard analytics."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.lesson import Lesson
from app.models.progress import (
    UserLearningPath,
    UserLessonProgress,
    UserRoadmapProgress,
)
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.schemas.progress import (
    CourseProgressResponse,
    DashboardEnrolledPath,
    DashboardSummaryResponse,
    PathProgressResponse,
    SkillProgressBadge,
)


class ProgressService:
    """Service handling roadmap steps, lesson tracking, and dashboard summaries."""

    async def get_path_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        path_id: int,
    ) -> PathProgressResponse:
        """Fetch completed roadmap steps and overall percentage for a path."""
        # 1. Get completed step IDs
        step_stmt = select(UserRoadmapProgress.step_id).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.learning_path_id == path_id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        step_result = await db.execute(step_stmt)
        completed_step_ids = list(step_result.scalars().all())

        # 2. Get total roadmap steps for this path
        total_stmt = select(func.count(RoadmapStep.id)).where(
            RoadmapStep.learning_path_id == path_id
        )
        total_result = await db.execute(total_stmt)
        total_steps = total_result.scalar() or 0

        # Calculate percentage
        percent = (
            min(100, round((len(completed_step_ids) / total_steps) * 100))
            if total_steps > 0
            else 0
        )

        return PathProgressResponse(
            learning_path_id=path_id,
            completed_step_ids=completed_step_ids,
            total_steps=total_steps,
            progress_percent=percent,
        )

    async def toggle_roadmap_step(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        path_id: int,
        step_id: int,
        is_completed: bool,
    ) -> PathProgressResponse:
        """Mark a roadmap step completed or uncompleted and update path enrollment."""
        # Check existing progress record
        stmt = select(UserRoadmapProgress).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.step_id == step_id,
        )
        res = await db.execute(stmt)
        progress_rec = res.scalar_one_or_none()

        if is_completed:
            if not progress_rec:
                new_rec = UserRoadmapProgress(
                    user_id=user_id,
                    learning_path_id=path_id,
                    step_id=step_id,
                    is_completed=True,
                    completed_at=datetime.now(timezone.utc),
                )
                db.add(new_rec)
            else:
                progress_rec.is_completed = True
                progress_rec.completed_at = datetime.now(timezone.utc)
        else:
            if progress_rec:
                await db.delete(progress_rec)

        # Calculate new path percentage
        await db.flush()

        step_stmt = select(UserRoadmapProgress.step_id).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.learning_path_id == path_id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        step_res = await db.execute(step_stmt)
        completed_step_ids = list(step_res.scalars().all())

        total_stmt = select(func.count(RoadmapStep.id)).where(
            RoadmapStep.learning_path_id == path_id
        )
        total_res = await db.execute(total_stmt)
        total_steps = total_res.scalar() or 0

        percent = (
            min(100, round((len(completed_step_ids) / total_steps) * 100))
            if total_steps > 0
            else 0
        )

        # Update or create UserLearningPath enrollment
        ulp_stmt = select(UserLearningPath).where(
            UserLearningPath.user_id == user_id,
            UserLearningPath.learning_path_id == path_id,
        )
        ulp_res = await db.execute(ulp_stmt)
        ulp = ulp_res.scalar_one_or_none()

        if not ulp:
            ulp = UserLearningPath(
                user_id=user_id,
                learning_path_id=path_id,
                status="completed" if percent == 100 else "active",
                progress_percent=percent,
                last_accessed_at=datetime.now(timezone.utc),
            )
            db.add(ulp)
        else:
            ulp.progress_percent = percent
            ulp.status = "completed" if percent == 100 else "active"
            ulp.last_accessed_at = datetime.now(timezone.utc)

        await db.commit()

        return PathProgressResponse(
            learning_path_id=path_id,
            completed_step_ids=completed_step_ids,
            total_steps=total_steps,
            progress_percent=percent,
        )

    async def get_course_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        course_id: int,
    ) -> CourseProgressResponse:
        """Fetch completed lesson IDs and progress percentage for a course."""
        stmt = select(UserLessonProgress.lesson_id).where(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.course_id == course_id,
            UserLessonProgress.is_completed.is_(True),
        )
        res = await db.execute(stmt)
        completed_lesson_ids = list(res.scalars().all())

        total_stmt = select(func.count(Lesson.id)).where(
            Lesson.course_id == course_id
        )
        total_res = await db.execute(total_stmt)
        total_lessons = total_res.scalar() or 0

        percent = (
            min(100, round((len(completed_lesson_ids) / total_lessons) * 100))
            if total_lessons > 0
            else 0
        )

        return CourseProgressResponse(
            course_id=course_id,
            completed_lesson_ids=completed_lesson_ids,
            total_lessons=total_lessons,
            progress_percent=percent,
        )

    async def toggle_lesson_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        course_id: int,
        lesson_id: int,
        is_completed: bool,
    ) -> CourseProgressResponse:
        """Mark a video lesson complete or incomplete."""
        stmt = select(UserLessonProgress).where(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.lesson_id == lesson_id,
        )
        res = await db.execute(stmt)
        rec = res.scalar_one_or_none()

        if is_completed:
            if not rec:
                new_rec = UserLessonProgress(
                    user_id=user_id,
                    course_id=course_id,
                    lesson_id=lesson_id,
                    is_completed=True,
                    completed_at=datetime.now(timezone.utc),
                )
                db.add(new_rec)
            else:
                rec.is_completed = True
                rec.completed_at = datetime.now(timezone.utc)
        else:
            if rec:
                await db.delete(rec)

        await db.commit()
        return await self.get_course_progress(db, user_id=user_id, course_id=course_id)

    async def sync_guest_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        path_progress: dict[str, list[int]],
        course_progress: dict[str, list[int]],
    ) -> None:
        """Sync guest localStorage progress records into the user's database account."""
        now = datetime.now(timezone.utc)

        # 1. Sync roadmap step progress
        for path_id_str, step_ids in path_progress.items():
            try:
                path_id = int(path_id_str)
            except ValueError:
                continue

            for step_id in step_ids:
                if not isinstance(step_id, int):
                    continue
                stmt = select(UserRoadmapProgress).where(
                    UserRoadmapProgress.user_id == user_id,
                    UserRoadmapProgress.step_id == step_id,
                )
                res = await db.execute(stmt)
                if not res.scalar_one_or_none():
                    db.add(
                        UserRoadmapProgress(
                            user_id=user_id,
                            learning_path_id=path_id,
                            step_id=step_id,
                            is_completed=True,
                            completed_at=now,
                        )
                    )

            await db.flush()

            # Recalculate and update path progress enrollment
            total_stmt = select(func.count(RoadmapStep.id)).where(
                RoadmapStep.learning_path_id == path_id
            )
            total_res = await db.execute(total_stmt)
            total_steps = total_res.scalar() or 0

            step_stmt = select(func.count(UserRoadmapProgress.id)).where(
                UserRoadmapProgress.user_id == user_id,
                UserRoadmapProgress.learning_path_id == path_id,
                UserRoadmapProgress.is_completed.is_(True),
            )
            step_res = await db.execute(step_stmt)
            completed_count = step_res.scalar() or 0

            percent = (
                min(100, round((completed_count / total_steps) * 100))
                if total_steps > 0
                else 0
            )

            ulp_stmt = select(UserLearningPath).where(
                UserLearningPath.user_id == user_id,
                UserLearningPath.learning_path_id == path_id,
            )
            ulp_res = await db.execute(ulp_stmt)
            ulp = ulp_res.scalar_one_or_none()

            if not ulp:
                db.add(
                    UserLearningPath(
                        user_id=user_id,
                        learning_path_id=path_id,
                        status="completed" if percent == 100 else "active",
                        progress_percent=percent,
                        last_accessed_at=now,
                    )
                )
            else:
                ulp.progress_percent = max(ulp.progress_percent, percent)
                ulp.last_accessed_at = now

        # 2. Sync lesson progress
        for course_id_str, lesson_ids in course_progress.items():
            try:
                course_id = int(course_id_str)
            except ValueError:
                continue

            for lesson_id in lesson_ids:
                if not isinstance(lesson_id, int):
                    continue
                l_stmt = select(UserLessonProgress).where(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.lesson_id == lesson_id,
                )
                l_res = await db.execute(l_stmt)
                if not l_res.scalar_one_or_none():
                    db.add(
                        UserLessonProgress(
                            user_id=user_id,
                            course_id=course_id,
                            lesson_id=lesson_id,
                            is_completed=True,
                            completed_at=now,
                        )
                    )

        await db.commit()

    async def get_dashboard_summary(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> DashboardSummaryResponse:
        """Assemble comprehensive dashboard analytics for the current user."""
        # 1. Total completed milestones
        m_stmt = select(func.count(UserRoadmapProgress.id)).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        m_res = await db.execute(m_stmt)
        total_milestones = m_res.scalar() or 0

        # 2. Total completed lessons
        l_stmt = select(func.count(UserLessonProgress.id)).where(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.is_completed.is_(True),
        )
        l_res = await db.execute(l_stmt)
        total_lessons = l_res.scalar() or 0

        # 3. Enrolled paths ordered by last accessed
        ulp_stmt = (
            select(UserLearningPath, LearningPath)
            .join(LearningPath, UserLearningPath.learning_path_id == LearningPath.id)
            .where(UserLearningPath.user_id == user_id)
            .order_by(UserLearningPath.last_accessed_at.desc())
        )
        ulp_res = await db.execute(ulp_stmt)
        path_rows = ulp_res.all()

        enrolled_paths: list[DashboardEnrolledPath] = []
        skills_tally: dict[str, dict[str, int]] = {}

        for ulp, lp in path_rows:
            # Query steps for this path
            steps_stmt = select(RoadmapStep).where(
                RoadmapStep.learning_path_id == lp.id
            ).order_by(RoadmapStep.step_number)
            steps_res = await db.execute(steps_stmt)
            steps = list(steps_res.scalars().all())

            # Query completed steps
            c_stmt = select(UserRoadmapProgress.step_id).where(
                UserRoadmapProgress.user_id == user_id,
                UserRoadmapProgress.learning_path_id == lp.id,
                UserRoadmapProgress.is_completed.is_(True),
            )
            c_res = await db.execute(c_stmt)
            completed_step_ids = set(c_res.scalars().all())

            next_step_title = None
            for s in steps:
                if s.id not in completed_step_ids:
                    next_step_title = s.title
                    break

            enrolled_paths.append(
                DashboardEnrolledPath(
                    id=lp.id,
                    title=lp.title,
                    category=lp.category,
                    level=lp.level,
                    duration=lp.duration,
                    progress_percent=ulp.progress_percent,
                    completed_steps_count=len(completed_step_ids),
                    total_steps_count=len(steps),
                    next_step_title=next_step_title,
                    last_accessed_at=ulp.last_accessed_at,
                )
            )

            # Tally category/skill progress
            cat = lp.category or "General"
            if cat not in skills_tally:
                skills_tally[cat] = {"completed": 0, "total": 0}
            skills_tally[cat]["completed"] += len(completed_step_ids)
            skills_tally[cat]["total"] += max(1, len(steps))

        # Build skills overview badges
        skills_overview: list[SkillProgressBadge] = []
        for cat, data in skills_tally.items():
            pct = round((data["completed"] / data["total"]) * 100) if data["total"] > 0 else 0
            skills_overview.append(
                SkillProgressBadge(
                    skill_name=cat,
                    category=cat,
                    mastery_percent=min(100, pct),
                    completed_milestones=data["completed"],
                )
            )

        total_active_paths = len(enrolled_paths)
        avg_progress = (
            round(sum(p.progress_percent for p in enrolled_paths) / total_active_paths)
            if total_active_paths > 0
            else 0
        )

        current_path = enrolled_paths[0] if enrolled_paths else None

        return DashboardSummaryResponse(
            user_id=user_id,
            total_completed_milestones=total_milestones,
            total_completed_lessons=total_lessons,
            total_active_paths=total_active_paths,
            overall_progress_percent=avg_progress,
            current_path=current_path,
            enrolled_paths=enrolled_paths,
            skills_overview=skills_overview,
        )


progress_service = ProgressService()
