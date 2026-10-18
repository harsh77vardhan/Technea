"""Business services package."""

from app.services.base import BaseService
from app.services.course import CourseService, course_service
from app.services.learning_path import LearningPathService, learning_path_service
from app.services.skill import SkillService, skill_service
from app.services.ai import AIService, ai_service, get_ai_service
from app.services.storage import BaseStorageService, LocalStorageService, get_storage_service

__all__ = [
    "BaseService",
    "SkillService",
    "skill_service",
    "LearningPathService",
    "learning_path_service",
    "CourseService",
    "course_service",
    "AIService",
    "ai_service",
    "get_ai_service",
    "BaseStorageService",
    "LocalStorageService",
    "get_storage_service",
]
