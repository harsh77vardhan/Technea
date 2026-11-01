"""Integration tests for Technea Study Rooms MVP."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.security import create_access_token
from app.db.init_db import run_study_rooms_schema_migrations, run_study_rooms_phase2_schema_migrations
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await run_study_rooms_schema_migrations(engine)
    await run_study_rooms_phase2_schema_migrations(engine)
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

        # 12. Members list with presence state
        res_members = await client.get(f"/api/v1/community/rooms/{pub_room_id}/members")
        assert res_members.status_code == 200
        members = res_members.json()
        assert len(members) >= 1
        assert any(m["user_id"] == str(user_id) for m in members)

        # 13. Phase 2: Presence state update (🟢 Studying, 🟡 Taking Break, 🔴 Away)
        res_state_break = await client.put(
            f"/api/v1/community/rooms/{pub_room_id}/study-status",
            json={
                "study_status": "5 min coffee break",
                "study_state": "break",
            },
            headers=auth_headers,
        )
        assert res_state_break.status_code == 200
        assert res_state_break.json()["study_state"] == "break"
        assert res_state_break.json()["study_status"] == "5 min coffee break"

        # 14. Phase 2: Start Study Session with Pomodoro Focus Timer and Host
        res_pomo_session = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/session/start",
            json={
                "topic": "Python Functions & Scope Deep Dive",
                "timer_type": "pomodoro",
                "timer_mode": "study",
                "duration_minutes": 25,
            },
            headers=auth_headers,
        )
        assert res_pomo_session.status_code == 200
        session_data = res_pomo_session.json()
        assert session_data["study_session_active"] is True
        assert session_data["study_session_topic"] == "Python Functions & Scope Deep Dive"
        assert session_data["study_session_timer_type"] == "pomodoro"
        assert session_data["study_session_host_name"] is not None

        # 15. Phase 2: End Study Session & Verify Session History Logging
        res_end_pomo = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/session/end",
            headers=auth_headers,
        )
        assert res_end_pomo.status_code == 200
        assert res_end_pomo.json()["study_session_active"] is False

        res_hist = await client.get(f"/api/v1/community/rooms/{pub_room_id}/history")
        assert res_hist.status_code == 200
        history_list = res_hist.json()
        assert len(history_list) >= 1
        assert history_list[0]["topic"] == "Python Functions & Scope Deep Dive"
        assert history_list[0]["participants_count"] >= 1

        # 16. Phase 2: Collaborative Shared Notes
        res_get_notes = await client.get(f"/api/v1/community/rooms/{pub_room_id}/notes")
        assert res_get_notes.status_code == 200
        notes_data = res_get_notes.json()
        assert "Shared Notes" in notes_data["title"]

        res_save_notes = await client.put(
            f"/api/v1/community/rooms/{pub_room_id}/notes",
            json={
                "title": "Python Functions Concepts",
                "content": "# Key Takeaways\n1. Positional-only args using `/`\n2. Keyword-only args using `*`\n3. Closures and nonlocal bindings",
            },
            headers=auth_headers,
        )
        assert res_save_notes.status_code == 200
        updated_notes = res_save_notes.json()
        assert updated_notes["title"] == "Python Functions Concepts"
        assert "Closures and nonlocal bindings" in updated_notes["content"]
        assert updated_notes["last_edited_by_name"] is not None

        # 17. Phase 2: Learning Content Sharing
        res_share_content = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/share-content",
            json={
                "title": "Python Lesson 4: Functions & Scope",
                "content_type": "lesson",
                "content_badge": "Python Lesson 4",
                "action_url": "/learning?path=python&lesson=4",
                "description": "Essential lesson on scope resolution rules (LEGB).",
            },
            headers=auth_headers,
        )
        assert res_share_content.status_code == 201
        shared_card = res_share_content.json()
        assert shared_card["content_badge"] == "Python Lesson 4"
        assert shared_card["action_url"] == "/learning?path=python&lesson=4"
        assert shared_card["resource_type"] == "lesson"

        # 18. Phase 2: In-App Room Notifications
        res_notifs = await client.get(
            f"/api/v1/community/rooms/{pub_room_id}/notifications",
            headers=auth_headers,
        )
        assert res_notifs.status_code == 200
        notifs_list = res_notifs.json()
        assert len(notifs_list) >= 1  # session_started, note_updated, content_shared
        assert any(n["notification_type"] in ["session_started", "note_updated", "content_shared"] for n in notifs_list)

        res_mark_read = await client.post(
            f"/api/v1/community/rooms/{pub_room_id}/notifications/read",
            headers=auth_headers,
        )
        assert res_mark_read.status_code == 200
        assert res_mark_read.json()["success"] is True

        # 19. Phase 2: Enhanced Recommendations with Current Milestone & Skills
        res_rec_phase2 = await client.get(
            "/api/v1/community/rooms/recommended?active_roadmap=Python%20Developer&current_milestone=Functions&skills=Python,FastAPI",
            headers=auth_headers,
        )
        assert res_rec_phase2.status_code == 200
        rec_phase2_rooms = res_rec_phase2.json()
        assert len(rec_phase2_rooms) >= 1
        assert any("Python" in r["name"] or "Python" in r["topic"] for r in rec_phase2_rooms)

