"""Test suite for Technea AI Context Retriever and Catalog Integration.

Tests:
1. Catalog retrieval for queries: "full stack", "python", "machine learning", "react", "backend".
2. User-specific progress context retrieval with a real user from DB (testuser2@technea.dev).
3. POST /api/v1/ai/chat returns responses with Technea catalog references and valid related_actions.
"""

import asyncio
import logging
import os
import sys
import uuid
import httpx
from sqlalchemy import select

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.core.security import create_access_token
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User
from app.services.ai.context_retriever import context_retriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_context_retriever")


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


async def test_catalog_retrieval_queries():
    """Test 1: Verify catalog retrieval against database for standard tech queries."""
    print("\n[Test 1] Testing Catalog Retrieval across Core Tech Domains...")

    test_queries = [
        ("full stack", ["full stack", "web development"]),
        ("python", ["python"]),
        ("machine learning", ["machine learning"]),
        ("react", ["react"]),
        ("backend", ["backend"]),
    ]

    async with async_session_maker() as db:
        for query_text, expected_kws in test_queries:
            print(f"\n  --> Evaluating query: '{query_text}'")
            ctx = await context_retriever.retrieve_context(db=db, query=query_text)

            # Keyword validation
            keywords = ctx["keywords"]
            assert len(keywords) > 0, f"Expected keywords for '{query_text}', got none"
            print(f"      Extracted keywords: {keywords}")

            # Skills validation
            skills = ctx["skills"]
            assert len(skills) > 0, f"Expected matching skills for '{query_text}'"
            print(f"      Matched skills ({len(skills)}): {[s['name'] for s in skills]}")

            # Learning paths validation
            paths = ctx["learning_paths"]
            assert len(paths) > 0, f"Expected matching learning paths for '{query_text}'"
            for p in paths:
                assert "slug" in p and len(p["slug"]) > 0, "Learning path missing slug"
                assert "title" in p and len(p["title"]) > 0, "Learning path missing title"
                assert "level" in p, "Learning path missing level"
                assert "step_count" in p and isinstance(p["step_count"], int), "Learning path missing step_count"
            print(f"      Matched paths ({len(paths)}): {[p['title'] for p in paths]}")

            # Courses validation
            courses = ctx["courses"]
            assert len(courses) > 0, f"Expected matching courses for '{query_text}'"
            print(f"      Matched courses ({len(courses)}): {[c['title'] for c in courses[:2]]}...")

            # Projects validation
            projects = ctx["projects"]
            assert len(projects) > 0, f"Expected matching projects for '{query_text}'"
            for pr in projects:
                assert "title" in pr and len(pr["title"]) > 0
                assert "difficulty" in pr
                assert "tech_stack" in pr and isinstance(pr["tech_stack"], list)
            print(f"      Matched projects ({len(projects)}): {[pr['title'] for pr in projects]}")

            # Formatted context block validation
            catalog_context = ctx["catalog_context"]
            assert "TECHNEA_CATALOG_CONTEXT" in catalog_context
            assert "Learning Paths" in catalog_context
            assert "Skills" in catalog_context
            assert "Projects" in catalog_context

            # Related actions validation
            actions = ctx["related_actions"]
            assert len(actions) >= 1, "Expected at least 1 related action"
            for act in actions:
                assert "action_type" in act and len(act["action_type"]) > 0
                assert "title" in act and len(act["title"]) > 0
                assert "payload" in act and isinstance(act["payload"], dict)
            print(f"      Related actions: {[a['title'] for a in actions]}")

            # Suggestions validation
            suggestions = ctx["suggestions"]
            assert len(suggestions) >= 3, f"Expected at least 3 suggestions, got {len(suggestions)}"
            print(f"      Suggestions: {suggestions[:2]}...")

    print("\n  [PASSED] Test 1 passed successfully: all 5 domains verified against real DB records.")


