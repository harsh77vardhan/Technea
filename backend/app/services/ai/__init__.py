"""AI Services package for Technea.

Provides unified abstractions, Google Gemini REST integration with resilient
fallbacks, and pedagogical system prompt builders for the Technea learning platform.
"""

from app.services.ai.base_provider import BaseAIProvider
from app.services.ai.gemini_client import (
    GeminiAPIError,
    GeminiAuthError,
    GeminiError,
    GeminiNetworkError,
    GeminiProvider,
    GeminiRateLimitError,
    GeminiTimeoutError,
    sanitize_text,
)
from app.services.ai.prompts import (
    AI_CHARACTERISTICS,
    AI_NAME,
    BEHAVIORAL_RULES,
    DOMAIN_GUIDELINES,
    PERSONA_PROFILES,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    build_system_prompt,
    classify_intent,
    get_behavioral_rule,
)
from app.services.ai.ai_service import (
    AIService,
    RuleBasedProvider,
    ai_service,
    get_ai_service,
)
from app.services.ai.context_retriever import (
    ContextRetriever,
    context_retriever,
)
from app.services.ai.roadmap_context_extractor import (
    RoadmapContextExtractor,
    roadmap_context_extractor,
)


__all__ = [
    # Base Abstractions
    "BaseAIProvider",
    # Providers
    "GeminiProvider",
    "RuleBasedProvider",
    # Service and Factory
    "AIService",
    "ai_service",
    "get_ai_service",
    # Context Retrieval
    "ContextRetriever",
    "context_retriever",
    "RoadmapContextExtractor",
    "roadmap_context_extractor",
    # Prompts & Personas
    "AI_NAME",
    "AI_CHARACTERISTICS",
    "BEHAVIORAL_RULES",
    "TECHNEA_MENTOR_SYSTEM_PROMPT",
    "PERSONA_PROFILES",
    "DOMAIN_GUIDELINES",
    "build_system_prompt",
    "classify_intent",
    "get_behavioral_rule",
    # Errors & Utilities
    "GeminiError",
    "GeminiAuthError",
    "GeminiRateLimitError",
    "GeminiTimeoutError",
    "GeminiNetworkError",
    "GeminiAPIError",
    "sanitize_text",
]
