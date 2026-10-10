"""API v1 Router registry."""

from fastapi import APIRouter
from app.routers.courses import router as courses_router
from app.routers.health import router as health_router
from app.routers.learning_paths import router as learning_paths_router
from app.routers.skills import router as skills_router

api_router = APIRouter()

# Include feature routers
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(skills_router, prefix="/skills", tags=["Skills"])
api_router.include_router(
    learning_paths_router, prefix="/learning-paths", tags=["Learning Paths"]
)
api_router.include_router(courses_router, prefix="/courses", tags=["Courses"])

