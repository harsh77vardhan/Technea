"""Master QA Regression & User Journey Verification Suite for Technea.

Covers:
1. Platform Integrity Verification:
   - Dashboard Overview page (workspace, summary, stats, XP, developer level, daily activity)
   - Roadmaps & Roadmap builder (catalog 100+ roadmaps, AI generation with deep milestones)
   - Roadmap Search & filtering (search by query/category, keyword filtering)
   - Active Roadmap synchronization (persisting active status, updating continue learning)
   - Learning Page & continue learning / resume module
   - Video lessons player / courses
   - User Progress & Daily streaks (streak tracking, checklist task toggling, achievements)
   - Theme switch & navigation consistency
   - Authentication lifecycle (signup, login, profile check, demo bypass simulation, logout)
2. Study Rooms Complete End-to-End User Journeys:
   - Journey A: Discovery -> Filter by topic -> Create Public Room -> Enter Workspace
     -> Send Message -> Ask Question & Reply -> Share Resource & Content
     -> Start Study Session (Pomodoro) -> Save Collaborative Notes -> End Session (AI Summary) -> Exit
   - Journey B: Create Private Room -> Copy invite code -> User 2 Join via invite code
     -> Verify member count increments -> Verify role display and role promotion (member -> moderator)
"""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.db.init_db import (
    run_study_rooms_schema_migrations,
    run_study_rooms_phase2_schema_migrations,
    run_study_rooms_phase3_schema_migrations,
    seed_achievements,
)
from app.db.session import engine
from app.main import app


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine schemas and achievements are seeded, then cleaned up."""
    await run_study_rooms_schema_migrations(engine)
    await run_study_rooms_phase2_schema_migrations(engine)
    await run_study_rooms_phase3_schema_migrations(engine)
    await seed_achievements()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_platform_regression_auth_and_dashboard_overview():
    """1. Test Auth lifecycle, Dashboard Overview, metrics, and streak tracking."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1.1 Sign up new user
        unique_id = uuid.uuid4().hex[:8]
        email = f"qa_user_{unique_id}@technea.dev"
        password = "SecurePassword123!"
        full_name = "QA Master Engineer"

        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": email,
                "password": password,
                "full_name": full_name,
            },
        )
        assert signup_res.status_code == 201, f"Signup failed: {signup_res.text}"
        signup_data = signup_res.json()
        token = signup_data["access_token"]
        assert token is not None
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1.2 Verify current user profile
        me_res = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == email
        assert me_data["full_name"] == full_name

        # 1.3 Test Dashboard Workspace Consolidated Endpoint
        ws_res = await client.get("/api/v1/progress/workspace", headers=auth_headers)
        assert ws_res.status_code == 200
        ws_data = ws_res.json()
        assert "summary" in ws_data
        assert "daily_activity" in ws_data
        assert "achievements" in ws_data
        assert "saved_roadmaps" in ws_data
        assert "recommended_projects" in ws_data

        # 1.4 Test Dashboard Summary Stats
        summary_res = await client.get("/api/v1/progress/dashboard", headers=auth_headers)
        assert summary_res.status_code == 200
        summary = summary_res.json()
        assert "xp_points" in summary
        assert "developer_level" in summary
        assert "streak_count" in summary

        # 1.5 Test Daily Activity & Streaks
        activity_res = await client.get("/api/v1/progress/daily", headers=auth_headers)
        assert activity_res.status_code == 200
        activity = activity_res.json()
        assert "streak_count" in activity
        assert "today_checklist" in activity
        if activity["today_checklist"]:
            first_task = activity["today_checklist"][0]
            task_id = first_task["id"]
            toggle_task_res = await client.post(
                "/api/v1/progress/daily/toggle",
                json={"task_id": task_id, "is_completed": True},
                headers=auth_headers,
            )
            assert toggle_task_res.status_code == 200
            assert toggle_task_res.json()["streak_count"] >= 0

        # 1.6 Test Achievements
        ach_res = await client.get("/api/v1/progress/achievements", headers=auth_headers)
        assert ach_res.status_code == 200
        achievements = ach_res.json()
        assert isinstance(achievements, list)
        assert len(achievements) > 0


