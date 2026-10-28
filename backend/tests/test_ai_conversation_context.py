"""Comprehensive automated test suite for Technea AI Mentor conversation context & intent routing.

Verifies:
1. Test 1: User: 'hey' -> 'Hey 👋'
2. Test 2: User: 'what day is today?' -> 'Today is {weekday}.'
3. Test 3: User: 'okay what's the day today?' -> 'Today is {weekday}.'
4. Test 4: User: 'what time is it?' -> Current server time
5. Test 5: User: 'teach me React hooks' -> Educational explanation
6. Test 6: User: 'review my code' -> Senior code review guidance
7. Multi-turn conversation flow: Latest user message is ALWAYS answered without being overridden by previous turns.
8. Server date/time injection: current date, weekday, year, and timezone in system prompt.
9. Full intent routing across Greetings, Time/Date, Simple questions, Learning, Coding, and Career.
"""

from datetime import datetime
import os
import sys
import httpx
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.ai.ai_service import RuleBasedProvider
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODING_ARCHITECTURE,
    INTENT_GREETING,
    INTENT_LEARNING_QUESTION,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    build_system_prompt,
    classify_intent,
)


@pytest.fixture
def current_weekday() -> str:
    return datetime.now().astimezone().strftime("%A")


@pytest.fixture
def current_year() -> str:
    return datetime.now().astimezone().strftime("%Y")


# =====================================================================
# Test 1: Short greeting
# =====================================================================
@pytest.mark.asyncio
async def test_case_1_greeting():
    """Test 1: User says 'hey' -> returns 'Hey 👋' (or 'Hey {Name} 👋')."""
    provider = RuleBasedProvider()

    # Anonymous / guest
    res_guest = await provider.generate_chat_response("hey")
    assert "Hey 👋" in res_guest
    assert len([l for l in res_guest.strip().split("\n") if l.strip()]) <= 2

    # Authenticated user
    res_user = await provider.generate_chat_response("hey", context={"user_name": "Harsh"})
    assert "Hey Harsh! 👋" in res_user


# =====================================================================
# Test 2: Direct day question
# =====================================================================
@pytest.mark.asyncio
async def test_case_2_what_day_is_today(current_weekday: str):
    """Test 2: User says 'what day is today?' -> returns 'Today is {weekday}.'"""
    provider = RuleBasedProvider()
    res = await provider.generate_chat_response("what day is today?")
    assert f"Today is {current_weekday}." in res


# =====================================================================
# Test 3: Filler-prefixed day question ("okay what's the day today?")
# =====================================================================
@pytest.mark.asyncio
async def test_case_3_filler_prefixed_day_question(current_weekday: str):
    """Test 3: User says 'okay what's the day today?' -> returns 'Today is {weekday}.'"""
    provider = RuleBasedProvider()
    res = await provider.generate_chat_response("okay what's the day today?")
    assert f"Today is {current_weekday}." in res

    # Additional conversational filler variants
    res_ok = await provider.generate_chat_response("ok what day is it today?")
    assert f"Today is {current_weekday}." in res_ok

    res_so = await provider.generate_chat_response("so tell me what's the day today")
    assert f"Today is {current_weekday}." in res_so

    res_alright = await provider.generate_chat_response("alright, which day is today?")
    assert f"Today is {current_weekday}." in res_alright


# =====================================================================
# Test 4: Current time question
# =====================================================================
@pytest.mark.asyncio
async def test_case_4_what_time_is_it():
    """Test 4: User says 'what time is it?' -> returns current server time."""
    provider = RuleBasedProvider()
    res = await provider.generate_chat_response("what time is it?")
    assert "server time" in res.lower()
    # Check that it contains AM or PM
    assert any(indicator in res for indicator in ["AM", "PM", "UTC", "IST", "GMT"])


# =====================================================================
# Test 5: Educational explanation ("teach me React hooks")
# =====================================================================
@pytest.mark.asyncio
async def test_case_5_teach_me_react_hooks():
    """Test 5: User says 'teach me React hooks' -> returns educational explanation."""
    provider = RuleBasedProvider()
    res = await provider.generate_chat_response("teach me React hooks")
    assert "react hooks" in res.lower()
    assert "usestate" in res.lower() or "useeffect" in res.lower()
    assert "```" in res, "Must include working code example"