async def test_user_context_retrieval():
    """Test 2: Verify user-specific progress retrieval for testuser2@technea.dev."""
    print("\n[Test 2] Testing User-Specific Progress Retrieval for testuser2@technea.dev...")

    async with async_session_maker() as db:
        user_stmt = select(User).where(User.email == "testuser2@technea.dev")
        user = (await db.execute(user_stmt)).scalar_one_or_none()

        assert user is not None, "Real DB user 'testuser2@technea.dev' not found in database!"
        print(f"  -> Found user: {user.full_name} ({user.email}), ID: {user.id}")

        ctx = await context_retriever.retrieve_context(
            db=db,
            query="What milestone should I focus on next?",
            user_id=user.id,
        )

        user_prog = ctx["user_progress"]
        assert user_prog is not None, "user_progress should not be None for authenticated user"
        assert user_prog["user_name"] == "Test Engineer"
        assert user_prog["developer_level"] is not None
        assert user_prog["xp_points"] >= 0
        assert user_prog["streak"] >= 0

        print(f"  -> Standing: Level={user_prog['developer_level']}, XP={user_prog['xp_points']}, Streak={user_prog['streak']} days")

        # Active roadmaps check
        active_roadmaps = user_prog["active_roadmaps"]
        assert len(active_roadmaps) >= 1, "Expected at least 1 active roadmap for testuser2"
        first_roadmap = active_roadmaps[0]
        assert "Devops Engineer Roadmap" in first_roadmap["title"] or "DevOps" in first_roadmap["title"]
        assert first_roadmap["goal"] == "I want to become a DevOps Engineer"
        assert first_roadmap["total_steps"] == 8
        assert first_roadmap["current_step"] >= 1
        assert len(first_roadmap["milestones"]) == 8

        print(f"  -> Active Roadmap: '{first_roadmap['title']}'")
        print(f"     Goal: '{first_roadmap['goal']}'")
        print(f"     Step: {first_roadmap['current_step']} of {first_roadmap['total_steps']}")
        print(f"     Milestones Loaded: {len(first_roadmap['milestones'])}")

        # Related actions check: user's active roadmap should be surfaced
        actions = ctx["related_actions"]
        action_titles = [a["title"] for a in actions]
        assert any("Devops Engineer Roadmap" in t or "DevOps" in t for t in action_titles), (
            f"Active roadmap should be present in related_actions: {action_titles}"
        )
        print(f"  -> Action Deep Links: {action_titles}")

        # Suggestions check: should prompt about active roadmap
        suggestions = ctx["suggestions"]
        assert any("Devops Engineer Roadmap" in s or "roadmap" in s.lower() for s in suggestions), (
            f"Suggestions should reference active roadmap: {suggestions}"
        )
        print(f"  -> Tailored Suggestions: {suggestions[:2]}")

        # Catalog context markdown check
        catalog_md = ctx["catalog_context"]
        assert "Learner Profile & Standing" in catalog_md
        assert "Devops Engineer Roadmap" in catalog_md

    print("\n  [PASSED] Test 2 passed successfully: real DB user progress and roadmaps verified.")


async def test_chat_endpoint_catalog_integration():
    """Test 3: Verify POST /api/v1/ai/chat returns responses with Technea catalog references and valid related_actions."""
    print("\n[Test 3] Testing POST /api/v1/ai/chat with Real Catalog References & Actions...")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

        # 3A: Guest query on full stack
        print("\n  [3A] Testing Guest Inquiry: 'How do I learn full stack development?'...")
        guest_payload = {"message": "How do I learn full stack development with modern tools?"}
        res = await client.post("/api/v1/ai/chat", json=guest_payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        assert len(data["response"]) > 0
        assert len(data["suggestions"]) >= 3
        assert len(data["related_actions"]) >= 1

        action_titles = [a["title"] for a in data["related_actions"]]
        print(f"      Provider Used: {data['provider_used']}")
        print(f"      Related Actions: {action_titles}")
        print(f"      Suggestions: {data['suggestions'][:2]}...")
        assert any("Full Stack" in t or "Web Development" in t for t in action_titles), (
            f"Expected full-stack catalog item in actions: {action_titles}"
        )

        # 3B: Authenticated query for testuser2
        print("\n  [3B] Testing Authenticated Inquiry for testuser2@technea.dev...")
        async with async_session_maker() as session:
            user_stmt = select(User).where(User.email == "testuser2@technea.dev")
            db_user = (await session.execute(user_stmt)).scalar_one()

        token = create_access_token(subject=str(db_user.id))
        headers = {"Authorization": f"Bearer {token}"}
        auth_payload = {"message": "What should I focus on next in my learning path?"}

        res = await client.post("/api/v1/ai/chat", json=auth_payload, headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        auth_data = res.json()

        assert len(auth_data["response"]) > 0
        assert len(auth_data["suggestions"]) >= 3
        assert len(auth_data["related_actions"]) >= 1

        auth_action_titles = [a["title"] for a in auth_data["related_actions"]]
        print(f"      Authenticated User: {db_user.full_name}")
        print(f"      Related Actions: {auth_action_titles}")
        print(f"      Suggestions: {auth_data['suggestions'][:2]}")
        print(f"      Response preview: {auth_data['response'][:150].replace(chr(10), ' ')}...")

        # Must have active roadmap action
        assert any("Devops Engineer Roadmap" in t or "DevOps" in t for t in auth_action_titles), (
            f"Expected Devops Engineer Roadmap in authenticated user actions, got: {auth_action_titles}"
        )

        # Response should reference catalog or active roadmap
        assert "Devops Engineer Roadmap" in auth_data["response"] or "Technea" in auth_data["response"], (
            "Response should reference user's roadmap or Technea catalog"
        )

    print("\n  [PASSED] Test 3 passed successfully: POST /api/v1/ai/chat deeply integrates database catalog and user progress.")


async def run_all_tests():
    print("==================================================")
    print("Starting Technea AI Database Context Integration Test Suite")
    print("==================================================")

    await test_catalog_retrieval_queries()
    await test_user_context_retrieval()
    await test_chat_endpoint_catalog_integration()

    print("\n==================================================")
    print("ALL TESTS PASSED! Context Retriever & Database Integration Verified!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
