"""API v1 Router registry."""

from fastapi import APIRouter
from app.routers.health import router as health_router

api_router = APIRouter()

# Include feature routers
api_router.include_router(health_router, prefix="", tags=["Health"])

# Future feature routers can be mounted here, for example:
# api_router.include_router(roadmaps_router, prefix="/roadmaps", tags=["Roadmaps"])
# api_router.include_router(skills_router, prefix="/skills", tags=["Skills"])
