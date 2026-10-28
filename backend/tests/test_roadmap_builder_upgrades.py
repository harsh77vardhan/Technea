"""Comprehensive test suite verifying AI Roadmap Builder transformations and Dashboard Achievements.

Verifies:
1. RoadmapGenerateRequest supporting goal, experience_level, available_time, preferred_language,
   current_skills, target_role, current_level, main_goal, preferred_style.
2. Every generated milestone across blueprints and dynamically synthesized milestones has:
   - lessons (3-5 items)
   - resources (curated documentation links with title, url, type)
   - practice_tasks (2-3 items)
   - interview_prep (2-3 items)
   - checkpoints (2 items)
3. Tailored language adaptations (Go, TypeScript, Rust, Python, Java) and duration scaling.
4. Saving, updating (PUT /{roadmap_id}), regenerating (POST /{roadmap_id}/regenerate preserving ID),
   and milestone progress toggling.
5. Database seed_achievements() and GET /api/v1/progress/achievements endpoint.
"""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.db.init_db import seed_achievements
from app.db.session import engine
from app.main import app


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed cleanly per test."""
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_generate_roadmap_with_all_parameters():
    """Verify POST /api/v1/roadmaps/generate handles all new parameters and enriches milestones."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.post(
            "/api/v1/roadmaps/generate",
            json={
                "goal": "I want to become a Go Backend Web Developer",
                "experience_level": "Intermediate",
                "available_time": "2+ hours/day",
                "preferred_language": "Go",
                "current_skills": ["HTML/CSS", "Python Basics"],
                "target_role": "Cloud Backend Architect",
                "current_level": "Intermediate",
                "main_goal": "Job",
                "preferred_style": "Projects",
            },
        )
        assert res.status_code == 200
        data = res.json()

        # Target role and title
        assert data["target_role"] == "Cloud Backend Architect"
        assert data["title"] == "Cloud Backend Architect Roadmap"
        assert "(Intensive)" in data["estimated_duration"]

        roadmap_data = data["roadmap_data"]
        assert "HTML/CSS" in roadmap_data["summary"]
        assert "Focus language: Go" in roadmap_data["summary"]
        assert len(roadmap_data["phases"]) >= 4

        # Verify EVERY milestone across ALL phases has required rich fields
        total_milestones_checked = 0
        for phase in roadmap_data["phases"]:
            for m in phase["milestones"]:
                total_milestones_checked += 1
                # Lessons: 3-5 concrete topics
                assert isinstance(m["lessons"], list)
                assert 3 <= len(m["lessons"]) <= 5
                for lesson in m["lessons"]:
                    assert isinstance(lesson, str) and len(lesson) > 5

                # Resources: curated doc links
                assert isinstance(m["resources"], list)
                assert len(m["resources"]) >= 2
                for r in m["resources"]:
                    assert "title" in r and "url" in r and "type" in r

                # Practice tasks: 2-3 items
                assert isinstance(m["practice_tasks"], list)
                assert 2 <= len(m["practice_tasks"]) <= 3
                for task in m["practice_tasks"]:
                    assert isinstance(task, str) and len(task) > 10

                # Interview prep: 2-3 items
                assert isinstance(m["interview_prep"], list)
                assert 2 <= len(m["interview_prep"]) <= 3
                for q in m["interview_prep"]:
                    assert isinstance(q, str) and len(q) > 10

                # Checkpoints: 2 items
                assert isinstance(m["checkpoints"], list)
                assert len(m["checkpoints"]) >= 2
                for cp in m["checkpoints"]:
                    assert isinstance(cp, str) and len(cp) > 10

        assert total_milestones_checked >= 8

        # Verify language adaptation for Go in backend milestone
        phase3 = next(p for p in roadmap_data["phases"] if p["phase_number"] == 3)
        backend_m = phase3["milestones"][0]
        assert "Go" in backend_m["title"]
        assert "Go" in backend_m["key_skills"]
        assert any("Go" in l for l in backend_m["lessons"])
        assert any("go.dev" in r["url"] for r in backend_m["resources"])

        # Capstone project tech stack should include Go
        capstone = roadmap_data["capstone_project"]
        assert capstone is not None
        assert any("Go" in tech for tech in capstone["tech_stack"])


