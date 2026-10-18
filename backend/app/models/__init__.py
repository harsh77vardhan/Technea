"""SQLAlchemy models package.

Import all database models here so Alembic can discover their metadata.
"""

from app.db.base import Base
from app.models.base import IntIdMixin, TableNameMixin, TimestampMixin, UUIDIdMixin
from app.models.skill import Skill, SkillPrerequisite
from app.models.learning_path import LearningPath
from app.models.course import Course
from app.models.roadmap_step import RoadmapStep
from app.models.lesson import Lesson
from app.models.user import User
from app.models.progress import (
    UserLearningPath,
    UserRoadmapProgress,
    UserLessonProgress,
)
from app.models.user_roadmap import (
    UserGeneratedRoadmap,
    DailyLearningActivity,
)

__all__ = [
    "Base",
    "TableNameMixin",
    "TimestampMixin",
    "UUIDIdMixin",
    "IntIdMixin",
    "Skill",
    "SkillPrerequisite",
    "LearningPath",
    "Course",
    "RoadmapStep",
    "Lesson",
    "User",
    "UserLearningPath",
    "UserRoadmapProgress",
    "UserLessonProgress",
    "UserGeneratedRoadmap",
    "DailyLearningActivity",
]


