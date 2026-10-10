"""Service layer for Course domain."""

from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate
from app.services.base import BaseService


class CourseService(BaseService[Course, CourseCreate, CourseUpdate]):
    """Service providing business logic and CRUD operations for Courses."""

    async def get_with_lessons(self, db: AsyncSession, id: int) -> Course | None:
        """Fetch a single course with its ordered lessons loaded."""
        query = (
            select(self.model)
            .where(self.model.id == id)
            .options(selectinload(self.model.lessons))
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_skill(
        self, db: AsyncSession, skill_id: int
    ) -> Sequence[Course]:
        """Fetch all courses associated with a given skill ID."""
        query = (
            select(self.model)
            .where(self.model.skill_id == skill_id)
            .options(selectinload(self.model.lessons))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_learning_path(
        self, db: AsyncSession, learning_path_id: int
    ) -> Sequence[Course]:
        """Fetch all courses associated with a given learning path ID."""
        query = (
            select(self.model)
            .where(self.model.learning_path_id == learning_path_id)
            .options(selectinload(self.model.lessons))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_filtered(
        self,
        db: AsyncSession,
        *,
        skill_id: int | None = None,
        learning_path_id: int | None = None,
        skip: int = 0,
        limit: int = 200,
    ) -> Sequence[Course]:
        """Fetch courses filtered by skill_id and/or learning_path_id with lessons."""
        query = select(self.model).options(selectinload(self.model.lessons))
        if learning_path_id is not None:
            query = query.where(self.model.learning_path_id == learning_path_id)
        elif skill_id is not None:
            query = query.where(self.model.skill_id == skill_id)

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_multi_with_lessons(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 200
    ) -> Sequence[Course]:
        """Fetch multiple courses with lessons loaded."""
        query = (
            select(self.model)
            .options(selectinload(self.model.lessons))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_related(
        self, db: AsyncSession, course_id: int, limit: int = 4
    ) -> Sequence[Course]:
        """Fetch related courses sharing the same learning path or skill."""
        course = await self.get(db, id=course_id)
        if not course:
            return []
        query = (
            select(self.model)
            .where(self.model.id != course_id)
            .options(selectinload(self.model.lessons))
        )
        if course.learning_path_id is not None:
            query = query.where(self.model.learning_path_id == course.learning_path_id)
        else:
            query = query.where(self.model.skill_id == course.skill_id)
        query = query.limit(limit)
        result = await db.execute(query)
        return result.scalars().all()


course_service = CourseService(Course)
