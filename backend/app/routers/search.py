from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, status
from app.api.deps import DatabaseDep
from app.schemas.search import (
    UnifiedSearchResponse,
    IntentRecommendationResponse,
    SearchQueryRequest,
)
from app.services.search import search_service
from app.services.intent import intent_service

router = APIRouter(tags=["Search"])


@router.get(
    "",
    response_model=UnifiedSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Unified catalog search",
    description="Fuzzy matching, synonym expansion, and ranked relevance search across skills, learning paths, and courses.",
)
async def search_catalog(
    db: DatabaseDep,
    q: Annotated[str, Query(description="Search query or keyword (e.g. 'pyhton', 'react', 'machine learning')")] = "",
    category: Annotated[str | None, Query(description="Optional domain category filter")] = None,
    level: Annotated[str | None, Query(description="Optional difficulty level filter")] = None,
    duration: Annotated[str | None, Query(description="Optional duration filter (e.g. '2 Weeks', '4 Weeks')")] = None,
    goal: Annotated[str | None, Query(description="Optional goal filter (e.g. 'Job', 'Projects', 'College')")] = None,
    style: Annotated[str | None, Query(description="Optional style filter (e.g. 'Projects', 'Videos', 'Interactive')")] = None,
    language: Annotated[str | None, Query(description="Optional language filter (e.g. 'English', 'Hindi', 'Hinglish')")] = None,
    limit: Annotated[int, Query(ge=1, le=500, description="Max results per entity type")] = 15,
) -> UnifiedSearchResponse:
    """Execute unified fuzzy and synonym search."""
    return await search_service.unified_search(
        db=db,
        query=q,
        category=category,
        level=level,
        duration=duration,
        goal=goal,
        style=style,
        language=language,
        limit=limit,
    )


@router.post(
    "",
    response_model=UnifiedSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Unified catalog search (POST)",
    description="Fuzzy matching, synonym expansion, and ranked relevance search across skills, learning paths, and courses via JSON payload.",
)
async def search_catalog_post(
    request: SearchQueryRequest,
    db: DatabaseDep,
) -> UnifiedSearchResponse:
    """Execute unified search via POST body."""
    query_str = request.q if (request.q and not request.query) else request.query
    return await search_service.unified_search(
        db=db,
        query=query_str,
        category=request.category,
        level=request.level,
        duration=request.duration,
        goal=request.goal,
        style=request.style,
        language=request.language,
        limit=request.limit,
    )


@router.get(
    "/intent",
    response_model=IntentRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Intent understanding & roadmap recommendation (GET)",
    description="Analyzes natural language intent (e.g. 'I have never coded and want to build websites'), extracts experience level and domain, and returns an ordered prerequisite progression roadmap.",
)
async def analyze_intent_get(
    db: DatabaseDep,
    q: str = Query(
        ...,
        min_length=1,
        description="Natural language user prompt (e.g. 'I have never coded and want to build websites')",
    ),
) -> IntentRecommendationResponse:
    """Analyze learning intent from query string."""
    return await intent_service.analyze_and_recommend(db=db, query=q)


@router.post(
    "/intent",
    response_model=IntentRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Intent understanding & roadmap recommendation (POST)",
    description="Analyzes natural language intent from a JSON payload and returns structured roadmap recommendations.",
)
async def analyze_intent_post(
    request: SearchQueryRequest,
    db: DatabaseDep,
) -> IntentRecommendationResponse:
    """Analyze learning intent from JSON body."""
    return await intent_service.analyze_and_recommend(db=db, query=request.query)
