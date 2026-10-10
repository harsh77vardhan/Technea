"""Service layer for Skill domain."""

from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate
from app.services.base import BaseService


class SkillService(BaseService[Skill, SkillCreate, SkillUpdate]):
    """Service providing business logic and CRUD operations for Skills."""

    pass


skill_service = SkillService(Skill)
