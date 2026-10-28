"""End-to-End Test Suite for Technea AI Mentor 2.0 Redesign.

Verifies all critical fixes and architectural capabilities requested:
1. Greetings fast path (Zero token waste)
2. Date queries ("what is today's date?", "today's date")
3. Single-word follow-up ("date?") resolution
4. Time queries ("time", "what time is it?")
5. Resource search for "python playlist" (Technea courses + trusted public resources, NO roadmap/architecture dump)
6. Roadmap planning queries
7. Quiz generation strictly anchored to current milestone ("Object-Oriented Design Patterns")
8. Project recommendations strictly anchored to current milestone (NO Blender / Business Analytics)
9. Multi-turn conversation memory and user corrections
10. Context persistence through `/api/v1/ai/chat` endpoint
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.ai.ai_service import ai_service, RuleBasedProvider
from app.services.ai.memory_engine import memory_engine
from app.services.ai.prompts import (
    INTENT_GREETING,
    INTENT_TIME_DATE,
    INTENT_RESOURCE_SEARCH,
    INTENT_QUIZ,
    INTENT_ROADMAP_PLANNING,
    INTENT_PROJECT_RECOMMENDATION,
    classify_intent,
)
from app.services.ai.recommendation_engine import recommendation_engine
from app.services.ai.special_router import special_router
from app.services.ai.trusted_resources import get_trusted_resources_for_topic


@pytest.mark.asyncio
async def test_special_router_greetings():
    """Verify greetings are handled cleanly by special router without token waste."""
    assert special_router.can_handle(INTENT_GREETING, "hi") is True
    assert special_router.can_handle(INTENT_GREETING, "hello") is True
    assert special_router.can_handle(INTENT_GREETING, "hey") is True

    res = await special_router.route(INTENT_GREETING, "hey", context={"user_name": "Harsh"})
    assert "Hey Harsh" in res or "Harsh" in res
    assert len(res.splitlines()) <= 4  # Short, non-bloated response


@pytest.mark.asyncio
async def test_date_and_time_queries():
    """Verify date and time queries resolve accurately in real-time."""
    intent_date = classify_intent("what is today's date?")
    assert intent_date == INTENT_TIME_DATE
    assert special_router.can_handle(intent_date, "what is today's date?") is True
    date_res = await special_router.route(intent_date, "what is today's date?")
    assert "Today is" in date_res

    intent_time = classify_intent("what time is it?")
    assert intent_time == INTENT_TIME_DATE
    assert special_router.can_handle(intent_time, "what time is it?") is True
    time_res = await special_router.route(intent_time, "what time is it?")
    assert "The current server time is" in time_res


@pytest.mark.asyncio
async def test_date_single_word_followup_bug_fix():
    """Verify bug fix: 'date?' was previously ignored or classified as casual.

    Now it must classify as INTENT_TIME_DATE and return the actual date.
    """
    intent = classify_intent("date?")
    assert intent == INTENT_TIME_DATE

    history = [
        {"role": "user", "content": "what is today's date?"},
        {"role": "assistant", "content": "Today is Wednesday."},
    ]
    state = memory_engine.analyze(history, "date?")
    assert state.resolved_intent == INTENT_TIME_DATE

    # AIService generates date response
    response, provider = await ai_service.generate_chat_response(
        prompt="date?",
        conversation_history=history,
        return_metadata=True,
    )
    assert provider == "special_router"
    assert "Today is" in response


@pytest.mark.asyncio
async def test_python_playlist_resource_search():
    """Verify bug fix: Asking for Python playlist returns resources, NOT a roadmap or architecture dump."""
    intent = classify_intent("python playlist")
    assert intent == INTENT_RESOURCE_SEARCH

    response = await ai_service.generate_chat_response(
        prompt="python playlist",
        context={"learning_goal": "Python Mastery", "preferred_language": "Python"},
    )

    # Must contain trusted recommendations
    assert any(
        src in response
        for src in ["Corey Schafer", "freeCodeCamp", "Tech With Tim", "CS50", "docs.python.org", "Python"]
    )
    # Must NOT contain architecture templates
    assert "Separation of Concerns" not in response
    assert "Idempotency" not in response


@pytest.mark.asyncio
async def test_roadmap_planning():
    """Verify roadmap planning intent and structured response."""
    intent = classify_intent("give me a roadmap for python backend")
    assert intent == INTENT_ROADMAP_PLANNING

    response = await ai_service.generate_chat_response(
        prompt="give me a roadmap for python backend",
        context={"preferred_language": "Python", "level": "Intermediate"},
    )
    assert "Phase" in response or "Milestone" in response or "Roadmap" in response


@pytest.mark.asyncio
async def test_quiz_generation_anchored_to_current_milestone():
    """Verify bug fix: Quiz generation must ONLY use current milestone, NOT generic questions."""
    intent = classify_intent("quiz me on my current milestone")
    assert intent == INTENT_QUIZ

    context = {
        "current_milestone": "Object-Oriented Design Patterns",
        "current_milestone_title": "Object-Oriented Design Patterns",
        "current_milestone_description": "Factory, Singleton, Strategy, and SOLID principles in production.",
        "preferred_language": "Python",
        "level": "Intermediate",
    }

    response = await ai_service.generate_chat_response(
        prompt="quiz me on my current milestone",
        context=context,
    )

    # Must be anchored to Object-Oriented Design Patterns
    assert any(
        kw.lower() in response.lower()
        for kw in ["design pattern", "object-oriented", "singleton", "factory", "strategy", "solid", "oop", "polymorphism"]
    )
    # Must have question formatting
    assert "Question 1" in response or "1." in response or "Q1" in response
    assert "A)" in response or "A." in response or "[A]" in response


@pytest.mark.asyncio
async def test_recommendations_never_random():
    """Verify bug fix: Current milestone 'Object-Oriented Design Patterns' NEVER recommends Blender or Business Analytics."""
    context = {
        "domain": "backend",
        "preferred_language": "Python",
        "active_roadmaps": ["Python Backend Engineer"],
        "current_milestone": "Object-Oriented Design Patterns",
        "current_milestone_title": "Object-Oriented Design Patterns",
        "learning_goal": "Master Python & Backend Architecture",
    }

    recs = recommendation_engine.get_recommendations(context, query="recommend next steps")
    related_actions = recs.get("related_actions", [])

    titles = [a.get("title", "") for a in related_actions]

    # Strictly forbidden orthogonal topics
    for forbidden in ["Blender", "3D Modeling", "Business Analytics", "Accounting", "Cloud Security"]:
        for t in titles:
            assert forbidden.lower() not in t.lower(), f"Random recommendation '{forbidden}' found in '{t}'"


@pytest.mark.asyncio
async def test_conversation_memory_user_corrections():
    """Verify conversation memory tracks user corrections across turns."""
    history = [
        {"role": "user", "content": "I want to build an API"},
        {"role": "assistant", "content": "Great! We can use Express.js and Node."},
        {"role": "user", "content": "No, I am using Python and FastAPI, not JavaScript"},
        {"role": "assistant", "content": "Understood! FastAPI with Python is an excellent modern choice."},
    ]

    state = memory_engine.analyze(history, "sounds good")
    assert state.user_corrections.get("preferred_language") == "Python"
    assert state.user_corrections.get("framework") == "FastAPI"
    assert "javascript" in state.user_corrections.get("avoid_framework", "").lower()


@pytest.mark.asyncio
async def test_api_chat_endpoint_e2e():
    """Full HTTP API test through FastAPI /api/v1/ai/chat."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Case 1: Date query
        r1 = await ac.post("/api/v1/ai/chat", json={"message": "what is today's date?"})
        assert r1.status_code == 200
        data1 = r1.json()
        assert "Today is" in data1["response"]
        assert data1["provider_used"] in ["special_router", "rule_based"]

        # Case 2: Date follow-up ("date?")
        r2 = await ac.post(
            "/api/v1/ai/chat",
            json={
                "message": "date?",
                "conversation_history": [
                    {"role": "user", "content": "what is today's date?"},
                    {"role": "assistant", "content": "Today is Wednesday."},
                ],
            },
        )
        assert r2.status_code == 200
        data2 = r2.json()
        assert "Today is" in data2["response"]

        # Case 3: Python playlist
        r3 = await ac.post("/api/v1/ai/chat", json={"message": "python playlist"})
        assert r3.status_code == 200
        data3 = r3.json()
        assert any(
            src.lower() in data3["response"].lower()
            for src in ["corey schafer", "freecodecamp", "tech with tim", "cs50", "python"]
        )