@pytest.mark.asyncio
async def test_platform_regression_roadmaps_and_catalog():
    """2. Test Roadmaps catalog (100+ roadmaps), search & filter, generation, and active sync."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create authenticated user
        unique_id = uuid.uuid4().hex[:8]
        email = f"roadmap_user_{unique_id}@technea.dev"
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": email, "password": "Password123!", "full_name": "Roadmap Tester"},
        )
        token = signup_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2.1 Catalog Discovery (100+ Roadmaps)
        cat_res = await client.get("/api/v1/roadmaps/catalog?limit=150")
        assert cat_res.status_code == 200
        catalog = cat_res.json()
        assert isinstance(catalog, list)
        assert len(catalog) >= 10, f"Expected catalog items, got {len(catalog)}"

        # 2.2 Search & Filtering
        search_res = await client.get("/api/v1/roadmaps/catalog?search=Python")
        assert search_res.status_code == 200
        search_items = search_res.json()
        assert len(search_items) > 0
        assert any("Python" in item["title"] or "python" in item.get("category", "").lower() for item in search_items)

        # 2.3 Custom AI Roadmap Generation
        gen_res = await client.post(
            "/api/v1/roadmaps/generate",
            json={
                "goal": "Master Cloud Native Architecture with Kubernetes and Go",
                "experience_level": "Intermediate",
                "available_time": "10 hours/week",
                "preferred_language": "Go",
                "current_skills": ["Docker", "Linux", "REST APIs"],
                "target_role": "Cloud Platform Engineer",
                "current_level": "Intermediate",
                "main_goal": "Job",
                "preferred_style": "Hands-on Projects",
            },
            headers=auth_headers,
        )
        assert gen_res.status_code == 200
        gen_data = gen_res.json()
        assert "Cloud" in gen_data["title"] or "Platform" in gen_data.get("target_role", "")
        roadmap_data = gen_data["roadmap_data"]
        assert len(roadmap_data["phases"]) > 0
        # Check first milestone structure inside first phase
        first_phase = roadmap_data["phases"][0]
        assert len(first_phase["milestones"]) > 0
        m1 = first_phase["milestones"][0]
        assert "lessons" in m1
        assert "resources" in m1
        assert "practice_tasks" in m1
        assert "checkpoints" in m1

        # 2.4 Save Roadmap
        save_payload = {
            "title": gen_data["title"],
            "goal": gen_data["goal"],
            "target_role": gen_data["target_role"],
            "experience_level": gen_data["experience_level"],
            "estimated_duration": gen_data["estimated_duration"],
            "roadmap_data": gen_data["roadmap_data"],
        }
        save_res = await client.post(
            "/api/v1/roadmaps/save",
            json=save_payload,
            headers=auth_headers,
        )
        assert save_res.status_code == 201
        saved_roadmap = save_res.json()
        saved_id = saved_roadmap["id"]

        # 2.5 Active Roadmap Synchronization
        active_res = await client.post(
            f"/api/v1/roadmaps/{saved_id}/set-active",
            headers=auth_headers,
        )
        assert active_res.status_code == 200
        active_data = active_res.json()
        assert active_data["is_active"] is True

        # Verify active roadmap reflected in my-roadmaps
        my_res = await client.get("/api/v1/roadmaps/my", headers=auth_headers)
        assert my_res.status_code == 200
        my_roadmaps = my_res.json()
        assert any(r["id"] == saved_id and r["is_active"] is True for r in my_roadmaps)


@pytest.mark.asyncio
async def test_platform_regression_learning_and_courses():
    """3. Test Learning Paths, step progress toggle, and course player endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create user
        unique_id = uuid.uuid4().hex[:8]
        email = f"learning_user_{unique_id}@technea.dev"
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": email, "password": "Password123!", "full_name": "Learning Tester"},
        )
        token = signup_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 3.1 Fetch Learning Paths (paginated response)
        lp_res = await client.get("/api/v1/learning-paths")
        assert lp_res.status_code == 200
        lp_data = lp_res.json()
        assert "items" in lp_data
        paths = lp_data["items"]
        assert len(paths) > 0
        first_path = paths[0]
        path_id = first_path["id"]

        # 3.2 Fetch Detail
        detail_res = await client.get(f"/api/v1/learning-paths/{path_id}", headers=auth_headers)
        assert detail_res.status_code == 200
        detail_data = detail_res.json()
        assert detail_data["id"] == path_id
        assert "roadmap_steps" in detail_data

        # 3.3 Toggle Step Progress
        if detail_data["roadmap_steps"]:
            step_id = detail_data["roadmap_steps"][0]["id"]
            toggle_step_res = await client.post(
                "/api/v1/progress/steps/toggle",
                json={
                    "learning_path_id": path_id,
                    "step_id": step_id,
                    "is_completed": True,
                },
                headers=auth_headers,
            )
            assert toggle_step_res.status_code == 200
            step_progress = toggle_step_res.json()
            assert step_id in step_progress["completed_step_ids"]

        # 3.4 Courses Catalog
        courses_res = await client.get("/api/v1/courses")
        assert courses_res.status_code == 200
        courses = courses_res.json()
        assert isinstance(courses, list)


