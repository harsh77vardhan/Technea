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

    async def get_multi_with_fallback(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 250,
        q: str | None = None,
        category: str | None = None,
        level: str | None = None,
        duration: str | None = None,
        goal: str | None = None,
        style: str | None = None,
        language: str | None = None,
    ) -> tuple[Sequence[LearningPath], bool, str | None]:
        """Fetch learning paths with fallback indicators for UI feedback."""
        paths, _, is_fallback, fallback_msg = await search_service.search_learning_paths(
            db,
            query=q or "",
            category=category,
            level=level,
            duration=duration,
            goal=goal,
            style=style,
            language=language,
            limit=limit + skip,
        )
        return paths[skip : skip + limit], is_fallback, fallback_msg

    async def get_multi_with_steps(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 250,
        q: str | None = None,
        category: str | None = None,
        level: str | None = None,
        duration: str | None = None,
        goal: str | None = None,
        style: str | None = None,
        language: str | None = None,
    ) -> Sequence[LearningPath]:
        """Fetch multiple learning paths with eager-loaded steps, full filter support, duration proximity, and fallback."""
        paths, _, _ = await self.get_multi_with_fallback(
            db,
            skip=skip,
            limit=limit,
            q=q,
            category=category,
            level=level,
            duration=duration,
            goal=goal,
            style=style,
            language=language,
        )
        return paths

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
