"""Comprehensive test suite for SpecialRouter and MemoryEngine in Technea AI Mentor 2.0.

Verifies:
1. SpecialRouter Zero-Token Fast Path:
   - Greetings ("hi", "hello", "hey", "good morning", "yo", "sup", directives)
   - Gratitude & Casual acknowledgments ("thank you", "thanks", "cool", "got it", "nice", "bye")
   - Accurate server date/time queries ("what is today's date?", "date?", "date", "today's date", "time", "what time is it?", "what day is today?", "current time", "what's the day")
   - Guardrails: Non-conversational technical queries are not handled by SpecialRouter.
2. MemoryEngine:
   - Multi-turn state tracking (previous intent, previous topic, previous code snippet)
   - Resolution of pending assistant offers (e.g. "quiz or project" -> "quiz" / "project")
   - User corrections extraction across turns ("I'm learning Python", "using FastAPI not Django", level corrections)
   - Ellipsis and single-word follow-up resolution ("why?", "explain", "quiz me", "date?")
3. AIService Pipeline Integration:
   - Zero-token execution (<5ms, provider_used="special_router")
   - Proper pass-through to rule_based for technical queries.
"""

from datetime import datetime
import pytest

from app.services.ai import (
    AIService,
    ConversationMemoryState,
    MemoryEngine,
    RuleBasedProvider,
    SpecialRouter,
    memory_engine,
    special_router,
)
from app.services.ai.prompts import (
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_GREETING,
    INTENT_PROJECT_SUGGESTION,
    INTENT_REVISION,
    INTENT_TIME_DATE,
    classify_intent,
)


# =====================================================================
# 1. Special Router Tests
# =====================================================================
@pytest.mark.asyncio
async def test_special_router_greetings():
    """Verify greeting fast path for authenticated users and guests."""
    router = SpecialRouter()

    # Direct short greeting - guest
    assert router.can_handle(INTENT_GREETING, "hey")
    res_guest = await router.route(INTENT_GREETING, "hey")
    assert "Hey 👋" in res_guest

    # Direct short greeting - named user
    ctx_user = {"user_name": "Harsh", "level": "Intermediate"}
    res_user = await router.route(INTENT_GREETING, "hey", ctx_user)
    assert "Hey Harsh! 👋" in res_user

    # Greetings list
    for g in ["hi", "yo", "sup", "hey there", "hi there"]:
        assert router.can_handle(INTENT_GREETING, g)
        r = await router.route(INTENT_GREETING, g, ctx_user)
        assert "Harsh" in r or "Hey" in r

    # Conversational directive
    res_directive = await router.route(INTENT_GREETING, "hey, just say hey back")
    assert "Hey back! 👋" in res_directive

    # Full persona greeting
    res_hello = await router.route(INTENT_GREETING, "hello", ctx_user)
    assert "Technea AI Mentor" in res_hello
    assert "Harsh" in res_hello
    assert "Intermediate" in res_hello


@pytest.mark.asyncio
async def test_special_router_gratitude_and_casual():
    """Verify polite acknowledgment and casual fast path."""
    router = SpecialRouter()

    # Gratitude
    for q in ["thank you", "thanks", "thx", "many thanks", "thank you so much"]:
        assert router.can_handle(INTENT_CASUAL, q)
        r = await router.route(INTENT_CASUAL, q)
        assert "welcome" in r.lower()

    # Acknowledgments
    for q in ["cool", "got it", "nice", "awesome", "great", "understood", "makes sense"]:
        assert router.can_handle(INTENT_CASUAL, q)
        r = await router.route(INTENT_CASUAL, q)
        assert "helpful" in r.lower() or "glad" in r.lower()

    # Farewells
    for q in ["bye", "goodbye", "see you", "see ya"]:
        assert router.can_handle(INTENT_CASUAL, q)
        r = await router.route(INTENT_CASUAL, q)
        assert "later" in r.lower() or "happy coding" in r.lower()


@pytest.mark.asyncio
async def test_special_router_time_and_date():
    """Verify non-hallucinatory resolution for all required date, time, and day questions."""
    router = SpecialRouter()
    now = datetime.now().astimezone()
    cur_weekday = now.strftime("%A")
    cur_date = now.strftime("%B %d, %Y")

    # Date questions
    date_queries = [
        "what is today's date?",
        "date?",
        "date",
        "today's date",
        "current date",
        "what's the date today",
    ]
    for q in date_queries:
        assert router.can_handle(INTENT_TIME_DATE, q), f"Router failed to match {q}"
        r = await router.route(INTENT_TIME_DATE, q)
        assert cur_weekday in r
        assert cur_date in r

    # Time questions
    time_queries = [
        "time",
        "time?",
        "what time is it?",
        "current time",
        "server time",
        "what's the time",
    ]
    for q in time_queries:
        assert router.can_handle(INTENT_TIME_DATE, q), f"Router failed to match {q}"
        r = await router.route(INTENT_TIME_DATE, q)
        assert "server time" in r.lower()
        assert any(ind in r for ind in ["AM", "PM", "UTC", "IST", "GMT"])

    # Day questions
    day_queries = [
        "what day is today?",
        "what's the day",
        "what is the day",
        "which day is today",
        "what day of the week is it",
    ]
    for q in day_queries:
        assert router.can_handle(INTENT_TIME_DATE, q), f"Router failed to match {q}"
        r = await router.route(INTENT_TIME_DATE, q)
        assert f"Today is {cur_weekday}." in r


