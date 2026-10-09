"""Health check and readiness verification endpoints."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.schemas.common import HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness check",
    description="Returns the status of the service to verify the application process is running.",
)
async def health_check() -> HealthCheckResponse:
    """Perform a simple service liveness check."""
    return HealthCheckResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database_connected=True,
    )


@router.get(
    "/ready",
    response_model=HealthCheckResponse,
    summary="Readiness check",
    description="Verifies the application and downstream dependencies (PostgreSQL) are ready to accept traffic.",
)
async def readiness_check(
    db: AsyncSession = Depends(get_db),
) -> HealthCheckResponse | JSONResponse:
    """Perform a database readiness check."""
    try:
        await db.execute(text("SELECT 1"))
        return HealthCheckResponse(
            status="ok",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            database_connected=True,
        )
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unavailable",
                "app_name": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "environment": settings.ENVIRONMENT,
                "database_connected": False,
                "detail": str(exc),
            },
        )
