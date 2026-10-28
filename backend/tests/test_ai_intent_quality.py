"""Comprehensive test suite for AI Mentor conversational intent quality.

Verifies:
1. Short friendly casual greetings ("hey", "hi", "yo") acknowledging name if present (<= 2 lines).
2. Conversational directives ("hey dont say anything just say hey back", "just say hey back") returning short greeting with no code blocks or architecture (<= 2 lines).
3. Gratitude messages ("thanks", "thank you") returning friendly acknowledgment without architecture.
4. Structured learning guidance for educational inquiries ("how do I learn Python?").
5. Technical explanation and working code for concept questions ("explain React hooks").
6. Comprehensive architecture blueprint for system design requests ("build me a backend architecture").
7. Factual, concise 2-3 sentence definition for simple questions without full project dumps ("what is an API?").
8. Router endpoint enforcement: allow_resources=False, short suggestions, suggested_next_step=None on casual/simple intents.
"""

import asyncio
import os
import sys
import httpx
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import engine
from app.main import app
from app.services.ai.ai_service import RuleBasedProvider
from app.services.ai.prompts import (
    INTENT_CASUAL,
    INTENT_CODING_ARCHITECTURE,
    INTENT_GREETING,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    classify_intent,
)


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


# =====================================================================
# Case 1: Short friendly greeting for "hey"
# =====================================================================
@pytest.mark.asyncio
async def test_case_1_hey_short_greeting():
    """Case 1: provider.generate_chat_response("hey") -> returns 'Hey 👋' or 'Hey {Name} 👋' (short, <= 2 lines)."""
    provider = RuleBasedProvider()

    # Without user name
    res_no_name = await provider.generate_chat_response("hey")
    lines_no_name = [line.strip() for line in res_no_name.strip().split("\n") if line.strip()]
    assert len(lines_no_name) <= 2, f"Expected <= 2 lines, got {len(lines_no_name)}"
    assert "Hey" in res_no_name
    assert "👋" in res_no_name
    assert "```" not in res_no_name
    assert "###" not in res_no_name

    # With user name
    res_with_name = await provider.generate_chat_response("hey", context={"user_name": "Devon"})
    lines_with_name = [line.strip() for line in res_with_name.strip().split("\n") if line.strip()]
    assert len(lines_with_name) <= 2, f"Expected <= 2 lines, got {len(lines_with_name)}"
    assert "Devon" in res_with_name
    assert "Hey" in res_with_name
    assert "👋" in res_with_name
    assert "```" not in res_with_name
    assert "###" not in res_with_name


# =====================================================================
# Case 2: Conversational directive "hey dont say anything just say hey back"
# =====================================================================
@pytest.mark.asyncio
async def test_case_2_conversational_directive():
    """Case 2: provider.generate_chat_response("hey dont say anything just say hey back") -> short greeting with NO code, NO architecture headings, <= 2 lines."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("hey dont say anything just say hey back")
    lines = [line.strip() for line in res.strip().split("\n") if line.strip()]

    assert len(lines) <= 2, f"Expected <= 2 lines, got {len(lines)}"
    assert "Hey" in res
    assert "👋" in res
    assert "```" not in res, "Must not contain code blocks"
    assert "###" not in res, "Must not contain markdown headers"
    assert "architecture" not in res.lower(), "Must not mention architecture"
    assert "fastapi" not in res.lower()
    assert "endpoint" not in res.lower()

    # Additional directive variants
    res_just_say = await provider.generate_chat_response("just say hey back")
    assert len([l for l in res_just_say.strip().split("\n") if l.strip()]) <= 2
    assert "Hey" in res_just_say

    res_say_hey = await provider.generate_chat_response("say hey")
    assert len([l for l in res_say_hey.strip().split("\n") if l.strip()]) <= 2
    assert "Hey" in res_say_hey


# =====================================================================
# Case 3: Gratitude acknowledgment "thanks"
# =====================================================================
@pytest.mark.asyncio
async def test_case_3_thanks_acknowledgment():
    """Case 3: provider.generate_chat_response("thanks") -> returns 'You're welcome!' friendly acknowledgment without architecture."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("thanks")
    assert "welcome" in res.lower()
    assert "```" not in res, "Must not contain code blocks"
    assert "###" not in res, "Must not contain markdown headers"
    assert "architecture" not in res.lower(), "Must not contain architecture explanation"
    assert "database" not in res.lower()

    res_thank_you = await provider.generate_chat_response("thank you")
    assert "welcome" in res_thank_you.lower()
    assert "```" not in res_thank_you


