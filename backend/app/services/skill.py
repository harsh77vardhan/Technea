"""Service layer for Skill domain."""

from collections.abc import Sequence
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.skill import Skill, SkillPrerequisite
from app.models.learning_path import LearningPath
from app.schemas.skill import SkillCreate, SkillUpdate
from app.schemas.search import SkillRelationshipResponse
from app.schemas.skill import SkillResponse
from app.schemas.learning_path import LearningPathResponse
from app.services.base import BaseService
from app.services.search import search_service


class SkillService(BaseService[Skill, SkillCreate, SkillUpdate]):
    """Service providing business logic, relationships graph, and search for Skills."""

    async def get_multi_filtered(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        q: str | None = None,
        category: str | None = None,
    ) -> Sequence[Skill]:
        """Fetch skills with optional query search and category filter."""
        if q and isinstance(q, str):
            return await search_service.search_skills(db, query=q, category=category, limit=limit)

        stmt = select(self.model)
        if category and isinstance(category, str):
            stmt = stmt.where(func.lower(self.model.category) == category.lower())
        stmt = stmt.offset(skip).limit(limit)
        res = await db.execute(stmt)
        return res.scalars().all()

    async def get_relationships(
        self,
        db: AsyncSession,
        skill_id: int,
    ) -> SkillRelationshipResponse | None:
        """Retrieve a skill and its graph of prerequisites, next skills, and learning paths."""
        skill = await self.get(db, id=skill_id)
        if not skill:
            return None

        # Fetch prerequisite skills
        prereqs: list[Skill] = []
        # First try relational table
        rel_stmt = (
            select(Skill)
            .join(SkillPrerequisite, SkillPrerequisite.prerequisite_id == Skill.id)
            .where(SkillPrerequisite.skill_id == skill.id)
        )
        res = await db.execute(rel_stmt)
        prereqs = list(res.scalars().all())

        # If empty, fallback to JSON field names
        if not prereqs and skill.prerequisites:
            name_stmt = select(Skill).where(Skill.name.in_(skill.prerequisites))
            res_names = await db.execute(name_stmt)
            prereqs = list(res_names.scalars().all())

        # Fetch recommended next skills
        recommended_next: list[Skill] = []
        if skill.recommended_next:
            next_stmt = select(Skill).where(Skill.name.in_(skill.recommended_next))
            res_next = await db.execute(next_stmt)
            recommended_next = list(res_next.scalars().all())

        # Fetch associated learning paths with roadmap steps
        paths_stmt = (
            select(LearningPath)
            .options(selectinload(LearningPath.roadmap_steps))
            .where(LearningPath.skill_id == skill.id)
        )
        res_paths = await db.execute(paths_stmt)
        learning_paths = list(res_paths.scalars().all())

        return SkillRelationshipResponse(
            skill_id=skill.id,
            name=skill.name,
            category=skill.category,
            tags=skill.tags or [],
            keywords=skill.keywords or [],
            aliases=skill.aliases or [],
            prerequisites=[SkillResponse.model_validate(p) for p in prereqs],
            recommended_next=[SkillResponse.model_validate(n) for n in recommended_next],
            learning_paths=[LearningPathResponse.model_validate(lp) for lp in learning_paths],
        )


skill_service = SkillService(Skill)
