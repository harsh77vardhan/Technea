"""Service layer for User Profile Viewer, Profile Editor, and Follow System."""

import os
import re
import time
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import UserAchievement
from app.models.community import UserLearningRoom
from app.models.follow import Follow
from app.models.progress import UserLearningPath, UserLessonProgress, UserRoadmapProgress
from app.models.project import Project, UserProject
from app.models.skill import Skill
from app.models.user import User
from app.models.user_roadmap import DailyLearningActivity, UserGeneratedRoadmap
from app.schemas.profile import (
    AvatarUploadResponse,
    FollowActionResponse,
    FollowUserItem,
    ProfileAchievementBadge,
    ProfileProjectItem,
    ProfileSkillItem,
    ProfileUpdateRequest,
    UserProfilePublicResponse,
    UserStatsResponse,
)
from app.services.storage import get_storage_service

# Uploads & Static storage directories
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
AVATAR_DIR = UPLOADS_DIR / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"
(STATIC_DIR / "avatars").mkdir(parents=True, exist_ok=True)

USERNAME_REGEX = re.compile(r"^[a-z0-9_]{3,20}$")


class ProfileService:
    """Service handling profile viewing, editing, avatar storage, and social follow interactions."""

    def _calculate_developer_level(self, xp: int) -> tuple[str, int, int]:
        """Compute developer tier, next tier threshold, and level progress percentage."""
        if xp >= 6000:
            return "Staff Platform Engineer", 10000, 100
        elif xp >= 3500:
            return "Full Stack Architect", 6000, int(((xp - 3500) / 2500) * 100)
        elif xp >= 2000:
            return "Senior Systems Engineer", 3500, int(((xp - 2000) / 1500) * 100)
        elif xp >= 1200:
            return "Full Stack Engineer", 2000, int(((xp - 1200) / 800) * 100)
        elif xp >= 600:
            return "Full Stack Craftsman", 1200, int(((xp - 600) / 600) * 100)
        elif xp >= 250:
            return "Junior Developer", 600, int(((xp - 250) / 350) * 100)
        else:
            return "Code Initiate", 250, int((xp / 250) * 100)

    async def get_public_profile(
        self,
        db: AsyncSession,
        username_or_id: str,
        viewer_id: uuid.UUID | None = None,
    ) -> UserProfilePublicResponse:
        """Fetch complete public developer portfolio profile."""
        clean_identifier = username_or_id.lower().strip().lstrip("@")

        # 1. Look up user by username or UUID
        stmt = select(User).where(func.lower(User.username) == clean_identifier)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            try:
                parsed_uuid = uuid.UUID(clean_identifier)
                stmt_uuid = select(User).where(User.id == parsed_uuid)
                res_uuid = await db.execute(stmt_uuid)
                user = res_uuid.scalar_one_or_none()
            except ValueError:
                user = None

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '@{clean_identifier}' was not found.",
            )

        # 2. Count Followers & Following
        followers_count_stmt = select(func.count(Follow.id)).where(Follow.following_id == user.id)
        followers_count = (await db.execute(followers_count_stmt)).scalar() or 0

        following_count_stmt = select(func.count(Follow.id)).where(Follow.follower_id == user.id)
        following_count = (await db.execute(following_count_stmt)).scalar() or 0

        # 3. Check is_following and is_own_profile
        is_following = False
        is_own_profile = viewer_id is not None and viewer_id == user.id

        if viewer_id and not is_own_profile:
            check_stmt = select(Follow.id).where(
                Follow.follower_id == viewer_id,
                Follow.following_id == user.id,
            )
            is_following = (await db.execute(check_stmt)).scalar() is not None

        # 4. Learning Statistics
        milestones_count_stmt = select(func.count(UserRoadmapProgress.id)).where(
            UserRoadmapProgress.user_id == user.id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        milestones_count = (await db.execute(milestones_count_stmt)).scalar() or 0

        lessons_count_stmt = select(func.count(UserLessonProgress.id)).where(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.is_completed.is_(True),
        )
        lessons_count = (await db.execute(lessons_count_stmt)).scalar() or 0

        projects_count_stmt = select(func.count(UserProject.id)).where(
            UserProject.user_id == user.id,
            UserProject.status == "completed",
        )
        completed_projects_count = (await db.execute(projects_count_stmt)).scalar() or 0

        rooms_count_stmt = select(func.count(UserLearningRoom.id)).where(
            UserLearningRoom.user_id == user.id,
        )
        joined_rooms_count = (await db.execute(rooms_count_stmt)).scalar() or 0

        streak_stmt = (
            select(DailyLearningActivity.streak_count)
            .where(DailyLearningActivity.user_id == user.id)
            .order_by(DailyLearningActivity.activity_date.desc())
            .limit(1)
        )
        streak_res = await db.execute(streak_stmt)
        learning_streak = streak_res.scalar() or 1

        # 5. Developer Progression XP & Tier
        xp_points = (
            milestones_count * 50
            + lessons_count * 20
            + completed_projects_count * 150
            + learning_streak * 10
        )
        dev_level, next_level_xp, progress_percent = self._calculate_developer_level(xp_points)

        # 6. Hands-on Projects
        up_stmt = (
            select(UserProject, Project)
            .join(Project, UserProject.project_id == Project.id)
            .where(UserProject.user_id == user.id)
            .order_by(UserProject.started_at.desc())
        )
        up_res = await db.execute(up_stmt)
        user_projects = [
            ProfileProjectItem(
                id=p.id,
                title=p.title,
                description=p.description,
                difficulty=p.difficulty,
                category=p.related_paths[0] if (p.related_paths and len(p.related_paths) > 0) else "Engineering",
                tech_stack=p.technologies or [],
                status=up.status,
                github_url=up.github_url,
                completed_at=up.completed_at.strftime("%b %d, %Y") if up.completed_at else None,
            )
            for up, p in up_res.all()
        ]

        # 7. Skills Mastery Breakdown
        skills_stmt = (
            select(
                Skill.id,
                Skill.name,
                func.count(UserRoadmapProgress.id).label("completed_steps"),
            )
            .join(UserRoadmapProgress, Skill.id == UserRoadmapProgress.step_id, isouter=True)
            .where(UserRoadmapProgress.user_id == user.id)
            .group_by(Skill.id, Skill.name)
            .limit(6)
        )
        skills_res = await db.execute(skills_stmt)
        skills_rows = skills_res.all()

        profile_skills: list[ProfileSkillItem] = []
        if skills_rows:
            for s_id, s_name, comp_steps in skills_rows:
                mastery = min(100, max(20, comp_steps * 25))
                profile_skills.append(
                    ProfileSkillItem(
                        skill_id=s_id,
                        skill_name=s_name,
                        mastery_percent=mastery,
                        completed_milestones=comp_steps,
                    )
                )
        else:
            # Curated showcase for learner
            profile_skills = [
                ProfileSkillItem(skill_id=1, skill_name="Python Fundamentals", mastery_percent=85, completed_milestones=8),
                ProfileSkillItem(skill_id=2, skill_name="FastAPI & Async Architectures", mastery_percent=60, completed_milestones=5),
                ProfileSkillItem(skill_id=3, skill_name="React & Modern UI", mastery_percent=45, completed_milestones=4),
                ProfileSkillItem(skill_id=4, skill_name="Database Modeling & SQL", mastery_percent=40, completed_milestones=3),
            ]

        # 8. Achievement Badges
        achievements_list: list[ProfileAchievementBadge] = [
            ProfileAchievementBadge(
                id="early_adopter",
                title="Early Adopter",
                description="Joined Technea during autonomous developer release.",
                icon="sparkles",
                unlocked=True,
            ),
            ProfileAchievementBadge(
                id="consistent_coder",
                title="Consistent Coder",
                description="Maintained an active study streak on Technea.",
                icon="flame",
                unlocked=learning_streak >= 1,
            ),
            ProfileAchievementBadge(
                id="milestone_conqueror",
                title="Milestone Conqueror",
                description="Completed verified engineering milestones.",
                icon="target",
                unlocked=milestones_count >= 1,
            ),
            ProfileAchievementBadge(
                id="project_deliverable",
                title="Project Deliverable",
                description="Built and linked hands-on code deliverables.",
                icon="folder_git",
                unlocked=len(user_projects) >= 1,
            ),
            ProfileAchievementBadge(
                id="guild_contributor",
                title="Guild Contributor",
                description="Connected with peers in Technea community learning rooms.",
                icon="users",
                unlocked=joined_rooms_count >= 1,
            ),
            ProfileAchievementBadge(
                id="roadmap_architect",
                title="Roadmap Architect",
                description="Generated personalized engineering curriculum with AI.",
                icon="layers",
                unlocked=True,
            ),
        ]

        is_private_restricted = (user.profile_visibility == "private" and not is_own_profile)

        if is_private_restricted:
            return UserProfilePublicResponse(
                id=user.id,
                username=user.username or user.email.split("@")[0].lower(),
                full_name=user.full_name or "Technea Engineer",
                avatar_url=user.avatar_url,
                bio="This profile is private.",
                location=None,
                github_url=None,
                linkedin_url=None,
                website_url=None,
                portfolio_url=None,
                profile_visibility="private",
                joined_date=user.created_at.strftime("%B %Y") if user.created_at else "October 2026",
                followers_count=followers_count,
                following_count=following_count,
                is_following=is_following,
                is_own_profile=False,
                developer_level=dev_level,
                xp_points=xp_points,
                next_level_xp=next_level_xp,
                level_progress_percent=progress_percent,
                learning_streak=learning_streak,
                completed_milestones_count=milestones_count,
                completed_courses_count=lessons_count,
                completed_projects_count=completed_projects_count,
                joined_rooms_count=joined_rooms_count,
                skills=[],
                projects=[],
                achievements=[],
            )

        return UserProfilePublicResponse(
            id=user.id,
            username=user.username or user.email.split("@")[0].lower(),
            full_name=user.full_name or "Technea Engineer",
            avatar_url=user.avatar_url,
            bio=user.bio or "AI enthusiast building intelligent software systems.",
            location=user.location or "Global",
            github_url=user.github_url,
            linkedin_url=user.linkedin_url,
            website_url=user.website_url,
            portfolio_url=user.portfolio_url,
            profile_visibility=user.profile_visibility or "public",
            joined_date=user.created_at.strftime("%B %Y") if user.created_at else "October 2026",
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following,
            is_own_profile=is_own_profile,
            developer_level=dev_level,
            xp_points=xp_points,
            next_level_xp=next_level_xp,
            level_progress_percent=progress_percent,
            learning_streak=learning_streak,
            completed_milestones_count=milestones_count,
            completed_courses_count=lessons_count,
            completed_projects_count=completed_projects_count,
            joined_rooms_count=joined_rooms_count,
            skills=profile_skills,
            projects=user_projects,
            achievements=achievements_list,
        )

    async def update_profile(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: ProfileUpdateRequest,
    ) -> UserProfilePublicResponse:
        """Update authenticated user's profile details with username uniqueness validation."""
        clean_username = payload.username.lower().strip()
        if not USERNAME_REGEX.match(clean_username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be 3-20 lowercase alphanumeric characters or underscores.",
            )

        # Check if username is already taken by another user
        conflict_stmt = select(User.id).where(
            func.lower(User.username) == clean_username,
            User.id != user_id,
        )
        conflict_res = await db.execute(conflict_stmt)
        if conflict_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The username '@{clean_username}' is already claimed by another user.",
            )

        user_stmt = select(User).where(User.id == user_id)
        user = (await db.execute(user_stmt)).scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        # Apply profile modifications
        user.full_name = payload.full_name.strip()
        user.username = clean_username
        user.bio = payload.bio.strip() if payload.bio else None
        user.location = payload.location.strip() if payload.location else None
        user.github_url = payload.github_url.strip() if payload.github_url else None
        user.linkedin_url = payload.linkedin_url.strip() if payload.linkedin_url else None
        user.portfolio_url = payload.portfolio_url.strip() if payload.portfolio_url else None
        if payload.website_url is not None:
            user.website_url = payload.website_url.strip() if payload.website_url else None
        if payload.profile_visibility is not None:
            user.profile_visibility = payload.profile_visibility.strip().lower()
        if payload.avatar_url is not None:
            user.avatar_url = payload.avatar_url.strip() or None

        user.profile_completed = True

        await db.commit()
        await db.refresh(user)

        return await self.get_public_profile(db, user.username, viewer_id=user_id)

    async def get_user_stats(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> UserStatsResponse:
        """Calculate and return learning statistics for the specified user."""
        user_stmt = select(User.id).where(User.id == user_id)
        user_exists = (await db.execute(user_stmt)).scalar_one_or_none()
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # 1. Completed milestones count
        milestones_count_stmt = select(func.count(UserRoadmapProgress.id)).where(
            UserRoadmapProgress.user_id == user_id,
            UserRoadmapProgress.is_completed.is_(True),
        )
        milestones_count = (await db.execute(milestones_count_stmt)).scalar() or 0

        # 2. Completed lessons count
        lessons_count_stmt = select(func.count(UserLessonProgress.id)).where(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.is_completed.is_(True),
        )
        lessons_count = (await db.execute(lessons_count_stmt)).scalar() or 0

        # 3. Completed projects count
        projects_count_stmt = select(func.count(UserProject.id)).where(
            UserProject.user_id == user_id,
            UserProject.status == "completed",
        )
        completed_projects_count = (await db.execute(projects_count_stmt)).scalar() or 0

        # 4. Completed roadmaps count (both user generated roadmaps and catalog learning paths)
        completed_gen_roadmaps_stmt = select(func.count(UserGeneratedRoadmap.id)).where(
            UserGeneratedRoadmap.user_id == user_id,
            UserGeneratedRoadmap.progress_percent >= 100,
        )
        completed_gen_roadmaps = (await db.execute(completed_gen_roadmaps_stmt)).scalar() or 0

        completed_paths_stmt = select(func.count(UserLearningPath.id)).where(
            UserLearningPath.user_id == user_id,
            (UserLearningPath.status == "completed") | (UserLearningPath.progress_percent >= 100),
        )
        completed_paths = (await db.execute(completed_paths_stmt)).scalar() or 0
        completed_roadmaps_count = completed_gen_roadmaps + completed_paths

        # 5. Learning streak
        streak_stmt = (
            select(DailyLearningActivity.streak_count)
            .where(DailyLearningActivity.user_id == user_id)
            .order_by(DailyLearningActivity.activity_date.desc())
            .limit(1)
        )
        streak_res = await db.execute(streak_stmt)
        learning_streak = streak_res.scalar() or 1

        # 6. Progression XP & Developer Tier
        xp_points = (
            milestones_count * 50
            + lessons_count * 20
            + completed_projects_count * 150
            + learning_streak * 10
        )
        dev_level, _, _ = self._calculate_developer_level(xp_points)

        return UserStatsResponse(
            xp_points=xp_points,
            developer_level=dev_level,
            learning_streak=learning_streak,
            completed_roadmaps_count=completed_roadmaps_count,
            completed_milestones_count=milestones_count,
            completed_lessons_count=lessons_count,
            completed_projects_count=completed_projects_count,
        )

    async def upload_avatar(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        file: UploadFile,
    ) -> AvatarUploadResponse:
        """Store uploaded avatar image in storage and update user.avatar_url."""
        user_stmt = select(User).where(User.id == user_id)
        user = (await db.execute(user_stmt)).scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        storage = get_storage_service()
        if user.avatar_url:
            try:
                await storage.delete_file(user.avatar_url)
            except Exception:
                pass

        avatar_url = await storage.save_file(file, subfolder="avatars")
        user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(user)

        return AvatarUploadResponse(
            avatar_url=avatar_url,
            message="Profile photo updated successfully.",
        )

    async def follow_user(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
        target_username: str,
    ) -> FollowActionResponse:
        """Follow another Technea user, enforcing self-follow and duplicate checks."""
        clean_target = target_username.lower().strip().lstrip("@")
        stmt = select(User).where(func.lower(User.username) == clean_target)
        target_user = (await db.execute(stmt)).scalar_one_or_none()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '@{clean_target}' not found.",
            )

        if target_user.id == follower_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot follow your own profile.",
            )

        # Check existing follow
        existing_stmt = select(Follow).where(
            Follow.follower_id == follower_id,
            Follow.following_id == target_user.id,
        )
        existing_follow = (await db.execute(existing_stmt)).scalar_one_or_none()

        if not existing_follow:
            new_follow = Follow(
                follower_id=follower_id,
                following_id=target_user.id,
            )
            db.add(new_follow)
            await db.commit()

        # Count updated followers
        f_count = (
            await db.execute(select(func.count(Follow.id)).where(Follow.following_id == target_user.id))
        ).scalar() or 0
        ing_count = (
            await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == target_user.id))
        ).scalar() or 0

        return FollowActionResponse(
            status="success",
            is_following=True,
            followers_count=f_count,
            following_count=ing_count,
            message=f"You are now following @{target_user.username}.",
        )

    async def unfollow_user(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
        target_username: str,
    ) -> FollowActionResponse:
        """Unfollow a Technea user."""
        clean_target = target_username.lower().strip().lstrip("@")
        stmt = select(User).where(func.lower(User.username) == clean_target)
        target_user = (await db.execute(stmt)).scalar_one_or_none()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '@{clean_target}' not found.",
            )

        existing_stmt = select(Follow).where(
            Follow.follower_id == follower_id,
            Follow.following_id == target_user.id,
        )
        existing_follow = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_follow:
            await db.delete(existing_follow)
            await db.commit()

        f_count = (
            await db.execute(select(func.count(Follow.id)).where(Follow.following_id == target_user.id))
        ).scalar() or 0
        ing_count = (
            await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == target_user.id))
        ).scalar() or 0

        return FollowActionResponse(
            status="success",
            is_following=False,
            followers_count=f_count,
            following_count=ing_count,
            message=f"You have unfollowed @{target_user.username}.",
        )

    async def get_followers(
        self,
        db: AsyncSession,
        target_username: str,
        viewer_id: uuid.UUID | None = None,
    ) -> list[FollowUserItem]:
        """Fetch list of users following the target user."""
        clean_target = target_username.lower().strip().lstrip("@")
        stmt = select(User).where(func.lower(User.username) == clean_target)
        target_user = (await db.execute(stmt)).scalar_one_or_none()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '@{clean_target}' not found.",
            )

        followers_stmt = (
            select(User)
            .join(Follow, Follow.follower_id == User.id)
            .where(Follow.following_id == target_user.id)
            .order_by(Follow.created_at.desc())
        )
        followers = (await db.execute(followers_stmt)).scalars().all()

        viewer_following_ids: set[uuid.UUID] = set()
        if viewer_id:
            vf_stmt = select(Follow.following_id).where(Follow.follower_id == viewer_id)
            viewer_following_ids = set((await db.execute(vf_stmt)).scalars().all())

        return [
            FollowUserItem(
                id=u.id,
                username=u.username or u.email.split("@")[0].lower(),
                full_name=u.full_name or "Technea Engineer",
                avatar_url=u.avatar_url,
                bio=u.bio,
                developer_level="Junior Developer",
                is_following=u.id in viewer_following_ids,
                is_self=viewer_id is not None and u.id == viewer_id,
            )
            for u in followers
        ]

    async def get_following(
        self,
        db: AsyncSession,
        target_username: str,
        viewer_id: uuid.UUID | None = None,
    ) -> list[FollowUserItem]:
        """Fetch list of users that the target user follows."""
        clean_target = target_username.lower().strip().lstrip("@")
        stmt = select(User).where(func.lower(User.username) == clean_target)
        target_user = (await db.execute(stmt)).scalar_one_or_none()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '@{clean_target}' not found.",
            )

        following_stmt = (
            select(User)
            .join(Follow, Follow.following_id == User.id)
            .where(Follow.follower_id == target_user.id)
            .order_by(Follow.created_at.desc())
        )
        following_users = (await db.execute(following_stmt)).scalars().all()

        viewer_following_ids: set[uuid.UUID] = set()
        if viewer_id:
            vf_stmt = select(Follow.following_id).where(Follow.follower_id == viewer_id)
            viewer_following_ids = set((await db.execute(vf_stmt)).scalars().all())

        return [
            FollowUserItem(
                id=u.id,
                username=u.username or u.email.split("@")[0].lower(),
                full_name=u.full_name or "Technea Engineer",
                avatar_url=u.avatar_url,
                bio=u.bio,
                developer_level="Junior Developer",
                is_following=u.id in viewer_following_ids,
                is_self=viewer_id is not None and u.id == viewer_id,
            )
            for u in following_users
        ]


profile_service = ProfileService()
