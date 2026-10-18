"""API v1 Router registry."""

from fastapi import APIRouter
from app.routers.courses import router as courses_router
from app.routers.health import router as health_router
from app.routers.learning_paths import router as learning_paths_router
from app.routers.skills import router as skills_router
from app.routers.search import router as search_router
from app.routers.auth import router as auth_router
from app.routers.progress import router as progress_router
from app.routers.roadmap_builder import router as roadmap_builder_router

api_router = APIRouter()

# Include feature routers
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(progress_router, prefix="/progress", tags=["User Progress"])
api_router.include_router(roadmap_builder_router, prefix="/roadmaps", tags=["Roadmap Builder"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])
api_router.include_router(skills_router, prefix="/skills", tags=["Skills"])
api_router.include_router(
    learning_paths_router, prefix="/learning-paths", tags=["Learning Paths"]
)
api_router.include_router(courses_router, prefix="/courses", tags=["Courses"])


