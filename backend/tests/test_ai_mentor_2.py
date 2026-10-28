"""Comprehensive test suite for AI Mentor 2.0.

Verifies:
1. get_user_progress deep context & memory retrieval (roadmaps, milestones, lessons, projects, activity, profile).
2. formulate_user_progress_context structured markdown block (### 👤 LEARNER PROFILE & MENTOR MEMORY).
3. AI Mentor 2.0 intent classification (INTENT_REVISION, INTENT_INTERVIEW_PREP, INTENT_DAILY_GOAL, INTENT_WEEKLY_PLAN, INTENT_CODE_HELP).
4. Prompt construction & Senior Software Engineer + Patient Teacher system prompt.
5. Contextual suggestions in _build_suggestions.
6. GET /api/v1/ai/mentor/context endpoint for authenticated learners and guests.
7. POST /api/v1/ai/chat incorporating deep memory and contextual intent responses.
"""

import os
import sys
import uuid
import httpx
import pytest
from sqlalchemy import select

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import create_access_token
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User
from app.services.ai.context_retriever import context_retriever
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CODE_HELP,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_INTERVIEW_PREP,
    INTENT_REVISION,
    INTENT_WEEKLY_PLAN,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    build_system_prompt,
    classify_intent,
)
from app.routers.ai import _build_suggestions


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


def test_intent_classification_ai_mentor_2():
    """Verify classification for all new AI Mentor 2.0 intents."""
    # 1. Revision
    assert classify_intent("revision") == INTENT_REVISION
    assert classify_intent("quiz me on python") == INTENT_REVISION
    assert classify_intent("review what i learned") == INTENT_REVISION
    assert classify_intent("test my knowledge") == INTENT_REVISION
    assert classify_intent("spaced repetition practice") == INTENT_REVISION

    # 2. Interview Prep
    assert classify_intent("mock interview") == INTENT_INTERVIEW_PREP
    assert classify_intent("interview prep") == INTENT_INTERVIEW_PREP
    assert classify_intent("technical questions") == INTENT_INTERVIEW_PREP
    assert classify_intent("coding interview") == INTENT_INTERVIEW_PREP
    assert classify_intent("system design interview") == INTENT_INTERVIEW_PREP

    # 3. Daily Goal
    assert classify_intent("daily goal") == INTENT_DAILY_GOAL
    assert classify_intent("today's goal") == INTENT_DAILY_GOAL
    assert classify_intent("what should i do today") == INTENT_DAILY_GOAL
    assert classify_intent("study plan today") == INTENT_DAILY_GOAL
    assert classify_intent("today") == INTENT_DAILY_GOAL

    # 4. Weekly Plan
    assert classify_intent("weekly plan") == INTENT_WEEKLY_PLAN
    assert classify_intent("this week") == INTENT_WEEKLY_PLAN
    assert classify_intent("week plan") == INTENT_WEEKLY_PLAN
    assert classify_intent("schedule for the week") == INTENT_WEEKLY_PLAN

    # 5. Code Help / Debug
    assert classify_intent("code help") == INTENT_CODE_HELP
    assert classify_intent("debug this traceback") == INTENT_CODE_HELP
    assert classify_intent("syntax error in python") == INTENT_CODE_HELP
    assert classify_intent("fix code") == INTENT_CODE_HELP
    assert classify_intent("code review my function") == INTENT_CODE_HELP
    assert classify_intent("refactor this algorithm") == INTENT_CODE_HELP

    # Equivalence between INTENT_CODE_HELP and INTENT_CODING_HELP
    assert INTENT_CODE_HELP == INTENT_CODING_HELP
    assert INTENT_CODE_HELP == "code_help"
    assert INTENT_CODE_HELP == "coding_help"


def test_ai_mentor_2_system_prompt_and_persona():
    """Verify Senior Software Engineer + Patient Teacher persona and injected mentor memory instructions."""
    prompt = TECHNEA_MENTOR_SYSTEM_PROMPT
    assert "senior software engineer and teacher combined" in prompt.lower()
    assert "never answer in a generic way when user data exists" in prompt.lower()
    assert "daily goals" in prompt.lower()
    assert "weekly plans" in prompt.lower()
    assert "revision suggestions" in prompt.lower()
    assert "interview preparation" in prompt.lower()
    assert "code help" in prompt.lower()

    # Dynamic build system prompt
    built = build_system_prompt(
        learner_level="Beginner",
        domain="web_development",
        user_name="Harsh",
        context={
            "classified_intent": INTENT_DAILY_GOAL,
            "preferred_language": "TypeScript",
            "current_milestone_title": "Full-Stack API Design",
        },
    )
    assert "CURRENT INTENT: daily goal" in built
    assert "MENTOR MEMORY ANCHOR RULE (AI MENTOR 2.0)" in built


def test_build_suggestions_ai_mentor_2():
    """Verify suggestions for all new AI Mentor 2.0 intents."""
    daily_sug = _build_suggestions("what is my plan?", "web_development", False, intent=INTENT_DAILY_GOAL)
    assert len(daily_sug) >= 3
    assert any("45-minute" in s for s in daily_sug)

    weekly_sug = _build_suggestions("show schedule", "web_development", False, intent=INTENT_WEEKLY_PLAN)
    assert len(weekly_sug) >= 3
    assert any("Monday-to-Sunday" in s for s in weekly_sug)

    rev_sug = _build_suggestions("quiz me", "web_development", False, intent=INTENT_REVISION)
    assert len(rev_sug) >= 3
    assert any("spaced repetition" in s or "Quiz me" in s for s in rev_sug)

    interview_sug = _build_suggestions("interview prep", "web_development", False, intent=INTENT_INTERVIEW_PREP)
    assert len(interview_sug) >= 3
    assert any("interview" in s.lower() for s in interview_sug)

    code_sug = _build_suggestions("help with code", "web_development", False, intent=INTENT_CODE_HELP)
    assert len(code_sug) >= 3
    assert any("review this code" in s or "unit tests" in s for s in code_sug)


