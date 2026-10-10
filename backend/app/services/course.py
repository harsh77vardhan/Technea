"""Service layer for Course domain."""

from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate
from app.services.base import BaseService


class CourseService(BaseService[Course, CourseCreate, CourseUpdate]):
    """Service providing business logic and CRUD operations for Courses."""

    async def get_by_skill(
        self, db: AsyncSession, skill_id: int
    ) -> Sequence[Course]:
        """Fetch all courses associated with a given skill ID."""
        query = select(self.model).where(self.model.skill_id == skill_id)
        result = await db.execute(query)
        return result.scalars().all()


course_service = CourseService(Course)
