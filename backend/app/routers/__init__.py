"""Routers package."""

from app.routers.courses import router as courses_router
from app.routers.health import router as health_router
from app.routers.learning_paths import router as learning_paths_router
from app.routers.skills import router as skills_router

__all__ = [
    "health_router",
    "skills_router",
    "learning_paths_router",
    "courses_router",
]
