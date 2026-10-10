"""Pydantic schemas package."""

from app.schemas.common import (
    CustomBaseModel,
    HealthCheckResponse,
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
)
from app.schemas.course import (
    CourseBase,
    CourseCreate,
    CourseResponse,
    CourseUpdate,
)
from app.schemas.learning_path import (
    LearningPathBase,
    LearningPathCreate,
    LearningPathResponse,
    LearningPathUpdate,
)
from app.schemas.roadmap_step import (
    RoadmapStepBase,
    RoadmapStepCreate,
    RoadmapStepResponse,
)
from app.schemas.skill import (
    SkillBase,
    SkillCreate,
    SkillResponse,
    SkillUpdate,
)

__all__ = [
    "CustomBaseModel",
    "HealthCheckResponse",
    "MessageResponse",
    "PaginatedResponse",
    "PaginationParams",
    "SkillBase",
    "SkillCreate",
    "SkillUpdate",
    "SkillResponse",
    "LearningPathBase",
    "LearningPathCreate",
    "LearningPathUpdate",
    "LearningPathResponse",
    "CourseBase",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "RoadmapStepBase",
    "RoadmapStepCreate",
    "RoadmapStepResponse",
]