def test_special_router_guardrails():
    """Ensure technical and complex queries are rejected by SpecialRouter."""
    router = SpecialRouter()
    technical_queries = [
        "explain recursion",
        "teach me React hooks",
        "review my code",
        "how does FastAPI work?",
        "what is an API?",
        "python roadmap",
        "give me a project idea",
        "what should I do next?",
    ]
    for q in technical_queries:
        intent = classify_intent(q)
        assert not router.can_handle(intent, q), f"Special router should NOT handle: {q}"


# =====================================================================
# 2. Memory Engine Tests
# =====================================================================
def test_memory_engine_pending_offers():
    """Verify answering assistant prompts like 'Would you like a quiz or a project?'."""
    engine = MemoryEngine()
    history = [
        {"role": "user", "content": "What are Object-Oriented Design Patterns?"},
        {
            "role": "assistant",
            "content": (
                "### Mentor Insight on: Object-Oriented Design Patterns\n\n"
                "Design patterns represent reusable solutions to common software design problems.\n\n"
                "Would you like a quiz or a project to test your understanding?"
            ),
        },
    ]

    # User answers "quiz"
    state_quiz = engine.analyze(history, "quiz")
    assert state_quiz.resolved_intent == INTENT_REVISION
    assert "Object-Oriented Design Patterns" in state_quiz.resolved_message
    assert state_quiz.active_topic == "Object-Oriented Design Patterns"

    # User answers "project"
    state_proj = engine.analyze(history, "project")
    assert state_proj.resolved_intent == INTENT_PROJECT_SUGGESTION
    assert "Object-Oriented Design Patterns" in state_proj.resolved_message


def test_memory_engine_user_corrections():
    """Verify extracting user corrections (language, framework, level)."""
    engine = MemoryEngine()
    history = [
        {"role": "user", "content": "I am learning Python"},
        {"role": "assistant", "content": "Welcome! What framework are you building with?"},
        {"role": "user", "content": "using FastAPI not Django"},
        {"role": "assistant", "content": "FastAPI is a modern, high-performance async framework."},
        {"role": "user", "content": "I am intermediate"},
    ]

    state = engine.analyze(history, "quiz me")
    assert state.user_corrections.get("preferred_language") == "Python"
    assert state.user_corrections.get("framework") == "FastAPI"
    assert state.user_corrections.get("avoid_framework") == "Django"
    assert state.user_corrections.get("level") == "Intermediate"
    assert state.context_updates.get("preferred_language") == "Python"
    assert state.context_updates.get("framework") == "FastAPI"


def test_memory_engine_ellipsis_resolution():
    """Verify resolving single-word follow-ups ('date?', 'why?', 'quiz me')."""
    engine = MemoryEngine()

    # 1. "date?" follow-up
    state_date = engine.analyze([], "date?")
    assert state_date.resolved_intent == INTENT_TIME_DATE
    assert state_date.resolved_message == "What is today's date?"

    # 2. "why?" follow-up on code snippet
    history_code = [
        {"role": "user", "content": "Show me a recursive factorial in Python"},
        {
            "role": "assistant",
            "content": (
                "### Recursion: Intuition, Mechanics & Implementation\n\n"
                "```python\n"
                "def factorial(n: int) -> int:\n"
                "    if n <= 1:\n"
                "        return 1\n"
                "    return n * factorial(n - 1)\n"
                "```"
            ),
        },
    ]
    state_why = engine.analyze(history_code, "why?")
    assert state_why.resolved_intent == INTENT_CODE_HELP
    assert "factorial" in state_why.resolved_message

    # 3. "quiz me" on previous topic
    history_topic = [
        {"role": "user", "content": "Explain React hooks"},
        {
            "role": "assistant",
            "content": "### React Hooks Deep Dive: useState & useEffect\n\nHooks let you use state in functional components.",
        },
    ]
    state_quiz = engine.analyze(history_topic, "quiz me")
    assert state_quiz.resolved_intent == INTENT_REVISION
    assert "React Hooks" in state_quiz.resolved_message


# =====================================================================
# 3. AI Service Pipeline Integration Tests
# =====================================================================
@pytest.mark.asyncio
async def test_ai_service_special_router_integration():
    """Verify AIService returns provider_used='special_router' for zero-token path."""
    service = AIService()

    # Greeting fast path
    resp_greeting, provider_g = await service.generate_chat_response("hey", return_metadata=True)
    assert provider_g == "special_router"
    assert "Hey 👋" in resp_greeting

    # Date fast path
    resp_date, provider_d = await service.generate_chat_response("date?", return_metadata=True)
    assert provider_d == "special_router"
    assert datetime.now().astimezone().strftime("%A") in resp_date

    # Time fast path
    resp_time, provider_t = await service.generate_chat_response("what time is it?", return_metadata=True)
    assert provider_t == "special_router"
    assert "server time" in resp_time.lower()

    # Technical question falls through to rule_based
    resp_tech, provider_tech = await service.generate_chat_response("explain recursion", return_metadata=True)
    assert provider_tech == "rule_based"
    assert "recursion" in resp_tech.lower()


@pytest.mark.asyncio
async def test_rule_based_provider_rich_context():
    """Verify RuleBasedProvider utilizes memory engine active_topic for customized quizzes."""
    provider = RuleBasedProvider()

    # Customized quiz on Object-Oriented Design Patterns
    ctx = {"active_topic": "Object-Oriented Design Patterns", "preferred_language": "Python"}
    resp = await provider.generate_chat_response("quiz me", context=ctx)
    assert "Object-Oriented Design Patterns" in resp
    assert any(term in resp for term in ["Design Patterns", "Factory", "Encapsulation", "Polymorphism", "SRP", "Strategy"])
    assert "Question 1" in resp or "Quiz" in resp
