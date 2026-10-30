from typing import Any
from datetime import datetime
from pydantic import Field, field_validator, model_validator

from app.schemas.common import CustomBaseModel
from app.schemas.roadmap_step import RoadmapStepResponse


class LearningPathBase(CustomBaseModel):
    """Base fields for LearningPath schema."""

    title: str = Field(description="Learning path title", max_length=255)
    description: str | None = Field(default=None, description="Optional path description")
    category: str = Field(description="Category (e.g. Programming, AI & ML)", max_length=100)
    level: str = Field(description="Skill level (e.g. Beginner, Intermediate)", max_length=50)
    difficulty: str | None = Field(default=None, description="Difficulty level alias (synced with level)", max_length=50)
    duration: str | None = Field(default=None, description="Estimated duration (e.g. 4 weeks)", max_length=100)
    projects: list[dict] = Field(default_factory=list, description="Capstone projects")
    search_terms: list[str] = Field(default_factory=list, description="Searchable keywords and terms")
    related_concepts: list[str] = Field(default_factory=list, description="Related technical concepts")
    goal: str | None = Field(default="Job", description="Primary goal", max_length=50)
    goals: list[str] = Field(default_factory=list, description="Applicable goals")
    style: str | None = Field(default="Projects", description="Primary learning style", max_length=50)
    styles: list[str] = Field(default_factory=list, description="Applicable styles")
    language: str | None = Field(default="English", description="Primary language", max_length=50)
    languages: list[str] = Field(default_factory=list, description="Supported languages")
    skill_id: int | None = Field(default=None, description="Optional associated skill ID")
    slug: str | None = Field(default=None, description="URL-friendly kebab-case identifier", max_length=255)
    skills_covered: list[str] = Field(default_factory=list, description="Specific skills covered")
    prerequisites: list[str] = Field(default_factory=list, description="Required prerequisites")
    career_outcomes: list[str] = Field(default_factory=list, description="Target career roles and outcomes")
    technology_stack: list[str] = Field(default_factory=list, description="Technology stack")
    tech_stack: list[str] = Field(default_factory=list, description="Backward-compatible alias for technology_stack")
    resources: list[dict] = Field(default_factory=list, description="Curated external resources and guides")
    curated_resources: list[dict] = Field(default_factory=list, description="Backward-compatible alias for resources")
    tags: list[str] = Field(default_factory=list, description="Searchable keywords and tags")
    is_featured: bool = Field(default=False, description="Featured roadmap flag")
    popularity_rank: int = Field(default=100, description="Popularity ranking (lower is more popular)")

    @field_validator(
        "projects",
        "search_terms",
        "related_concepts",
        "goals",
        "styles",
        "languages",
        "skills_covered",
        "prerequisites",
        "career_outcomes",
        "technology_stack",
        "tech_stack",
        "resources",
        "curated_resources",
        "tags",
        mode="before",
    )
    @classmethod
    def ensure_lists(cls, v: Any) -> list:
        return v if v is not None else []

    @model_validator(mode="before")
    @classmethod
    def sync_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync technology_stack and tech_stack
            if "technology_stack" in data and not data.get("tech_stack"):
                data["tech_stack"] = data["technology_stack"]
            elif "tech_stack" in data and not data.get("technology_stack"):
                data["technology_stack"] = data["tech_stack"]

            # Sync resources and curated_resources
            if "resources" in data and not data.get("curated_resources"):
                data["curated_resources"] = data["resources"]
            elif "curated_resources" in data and not data.get("resources"):
                data["resources"] = data["curated_resources"]
        return data


class LearningPathCreate(LearningPathBase):
    """Schema for creating a LearningPath."""

    pass


class LearningPathUpdate(CustomBaseModel):
    """Schema for updating a LearningPath."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    level: str | None = Field(default=None, max_length=50)
    difficulty: str | None = Field(default=None, max_length=50)
    duration: str | None = Field(default=None, max_length=100)
    projects: list[dict] | None = None
    search_terms: list[str] | None = None
    related_concepts: list[str] | None = None
    goal: str | None = None
    goals: list[str] | None = None
    style: str | None = None
    styles: list[str] | None = None
    language: str | None = None
    languages: list[str] | None = None
    skill_id: int | None = None
    slug: str | None = Field(default=None, max_length=255)
    skills_covered: list[str] | None = None
    prerequisites: list[str] | None = None
    career_outcomes: list[str] | None = None
    technology_stack: list[str] | None = None
    tech_stack: list[str] | None = None
    resources: list[dict] | None = None
    curated_resources: list[dict] | None = None
    tags: list[str] | None = None
    is_featured: bool | None = None
    popularity_rank: int | None = None


class LearningPathResponse(LearningPathBase):
    """Schema for LearningPath response."""

    id: int = Field(description="Unique learning path ID")
    created_at: datetime = Field(description="Timestamp when path was created")
    roadmap_steps: list[RoadmapStepResponse] = Field(
        default_factory=list,
        description="Sequential steps belonging to this learning path",
    )


class LearningPathPaginationResponse(CustomBaseModel):
    """Paginated response containing list of learning paths and pagination metadata."""

    items: list[LearningPathResponse] = Field(description="List of learning paths for current page")
    total: int = Field(description="Total number of matching learning paths")
    page: int = Field(description="Current page index (1-based)")
    page_size: int = Field(description="Item count limit per page")
    total_pages: int = Field(description="Total calculated pages")
