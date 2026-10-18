"""Service for Hands-on Project Recommendations and Progress Tracking."""

from datetime import datetime, timezone
from typing import Any
import uuid

from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import UserAchievement
from app.models.progress import UserLearningPath, UserRoadmapProgress
from app.models.project import Project, UserProject
from app.models.roadmap_step import RoadmapStep
from app.models.user_roadmap import UserGeneratedRoadmap
from app.schemas.project import ProjectRecommendationResponse, ProjectResponse


class ProjectService:
    """Service handling projects catalog, skill-based recommendations, and user status."""

    async def get_projects(
        self,
        db: AsyncSession,
        difficulty: str | None = None,
        skill_name: str | None = None,
        search: str | None = None,
        user_id: uuid.UUID | None = None,
    ) -> list[ProjectResponse]:
        """Fetch all projects with optional filtering and user progress overlay."""
        stmt = select(Project).order_by(Project.id.asc())

        if difficulty:
            stmt = stmt.where(Project.difficulty.ilike(f"%{difficulty}%"))

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Project.title.ilike(search_term),
                    Project.description.ilike(search_term),
                )
            )

        res = await db.execute(stmt)
        projects = list(res.scalars().all())

        if skill_name:
            skill_low = skill_name.lower()
            projects = [
                p
                for p in projects
                if any(skill_low in s.lower() for s in (p.required_skills or []))
                or any(skill_low in t.lower() for t in (p.technologies or []))
                or any(skill_low in rp.lower() for rp in (p.related_paths or []))
            ]

        # Fetch user status if logged in
        user_status_map: dict[int, UserProject] = {}
        if user_id:
            up_stmt = select(UserProject).where(UserProject.user_id == user_id)
            up_res = await db.execute(up_stmt)
            for up in up_res.scalars().all():
                user_status_map[up.project_id] = up

        output: list[ProjectResponse] = []
        for p in projects:
            up = user_status_map.get(p.id)
            output.append(
                ProjectResponse(
                    id=p.id,
                    title=p.title,
                    description=p.description,
                    difficulty=p.difficulty,
                    estimated_time=p.estimated_time,
                    required_skills=p.required_skills or [],
                    technologies=p.technologies or [],
                    related_paths=p.related_paths or [],
                    milestones=p.milestones or [],
                    skill_id=p.skill_id,
                    learning_path_id=p.learning_path_id,
                    user_status=up.status if up else "not_started",
                    github_url=up.github_url if up else None,
                    started_at=up.started_at if up else None,
                    completed_at=up.completed_at if up else None,
                )
            )
        return output

    async def get_project_by_id(
        self,
        db: AsyncSession,
        project_id: int,
        user_id: uuid.UUID | None = None,
    ) -> ProjectResponse | None:
        """Fetch single project by ID with user status."""
        stmt = select(Project).where(Project.id == project_id)
        res = await db.execute(stmt)
        p = res.scalar_one_or_none()
        if not p:
            return None

        up = None
        if user_id:
            up_stmt = select(UserProject).where(
                UserProject.user_id == user_id,
                UserProject.project_id == project_id,
            )
            up_res = await db.execute(up_stmt)
            up = up_res.scalar_one_or_none()

        return ProjectResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            difficulty=p.difficulty,
            estimated_time=p.estimated_time,
            required_skills=p.required_skills or [],
            technologies=p.technologies or [],
            related_paths=p.related_paths or [],
            milestones=p.milestones or [],
            skill_id=p.skill_id,
            learning_path_id=p.learning_path_id,
            user_status=up.status if up else "not_started",
            github_url=up.github_url if up else None,
            started_at=up.started_at if up else None,
            completed_at=up.completed_at if up else None,
        )

    async def get_recommended_projects(
        self,
        db: AsyncSession,
        user_id: uuid.UUID | None = None,
    ) -> ProjectRecommendationResponse:
        """Recommend optimal hands-on projects based on user's completed concepts or target career."""
        all_projects = await self.get_projects(db, user_id=user_id)
        if not all_projects:
            return ProjectRecommendationResponse(
                recommended_projects=[],
                trigger_reason="Explore our hands-on engineering lab catalog.",
                primary_skill="General Engineering",
            )

        if not user_id:
            # Guest: recommend top beginner projects
            beginner_projects = [p for p in all_projects if p.difficulty == "Beginner"][:4]
            return ProjectRecommendationResponse(
                recommended_projects=beginner_projects or all_projects[:4],
                trigger_reason="Recommended beginner engineering projects to kickstart your portfolio.",
                primary_skill="Core Programming",
            )

        # Logged in: Check active roadmap and latest completed milestones
        rm_stmt = (
            select(UserGeneratedRoadmap)
            .where(UserGeneratedRoadmap.user_id == user_id)
            .order_by(UserGeneratedRoadmap.updated_at.desc())
        )
        rm_res = await db.execute(rm_stmt)
        active_roadmap = rm_res.scalars().first()

        prog_stmt = (
            select(UserRoadmapProgress, RoadmapStep)
            .join(RoadmapStep, UserRoadmapProgress.step_id == RoadmapStep.id)
            .where(
                UserRoadmapProgress.user_id == user_id,
                UserRoadmapProgress.is_completed.is_(True),
            )
            .order_by(UserRoadmapProgress.completed_at.desc())
        )
        prog_res = await db.execute(prog_stmt)
        latest_step = prog_res.first()

        goal = active_roadmap.goal.lower() if active_roadmap else ""
        step_title = latest_step[1].title if latest_step else ""

        recommended: list[ProjectResponse] = []
        reason = ""
        skill_tag = "Full Stack Development"

        if "python" in goal or "python" in step_title.lower() or "function" in step_title.lower():
            recommended = [
                p
                for p in all_projects
                if "Python" in p.technologies or "Python Fundamentals" in p.related_paths
            ]
            reason = "Because you completed Python Functions & Foundations, build these CLI and data parsing deliverables to reinforce syntax retention."
            skill_tag = "Python Foundations"
        elif "react" in goal or "frontend" in goal or "component" in step_title.lower():
            recommended = [
                p
                for p in all_projects
                if "React" in p.technologies or "Frontend Development" in p.related_paths
            ]
            reason = "Solidify your React Hooks and reactive state lifecycles by building production frontend applications."
            skill_tag = "React Architecture"
        elif "devops" in goal or "cloud" in goal or "docker" in step_title.lower():
            recommended = [
                p
                for p in all_projects
                if "Docker" in p.technologies or "DevOps & Cloud" in p.related_paths
            ]
            reason = "Practice container orchestration, reverse proxy configurations, and automated CI/CD pipelines."
            skill_tag = "DevOps & Cloud"
        elif "ai" in goal or "machine learning" in goal or "data" in goal:
            recommended = [
                p
                for p in all_projects
                if "Pandas" in p.technologies or "AI / Machine Learning" in p.related_paths
            ]
            reason = "Apply predictive modeling and RAG vector retrieval pipelines to real-world datasets."
            skill_tag = "Applied AI & Data"

        if not recommended:
            recommended = all_projects[:4]
            reason = "Tailored project recommendations based on your current engineering journey."

        return ProjectRecommendationResponse(
            recommended_projects=recommended[:4],
            trigger_reason=reason,
            primary_skill=skill_tag,
        )

    async def update_user_project_status(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        project_id: int,
        status: str,
        github_url: str | None = None,
        notes: str | None = None,
    ) -> ProjectResponse:
        """Start or complete a project and award developer achievement XP."""
        stmt = select(UserProject).where(
            UserProject.user_id == user_id,
            UserProject.project_id == project_id,
        )
        res = await db.execute(stmt)
        user_project = res.scalar_one_or_none()

        now = datetime.now(timezone.utc)

        if not user_project:
            user_project = UserProject(
                user_id=user_id,
                project_id=project_id,
                status=status,
                github_url=github_url,
                notes=notes,
                started_at=now,
                completed_at=now if status == "completed" else None,
            )
            db.add(user_project)
        else:
            user_project.status = status
            if github_url is not None:
                user_project.github_url = github_url
            if notes is not None:
                user_project.notes = notes
            if status == "completed" and not user_project.completed_at:
                user_project.completed_at = now

        # If completed, check for "First Project Completed" achievement
        if status == "completed":
            ach_stmt = select(UserAchievement).where(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == "first_project",
            )
            ach_res = await db.execute(ach_stmt)
            if not ach_res.scalar_one_or_none():
                db.add(
                    UserAchievement(
                        user_id=user_id,
                        achievement_id="first_project",
                        title="First Project Completed",
                        description="Successfully constructed and delivered your first engineering practice lab.",
                        icon="rocket",
                        xp_reward=150,
                        unlocked_at=now,
                    )
                )

        await db.commit()
        refreshed = await self.get_project_by_id(db, project_id=project_id, user_id=user_id)
        if not refreshed:
            raise ValueError("Failed to retrieve updated project.")
        return refreshed

    async def get_user_projects(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[ProjectResponse]:
        """Fetch all projects started or completed by the user."""
        up_stmt = (
            select(UserProject, Project)
            .join(Project, UserProject.project_id == Project.id)
            .where(UserProject.user_id == user_id)
            .order_by(desc(UserProject.started_at))
        )
        up_res = await db.execute(up_stmt)

        output: list[ProjectResponse] = []
        for up, p in up_res.all():
            output.append(
                ProjectResponse(
                    id=p.id,
                    title=p.title,
                    description=p.description,
                    difficulty=p.difficulty,
                    estimated_time=p.estimated_time,
                    required_skills=p.required_skills or [],
                    technologies=p.technologies or [],
                    related_paths=p.related_paths or [],
                    milestones=p.milestones or [],
                    skill_id=p.skill_id,
                    learning_path_id=p.learning_path_id,
                    user_status=up.status,
                    github_url=up.github_url,
                    started_at=up.started_at,
                    completed_at=up.completed_at,
                )
            )
        return output


project_service = ProjectService()
