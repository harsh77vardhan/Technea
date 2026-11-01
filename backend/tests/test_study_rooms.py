"""Integration tests for Technea Study Rooms MVP."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.security import create_access_token
from app.db.init_db import run_study_rooms_schema_migrations
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await run_study_rooms_schema_migrations(engine)
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_study_rooms_lifecycle():
    """Test full Study Rooms lifecycle: discovery, creation, code join, chat, Q&A, resources, and study sessions."""
    # Create test user
    test_email = f"study_user_{uuid.uuid4().hex[:8]}@technea.dev"
    async with async_session_maker() as session:
        user = User(
            email=test_email,
            hashed_password="hashed_pw_test",
            full_name="Study Test User",
            username=f"studyuser_{uuid.uuid4().hex[:6]}",
            profile_completed=True,
            is_active=True,
            learning_goal="Master Python Development",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id

    token = create_access_token(subject=str(user_id))
    auth_headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. List rooms
        res = await client.get("/api/v1/community/rooms")
        assert res.status_code == 200
        initial_rooms = res.json()
        assert isinstance(initial_rooms, list)

        # 2. Get recommendations
        res_rec = await client.get(
            "/api/v1/community/rooms/recommended?active_roadmap=Python%20Developer%20Roadmap",
            headers=auth_headers,
        )
        assert res_rec.status_code == 200
        recommended = res_rec.json()
        assert isinstance(recommended, list)

        # 3. Create a public study room
        pub_payload = {
            "name": f"Python Fastapi Explorers {uuid.uuid4().hex[:4]}",
            "description": "Daily deep dives into async Python, FastAPI, and Postgres microservices.",
            "topic": "Python",
            "roadmap_name": "Python Developer Roadmap",
            "is_private": False,
            "max_members": 25,
            "category": "Backend",
            "icon": "terminal",
        }
        res_create_pub = await client.post(
            "/api/v1/community/rooms",
            json=pub_payload,
            headers=auth_headers,
        )
        assert res_create_pub.status_code == 201
        pub_room = res_create_pub.json()
        assert "Python Fastapi Explorers" in pub_room["name"]
        assert pub_room["topic"] == "Python"
        assert pub_room["is_private"] is False
        assert pub_room["is_joined"] is True
        assert pub_room["invite_code"] is not None
        pub_room_id = pub_room["id"]

        # 4. Create a private study room
        priv_payload = {
            "name": f"Secret React Lab {uuid.uuid4().hex[:4]}",
            "description": "Private study enclave for React compiler experiments.",
            "topic": "React",
            "roadmap_name": "Frontend Developer Roadmap",
            "is_private": True,
            "max_members": 10,
            "category": "Frontend",
            "icon": "layout",
        }
        res_create_priv = await client.post(
            "/api/v1/community/rooms",
            json=priv_payload,
            headers=auth_headers,
        )
        assert res_create_priv.status_code == 201
        priv_room = res_create_priv.json()
        assert priv_room["is_private"] is True
        priv_code = priv_room["invite_code"]
        assert priv_code.startswith("TECH-")

        # 5. Search for the public room
        res_search = await client.get("/api/v1/community/rooms?search=Fastapi")
        assert res_search.status_code == 200
        search_results = res_search.json()
        assert any(r["id"] == pub_room_id for r in search_results)

        # 6. Join via invite code (idempotent for creator)
        res_join_code = await client.post(
            "/api/v1/community/rooms/join-by-code",
            json={"code": priv_code},
            headers=auth_headers,
        )
        assert res_join_code.status_code == 200
        assert res_join_code.json()["is_joined"] is True

        # 7. Update Study Status
        res_status = await client.put(
            f"/api/v1/community/rooms/{pub_room_id}/study-status",
            json={"study_status": "Reading async event loop internals"},
            headers=auth_headers,
        )
        assert res_status.status_code == 200
        assert res_status.json()["study_status"] == "Reading async event loop internals"

        # 8. Start and End Study Session
        res_start_session = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/session/start",
            json={"topic": "Deep Work Sprint: 45 min on Asynchronous Tasks"},
            headers=auth_headers,
        )
        assert res_start_session.status_code == 200
        assert res_start_session.json()["study_session_active"] is True
        assert res_start_session.json()["study_session_topic"] == "Deep Work Sprint: 45 min on Asynchronous Tasks"

        res_end_session = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/session/end",
            headers=auth_headers,
        )
        assert res_end_session.status_code == 200
        assert res_end_session.json()["study_session_active"] is False

        # 9. Discussion Chat: Send and retrieve messages
        res_msg = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/messages",
            json={"content": "Hey everyone, anyone working on the SQLAlchemy 2.0 query mappings?"},
            headers=auth_headers,
        )
        assert res_msg.status_code == 201
        assert "SQLAlchemy" in res_msg.json()["content"]

        res_msgs = await client.get(f"/api/v1/community/rooms/{pub_room_id}/messages")
        assert res_msgs.status_code == 200
        messages = res_msgs.json()
        assert len(messages) >= 2  # welcome message + user message

        # 10. Questions (Q&A): Ask, reply, and resolve
        res_q = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/questions",
            json={
                "title": "When should I use asyncio.gather vs TaskGroup?",
                "content": "In Python 3.11+, TaskGroup seems safer for exception handling. Is gather considered legacy?",
            },
            headers=auth_headers,
        )
        assert res_q.status_code == 201
        q_data = res_q.json()
        q_id = q_data["id"]
        assert q_data["is_resolved"] is False

        res_reply = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/questions/{q_id}/replies",
            json={"content": "TaskGroup guarantees all child tasks cancel cleanly if any task raises! Highly recommended."},
            headers=auth_headers,
        )
        assert res_reply.status_code == 201
        assert "TaskGroup guarantees" in res_reply.json()["content"]

        res_resolve = await client.put(
            f"/api/v1/community/rooms/{pub_room_id}/questions/{q_id}/resolve",
            headers=auth_headers,
        )
        assert res_resolve.status_code == 200
        assert res_resolve.json()["is_resolved"] is True
        assert res_resolve.json()["replies_count"] == 1

        # 11. Resources: Share and retrieve
        res_res = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/resources",
            json={
                "title": "Asyncio Architecture Deep Dive",
                "resource_type": "video",
                "url_or_content": "https://www.youtube.com/watch?v=Xbl7XjFYsN4",
                "description": "Essential conference talk breaking down coroutines and event loops.",
            },
            headers=auth_headers,
        )
        assert res_res.status_code == 201
        assert res_res.json()["resource_type"] == "video"

        res_all_res = await client.get(f"/api/v1/community/rooms/{pub_room_id}/resources")
        assert res_all_res.status_code == 200
        resources = res_all_res.json()
        assert len(resources) == 1
        assert resources[0]["title"] == "Asyncio Architecture Deep Dive"

        # 12. Members list
        res_members = await client.get(f"/api/v1/community/rooms/{pub_room_id}/members")
        assert res_members.status_code == 200
        members = res_members.json()
        assert len(members) >= 1
        assert any(m["user_id"] == str(user_id) for m in members)
