"""FastAPI Application entry point for Technea backend."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.logger import logger, setup_logging
from app.db.session import engine
from app.routers.health import router as health_router
from app.utils.exceptions import setup_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup and shutdown events."""
    # Startup actions
    setup_logging()
    logger.info("Initializing %s v%s...", settings.PROJECT_NAME, settings.VERSION)
    logger.info("Environment: %s | Debug: %s", settings.ENVIRONMENT, settings.DEBUG)

    yield

    # Shutdown actions
    logger.info("Shutting down %s, releasing database connection pools...", settings.PROJECT_NAME)
    await engine.dispose()
    logger.info("Database connections released. Shutdown complete.")


def create_application() -> FastAPI:
    """Factory function to build and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # Cross-Origin Resource Sharing (CORS) Middleware
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Register custom exception handlers
    setup_exception_handlers(app)

    # Mount health router at root level for infrastructure load balancers
    app.include_router(health_router, prefix="", tags=["Infrastructure Health"])

    # Mount API v1 router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get(
        "/",
        status_code=status.HTTP_200_OK,
        tags=["Root"],
        summary="Root welcome endpoint",
    )
    async def root() -> JSONResponse:
        """Root endpoint returning service status and documentation links."""
        return JSONResponse(
            content={
                "service": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "status": "online",
                "environment": settings.ENVIRONMENT,
                "docs_url": "/docs" if settings.DEBUG else None,
                "api_v1_url": settings.API_V1_STR,
            }
        )

    return app


# Application singleton used by ASGI servers (e.g. Uvicorn)
app = create_application()
