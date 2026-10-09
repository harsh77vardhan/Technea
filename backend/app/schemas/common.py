"""Shared Pydantic v2 schemas for responses and request parameters."""

from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class CustomBaseModel(BaseModel):
    """Base schema configured for ORM mode and attribute aliasing."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class HealthCheckResponse(CustomBaseModel):
    """Schema for health status endpoint."""

    status: str = Field(default="ok", description="Overall service status")
    app_name: str = Field(description="Name of the application")
    version: str = Field(description="Service version")
    environment: str = Field(description="Runtime environment")
    database_connected: bool = Field(description="Database connectivity status")


class MessageResponse(CustomBaseModel):
    """Generic message response schema."""

    message: str = Field(description="Informative message")
    detail: str | None = Field(default=None, description="Optional extra detail")


class PaginationParams(CustomBaseModel):
    """Standard pagination query parameters."""

    page: int = Field(default=1, ge=1, description="Page number, starting at 1")
    page_size: int = Field(
        default=20, ge=1, le=100, description="Number of items per page"
    )

    @property
    def offset(self) -> int:
        """Calculate database query offset."""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """Calculate database query limit."""
        return self.page_size


class PaginatedResponse(CustomBaseModel, Generic[T]):
    """Generic paginated response schema."""

    items: list[T] = Field(description="List of records for current page")
    total: int = Field(description="Total number of matching records")
    page: int = Field(description="Current page index")
    page_size: int = Field(description="Item count limit per page")
    total_pages: int = Field(description="Total calculated pages")
