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
    INTENT_CAREER_GUIDANCE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODE_REVIEW,
    INTENT_CODING_ARCHITECTURE,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_DEBUGGING,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_LEARNING_QUESTION,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_RECOMMENDATION,
    INTENT_PROJECT_SUGGESTION,
    INTENT_QUIZ,
    INTENT_RESOURCE_SEARCH,
    INTENT_REVISION,
    INTENT_ROADMAP_PLANNING,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    INTENT_WEEKLY_PLAN,
    PERSONA_PROFILES,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    build_system_prompt,
    construct_prompt,
    classify_intent,
    get_behavioral_rule,
)
from app.services.ai.quiz_engine import QuizEngine, quiz_engine
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
from app.services.ai.special_router import (
    SpecialRouter,
    special_router,
)
from app.services.ai.memory_engine import (
    ConversationMemoryState,
    MemoryEngine,
    memory_engine,
)
from app.services.ai.recommendation_engine import (
    RecommendationEngine,
    recommendation_engine,
)
from app.services.ai.trusted_resources import (
    TRUSTED_RESOURCES,
    get_trusted_resources_for_topic,
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
    # Special Fast-path Router & Memory Engine
    "SpecialRouter",
    "special_router",
    "MemoryEngine",
    "memory_engine",
    "ConversationMemoryState",
    # Context Retrieval & Recommendation Engine
    "ContextRetriever",
    "context_retriever",
    "RoadmapContextExtractor",
    "roadmap_context_extractor",
    "RecommendationEngine",
    "recommendation_engine",
    "get_trusted_resources_for_topic",
    "TRUSTED_RESOURCES",
    # Milestone Quiz Engine
    "QuizEngine",
    "quiz_engine",
    # Prompts & Personas
    "AI_NAME",
    "AI_CHARACTERISTICS",
    "BEHAVIORAL_RULES",
    "TECHNEA_MENTOR_SYSTEM_PROMPT",
    "PERSONA_PROFILES",
    "DOMAIN_GUIDELINES",
    "build_system_prompt",
    "construct_prompt",
    "classify_intent",
    "get_behavioral_rule",
    # Intent Constants
    "INTENT_GREETING",
    "INTENT_CASUAL",
    "INTENT_TIME_DATE",
    "INTENT_RESOURCE_SEARCH",
    "INTENT_QUIZ",
    "INTENT_PROJECT_RECOMMENDATION",
    "INTENT_PROJECT_SUGGESTION",
    "INTENT_LEARNING_QUESTION",
    "INTENT_LEARNING_ADVICE",
    "INTENT_CODING_HELP",
    "INTENT_CODE_HELP",
    "INTENT_DEBUGGING",
    "INTENT_CODE_REVIEW",
    "INTENT_CAREER_GUIDANCE",
    "INTENT_CAREER_ADVICE",
    "INTENT_ROADMAP_PLANNING",
    "INTENT_ROADMAP_REQUEST",
    "INTENT_INTERVIEW_PREP",
    "INTENT_DAILY_GOAL",
    "INTENT_WEEKLY_PLAN",
    "INTENT_SIMPLE_QUESTION",
    "INTENT_NEXT_STEP",
    "INTENT_REVISION",
    "INTENT_CODING_ARCHITECTURE",
    # Errors & Utilities
    "GeminiError",
    "GeminiAuthError",
    "GeminiRateLimitError",
    "GeminiTimeoutError",
    "GeminiNetworkError",
    "GeminiAPIError",
    "sanitize_text",
]
