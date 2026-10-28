"""Health check and readiness verification endpoints."""

import asyncio
import time
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logger import logger
from app.db.session import get_db
from app.schemas.common import HealthCheckResponse
from app.services.email import email_service

router = APIRouter(tags=["Health"])

START_TIME = time.time()


def get_uptime_seconds() -> float:
    """Calculate process uptime in seconds."""
    return round(time.time() - START_TIME, 2)


def get_email_status() -> tuple[str, bool, str]:
    """Determine email service provider, configuration flag, and sender address."""
    if settings.RESEND_API_KEY:
        service = "resend"
        configured = True
    elif settings.SMTP_HOST:
        service = "smtp"
        configured = True
    else:
        service = "unconfigured"
        configured = False
    return service, configured, email_service._get_sender_address()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns service health, database connectivity, AI status, and system uptime.",
)
async def health_check(
    db: AsyncSession = Depends(get_db),
) -> HealthCheckResponse | JSONResponse:
    """Perform an asynchronous health check verifying database and AI status."""
    uptime_sec = get_uptime_seconds()
    ai_status = "configured" if settings.GEMINI_API_KEY else "rule_based"
    email_service, email_configured, email_sender = get_email_status()

    db_connected = False
    try:
        await asyncio.wait_for(db.execute(text("SELECT 1")), timeout=3.0)
        db_connected = True
    except Exception as exc:
        logger.warning("Database connectivity check failed during /health check: %s", exc)
        db_connected = False

    if db_connected:
        return HealthCheckResponse(
            status="healthy",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            database="connected",
            database_connected=True,
            ai_status=ai_status,
            email_service=email_service,
            email_configured=email_configured,
            email_sender=email_sender,
            uptime_seconds=uptime_sec,
            uptime=f"{uptime_sec}s",
        )

    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "unhealthy",
            "app_name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database": "disconnected",
            "database_connected": False,
            "ai_status": ai_status,
            "email_service": email_service,
            "email_configured": email_configured,
            "email_sender": email_sender,
            "uptime_seconds": uptime_sec,
            "uptime": f"{uptime_sec}s",
        },
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
    uptime_sec = get_uptime_seconds()
    ai_status = "configured" if settings.GEMINI_API_KEY else "rule_based"
    email_service, email_configured, email_sender = get_email_status()

    try:
        await asyncio.wait_for(db.execute(text("SELECT 1")), timeout=3.0)
        return HealthCheckResponse(
            status="healthy",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            database="connected",
            database_connected=True,
            ai_status=ai_status,
            email_service=email_service,
            email_configured=email_configured,
            email_sender=email_sender,
            uptime_seconds=uptime_sec,
            uptime=f"{uptime_sec}s",
        )
    except Exception as exc:
        logger.error("Readiness check failed: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unavailable",
                "app_name": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "environment": settings.ENVIRONMENT,
                "database": "disconnected",
                "database_connected": False,
                "ai_status": ai_status,
                "email_service": email_service,
                "email_configured": email_configured,
                "email_sender": email_sender,
                "uptime_seconds": uptime_sec,
                "uptime": f"{uptime_sec}s",
                "detail": str(exc) if (settings.DEBUG and settings.ENVIRONMENT != "production") else "Database connection unavailable",
            },
        )