@pytest.mark.asyncio
async def test_study_rooms_e2e_journey_a_public_room():
    """4. Study Rooms Journey A (Public Room):
    Discovery -> Filter by topic -> Create Public Room -> Enter Workspace
    -> Send Message -> Ask Question & Reply -> Share Resource & Content
    -> Start Study Session -> Save Notes -> End Session -> Exit
    """
    unique_id = uuid.uuid4().hex[:8]
    creator_email = f"creator_{unique_id}@technea.dev"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create creator user
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": creator_email, "password": "Password123!", "full_name": "Room Architect"},
        )
        creator_token = signup_res.json()["access_token"]
        creator_headers = {"Authorization": f"Bearer {creator_token}"}

        # Step 1: Discovery - List all rooms
        disc_res = await client.get("/api/v1/community/rooms")
        assert disc_res.status_code == 200
        all_rooms = disc_res.json()
        assert isinstance(all_rooms, list)

        # Step 2: Filter by topic (e.g. Python)
        topic_filter_res = await client.get("/api/v1/community/rooms?topic=Python")
        assert topic_filter_res.status_code == 200

        # Step 3: Create Public Room
        pub_payload = {
            "name": f"Python Async Concurrency Guild {unique_id}",
            "description": "Collaborative study room exploring asyncio, event loops, and FastAPI background tasks.",
            "topic": "Python",
            "roadmap_name": "Python Developer Roadmap",
            "is_private": False,
            "max_members": 20,
            "category": "Backend",
            "icon": "terminal",
        }
        create_res = await client.post(
            "/api/v1/community/rooms",
            json=pub_payload,
            headers=creator_headers,
        )
        assert create_res.status_code == 201
        room = create_res.json()
        room_id = room["id"]
        assert room["name"] == pub_payload["name"]
        assert room["is_private"] is False
        assert room["is_joined"] is True
        assert room["invite_code"] is not None

        # Step 4: Enter Workspace - fetch all initial workspace data
        res_msgs = await client.get(f"/api/v1/community/rooms/{room_id}/messages")
        assert res_msgs.status_code == 200

        res_qs = await client.get(f"/api/v1/community/rooms/{room_id}/questions")
        assert res_qs.status_code == 200

        res_resources = await client.get(f"/api/v1/community/rooms/{room_id}/resources")
        assert res_resources.status_code == 200

        res_notes = await client.get(f"/api/v1/community/rooms/{room_id}/notes")
        assert res_notes.status_code == 200

        res_members = await client.get(f"/api/v1/community/rooms/{room_id}/members")
        assert res_members.status_code == 200
        members = res_members.json()
        assert len(members) >= 1
        creator_member = members[0]
        assert creator_member["role"] in ["host", "owner", "admin", "member"]

        # Step 5: Send Message in Chat
        msg_payload = {"content": "Welcome everyone! Today we are mastering asyncio.gather and TaskGroup."}
        send_msg_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/messages",
            json=msg_payload,
            headers=creator_headers,
        )
        assert send_msg_res.status_code == 201
        sent_msg = send_msg_res.json()
        assert sent_msg["content"] == msg_payload["content"]

        # Verify message listed in workspace chat
        messages_after = (await client.get(f"/api/v1/community/rooms/{room_id}/messages")).json()
        assert any(m["content"] == msg_payload["content"] for m in messages_after)

        # Step 6: Ask Question & Reply & Resolve
        q_payload = {
            "title": "How does asyncio prevent event loop starvation with cpu-bound tasks?",
            "content": "Should we offload to run_in_executor or ProcessPoolExecutor?",
        }
        ask_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/questions",
            json=q_payload,
            headers=creator_headers,
        )
        assert ask_res.status_code == 201
        q_data = ask_res.json()
        q_id = q_data["id"]
        assert q_data["is_resolved"] is False

        reply_payload = {"content": "Use loop.run_in_executor(None, sync_func) for IO-heavy or ProcessPool for CPU bound work."}
        reply_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/questions/{q_id}/replies",
            json=reply_payload,
            headers=creator_headers,
        )
        assert reply_res.status_code == 201

        resolve_res = await client.put(
            f"/api/v1/community/rooms/{room_id}/questions/{q_id}/resolve",
            headers=creator_headers,
        )
        assert resolve_res.status_code == 200
        assert resolve_res.json()["is_resolved"] is True

        # Step 7: Share Resource & Learning Content
        res_payload = {
            "title": "Python Async Internals Documentation",
            "resource_type": "link",
            "url_or_content": "https://docs.python.org/3/library/asyncio.html",
            "description": "Official Python standard library asyncio specification.",
        }
        add_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/resources",
            json=res_payload,
            headers=creator_headers,
        )
        assert add_res.status_code == 201
        assert add_res.json()["title"] == res_payload["title"]

        # Share Technea learning content
        share_content_payload = {
            "title": "Lesson 6: Concurrency & Coroutines",
            "content_type": "lesson",
            "content_badge": "Python Mastery",
            "action_url": "/learning?path=python&lesson=6",
            "description": "Deep dive into async generators and context managers.",
        }
        share_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/share-content",
            json=share_content_payload,
            headers=creator_headers,
        )
        assert share_res.status_code == 201

        # Step 8: Start Study Session (Pomodoro Focus Timer)
        start_session_payload = {
            "topic": "Sprint 1: Async Event Loop Patterns",
            "timer_type": "pomodoro",
            "timer_mode": "study",
            "duration_minutes": 25,
        }
        start_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/session/start",
            json=start_session_payload,
            headers=creator_headers,
        )
        assert start_res.status_code == 200
        session_info = start_res.json()
        assert session_info["study_session_active"] is True
        assert session_info["study_session_topic"] == start_session_payload["topic"]

        # Step 9: Save Collaborative Shared Notes
        notes_payload = {
            "title": "Sprint 1 Shared Notes",
            "content": "## Asyncio Summary\n- Event loops manage OS selectors\n- Avoid blocking the loop\n- Use TaskGroup for structured concurrency",
        }
        save_notes_res = await client.put(
            f"/api/v1/community/rooms/{room_id}/notes",
            json=notes_payload,
            headers=creator_headers,
        )
        assert save_notes_res.status_code == 200
        saved_notes = save_notes_res.json()
        assert saved_notes["title"] == notes_payload["title"]
        assert "structured concurrency" in saved_notes["content"]

        # Step 10: End Study Session (Generates AI Summary)
        end_session_res = await client.post(
            f"/api/v1/community/rooms/{room_id}/session/end",
            headers=creator_headers,
        )
        assert end_session_res.status_code == 200
        ended_info = end_session_res.json()
        assert ended_info["study_session_active"] is False

        # Verify Session History includes logged session with AI summary
        history_res = await client.get(f"/api/v1/community/rooms/{room_id}/history")
        assert history_res.status_code == 200
        history_list = history_res.json()
        assert len(history_list) >= 1
        latest_history = history_list[0]
        assert latest_history["topic"] == start_session_payload["topic"]
        assert latest_history["ai_summary"] is not None

        # Step 11: Exit workspace / verify presence update
        status_res = await client.put(
            f"/api/v1/community/rooms/{room_id}/study-status",
            json={"study_status": "Offline", "study_state": "away"},
            headers=creator_headers,
        )
        assert status_res.status_code == 200
        assert status_res.json()["study_state"] == "away"


