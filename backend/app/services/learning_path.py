"""Service layer for LearningPath domain."""

import re
from collections.abc import Sequence
from typing import Any
from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_path import LearningPath
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.services.base import BaseService
from app.services.search import search_service


def clean_slugify(text: str) -> str:
    """Generate a clean URL slug from a title string."""
    s = text.lower().replace("&", "and").replace("/", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


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

    async def get_by_slug_or_id(
        self, db: AsyncSession, slug_or_id: str | int
    ) -> LearningPath | None:
        """Fetch a single learning path by integer ID or string slug with eager-loaded roadmap steps."""
        if isinstance(slug_or_id, int) or (isinstance(slug_or_id, str) and slug_or_id.isdigit()):
            path = await self.get_with_steps(db, int(slug_or_id))
            if path:
                return path

        slug_norm = str(slug_or_id).strip().lower()

        # Direct exact match on slug column
        direct_slug_query = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .where(func.lower(self.model.slug) == slug_norm)
        )
        direct_res = await db.execute(direct_slug_query)
        found_direct = direct_res.scalars().first()
        if found_direct:
            return found_direct

        # Fuzzy / fallback matching against slugify(title)
        query = select(self.model).options(selectinload(LearningPath.roadmap_steps))
        result = await db.execute(query)
        all_paths = result.scalars().all()

        for path in all_paths:
            if path.slug and path.slug.lower() == slug_norm:
                return path
            if clean_slugify(path.title) == slug_norm or path.title.lower() == slug_norm.replace("-", " "):
                return path

        for path in all_paths:
            p_slug = clean_slugify(path.title)
            if slug_norm in p_slug or p_slug in slug_norm:
                return path

        return None

    # Alias for backward compatibility
    get_by_slug_or_id_with_steps = get_by_slug_or_id

    async def get_featured(
        self,
        db: AsyncSession,
        *,
        limit: int = 10,
        skip: int = 0,
    ) -> Sequence[LearningPath]:
        """Fetch featured learning paths ordered by popularity rank."""
        stmt = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .where(self.model.is_featured.is_(True))
            .order_by(self.model.popularity_rank.asc(), self.model.id.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        paths = result.scalars().all()

        if not paths:
            # Fallback to top popularity rank paths if none are explicitly flagged as featured
            fallback_stmt = (
                select(self.model)
                .options(selectinload(LearningPath.roadmap_steps))
                .order_by(self.model.popularity_rank.asc(), self.model.id.asc())
                .offset(skip)
                .limit(limit)
            )
            fallback_res = await db.execute(fallback_stmt)
            paths = fallback_res.scalars().all()

        return paths

    async def get_recommended(
        self,
        db: AsyncSession,
        *,
        user: Any | None = None,
        limit: int = 10,
        skip: int = 0,
    ) -> Sequence[LearningPath]:
        """Fetch recommended learning paths ordered by featured status and popularity."""
        stmt = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .order_by(
                self.model.is_featured.desc(),
                self.model.popularity_rank.asc(),
                self.model.id.asc(),
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_paginated(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
        category: str | None = None,
        difficulty: str | None = None,
        level: str | None = None,
        is_featured: bool | None = None,
        tag: str | None = None,
        duration: str | None = None,
        goal: str | None = None,
        style: str | None = None,
        language: str | None = None,
    ) -> tuple[Sequence[LearningPath], int]:
        """Retrieve paginated learning paths with extensive multi-field filtering."""
        conditions = []

        if q and q.strip():
            query_str = f"%{q.strip()}%"
            conditions.append(
                or_(
                    self.model.title.ilike(query_str),
                    self.model.description.ilike(query_str),
                    self.model.category.ilike(query_str),
                    self.model.slug.ilike(query_str),
                    cast(self.model.search_terms, String).ilike(query_str),
                    cast(self.model.tags, String).ilike(query_str),
                    cast(self.model.technology_stack, String).ilike(query_str),
                    cast(self.model.skills_covered, String).ilike(query_str),
                )
            )

        if category and category.strip():
            conditions.append(self.model.category.ilike(f"%{category.strip()}%"))

        diff_filter = difficulty or level
        if diff_filter and diff_filter.strip():
            df = f"%{diff_filter.strip()}%"
            conditions.append(
                or_(
                    self.model.level.ilike(df),
                    self.model.difficulty.ilike(df),
                )
            )

        if is_featured is not None:
            conditions.append(self.model.is_featured.is_(is_featured))

        if tag and tag.strip():
            tag_str = f"%{tag.strip()}%"
            conditions.append(
                or_(
                    cast(self.model.tags, String).ilike(tag_str),
                    cast(self.model.skills_covered, String).ilike(tag_str),
                    cast(self.model.technology_stack, String).ilike(tag_str),
                    cast(self.model.related_concepts, String).ilike(tag_str),
                    self.model.title.ilike(tag_str),
                )
            )

        if duration and duration.strip():
            conditions.append(self.model.duration.ilike(f"%{duration.strip()}%"))

        if goal and goal.strip():
            g_str = f"%{goal.strip()}%"
            conditions.append(
                or_(
                    self.model.goal.ilike(g_str),
                    cast(self.model.goals, String).ilike(g_str),
                )
            )

        if style and style.strip():
            s_str = f"%{style.strip()}%"
            conditions.append(
                or_(
                    self.model.style.ilike(s_str),
                    cast(self.model.styles, String).ilike(s_str),
                )
            )

        if language and language.strip():
            l_str = f"%{language.strip()}%"
            conditions.append(
                or_(
                    self.model.language.ilike(l_str),
                    cast(self.model.languages, String).ilike(l_str),
                )
            )

        # 1. Total count query
        count_stmt = select(func.count(self.model.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        # 2. Paginated data query
        offset = max(0, (page - 1) * page_size)
        query = (
            select(self.model)
            .options(selectinload(LearningPath.roadmap_steps))
            .order_by(
                self.model.is_featured.desc(),
                self.model.popularity_rank.asc(),
                self.model.id.asc(),
            )
            .offset(offset)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        items_res = await db.execute(query)
        items = items_res.scalars().all()

        return items, total


learning_path_service = LearningPathService(LearningPath)