# =====================================================================
# Case 4: Educational guidance "how do I learn Python?"
# =====================================================================
@pytest.mark.asyncio
async def test_case_4_how_to_learn_python():
    """Case 4: provider.generate_chat_response("how do I learn Python?") -> returns structured learning roadmap / educational guidance."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("how do I learn Python?")
    assert "Python" in res
    assert "Foundations" in res
    assert "Data Structures" in res
    assert "Projects" in res or "Hands-on" in res
    assert "Testing" in res or "Production" in res
    assert "pytest" in res or "syntax" in res.lower()


# =====================================================================
# Case 5: Technical explanation with example "explain React hooks"
# =====================================================================
@pytest.mark.asyncio
async def test_case_5_explain_react_hooks():
    """Case 5: provider.generate_chat_response("explain React hooks") -> returns technical explanation of React hooks with example."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("explain React hooks")
    assert "React" in res
    assert "useState" in res
    assert "useEffect" in res
    assert "Custom Hooks" in res or "custom hook" in res.lower()
    assert "```" in res, "Must contain a fenced code block"
    assert "Takeaways" in res or "Rules of Hooks" in res or "takeaway" in res.lower()


# =====================================================================
# Case 6: Deep architecture response "build me a backend architecture"
# =====================================================================
@pytest.mark.asyncio
async def test_case_6_backend_architecture():
    """Case 6: provider.generate_chat_response("build me a backend architecture") -> returns deep architecture response."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("build me a backend architecture")
    assert "API Gateway" in res or "Gateway" in res
    assert "FastAPI" in res
    assert "PostgreSQL" in res
    assert "Redis" in res
    assert "Celery" in res or "queue" in res.lower()
    assert "Security" in res or "security" in res.lower()
    assert "```" in res, "Must contain deployment / architecture diagram"


# =====================================================================
# Case 7: Concise simple question answer "what is an API?"
# =====================================================================
@pytest.mark.asyncio
async def test_case_7_what_is_an_api():
    """Case 7: provider.generate_chat_response("what is an API?") -> returns concise simple question answer (short, factual, no full project dump)."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("what is an API?")
    lines = [line.strip() for line in res.strip().split("\n") if line.strip()]

    # Concise: 1 to 4 lines maximum
    assert len(lines) <= 4, f"Simple definition should be concise (expected <= 4 lines, got {len(lines)})"
    assert "API" in res
    assert "Application Programming Interface" in res or "protocol" in res.lower() or "interface" in res.lower()
    assert "```" not in res, "Simple question must not dump full code template"
    assert "Phase 1" not in res, "Simple question must not dump multi-phase roadmap"
    assert "Phase 5" not in res

    # Check other simple questions
    res_py = await provider.generate_chat_response("what is python")
    assert "Python" in res_py
    assert len([l for l in res_py.strip().split("\n") if l.strip()]) <= 4
    assert "```" not in res_py

    res_docker = await provider.generate_chat_response("what is docker")
    assert "Docker" in res_docker or "container" in res_docker.lower()
    assert len([l for l in res_docker.strip().split("\n") if l.strip()]) <= 4
    assert "```" not in res_docker

    res_var = await provider.generate_chat_response("what is a variable")
    assert "variable" in res_var.lower()
    assert len([l for l in res_var.strip().split("\n") if l.strip()]) <= 4
    assert "```" not in res_var


# =====================================================================
# Case 8: Router API integration tests
# =====================================================================
@pytest.mark.asyncio
async def test_router_casual_directive_and_simple_question():
    """Verify /api/v1/ai/chat handles casual directive and simple questions cleanly without unsolicited resources."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Casual directive
        res_dir = await client.post(
            "/api/v1/ai/chat",
            json={"message": "hey dont say anything just say hey back"},
        )
        assert res_dir.status_code == 200
        data_dir = res_dir.json()
        assert "Hey" in data_dir["response"]
        assert len([l for l in data_dir["response"].strip().split("\n") if l.strip()]) <= 2
        # Catalog resources must be empty
        assert data_dir["related_actions"] == []
        assert data_dir.get("suggested_next_step") is None
        # Suggestions must be conversational and not crash
        assert len(data_dir["suggestions"]) >= 2

        # Test 2: Simple definition question
        res_api = await client.post(
            "/api/v1/ai/chat",
            json={"message": "what is an API?"},
        )
        assert res_api.status_code == 200
        data_api = res_api.json()
        assert "API" in data_api["response"]
        assert "```" not in data_api["response"]
        assert data_api["related_actions"] == []
        assert data_api.get("suggested_next_step") is None

        # Test 3: Gratitude
        res_thanks = await client.post(
            "/api/v1/ai/chat",
            json={"message": "thanks"},
        )
        assert res_thanks.status_code == 200
        data_thanks = res_thanks.json()
        assert "welcome" in data_thanks["response"].lower()
        assert data_thanks["related_actions"] == []
        assert data_thanks.get("suggested_next_step") is None
