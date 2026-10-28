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
    UserLearningPathProgress,
    UserRoadmapProgress,
    UserLessonProgress,
)
from app.models.user_roadmap import (
    UserGeneratedRoadmap,
    UserRoadmap,
    DailyLearningActivity,
)
from app.models.project import (
    Project,
    UserProject,
)
from app.models.community import (
    LearningRoom,
    UserLearningRoom,
)
from app.models.achievement import (
    Achievement,
    UserAchievement,
)
from app.models.follow import Follow
from app.models.email_otp import EmailOTP

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
    "UserLearningPathProgress",
    "UserRoadmapProgress",
    "UserLessonProgress",
    "UserGeneratedRoadmap",
    "UserRoadmap",
    "DailyLearningActivity",
    "Project",
    "UserProject",
    "LearningRoom",
    "UserLearningRoom",
    "Achievement",
    "UserAchievement",
    "Follow",
    "EmailOTP",
]


