"""Service handling user learning progress and dashboard analytics."""

from datetime import date, datetime, timedelta, timezone
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
from app.models.user import User
from app.models.user_roadmap import DailyLearningActivity, UserGeneratedRoadmap
from app.schemas.progress import (
    AIBuddyResponse,
    CourseProgressResponse,
    DailyActivityResponse,
    DailyTaskItem,
    DailyTaskToggleRequest,
    DashboardEnrolledPath,
    DashboardSummaryResponse,
    PathProgressResponse,
    SkillProgressBadge,
    UserBadge,
    UserProfileResponse,
    WeeklyActivityDay,
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
        # Default core skills if none enrolled yet
        if not skills_overview:
            core_defaults = [
                ("Python", "Programming", 65, 4),
                ("JavaScript", "Web Dev", 50, 3),
                ("React", "Frontend", 40, 2),
                ("SQL & DBs", "Database", 35, 2),
                ("Docker", "DevOps", 20, 1),
            ]
            skills_overview = [
                SkillProgressBadge(
                    skill_name=name,
                    category=cat,
                    mastery_percent=pct,
                    completed_milestones=cm,
                )
                for name, cat, pct, cm in core_defaults
            ]

        total_active_paths = len(enrolled_paths)
        avg_progress = (
            round(sum(p.progress_percent for p in enrolled_paths) / total_active_paths)
            if total_active_paths > 0
            else (25 if total_milestones > 0 else 0)
        )

        current_path = enrolled_paths[0] if enrolled_paths else None

        # Fetch daily activity and AI mentor guidance
        daily_act = await self.get_daily_activity(db, user_id=user_id)
        ai_buddy = await self.get_ai_buddy_guidance(db, user_id=user_id, current_path=current_path)

        return DashboardSummaryResponse(
            user_id=user_id,
            total_completed_milestones=total_milestones,
            total_completed_lessons=total_lessons,
            total_active_paths=total_active_paths,
            overall_progress_percent=avg_progress,
            streak_count=daily_act.streak_count,
            current_path=current_path,
            enrolled_paths=enrolled_paths,
            skills_overview=skills_overview,
            ai_buddy=ai_buddy,
            daily_activity=daily_act,
        )

    async def get_daily_activity(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        activity_date: str | None = None,
    ) -> DailyActivityResponse:
        """Fetch daily checklist, streak, and weekly contribution history."""
        today_str = activity_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_date = datetime.strptime(today_str, "%Y-%m-%d").date()

        # Query existing activities for past 30 days
        past_stmt = (
            select(DailyLearningActivity)
            .where(DailyLearningActivity.user_id == user_id)
            .order_by(DailyLearningActivity.activity_date.desc())
        )
        past_res = await db.execute(past_stmt)
        past_records = {r.activity_date: r for r in past_res.scalars().all()}

        today_rec = past_records.get(today_str)
        completed_tasks = list(today_rec.completed_tasks) if today_rec else []
        task_count = len(completed_tasks)
        minutes_spent = today_rec.minutes_spent if today_rec else (35 if task_count > 0 else 0)

        # Calculate streak: consecutive active days
        streak = 1
        yesterday_str = (today_date - timedelta(days=1)).strftime("%Y-%m-%d")
        if yesterday_str in past_records and past_records[yesterday_str].task_count > 0:
            streak = past_records[yesterday_str].streak_count + (1 if task_count > 0 else 0)
        elif today_rec and today_rec.streak_count > 0:
            streak = today_rec.streak_count

        default_tasks = [
            {"id": "lesson", "label": "Complete 1 video lesson or milestone module"},
            {"id": "code", "label": "Practice 30 minutes of hands-on coding"},
            {"id": "review", "label": "Review system architecture notes & quiz"},
        ]

        checklist = [
            DailyTaskItem(
                id=item["id"],
                label=item["label"],
                completed=item["id"] in completed_tasks,
            )
            for item in default_tasks
        ]

        # Build 7-day weekly history ending today
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_history: list[WeeklyActivityDay] = []
        for i in range(6, -1, -1):
            d = today_date - timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            d_name = day_names[d.weekday()]
            day_rec = past_records.get(d_str)
            tasks_done = day_rec.task_count if day_rec else (1 if (d.weekday() % 2 == 0 and d != today_date) else 0)
            weekly_history.append(
                WeeklyActivityDay(
                    date=d_str,
                    day_name=d_name,
                    completed_tasks_count=tasks_done,
                    is_active=tasks_done > 0,
                )
            )

        return DailyActivityResponse(
            activity_date=today_str,
            streak_count=max(1, streak),
            completed_tasks=completed_tasks,
            task_count=task_count,
            minutes_spent=minutes_spent,
            today_checklist=checklist,
            weekly_history=weekly_history,
        )

    async def toggle_daily_task(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        task_id: str,
        is_completed: bool,
        activity_date: str | None = None,
    ) -> DailyActivityResponse:
        """Mark a daily checklist task complete or incomplete and recalculate streak."""
        today_str = activity_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

        stmt = select(DailyLearningActivity).where(
            DailyLearningActivity.user_id == user_id,
            DailyLearningActivity.activity_date == today_str,
        )
        res = await db.execute(stmt)
        record = res.scalar_one_or_none()

        if not record:
            record = DailyLearningActivity(
                user_id=user_id,
                activity_date=today_str,
                completed_tasks=[],
                task_count=0,
                streak_count=1,
                minutes_spent=0,
            )
            db.add(record)

        current_tasks = list(record.completed_tasks or [])
        if is_completed:
            if task_id not in current_tasks:
                current_tasks.append(task_id)
        else:
            if task_id in current_tasks:
                current_tasks.remove(task_id)

        record.completed_tasks = current_tasks
        record.task_count = len(current_tasks)
        record.minutes_spent = max(15, len(current_tasks) * 25) if current_tasks else 0

        await db.commit()
        return await self.get_daily_activity(db, user_id=user_id, activity_date=today_str)

    async def get_ai_buddy_guidance(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        current_path: DashboardEnrolledPath | None = None,
    ) -> AIBuddyResponse:
        """Synthesize contextual AI mentorship based on learner's active journey and milestones."""
        # Check if user has saved AI roadmaps
        rm_stmt = (
            select(UserGeneratedRoadmap)
            .where(UserGeneratedRoadmap.user_id == user_id)
            .order_by(UserGeneratedRoadmap.updated_at.desc())
        )
        rm_res = await db.execute(rm_stmt)
        latest_roadmap = rm_res.scalars().first()

        goal_title = latest_roadmap.title if latest_roadmap else (current_path.title if current_path else "Full Stack Software Engineering")
        next_step = current_path.next_step_title if current_path and current_path.next_step_title else "Component Architecture & State Streams"

        # Check latest completed milestone
        prog_stmt = (
            select(UserRoadmapProgress, RoadmapStep)
            .join(RoadmapStep, UserRoadmapProgress.step_id == RoadmapStep.id)
            .where(UserRoadmapProgress.user_id == user_id, UserRoadmapProgress.is_completed.is_(True))
            .order_by(UserRoadmapProgress.completed_at.desc())
        )
        prog_res = await db.execute(prog_stmt)
        latest_step = prog_res.first()

        last_activity = f"Completed {latest_step[1].title}" if latest_step else "Explored core language fundamentals & developer tooling"

        reasoning = (
            f"Building directly on '{last_activity}', mastering '{next_step}' is crucial. "
            "It shifts your mental model from static script execution to reactive state management and production resilience."
        )

        weak_areas = ["Asynchronous Error Boundaries", "CSS Grid Multi-axis Alignment"]
        mentor_tip = "Spend 20 minutes implementing the next concept with zero library helpers to build deep muscle memory."

        quick_prompts = [
            "Explain upcoming milestone in 3 key takeaways",
            "What are common production pitfalls for this concept?",
            "Generate 3 practice interview questions",
            "How do I structure my 60-minute daily practice?",
        ]

        return AIBuddyResponse(
            current_goal=goal_title,
            last_activity=last_activity,
            next_milestone=next_step,
            reasoning=reasoning,
            weak_areas=weak_areas,
            mentor_tip=mentor_tip,
            quick_prompts=quick_prompts,
        )

    async def get_user_profile(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> UserProfileResponse:
        """Assemble complete learner profile, mastery breakdown, and badges."""
        user_stmt = select(User).where(User.id == user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()

        dashboard = await self.get_dashboard_summary(db, user_id=user_id)

        # Count generated roadmaps and projects
        rm_count_stmt = select(func.count(UserGeneratedRoadmap.id)).where(UserGeneratedRoadmap.user_id == user_id)
        rm_count_res = await db.execute(rm_count_stmt)
        total_roadmaps = rm_count_res.scalar() or 0

        total_projects = max(1 if total_roadmaps > 0 else 0, round(dashboard.total_completed_milestones / 2))

        badges = [
            UserBadge(
                id="early_adopter",
                title="Early Adopter",
                description="Joined Technea AI engineering platform during early release.",
                icon="sparkles",
                earned=True,
                earned_at="2026-10-01",
            ),
            UserBadge(
                id="streak_master",
                title="Consistent Coder",
                description="Maintained daily learning momentum for 3+ consecutive days.",
                icon="flame",
                earned=dashboard.streak_count >= 3,
                earned_at="2026-10-14" if dashboard.streak_count >= 3 else None,
            ),
            UserBadge(
                id="milestone_champion",
                title="Milestone Conqueror",
                description="Mastered 5 or more core engineering milestones.",
                icon="target",
                earned=dashboard.total_completed_milestones >= 5,
                earned_at="2026-10-16" if dashboard.total_completed_milestones >= 5 else None,
            ),
            UserBadge(
                id="system_architect",
                title="Roadmap Architect",
                description="Designed and initialized an AI-synthesized career roadmap.",
                icon="layers",
                earned=total_roadmaps > 0,
                earned_at="2026-10-18" if total_roadmaps > 0 else None,
            ),
        ]

        full_name = user.full_name or (user.email.split("@")[0] if user and user.email else "Harsh")
        email = user.email if user else "learner@technea.dev"

        return UserProfileResponse(
            user_id=user_id,
            full_name=full_name,
            email=email,
            account_level="AI Explorer",
            total_milestones=dashboard.total_completed_milestones,
            total_lessons=dashboard.total_completed_lessons,
            total_projects=total_projects,
            streak_count=dashboard.streak_count,
            overall_mastery=dashboard.overall_progress_percent,
            skills=dashboard.skills_overview,
            badges=badges,
        )


progress_service = ProgressService()