# =====================================================================
# Test 6: Senior Code Review Guidance ("review my code")
# =====================================================================
@pytest.mark.asyncio
async def test_case_6_review_my_code():
    """Test 6: User says 'review my code' -> returns code review guidance."""
    provider = RuleBasedProvider()
    res = await provider.generate_chat_response("review my code")
    assert "code review" in res.lower()
    assert "complexity" in res.lower() or "correctness" in res.lower()
    assert "edge cases" in res.lower()
    assert "paste your code" in res.lower() or "share your code" in res.lower()


# =====================================================================
# Test 7: Multi-turn flow where user switches from directive to question
# =====================================================================
@pytest.mark.asyncio
async def test_multi_turn_latest_message_priority(current_weekday: str):
    """Multi-turn test: Turn 1 is greeting constraint, Turn 2 is day question.

    Ensures the mentor ALWAYS answers the latest user message without
    continuing or repeating the previous response.
    """
    provider = RuleBasedProvider()

    history = [
        {"role": "user", "content": "hey, just say hey back"},
        {"role": "assistant", "content": "Hey back! 👋"},
    ]

    res = await provider.generate_chat_response(
        prompt="okay what's the day today?",
        conversation_history=history,
    )

    assert f"Today is {current_weekday}." in res
    assert "Hey back! 👋" not in res
    assert "Building directly upon our previous action plan" not in res


# =====================================================================
# Test 8: Full API route verification
# =====================================================================
@pytest.mark.asyncio
async def test_api_route_conversation_context(current_weekday: str):
    """Verify POST /api/v1/ai/chat with conversation history and time/date question."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message": "okay what's the day today?",
            "conversation_history": [
                {"role": "user", "content": "hey, just say hey back"},
                {"role": "assistant", "content": "Hey back! 👋"},
            ],
        }
        res = await client.post("/api/v1/ai/chat", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert f"Today is {current_weekday}." in data["response"]
        assert data["related_actions"] == []
        assert data.get("suggested_next_step") is None
        assert len(data["suggestions"]) >= 2


# =====================================================================
# Test 9: System prompt real-time date/time & flow rules injection
# =====================================================================
def test_system_prompt_datetime_injection(current_weekday: str, current_year: str):
    """Verify build_system_prompt injects server date/time and conversation flow rules."""
    prompt = build_system_prompt()

    assert "CURRENT SERVER DATE & TIME:" in prompt
    assert current_weekday in prompt
    assert current_year in prompt
    assert "CONVERSATION CONTEXT & FLOW RULES:" in prompt
    assert "You must ALWAYS answer the latest user message directly" in prompt
    assert "Never continue the previous assistant response" in prompt


# =====================================================================
# Test 10: Intent classification coverage
# =====================================================================
def test_intent_classification_routing():
    """Verify all 6 categories are correctly classified."""
    # Greetings
    assert classify_intent("hey") == INTENT_GREETING
    assert classify_intent("hey, just say hey back") == INTENT_GREETING

    # Time/Date questions
    assert classify_intent("what day is today?") == INTENT_TIME_DATE
    assert classify_intent("okay what's the day today?") == INTENT_TIME_DATE
    assert classify_intent("what time is it?") == INTENT_TIME_DATE
    assert classify_intent("what is today's date?") == INTENT_TIME_DATE
    assert classify_intent("what year is this?") == INTENT_TIME_DATE

    # Simple questions
    assert classify_intent("what is an API?") == INTENT_SIMPLE_QUESTION
    assert classify_intent("what is Docker?") == INTENT_SIMPLE_QUESTION

    # Learning questions
    assert classify_intent("how do I learn Python?") in {INTENT_LEARNING_QUESTION, "learning_advice"}

    # Coding questions
    assert classify_intent("teach me React hooks") in {INTENT_CODE_HELP, INTENT_CODING_ARCHITECTURE}
    assert classify_intent("review my code") == INTENT_CODE_HELP

    # Career questions
    assert classify_intent("how to prepare for technical interviews") == INTENT_CAREER_ADVICE
