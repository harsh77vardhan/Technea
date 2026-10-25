import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

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

    # Production secrets and security warnings check
    if settings.ENVIRONMENT == "production":
        insecure_keys = {
            "change-this-in-production-with-a-secure-random-secret-key",
            "generate-a-secure-random-secret-key-for-production",
            "secret",
            "secret-key",
            "default-secret-key",
        }
        if settings.SECRET_KEY in insecure_keys or len(settings.SECRET_KEY) < 32:
            logger.warning(
                "CRITICAL SECURITY WARNING: Default or weak SECRET_KEY is active in production environment! "
                "Update SECRET_KEY in your production environment variables."
            )
        if settings.POSTGRES_PASSWORD in {"postgres_password", "postgres", "admin", "password", "root"}:
            logger.warning(
                "SECURITY WARNING: Default or weak database password is configured in production environment!"
            )

    yield

    # Shutdown actions
    logger.info("Shutting down %s, releasing database connection pools...", settings.PROJECT_NAME)
    await engine.dispose()
    logger.info("Database connections released. Shutdown complete.")


class SecurityHeadersMiddleware:
    """Pure ASGI middleware injecting HTTP security response headers into every response."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))

                def set_header(key: bytes, val: bytes):
                    nonlocal headers
                    headers = [h for h in headers if h[0].lower() != key.lower()]
                    headers.append((key, val))

                set_header(b"x-frame-options", b"DENY")
                set_header(b"x-content-type-options", b"nosniff")
                set_header(b"referrer-policy", b"strict-origin-when-cross-origin")
                set_header(b"x-xss-protection", b"1; mode=block")
                set_header(b"strict-transport-security", b"max-age=31536000; includeSubDomains")

                # Content-Security-Policy (omit on interactive OpenAPI docs to avoid UI script breakage)
                path = scope.get("path", "")
                if not (path.startswith("/docs") or path.startswith("/redoc") or "openapi.json" in path):
                    csp_value = (
                        b"default-src 'self'; "
                        b"img-src 'self' data: https: blob:; "
                        b"font-src 'self' data:; "
                        b"style-src 'self' 'unsafe-inline'; "
                        b"script-src 'self' 'unsafe-inline'; "
                        b"connect-src 'self' *; "
                        b"frame-ancestors 'none'; "
                        b"object-src 'none';"
                    )
                    set_header(b"content-security-policy", csp_value)

                message["headers"] = headers

            await send(message)

        await self.app(scope, receive, send_wrapper)


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

    # Security Headers Middleware
    app.add_middleware(SecurityHeadersMiddleware)

    # Cross-Origin Resource Sharing (CORS) Middleware
    cors_origins = [str(origin).rstrip("/") for origin in settings.CORS_ORIGINS if str(origin).strip()]
    if settings.FRONTEND_URL:
        fe_origin = str(settings.FRONTEND_URL).rstrip("/")
        if fe_origin and fe_origin not in cors_origins:
            cors_origins.append(fe_origin)

    has_wildcard = "*" in cors_origins
    allow_credentials = True

    if has_wildcard:
        if settings.ENVIRONMENT == "production":
            logger.warning(
                "CORS wildcard '*' is prohibited with allow_credentials=True in production. "
                "Filtering '*' from origins to enforce explicit domain matching."
            )
            cors_origins = [o for o in cors_origins if o != "*"]
            if not cors_origins:
                cors_origins = ["*"]
                allow_credentials = False
        else:
            allow_credentials = False

    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
            allow_credentials=allow_credentials,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=["Content-Disposition", "Content-Length"],
        )

    # Register custom exception handlers
    setup_exception_handlers(app)

    # Mount health router at root level for infrastructure load balancers
    app.include_router(health_router, prefix="", tags=["Infrastructure Health"])

    # Mount API v1 router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # User uploads directory for avatars
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
    os.makedirs(os.path.join(uploads_dir, "avatars"), exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Static assets directory for user uploaded avatars & assets
    static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
    os.makedirs(os.path.join(static_dir, "avatars"), exist_ok=True)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

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
