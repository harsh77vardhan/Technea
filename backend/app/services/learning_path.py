"""Service layer for LearningPath domain."""

from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_path import LearningPath
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.services.base import BaseService


class LearningPathService(BaseService[LearningPath, LearningPathCreate, LearningPathUpdate]):
    """Service providing business logic and CRUD operations for LearningPaths."""

    async def get_multi_with_steps(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> Sequence[LearningPath]:
        """Fetch multiple learning paths with eager-loaded roadmap steps."""
        query = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .offset(skip)
            .limit(limit)
        )
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
