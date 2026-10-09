"""Custom application exceptions and unified FastAPI exception handlers."""

from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Any = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class NotFoundException(AppException):
    """Exception raised when a requested resource is not found."""

    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class BadRequestException(AppException):
    """Exception raised for invalid input or bad requests."""

    def __init__(self, message: str = "Bad request", details: Any = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class ConflictException(AppException):
    """Exception raised when an action creates a conflict with existing state."""

    def __init__(self, message: str = "Resource conflict", details: Any = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class UnauthorizedException(AppException):
    """Exception raised when authentication is missing or invalid."""

    def __init__(self, message: str = "Unauthorized", details: Any = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class ForbiddenException(AppException):
    """Exception raised when an authenticated entity has insufficient permissions."""

    def __init__(self, message: str = "Permission denied", details: Any = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


def setup_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers with the FastAPI application."""

    @app.exception_handler(AppException)
    async def app_exception_handler(
        request: Request, exc: AppException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "message": exc.message,
                    "status_code": exc.status_code,
                    "details": exc.details,
                }
            },
        )
