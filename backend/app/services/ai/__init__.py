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
    INTENT_CAREER_ADVICE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODING_ARCHITECTURE,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_LEARNING_QUESTION,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_SUGGESTION,
    INTENT_REVISION,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    INTENT_WEEKLY_PLAN,
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
    # Intent Constants
    "INTENT_GREETING",
    "INTENT_CASUAL",
    "INTENT_DAILY_GOAL",
    "INTENT_WEEKLY_PLAN",
    "INTENT_REVISION",
    "INTENT_INTERVIEW_PREP",
    "INTENT_CODE_HELP",
    "INTENT_CODING_HELP",
    "INTENT_ROADMAP_REQUEST",
    "INTENT_NEXT_STEP",
    "INTENT_PROJECT_SUGGESTION",
    "INTENT_CAREER_ADVICE",
    "INTENT_LEARNING_ADVICE",
    "INTENT_SIMPLE_QUESTION",
    "INTENT_TIME_DATE",
    "INTENT_CODING_ARCHITECTURE",
    "INTENT_LEARNING_QUESTION",
    # Errors & Utilities
    "GeminiError",
    "GeminiAuthError",
    "GeminiRateLimitError",
    "GeminiTimeoutError",
    "GeminiNetworkError",
    "GeminiAPIError",
    "sanitize_text",
]
