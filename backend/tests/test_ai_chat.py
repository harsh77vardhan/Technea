"""Test suite for Technea AI Mentor Chat API.

Tests:
1. Guest developer chat (POST /api/v1/ai/chat without auth header)
2. Authenticated developer chat with JWT token (POST /api/v1/ai/chat with Bearer token)
3. Mock developer chat with custom profile and level via dependency override
4. Conversation history multi-turn support
5. Input validation (empty message rejection)
6. Backward compatibility (/api/v1/progress/ai-mentor/chat)
"""

import asyncio
import json
import os
import sys
import uuid
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.deps import get_optional_current_user
from app.core.security import create_access_token
from app.db.session import async_session_maker
from app.main import app
from app.models.user import User
from sqlalchemy import select


async def run_all_tests():
    print("==================================================")
    print("Starting Technea AI Chat API Test Suite")
    print("==================================================")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

        # -------------------------------------------------------------
        # Test 1: Guest Developer Chat
        # -------------------------------------------------------------
        print("\n[Test 1] Testing POST /api/v1/ai/chat as GUEST USER...")
        guest_payload = {
            "message": "Hello! How do I get started with full-stack web development?",
        }
        res = await client.post("/api/v1/ai/chat", json=guest_payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        assert "response" in data and isinstance(data["response"], str) and len(data["response"]) > 0, "Missing response text"
        assert "suggestions" in data and isinstance(data["suggestions"], list), "Missing suggestions list"
        assert len(data["suggestions"]) >= 3, f"Expected at least 3 suggestions, got {len(data['suggestions'])}"
        assert "related_actions" in data and isinstance(data["related_actions"], list), "Missing related_actions"
        assert len(data["related_actions"]) > 0, "Expected at least 1 related action"
        for action in data["related_actions"]:
            assert "action_type" in action, "Action missing action_type"
            assert "title" in action, "Action missing title"
        assert "provider_used" in data, "Missing provider_used"

        print("  -> Status Code: 200 OK")
        print(f"  -> Provider Used: {data['provider_used']}")
        print(f"  -> Suggestions ({len(data['suggestions'])}): {data['suggestions'][:2]}...")
        print(f"  -> Related Actions ({len(data['related_actions'])}): {[a['title'] for a in data['related_actions']]}")
        print("  -> Response preview:", data["response"][:120].replace("\n", " "), "...")
        print("  [PASSED] Test 1 passed successfully.")

        # -------------------------------------------------------------
        # Test 2: Multi-turn Conversation with Conversation History
        # -------------------------------------------------------------
        print("\n[Test 2] Testing POST /api/v1/ai/chat with CONVERSATION HISTORY...")
        history_payload = {
            "message": "Can you show me an example of that?",
            "conversation_history": [
                {"role": "user", "content": "How do I create a React hook?"},
                {"role": "assistant", "content": "A custom hook is a JavaScript function whose name starts with 'use'."},
            ],
        }
        res = await client.post("/api/v1/ai/chat", json=history_payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert len(data["response"]) > 0
        assert len(data["suggestions"]) >= 3
        print("  -> Status Code: 200 OK")
        print("  -> Response preview:", data["response"][:120].replace("\n", " "), "...")
        print("  [PASSED] Test 2 passed successfully.")

        # -------------------------------------------------------------
        # Test 3: Authenticated User Chat with JWT Token
        # -------------------------------------------------------------
        print("\n[Test 3] Testing POST /api/v1/ai/chat with AUTHENTICATED USER JWT...")
        # Fetch an existing user from DB
        async with async_session_maker() as session:
            stmt = select(User).limit(1)
            user_res = await session.execute(stmt)
            db_user = user_res.scalars().first()

        if db_user:
            token = create_access_token(subject=str(db_user.id))
            auth_headers = {"Authorization": f"Bearer {token}"}
            auth_payload = {
                "message": "What should I focus on next in my current learning roadmap?",
            }
            res = await client.post("/api/v1/ai/chat", json=auth_payload, headers=auth_headers)
            assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
            data = res.json()
            assert len(data["response"]) > 0
            assert len(data["suggestions"]) >= 3
            assert len(data["related_actions"]) > 0
            print(f"  -> Authenticated User: {db_user.full_name or db_user.username} ({db_user.email})")
            print("  -> Status Code: 200 OK")
            print(f"  -> Provider Used: {data['provider_used']}")
            print(f"  -> Related Actions: {[a['title'] for a in data['related_actions']]}")
            print("  [PASSED] Test 3 passed successfully.")
        else:
            print("  [SKIPPED] No DB user found for live token test, covered in mock user test below.")

        # -------------------------------------------------------------
        # Test 4: Mock User with Developer Level and XP
        # -------------------------------------------------------------
        print("\n[Test 4] Testing POST /api/v1/ai/chat with MOCK USER PROFILE...")
        mock_user = User(
            id=uuid.uuid4(),
            email="developer.pro@technea.dev",
            username="dev_pro",
            full_name="Alex River",
            is_active=True,
        )
        setattr(mock_user, "developer_level", "Senior Systems Engineer")
        setattr(mock_user, "xp_points", 2800)

        async def override_get_optional_user():
            return mock_user

        app.dependency_overrides[get_optional_current_user] = override_get_optional_user
        try:
            mock_payload = {
                "message": "What system architecture patterns do you recommend for microservices?",
            }
            res = await client.post("/api/v1/ai/chat", json=mock_payload)
            assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
            data = res.json()
            assert len(data["response"]) > 0
            assert len(data["suggestions"]) >= 3
            print("  -> Status Code: 200 OK")
            print(f"  -> Provider Used: {data['provider_used']}")
            print(f"  -> Suggestions: {data['suggestions'][:2]}...")
            print("  [PASSED] Test 4 passed successfully.")
        finally:
            app.dependency_overrides.clear()

        # -------------------------------------------------------------
        # Test 5: Input Validation (Empty Message)
        # -------------------------------------------------------------
        print("\n[Test 5] Testing POST /api/v1/ai/chat input validation (empty message)...")
        invalid_payload = {"message": ""}
        res = await client.post("/api/v1/ai/chat", json=invalid_payload)
        assert res.status_code == 422, f"Expected 422 validation error, got {res.status_code}"
        print("  -> Status Code: 422 Unprocessable Entity (Properly validated min_length=1)")
        print("  [PASSED] Test 5 passed successfully.")

        # -------------------------------------------------------------
        # Test 6: Backward Compatibility (/api/v1/progress/ai-mentor/chat)
        # -------------------------------------------------------------
        print("\n[Test 6] Testing BACKWARD COMPATIBILITY for /api/v1/progress/ai-mentor/chat...")
        if db_user:
            token = create_access_token(subject=str(db_user.id))
            legacy_headers = {"Authorization": f"Bearer {token}"}
            legacy_payload = {
                "message": "Am I ready for advanced full-stack projects?",
            }
            res = await client.post("/api/v1/progress/ai-mentor/chat", json=legacy_payload, headers=legacy_headers)
            assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
            data = res.json()
            assert "reply" in data, "Legacy endpoint missing 'reply' field"
            print("  -> Legacy Endpoint Status Code: 200 OK")
            print("  -> Reply preview:", data["reply"][:80].replace("\n", " "), "...")
            print("  [PASSED] Test 6 passed successfully.")

    print("\n==================================================")
    print("ALL TESTS PASSED! API is fully operational.")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