async def test_get_user_progress_deep_memory():
    """Verify get_user_progress deep memory retrieval for a real user from database."""
    async with async_session_maker() as db:
        user_stmt = select(User).where(User.email == "testuser2@technea.dev")
        user = (await db.execute(user_stmt)).scalar_one_or_none()
        assert user is not None

        prog = await context_retriever.get_user_progress(db=db, user_id=user.id)

        # Basic identity & profile
        assert prog["user_id"] == str(user.id)
        assert prog["user_name"] == "Test Engineer"
        assert "learning_goal" in prog
        assert "current_skill_level" in prog
        assert "interests" in prog
        assert "bio" in prog
        assert "preferred_language" in prog
        assert "time_available" in prog

        # Active roadmaps & milestones
        assert len(prog["active_roadmaps"]) >= 1
        active_rm = prog["active_roadmaps"][0]
        assert "Devops Engineer Roadmap" in active_rm["title"] or "DevOps" in active_rm["title"]
        assert "target_role" in active_rm
        assert "goal" in active_rm
        assert "experience_level" in active_rm
        assert "estimated_duration" in active_rm
        assert "progress_percent" in active_rm
        assert "current_milestone" in active_rm
        assert "completed_milestones" in active_rm
        assert "upcoming_milestone" in active_rm

        # Completed lessons
        assert "completed_lessons_count" in prog
        assert isinstance(prog["completed_lessons_count"], int)
        assert "recent_completed_lessons" in prog
        assert isinstance(prog["recent_completed_lessons"], list)

        # Projects
        assert "user_projects" in prog
        assert isinstance(prog["user_projects"], list)

        # Recent activity
        assert "recent_activity" in prog
        act = prog["recent_activity"]
        assert "streak" in act
        assert "total_study_minutes" in act
        assert "completed_goals_count" in act

        # Markdown formulation
        md = context_retriever.formulate_user_progress_context(prog)
        assert "### 👤 LEARNER PROFILE & MENTOR MEMORY" in md
        assert "Learner Profile & Standing" in md
        assert "Preferred Language" in md
        assert "Active Roadmap & Milestone Trajectory" in md


async def test_mentor_context_api_endpoint():
    """Verify GET /api/v1/ai/mentor/context for authenticated user and guest."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Guest request
        guest_res = await client.get("/api/v1/ai/mentor/context")
        assert guest_res.status_code == 200
        guest_data = guest_res.json()
        assert guest_data["authenticated"] is False
        assert guest_data["sync_status"] == "guest"
        assert "preferred_language" in guest_data

        # Also test direct /ai/mentor/context
        direct_res = await client.get("/ai/mentor/context")
        assert direct_res.status_code == 200
        assert direct_res.json()["sync_status"] == "guest"

        # 2. Authenticated request for testuser2@technea.dev
        async with async_session_maker() as db:
            user_stmt = select(User).where(User.email == "testuser2@technea.dev")
            db_user = (await db.execute(user_stmt)).scalar_one()

        token = create_access_token(subject=str(db_user.id))
        headers = {"Authorization": f"Bearer {token}"}

        auth_res = await client.get("/api/v1/ai/mentor/context", headers=headers)
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        assert auth_data["authenticated"] is True
        assert auth_data["sync_status"] == "synced"
        assert auth_data["user_name"] == "Test Engineer"
        assert "active_roadmap" in auth_data
        assert auth_data["active_roadmap"] is not None
        assert "preferred_language" in auth_data
        assert "recent_activity" in auth_data
        assert "synced_at" in auth_data


async def test_chat_ai_mentor_2_intents():
    """Verify chat responses and follow-up suggestions for AI Mentor 2.0 intents."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        async with async_session_maker() as db:
            user_stmt = select(User).where(User.email == "testuser2@technea.dev")
            db_user = (await db.execute(user_stmt)).scalar_one()

        token = create_access_token(subject=str(db_user.id))
        headers = {"Authorization": f"Bearer {token}"}

        # Daily goal inquiry
        res_daily = await client.post(
            "/api/v1/ai/chat",
            json={"message": "What should I do today for my roadmap?"},
            headers=headers,
        )
        assert res_daily.status_code == 200
        data_daily = res_daily.json()
        assert len(data_daily["response"]) > 0
        assert len(data_daily["suggestions"]) >= 3
        assert any("45" in s or "block" in s.lower() or "today" in s.lower() for s in data_daily["suggestions"])

        # Weekly plan inquiry
        res_weekly = await client.post(
            "/api/v1/ai/chat",
            json={"message": "Can you give me a weekly plan for this week?"},
            headers=headers,
        )
        assert res_weekly.status_code == 200
        data_weekly = res_weekly.json()
        assert len(data_weekly["response"]) > 0
        assert any("monday" in data_weekly["response"].lower() or "week" in data_weekly["response"].lower() for _ in [1])

        # Revision inquiry
        res_rev = await client.post(
            "/api/v1/ai/chat",
            json={"message": "Quiz me on what I learned so far"},
            headers=headers,
        )
        assert res_rev.status_code == 200
        data_rev = res_rev.json()
        assert len(data_rev["response"]) > 0
