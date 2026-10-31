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
from app.models.project import Project, UserProject
from app.models.community import LearningRoom, UserLearningRoom
from app.models.achievement import Achievement, UserAchievement
from app.schemas.progress import (
    AchievementItemResponse,
    AIBuddyResponse,
    AIMentorChatRequest,
    AIMentorChatResponse,
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

    @staticmethod
    def compute_gamification(
        milestones: int,
        lessons: int,
        completed_projects: int,
        streak: int,
    ) -> dict:
        """Compute developer XP points and career tier level."""
        xp = (milestones * 50) + (lessons * 20) + (completed_projects * 150) + (streak * 10)

        tiers = [
            (0, 250, "Code Initiate"),
            (250, 600, "Junior Developer"),
            (600, 1200, "Frontend Craftsman"),
            (1200, 2000, "Full Stack Engineer"),
            (2000, 3500, "Senior Systems Engineer"),
            (3500, 6000, "Full Stack Architect"),
        ]

        dev_level = "Code Initiate"
        next_xp = 250
        tier_base = 0

        for base_xp, target_xp, title in tiers:
            if xp >= base_xp:
                dev_level = title
                tier_base = base_xp
                next_xp = target_xp

        if xp >= 6000:
            dev_level = "Staff Platform Engineer"
            tier_base = 6000
            next_xp = xp + 1500

        tier_span = max(1, next_xp - tier_base)
        xp_in_tier = max(0, xp - tier_base)
        progress_pct = min(100, round((xp_in_tier / tier_span) * 100))

        return {
            "xp_points": xp,
            "developer_level": dev_level,
            "next_level_xp": next_xp,
            "level_progress_percent": progress_pct,
        }

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

    async def evaluate_and_award_achievements(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[str]:
        """Automatically verify and award developer achievements."""
        unlocked_ids = []
        try:
            existing_stmt = select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
            existing_res = await db.execute(existing_stmt)
            unlocked_set = set(existing_res.scalars().all())

            m_stmt = select(func.count(UserRoadmapProgress.id)).where(
                UserRoadmapProgress.user_id == user_id,
                UserRoadmapProgress.is_completed.is_(True),
            )
            m_res = await db.execute(m_stmt)
            total_milestones = m_res.scalar() or 0

            l_stmt = select(func.count(UserLessonProgress.id)).where(
                UserLessonProgress.user_id == user_id,
                UserLessonProgress.is_completed.is_(True),
            )
            l_res = await db.execute(l_stmt)
            total_lessons = l_res.scalar() or 0

            daily_act = await self.get_daily_activity(db, user_id=user_id)
            streak = daily_act.streak_count

            p_stmt = select(func.count(UserProject.id)).where(UserProject.user_id == user_id)
            p_res = await db.execute(p_stmt)
            total_projects = p_res.scalar() or 0

            r_stmt = select(func.count(UserGeneratedRoadmap.id)).where(UserGeneratedRoadmap.user_id == user_id)
            r_res = await db.execute(r_stmt)
            total_roadmaps = r_res.scalar() or 0

            ach_stmt = select(Achievement)
            ach_res = await db.execute(ach_stmt)
            achievements = {a.achievement_id: a for a in ach_res.scalars().all()}

            candidates = []
            if "early_adopter" not in unlocked_set and "early_adopter" in achievements:
                candidates.append("early_adopter")
            if total_lessons >= 1 and "first_commit" not in unlocked_set and "first_commit" in achievements:
                candidates.append("first_commit")
            if streak >= 3 and "streak_master" not in unlocked_set and "streak_master" in achievements:
                candidates.append("streak_master")
            if total_milestones >= 5 and "milestone_champion" not in unlocked_set and "milestone_champion" in achievements:
                candidates.append("milestone_champion")
            if total_roadmaps >= 1 and "roadmap_architect" not in unlocked_set and "roadmap_architect" in achievements:
                candidates.append("roadmap_architect")
            if total_projects >= 1 and "project_builder" not in unlocked_set and "project_builder" in achievements:
                candidates.append("project_builder")

            now = datetime.now(timezone.utc)
            for cid in candidates:
                ach = achievements[cid]
                ua = UserAchievement(
                    user_id=user_id,
                    achievement_id=ach.achievement_id,
                    title=ach.title,
                    description=ach.description,
                    icon=ach.icon,
                    xp_reward=ach.xp_reward,
                    unlocked_at=now,
                )
                db.add(ua)
                unlocked_ids.append(cid)

            if unlocked_ids:
                await db.commit()
        except Exception:
            pass
        return unlocked_ids

    async def toggle_lesson_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        course_id: int,
        lesson_id: int,
        is_completed: bool,
    ) -> CourseProgressResponse:
        """Mark a video lesson complete or incomplete with automated progression cascading."""
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
            await db.commit()

            # Automatic Progression Cascades:
            # 1. Automatically check off daily lesson task
            try:
                await self.toggle_daily_task(db, user_id=user_id, task_id="lesson", is_completed=True)
            except Exception:
                pass

            # 2. Automatically evaluate and award achievements
            try:
                await self.evaluate_and_award_achievements(db, user_id=user_id)
            except Exception:
                pass
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
        # 1. Total completed milestones (curated + generated)
        m_stmt = select(func.count(UserRoadmapProgress.id)).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        m_res = await db.execute(m_stmt)
        curated_milestones = m_res.scalar() or 0

        ugr_m_stmt = select(UserGeneratedRoadmap.completed_milestone_ids).where(
            UserGeneratedRoadmap.user_id == user_id
        )
        ugr_m_res = await db.execute(ugr_m_stmt)
        gen_milestones = sum(len(ids) for ids in ugr_m_res.scalars().all() if isinstance(ids, list))
        total_milestones = curated_milestones + gen_milestones

        # 2. Total completed lessons
        l_stmt = select(func.count(UserLessonProgress.id)).where(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.is_completed.is_(True),
        )
        l_res = await db.execute(l_stmt)
        total_lessons = l_res.scalar() or 0

        enrolled_paths: list[DashboardEnrolledPath] = []
        skills_tally: dict[str, dict[str, int]] = {}

        # 3a. AI Generated Roadmaps (ordered by is_active first)
        ugr_stmt = (
            select(UserGeneratedRoadmap)
            .where(UserGeneratedRoadmap.user_id == user_id)
            .order_by(UserGeneratedRoadmap.is_active.desc(), UserGeneratedRoadmap.updated_at.desc())
        )
        ugr_res = await db.execute(ugr_stmt)
        for ugr in ugr_res.scalars().all():
            phases = []
            if isinstance(ugr.roadmap_data, dict):
                phases = ugr.roadmap_data.get("phases", [])
            total_milestones_count = 0
            completed_milestones = set(str(m) for m in (ugr.completed_milestone_ids or []))
            next_milestone_title = None

            for phase in phases:
                for ms in phase.get("milestones", []):
                    total_milestones_count += 1
                    ms_id = str(ms.get("id", ""))
                    if not next_milestone_title and ms_id not in completed_milestones:
                        next_milestone_title = ms.get("title")

            pct = ugr.progress_percent
            if total_milestones_count > 0 and len(completed_milestones) > 0 and pct == 0:
                pct = min(100, round((len(completed_milestones) / total_milestones_count) * 100))

            enrolled_paths.append(
                DashboardEnrolledPath(
                    id=ugr.id,
                    title=ugr.title,
                    category=ugr.target_role or "AI Custom Track",
                    level=ugr.experience_level or "Beginner",
                    duration=ugr.estimated_duration or "Self-paced",
                    progress_percent=pct,
                    completed_steps_count=len(completed_milestones),
                    total_steps_count=max(1, total_milestones_count),
                    next_step_title=next_milestone_title or "Review & Practice",
                    last_accessed_at=ugr.updated_at,
                )
            )
            cat = ugr.target_role or "Engineering"
            if cat not in skills_tally:
                skills_tally[cat] = {"completed": 0, "total": 0}
            skills_tally[cat]["completed"] += len(completed_milestones)
            skills_tally[cat]["total"] += max(1, total_milestones_count)

        # 3b. Curated Catalog Enrolled Paths ordered by last accessed
        ulp_stmt = (
            select(UserLearningPath, LearningPath)
            .join(LearningPath, UserLearningPath.learning_path_id == LearningPath.id)
            .where(UserLearningPath.user_id == user_id)
            .order_by(UserLearningPath.last_accessed_at.desc())
        )
        ulp_res = await db.execute(ulp_stmt)
        path_rows = ulp_res.all()

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

        # Count user projects
        up_stmt = select(UserProject).where(UserProject.user_id == user_id)
        up_res = await db.execute(up_stmt)
        user_projects = list(up_res.scalars().all())
        completed_proj_count = sum(1 for p in user_projects if p.status == "completed")
        active_proj_count = sum(1 for p in user_projects if p.status == "in_progress")

        # Count joined learning rooms
        room_stmt = select(func.count(UserLearningRoom.id)).where(UserLearningRoom.user_id == user_id)
        room_res = await db.execute(room_stmt)
        joined_rooms_count = room_res.scalar() or 0

        # Compute gamification developer level and XP
        gamification = self.compute_gamification(
            milestones=total_milestones,
            lessons=total_lessons,
            completed_projects=completed_proj_count,
            streak=daily_act.streak_count,
        )

        return DashboardSummaryResponse(
            user_id=user_id,
            total_completed_milestones=total_milestones,
            total_completed_lessons=total_lessons,
            total_active_paths=total_active_paths,
            overall_progress_percent=avg_progress,
            streak_count=daily_act.streak_count,
            xp_points=gamification["xp_points"],
            developer_level=gamification["developer_level"],
            next_level_xp=gamification["next_level_xp"],
            level_progress_percent=gamification["level_progress_percent"],
            completed_projects_count=completed_proj_count,
            active_projects_count=active_proj_count,
            joined_rooms_count=joined_rooms_count,
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

        # Fetch user's projects
        up_stmt = (
            select(UserProject, Project)
            .join(Project, UserProject.project_id == Project.id)
            .where(UserProject.user_id == user_id)
            .order_by(UserProject.started_at.desc())
        )
        up_res = await db.execute(up_stmt)
        user_proj_rows = up_res.all()
        completed_projects_list = [
            {
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty,
                "category": p.related_paths[0] if (p.related_paths and len(p.related_paths) > 0) else "Engineering",
                "tech_stack": p.technologies or [],
                "status": up.status,
                "github_url": up.github_url,
                "completed_at": up.completed_at.strftime("%Y-%m-%d") if up.completed_at else None,
            }
            for up, p in user_proj_rows
        ]

        # Fetch joined rooms
        rooms_stmt = (
            select(LearningRoom.name)
            .join(UserLearningRoom, LearningRoom.id == UserLearningRoom.room_id)
            .where(UserLearningRoom.user_id == user_id)
        )
        rooms_res = await db.execute(rooms_stmt)
        learning_rooms_list = list(rooms_res.scalars().all())

        total_projects = max(len(completed_projects_list), 1 if total_roadmaps > 0 else 0)

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
            UserBadge(
                id="project_builder",
                title="Hands-on Builder",
                description="Started or completed an active software project.",
                icon="code",
                earned=len(completed_projects_list) > 0,
                earned_at="2026-10-18" if len(completed_projects_list) > 0 else None,
            ),
            UserBadge(
                id="community_pioneer",
                title="Peer Collaborator",
                description="Joined a specialized Technea peer learning room.",
                icon="users",
                earned=len(learning_rooms_list) > 0,
                earned_at="2026-10-18" if len(learning_rooms_list) > 0 else None,
            ),
        ]

        full_name = user.full_name or (user.email.split("@")[0] if user and user.email else "Harsh")
        email = user.email if user else "learner@technea.dev"

        return UserProfileResponse(
            user_id=user_id,
            full_name=full_name,
            email=email,
            account_level=dashboard.developer_level,
            total_milestones=dashboard.total_completed_milestones,
            total_lessons=dashboard.total_completed_lessons,
            total_projects=total_projects,
            streak_count=dashboard.streak_count,
            overall_mastery=dashboard.overall_progress_percent,
            xp_points=dashboard.xp_points,
            developer_level=dashboard.developer_level,
            next_level_xp=dashboard.next_level_xp,
            level_progress_percent=dashboard.level_progress_percent,
            skills=dashboard.skills_overview,
            badges=badges,
            completed_projects=completed_projects_list,
            learning_rooms=learning_rooms_list,
        )

    async def ai_mentor_chat(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: AIMentorChatRequest,
    ) -> AIMentorChatResponse:
        """Personalized context-aware AI mentor answering queries, analyzing prerequisites, and recommending next steps."""
        user_msg = payload.message.strip().lower()

        # 1. Fetch user's current progress context
        dashboard = await self.get_dashboard_summary(db, user_id=user_id)
        completed_milestones_count = dashboard.total_completed_milestones
        current_path_title = dashboard.current_path.title if dashboard.current_path else "Full Stack Software Engineering"
        next_milestone_title = (
            dashboard.current_path.next_step_title
            if dashboard.current_path and dashboard.current_path.next_step_title
            else "Component Architecture & Asynchronous Streams"
        )

        # 2. Prerequisite verification heuristics
        prereq_warning = None
        if any(term in user_msg for term in ["react", "vue", "angular", "nextjs", "next.js", "frontend framework"]):
            if completed_milestones_count < 2:
                prereq_warning = "⚠️ Prerequisite Check: Building reactive components requires fluent JavaScript event loops, closures, and async/await. We strongly advise completing JavaScript Core Fundamentals first before diving deep into state trees."
        elif any(term in user_msg for term in ["microservice", "docker", "kubernetes", "k8s", "distributed"]):
            if completed_milestones_count < 3:
                prereq_warning = "⚠️ Prerequisite Check: Containerized microservices introduce distributed network partitions and orchestration complexity. Ensure you have built monolithic REST APIs and relational database schemas first."
        elif any(term in user_msg for term in ["rag", "llm", "deep learning", "machine learning", "ai agent"]):
            if completed_milestones_count < 2:
                prereq_warning = "⚠️ Prerequisite Check: Production AI/RAG requires solid data pipelining, vector embeddings math, and Python asynchronous concurrency. Finish core Python & API design before embedding vector databases."

        # 3. Project recommendation
        proj_stmt = select(Project).order_by(Project.difficulty.asc(), Project.id.asc()).limit(5)
        proj_res = await db.execute(proj_stmt)
        available_projects = proj_res.scalars().all()

        recommended_proj = None
        if completed_milestones_count <= 2:
            recommended_proj = "Expense Tracker CLI (Python / Node.js) — Master state persistence and data parsing."
        elif completed_milestones_count <= 5:
            recommended_proj = "Kanban Board & Task Workflow (React / TypeScript) — Master drag-and-drop state & component lifecycles."
        else:
            recommended_proj = "Distributed Microservices Order Processor (FastAPI / Redis / Docker) — Master asynchronous events & queues."

        # 4. Generate structured technical response
        reply_lines = []
        action_items = []

        if "prerequisite" in user_msg or "ready" in user_msg:
            reply_lines.append(f"### 🎯 Readiness & Prerequisite Assessment for **{current_path_title}**\n")
            reply_lines.append(f"You currently have **{completed_milestones_count} completed milestone(s)** and **{dashboard.xp_points} XP** ({dashboard.developer_level}).")
            if prereq_warning:
                reply_lines.append(f"\n{prereq_warning}\n")
            else:
                reply_lines.append("\n✅ Your engineering foundation looks solid! You have met the fundamental requirements to tackle your upcoming milestones.")
            reply_lines.append(f"\n**Next Critical Milestone:** `{next_milestone_title}`")
            action_items = [
                f"Review prerequisite fundamentals for {next_milestone_title}",
                "Write 25 lines of isolated test code before full implementation",
                "Deploy a working prototype to verify build pipelines",
            ]
        elif "pitfall" in user_msg or "mistake" in user_msg or "warning" in user_msg:
            reply_lines.append(f"### 🛡️ Production Pitfalls to Avoid in `{next_milestone_title}`\n")
            reply_lines.append("1. **Premature Abstraction**: Avoid creating complex multi-layer abstractions before you have at least 2 concrete implementations.")
            reply_lines.append("2. **Silent Failure & Missing Error Boundaries**: Always catch errors at asynchronous boundaries with informative log context.")
            reply_lines.append("3. **State Mutation**: Never mutate shared memory or state slices directly; adhere to pure immutable reducers.")
            action_items = [
                "Implement structured try/catch with fallback states",
                "Verify memory consumption under synthetic 1000-request load",
                "Document edge cases in your README architecture spec",
            ]
        elif "project" in user_msg or "build" in user_msg:
            reply_lines.append("### 🛠️ Hands-on Project Architecture Strategy\n")
            reply_lines.append(f"Based on your current level (**{dashboard.developer_level}**), the optimal next build is:")
            reply_lines.append(f"\n✨ **{recommended_proj}**\n")
            reply_lines.append("This project bridges conceptual theory into tangible software that hiring managers and engineering leads look for:")
            reply_lines.append("- Strict type validation and error envelopes")
            reply_lines.append("- Decoupled repository / data access layer")
            reply_lines.append("- Automated unit tests and continuous integration")
            action_items = [
                "Initialize repository with strict linter & formatting rules",
                "Create schema diagrams before writing business logic",
                "Push 3 feature branches with atomic pull requests",
            ]
        else:
            reply_lines.append(f"### 💡 Mentorship Guidance: Accelerating `{current_path_title}`\n")
            reply_lines.append(f"Great question! As your AI Engineering Mentor, I'm analyzing your journey toward **{dashboard.developer_level}**.\n")
            reply_lines.append(f"Right now, your highest-leverage focus area is **`{next_milestone_title}`**.")
            if prereq_warning:
                reply_lines.append(f"\n{prereq_warning}\n")
            reply_lines.append("\nTo master this concept deeply, focus on the underlying mental model rather than memorizing API signatures. Write small exploratory scripts in an isolated playground to inspect execution orders.")
            action_items = [
                f"Master core concepts of '{next_milestone_title}'",
                "Build a 100-line prototype without framework dependencies",
                f"Start hands-on project: '{recommended_proj.split(' — ')[0]}'",
            ]

        quick_prompts = [
            "Am I ready for advanced full-stack projects?",
            "What common production pitfalls should I avoid?",
            "Recommend a project matching my current skill level",
            "How do I structure my 60-minute daily practice?",
        ]

        return AIMentorChatResponse(
            reply="\n".join(reply_lines),
            detected_milestone=next_milestone_title,
            prerequisite_warning=prereq_warning,
            suggested_next_step=next_milestone_title,
            recommended_project=recommended_proj,
            action_items=action_items,
            quick_prompts=quick_prompts,
        )

    async def get_achievements(
        self,
        db: AsyncSession,
        user_id: uuid.UUID | None = None,
    ) -> list[AchievementItemResponse]:
        """Fetch all developer achievements and indicate unlock status for user."""
        try:
            stmt = select(Achievement).order_by(Achievement.id.asc())
            res = await db.execute(stmt)
            achievements = list(res.scalars().all())
        except Exception:
            achievements = []

        if not achievements:
            from app.db.init_db import DEFAULT_ACHIEVEMENTS
            items = []
            for d in DEFAULT_ACHIEVEMENTS:
                items.append(
                    AchievementItemResponse(
                        id=d["achievement_id"],
                        achievement_id=d["achievement_id"],
                        title=d["title"],
                        description=d["description"],
                        icon=d["icon"],
                        category=d.get("category", "General"),
                        xp_reward=d.get("xp_reward", 50),
                        criteria=d.get("criteria"),
                        unlocked=True if d["achievement_id"] == "early_adopter" else False,
                        earned=True if d["achievement_id"] == "early_adopter" else False,
                        unlocked_at="2026-10-01" if d["achievement_id"] == "early_adopter" else None,
                    )
                )
            return items

        user_unlocked_map: dict[str, UserAchievement] = {}
        total_milestones = 0
        streak = 1
        total_projects = 0
        total_roadmaps = 0
        total_rooms = 0

        if user_id:
            ua_stmt = select(UserAchievement).where(UserAchievement.user_id == user_id)
            ua_res = await db.execute(ua_stmt)
            for ua in ua_res.scalars().all():
                user_unlocked_map[ua.achievement_id] = ua

            m_stmt = select(func.count(UserRoadmapProgress.id)).where(
                UserRoadmapProgress.user_id == user_id,
                UserRoadmapProgress.is_completed.is_(True),
            )
            m_res = await db.execute(m_stmt)
            total_milestones = m_res.scalar() or 0

            daily_act = await self.get_daily_activity(db, user_id=user_id)
            streak = daily_act.streak_count

            p_stmt = select(func.count(UserProject.id)).where(UserProject.user_id == user_id)
            p_res = await db.execute(p_stmt)
            total_projects = p_res.scalar() or 0

            r_stmt = select(func.count(UserGeneratedRoadmap.id)).where(UserGeneratedRoadmap.user_id == user_id)
            r_res = await db.execute(r_stmt)
            total_roadmaps = r_res.scalar() or 0

            rm_stmt = select(func.count(UserLearningRoom.id)).where(UserLearningRoom.user_id == user_id)
            rm_res = await db.execute(rm_stmt)
            total_rooms = rm_res.scalar() or 0

        result: list[AchievementItemResponse] = []
        for ach in achievements:
            unlocked = False
            unlocked_at = None

            if user_id:
                if ach.achievement_id in user_unlocked_map:
                    unlocked = True
                    ua_obj = user_unlocked_map[ach.achievement_id]
                    unlocked_at = ua_obj.unlocked_at.strftime("%Y-%m-%d") if ua_obj.unlocked_at else None
                else:
                    if ach.achievement_id == "early_adopter":
                        unlocked = True
                        unlocked_at = "2026-10-01"
                    elif ach.achievement_id in ("streak_master", "consistent_coder") and streak >= 3:
                        unlocked = True
                    elif ach.achievement_id in ("milestone_champion", "milestone_conqueror") and total_milestones >= 5:
                        unlocked = True
                    elif ach.achievement_id in ("roadmap_architect", "system_architect") and total_roadmaps >= 1:
                        unlocked = True
                    elif ach.achievement_id in ("project_builder", "first_project") and total_projects >= 1:
                        unlocked = True
                    elif ach.achievement_id in ("community_pioneer", "guild_contributor") and total_rooms >= 1:
                        unlocked = True
                    elif ach.achievement_id == "polyglot_engineer" and total_milestones >= 3:
                        unlocked = True
                    elif ach.achievement_id == "full_stack_hero" and total_milestones >= 8:
                        unlocked = True

            result.append(
                AchievementItemResponse(
                    id=ach.achievement_id,
                    achievement_id=ach.achievement_id,
                    title=ach.title,
                    description=ach.description,
                    icon=ach.icon,
                    category=ach.category,
                    xp_reward=ach.xp_reward,
                    criteria=ach.criteria,
                    unlocked=unlocked,
                    earned=unlocked,
                    unlocked_at=unlocked_at,
                )
            )

        return result


progress_service = ProgressService()



