"""Service layer for LearningPath domain."""

from collections.abc import Sequence
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_path import LearningPath
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.services.base import BaseService
from app.services.search import search_service


class LearningPathService(BaseService[LearningPath, LearningPathCreate, LearningPathUpdate]):
    """Service providing business logic, search, and CRUD operations for LearningPaths."""

    async def get_multi_with_steps(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        q: str | None = None,
        category: str | None = None,
        level: str | None = None,
    ) -> Sequence[LearningPath]:
        """Fetch multiple learning paths with eager-loaded roadmap steps, supporting search & filters."""
        if q and isinstance(q, str):
            return await search_service.search_learning_paths(
                db, query=q, category=category, level=level, limit=limit
            )

        query = select(self.model).options(selectinload(LearningPath.roadmap_steps))
        if category and isinstance(category, str):
            query = query.where(func.lower(self.model.category) == category.lower())
        if level and isinstance(level, str):
            query = query.where(
                or_(
                    func.lower(self.model.level) == level.lower(),
                    func.lower(self.model.difficulty) == level.lower(),
                )
            )

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_with_steps(
        self, db: AsyncSession, id: int
    ) -> LearningPath | None:
        """Fetch a single learning path with eager-loaded roadmap steps."""
        query = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .where(self.model.id == id)
        )
        result = await db.execute(query)
        return result.scalars().first()


learning_path_service = LearningPathService(LearningPath)