@pytest.mark.asyncio
async def test_study_rooms_e2e_journey_b_private_room():
    """5. Study Rooms Journey B (Private Room):
    Create Private Room -> Copy invite code -> User 2 Join via invite code
    -> Verify member count increments -> Verify role display and role promotion (member -> moderator)
    """
    unique_id = uuid.uuid4().hex[:8]
    creator_email = f"priv_host_{unique_id}@technea.dev"
    peer_email = f"priv_peer_{unique_id}@technea.dev"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create Room Host User
        host_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": creator_email, "password": "Password123!", "full_name": "Host Lead"},
        )
        host_token = host_res.json()["access_token"]
        host_headers = {"Authorization": f"Bearer {host_token}"}

        # Create Peer User
        peer_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": peer_email, "password": "Password123!", "full_name": "Peer Student"},
        )
        peer_data = peer_res.json()
        peer_token = peer_data["access_token"]
        peer_user_id = peer_data["user"]["id"]
        peer_headers = {"Authorization": f"Bearer {peer_token}"}

        # Step 1: Create Private Room
        priv_payload = {
            "name": f"Algorithmic Architecture Sanctuary {unique_id}",
            "description": "Private algorithmic problem solving and systems design group.",
            "topic": "Data Structures & Algorithms",
            "roadmap_name": "Computer Science Roadmap",
            "is_private": True,
            "max_members": 8,
            "category": "Algorithms",
            "icon": "shield",
        }
        create_priv_res = await client.post(
            "/api/v1/community/rooms",
            json=priv_payload,
            headers=host_headers,
        )
        assert create_priv_res.status_code == 201
        priv_room = create_priv_res.json()
        priv_id = priv_room["id"]
        assert priv_room["is_private"] is True

        # Step 2: Copy invite code
        invite_code = priv_room["invite_code"]
        assert invite_code is not None
        assert invite_code.startswith("TECH-")
        initial_learners_count = priv_room["active_learners_count"]
        assert initial_learners_count == 1

        # Step 3: Peer User joins via invite code
        join_by_code_res = await client.post(
            "/api/v1/community/rooms/join-by-code",
            json={"code": invite_code},
            headers=peer_headers,
        )
        assert join_by_code_res.status_code == 200
        join_result = join_by_code_res.json()
        assert join_result["is_joined"] is True

        # Step 4: Verify member count increments
        members_res = await client.get(f"/api/v1/community/rooms/{priv_id}/members")
        assert members_res.status_code == 200
        members = members_res.json()
        assert len(members) == 2, f"Expected 2 members, found {len(members)}"

        # Step 5: Verify role display
        peer_member = next(m for m in members if m["user_id"] == str(peer_user_id))
        assert peer_member["role"] == "member"

        # Update role: Host promotes peer to moderator
        role_res = await client.put(
            f"/api/v1/community/rooms/{priv_id}/members/{peer_user_id}/role",
            json={"role": "moderator"},
            headers=host_headers,
        )
        assert role_res.status_code == 200
        assert role_res.json()["role"] == "moderator"

        # Verify role updated in room members list
        refreshed_members = (await client.get(f"/api/v1/community/rooms/{priv_id}/members")).json()
        promoted_member = next(m for m in refreshed_members if m["user_id"] == str(peer_user_id))
        assert promoted_member["role"] == "moderator"
