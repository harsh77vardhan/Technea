"""Pydantic schemas for Search and AI Intent Foundation."""

from pydantic import BaseModel, Field
from app.schemas.learning_path import LearningPathResponse
from app.schemas.skill import SkillResponse
from app.schemas.course import CourseResponse


class SearchQueryRequest(BaseModel):
    """Search request query payload."""

    query: str = Field(default="", description="Search or natural language intent query")
    q: str | None = Field(default=None, description="Optional alias for query")
    category: str | None = Field(default=None, description="Optional domain category filter")
    level: str | None = Field(default=None, description="Optional level/difficulty filter")
    duration: str | None = Field(default=None, description="Optional duration filter")
    goal: str | None = Field(default=None, description="Optional goal filter")
    style: str | None = Field(default=None, description="Optional learning style filter")
    language: str | None = Field(default=None, description="Optional language filter")
    limit: int = Field(default=20, ge=1, le=100, description="Max results per entity")


class SearchMatchReason(BaseModel):
    """Explains why a result matched the query."""

    match_type: str = Field(description="exact, synonym, fuzzy, metadata, or intent")
    matched_term: str = Field(description="Specific term or token that matched")
    score: float = Field(description="Relevance confidence score (0 to 100)")


class SearchResultItem(BaseModel):
    """Enriched search result with match metadata."""

    entity_type: str = Field(description="'skill', 'learning_path', or 'course'")
    id: int = Field(description="Database ID")
    title: str = Field(description="Name or title")
    category: str = Field(description="Domain category")
    level: str | None = Field(default=None, description="Difficulty level if applicable")
    duration: str | None = Field(default=None)
    description: str | None = Field(default=None)
    match_score: float = Field(default=0.0)
    match_reasons: list[str] = Field(default_factory=list)


class UnifiedSearchResponse(BaseModel):
    """Response containing search results across all platform entities."""

    query: str = Field(description="Original search query")
    normalized_query: str = Field(description="Cleaned, lowercase search query")
    synonyms_expanded: list[str] = Field(default_factory=list, description="Synonyms detected for this query")
    fuzzy_corrections: list[str] = Field(default_factory=list, description="Typo corrections applied")
    learning_paths: list[LearningPathResponse] = Field(default_factory=list)
    related_learning_paths: list[LearningPathResponse] = Field(
        default_factory=list, description="Related learning paths in nearby technologies"
    )
    skills: list[SkillResponse] = Field(default_factory=list)
    courses: list[CourseResponse] = Field(default_factory=list)
    is_fallback: bool = Field(default=False, description="Whether results are closest fallback alternatives")
    fallback_message: str | None = Field(default=None, description="Helpful note when showing recommended alternatives")
    total_matches: int = Field(default=0)


class DetectedIntent(BaseModel):
    """Structured user intent extracted from natural language prompt."""

    experience_level: str = Field(description="'Absolute Beginner', 'Beginner', 'Intermediate', or 'Advanced'")
    domain: str = Field(description="Primary technical domain identified")
    goal: str = Field(description="Concise description of the user's ultimate goal")
    summary: str = Field(description="Human-readable explanation of the detected intent")


class ProgressionStep(BaseModel):
    """Individual milestone step in the recommended skill roadmap."""

    step: int = Field(description="Step sequence number (1, 2, 3...)")
    skill_name: str = Field(description="Recommended skill at this step")
    action: str = Field(description="What the learner should master at this stage")
    estimated_duration: str = Field(default="2-4 Weeks", description="Estimated study time")


class IntentRecommendationResponse(BaseModel):
    """AI Intent Search Foundation response payload."""

    query: str = Field(description="Original natural language query")
    intent: DetectedIntent = Field(description="Extracted user intent")
    recommended_progression: list[ProgressionStep] = Field(
        description="Sequential prerequisite learning path (e.g. HTML -> CSS -> JavaScript -> React -> Projects)"
    )
    recommended_learning_paths: list[LearningPathResponse] = Field(
        default_factory=list, description="Top curated learning paths matching this intent"
    )
    recommended_courses: list[CourseResponse] = Field(
        default_factory=list, description="Top courses recommended for this learning track"
    )


class SkillRelationshipResponse(BaseModel):
    """Skill relationship graph response."""

    skill_id: int
    name: str
    category: str
    tags: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    aliases: list[str] = Field(default_factory=list)
    prerequisites: list[SkillResponse] = Field(default_factory=list)
    recommended_next: list[SkillResponse] = Field(default_factory=list)
    learning_paths: list[LearningPathResponse] = Field(default_factory=list)