@pytest.mark.asyncio
async def test_generate_roadmap_language_variants():
    """Verify language tailoring adapts backend milestones across TypeScript, Rust, and Java."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. TypeScript
        res_ts = await client.post(
            "/api/v1/roadmaps/generate",
            json={
                "goal": "I want to become a Full Stack Developer",
                "preferred_language": "TypeScript",
            },
        )
        assert res_ts.status_code == 200
        phases_ts = res_ts.json()["roadmap_data"]["phases"]
        phase3_ts = next(p for p in phases_ts if p["phase_number"] == 3)
        assert "TypeScript" in phase3_ts["milestones"][0]["title"]
        assert "TypeScript" in phase3_ts["milestones"][0]["key_skills"]

        # 2. Rust
        res_rust = await client.post(
            "/api/v1/roadmaps/generate",
            json={
                "goal": "I want to become a Systems Engineer",
                "preferred_language": "Rust",
            },
        )
        assert res_rust.status_code == 200
        phases_rust = res_rust.json()["roadmap_data"]["phases"]
        phase3_rust = next(p for p in phases_rust if p["phase_number"] == 3)
        assert "Rust" in phase3_rust["milestones"][0]["title"]
        assert "Rust" in phase3_rust["milestones"][0]["key_skills"]

        # 3. Java
        res_java = await client.post(
            "/api/v1/roadmaps/generate",
            json={
                "goal": "I want to build enterprise web applications",
                "preferred_language": "Java",
            },
        )
        assert res_java.status_code == 200
        phases_java = res_java.json()["roadmap_data"]["phases"]
        phase3_java = next(p for p in phases_java if p["phase_number"] == 3)
        assert "Java" in phase3_java["milestones"][0]["title"]
        assert "Spring Boot" in phase3_java["milestones"][0]["key_skills"]


@pytest.mark.asyncio
async def test_generate_roadmap_duration_pacing():
    """Verify available_time options correctly adjust estimated duration."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Self-Paced
        res1 = await client.post(
            "/api/v1/roadmaps/generate",
            json={"goal": "Learn web dev", "available_time": "30 minutes/day"},
        )
        assert res1.status_code == 200
        assert "(Self-Paced)" in res1.json()["estimated_duration"]

        # Standard
        res2 = await client.post(
            "/api/v1/roadmaps/generate",
            json={"goal": "Learn web dev", "available_time": "1 hour/day"},
        )
        assert res2.status_code == 200
        assert "(Standard)" in res2.json()["estimated_duration"]

        # Intensive
        res3 = await client.post(
            "/api/v1/roadmaps/generate",
            json={"goal": "Learn web dev", "available_time": "2+ hours/day"},
        )
        assert res3.status_code == 200
        assert "(Intensive)" in res3.json()["estimated_duration"]


@pytest.mark.asyncio
async def test_save_update_regenerate_and_progress_lifecycle():
    """Full lifecycle: Generate -> Save -> Get -> Update -> Progress -> Regenerate -> Delete."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Signup user to get token
        email = f"roadmap_tester_{uuid.uuid4().hex[:8]}@technea.dev"
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": email, "password": "Password123!", "full_name": "Roadmap Tester"},
        )
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2. Generate roadmap
        gen_res = await client.post(
            "/api/v1/roadmaps/generate",
            json={"goal": "I want to become a Full Stack Developer", "preferred_language": "TypeScript"},
        )
        assert gen_res.status_code == 200
        gen_data = gen_res.json()

        # 3. Save roadmap
        save_res = await client.post(
            "/api/v1/roadmaps/save",
            headers=auth_headers,
            json={
                "title": gen_data["title"],
                "goal": gen_data["goal"],
                "target_role": gen_data["target_role"],
                "experience_level": gen_data["experience_level"],
                "estimated_duration": gen_data["estimated_duration"],
                "roadmap_data": gen_data["roadmap_data"],
            },
        )
        assert save_res.status_code == 201
        saved = save_res.json()
        roadmap_id = saved["id"]
        assert saved["progress_percent"] == 0
        assert saved["is_active"] is True

        # 4. Fetch my roadmaps
        my_res = await client.get("/api/v1/roadmaps/my", headers=auth_headers)
        assert my_res.status_code == 200
        my_roadmaps = my_res.json()
        assert any(r["id"] == roadmap_id for r in my_roadmaps)

        # 5. Fetch single roadmap by ID
        get_res = await client.get(f"/api/v1/roadmaps/{roadmap_id}", headers=auth_headers)
        assert get_res.status_code == 200
        assert get_res.json()["title"] == gen_data["title"]

        # 6. Update roadmap (PUT /{roadmap_id})
        update_res = await client.put(
            f"/api/v1/roadmaps/{roadmap_id}",
            headers=auth_headers,
            json={
                "title": "Principal Full Stack Architect Roadmap",
                "target_role": "Principal Architect",
            },
        )
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["title"] == "Principal Full Stack Architect Roadmap"
        assert updated["target_role"] == "Principal Architect"

        # 7. Toggle milestone progress
        toggle_res = await client.post(
            f"/api/v1/roadmaps/{roadmap_id}/progress",
            headers=auth_headers,
            json={"milestone_id": "m1-1", "is_completed": True},
        )
        assert toggle_res.status_code == 200
        toggled = toggle_res.json()
        assert "m1-1" in toggled["completed_milestone_ids"]
        assert toggled["progress_percent"] > 0

        # 8. Regenerate roadmap (POST /{roadmap_id}/regenerate)
        regen_res = await client.post(
            f"/api/v1/roadmaps/{roadmap_id}/regenerate",
            headers=auth_headers,
            json={
                "goal": "I want to become an AI Engineer",
                "preferred_language": "Python",
                "target_role": "Senior AI Systems Engineer",
            },
        )
        assert regen_res.status_code == 200
        regenerated = regen_res.json()

        # ID is PRESERVED!
        assert regenerated["id"] == roadmap_id
        assert regenerated["target_role"] == "Senior AI Systems Engineer"
        assert "AI Systems Engineer" in regenerated["title"]
        assert regenerated["progress_percent"] == 0
        assert regenerated["completed_milestone_ids"] == []

        # Check new AI phases are loaded
        phases = regenerated["roadmap_data"]["phases"]
        assert any("PyTorch" in p["title"] or any("PyTorch" in m["title"] for m in p["milestones"]) for p in phases)

        # 9. Delete roadmap
        del_res = await client.delete(f"/api/v1/roadmaps/{roadmap_id}", headers=auth_headers)
        assert del_res.status_code == 200

        # 10. Verify 404 after deletion
        not_found_res = await client.get(f"/api/v1/roadmaps/{roadmap_id}", headers=auth_headers)
        assert not_found_res.status_code == 404


@pytest.mark.asyncio
async def test_seed_achievements_and_progress_endpoint():
    """Verify seed_achievements creates table and GET /api/v1/progress/achievements returns rich data."""
    # Ensure seeding is executed
    await seed_achievements()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Unauthenticated / Guest request
        guest_res = await client.get("/api/v1/progress/achievements")
        assert guest_res.status_code == 200
        achievements = guest_res.json()
        assert len(achievements) >= 8

        first_ach = achievements[0]
        assert "id" in first_ach
        assert "achievement_id" in first_ach
        assert "title" in first_ach
        assert "description" in first_ach
        assert "icon" in first_ach
        assert "category" in first_ach
        assert "xp_reward" in first_ach
        assert "unlocked" in first_ach
        assert "earned" in first_ach

        # Verify key achievements exist
        achievement_ids = {a["achievement_id"] for a in achievements}
        assert "early_adopter" in achievement_ids
        assert "roadmap_architect" in achievement_ids
        assert "milestone_champion" in achievement_ids
        assert "full_stack_hero" in achievement_ids

        # 2. Authenticated user request
        email = f"ach_tester_{uuid.uuid4().hex[:8]}@technea.dev"
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={"email": email, "password": "Password123!", "full_name": "Achievement Tester"},
        )
        token = signup_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        auth_res = await client.get("/api/v1/progress/achievements", headers=auth_headers)
        assert auth_res.status_code == 200
        auth_achievements = auth_res.json()
        assert len(auth_achievements) >= 8

        # Early adopter should be unlocked for user
        early = next(a for a in auth_achievements if a["achievement_id"] == "early_adopter")
        assert early["unlocked"] is True
        assert early["earned"] is True
