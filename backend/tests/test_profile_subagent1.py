"""Verification test suite for Subagent 1: Backend Profile Architecture.

Tests:
1. GET /api/v1/users/{username} (and legacy GET /api/v1/users/profile/{username})
2. PUT /api/v1/auth/profile (extended with social links, website_url, profile_visibility)
3. GET /api/v1/users/me/stats (learning metrics and progression breakdown)
4. Username uniqueness enforcement on updates
5. Profile visibility (public vs private restricted views)
"""

import asyncio
import os
import sys
import httpx
from sqlalchemy import delete, select

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import create_access_token, get_password_hash
from app.db.session import async_session_maker
from app.main import app
from app.models.user import User

BASE_URL = "http://127.0.0.1:8000"


async def setup_test_users():
    """Create or reset two test users for profile and uniqueness testing."""
    async with async_session_maker() as db:
        # Clean up existing test users if present
        await db.execute(
            delete(User).where(User.email.in_(["sub1_alice@technea.dev", "sub1_bob@technea.dev"]))
        )
        await db.commit()

        alice = User(
            email="sub1_alice@technea.dev",
            username="sub1_alice",
            full_name="Alice Architect",
            hashed_password=get_password_hash("SecretPassword123!"),
            bio="Distributed systems and AI engineer.",
            location="San Francisco, CA",
            github_url="https://github.com/alice",
            linkedin_url="https://linkedin.com/in/alice",
            website_url="https://alice.dev",
            portfolio_url="https://portfolio.alice.dev",
            profile_visibility="public",
            is_active=True,
            is_superuser=False,
        )
        bob = User(
            email="sub1_bob@technea.dev",
            username="sub1_bob",
            full_name="Bob Builder",
            hashed_password=get_password_hash("SecretPassword123!"),
            bio="Frontend developer diving into Python.",
            location="Seattle, WA",
            github_url="https://github.com/bob",
            linkedin_url="https://linkedin.com/in/bob",
            website_url="https://bob.codes",
            portfolio_url="https://portfolio.bob.codes",
            profile_visibility="public",
            is_active=True,
            is_superuser=False,
        )

        db.add(alice)
        db.add(bob)
        await db.commit()
        await db.refresh(alice)
        await db.refresh(bob)

        token_alice = create_access_token(subject=str(alice.id))
        token_bob = create_access_token(subject=str(bob.id))

        return alice, token_alice, bob, token_bob


async def cleanup_test_users():
    """Clean up test users."""
    async with async_session_maker() as db:
        await db.execute(
            delete(User).where(User.email.in_(["sub1_alice@technea.dev", "sub1_bob@technea.dev"]))
        )
        await db.commit()


async def run_tests():
    print("=" * 70)
    print("SUBAGENT 1: BACKEND PROFILE ARCHITECTURE TEST SUITE")
    print("=" * 70)

    alice, token_alice, bob, token_bob = await setup_test_users()
    headers_alice = {"Authorization": f"Bearer {token_alice}", "Content-Type": "application/json"}
    headers_bob = {"Authorization": f"Bearer {token_bob}", "Content-Type": "application/json"}

    total_tests = 0
    passed_tests = 0

    # Test with httpx against live server or fallback to ASGI transport
    try:
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as probe_client:
            health = await probe_client.get("/api/v1/health")
            use_live_server = health.status_code == 200
    except Exception:
        use_live_server = False

    if use_live_server:
        print(f"Targeting live server at {BASE_URL}")
        client_factory = lambda: httpx.AsyncClient(base_url=BASE_URL, timeout=15.0)
    else:
        print("Live server unavailable, using direct ASGI app transport")
        transport = httpx.ASGITransport(app=app)
        client_factory = lambda: httpx.AsyncClient(transport=transport, base_url="http://test", timeout=15.0)

    async with client_factory() as client:
        # -------------------------------------------------------------
        # 1. PUT /api/v1/auth/profile
        # -------------------------------------------------------------
        print("\n--- 1. Testing PUT /api/v1/auth/profile ---")
        total_tests += 1
        update_payload = {
            "full_name": "Alice Architect Updated",
            "username": "sub1_alice",
            "bio": "Building scalable AI platforms and web architectures.",
            "location": "New York, NY",
            "github_url": "https://github.com/alice-updated",
            "linkedin_url": "https://linkedin.com/in/alice-updated",
            "website_url": "https://alice-updated.dev",
            "portfolio_url": "https://portfolio.alice-updated.dev",
            "profile_visibility": "public",
        }
        res = await client.put("/api/v1/auth/profile", json=update_payload, headers=headers_alice)
        assert res.status_code == 200, f"PUT /auth/profile failed: {res.status_code} - {res.text}"
        data = res.json()
        assert data["full_name"] == "Alice Architect Updated", f"Mismatch full_name: {data.get('full_name')}"
        assert data["location"] == "New York, NY", f"Mismatch location: {data.get('location')}"
        assert data["website_url"] == "https://alice-updated.dev", f"Mismatch website_url: {data.get('website_url')}"
        assert data["portfolio_url"] == "https://portfolio.alice-updated.dev", f"Mismatch portfolio_url: {data.get('portfolio_url')}"
        assert data["profile_visibility"] == "public", f"Mismatch profile_visibility: {data.get('profile_visibility')}"
        print("  ✓ PUT /api/v1/auth/profile updated full_name, website_url, and profile_visibility successfully.")
        passed_tests += 1

        # -------------------------------------------------------------
        # 2. GET /api/v1/users/{username}
        # -------------------------------------------------------------
        print("\n--- 2. Testing GET /api/v1/users/{username} ---")
        total_tests += 1
        # Viewer is Bob viewing Alice's public profile
        res = await client.get("/api/v1/users/sub1_alice", headers=headers_bob)
        assert res.status_code == 200, f"GET /users/{alice.username} failed: {res.status_code} - {res.text}"
        data = res.json()
        required_fields = [
            "id", "username", "full_name", "avatar_url", "bio", "location",
            "github_url", "linkedin_url", "website_url", "portfolio_url",
            "profile_visibility", "joined_date", "followers_count", "following_count",
            "is_following", "is_own_profile", "developer_level", "xp_points",
            "next_level_xp", "level_progress_percent", "learning_streak",
            "completed_milestones_count", "completed_courses_count",
            "completed_projects_count", "skills", "projects", "achievements",
        ]
        for field in required_fields:
            assert field in data, f"Missing required field in public profile: {field}"

        assert data["username"] == "sub1_alice"
        assert data["website_url"] == "https://alice-updated.dev"
        assert data["profile_visibility"] == "public"
        assert data["is_own_profile"] is False
        print(f"  ✓ GET /api/v1/users/sub1_alice -> 200 OK (all {len(required_fields)} fields validated)")
        passed_tests += 1

        # Backward compatibility test for GET /api/v1/users/profile/{username}
        total_tests += 1
        res_legacy = await client.get("/api/v1/users/profile/sub1_alice", headers=headers_bob)
        assert res_legacy.status_code == 200, f"Legacy GET /users/profile/{alice.username} failed: {res_legacy.status_code}"
        data_legacy = res_legacy.json()
        assert data_legacy["username"] == "sub1_alice"
        assert data_legacy["website_url"] == "https://alice-updated.dev"
        print("  ✓ GET /api/v1/users/profile/sub1_alice -> 200 OK (backward compatibility verified)")
        passed_tests += 1

        # -------------------------------------------------------------
        # 3. Private Profile & Visibility Restriction
        # -------------------------------------------------------------
        print("\n--- 3. Testing Private Profile Restricted View ---")
        total_tests += 1
        # Set Alice's profile to private
        priv_payload = {
            "profile_visibility": "private",
        }
        res_priv = await client.put("/api/v1/auth/profile", json=priv_payload, headers=headers_alice)
        assert res_priv.status_code == 200, f"Failed setting private visibility: {res_priv.text}"
        assert res_priv.json()["profile_visibility"] == "private"

        # Bob (other user) views Alice's private profile
        res_view = await client.get("/api/v1/users/sub1_alice", headers=headers_bob)
        assert res_view.status_code == 200
        view_data = res_view.json()
        assert view_data["profile_visibility"] == "private"
        assert view_data["is_own_profile"] is False
        assert view_data["website_url"] is None, "website_url must be hidden on private profile"
        assert view_data["github_url"] is None, "github_url must be hidden on private profile"
        assert view_data["skills"] == [], "skills must be hidden on private profile"
        assert view_data["projects"] == [], "projects must be hidden on private profile"
        assert view_data["bio"] == "This profile is private."
        print("  ✓ Restricted public view verified: private links, bio, skills, and projects hidden from viewer.")
        passed_tests += 1

        # Alice views her own private profile
        total_tests += 1
        res_own = await client.get("/api/v1/users/sub1_alice", headers=headers_alice)
        assert res_own.status_code == 200
        own_data = res_own.json()
        assert own_data["is_own_profile"] is True
        assert own_data["website_url"] == "https://alice-updated.dev", "Owner must see their own website_url"
        print("  ✓ Owner view of private profile verified: owner has full access to own profile.")
        passed_tests += 1

        # Reset Alice back to public
        await client.put("/api/v1/auth/profile", json={"profile_visibility": "public"}, headers=headers_alice)

        # -------------------------------------------------------------
        # 4. GET /api/v1/users/me/stats
        # -------------------------------------------------------------
        print("\n--- 4. Testing GET /api/v1/users/me/stats ---")
        total_tests += 1
        res_stats = await client.get("/api/v1/users/me/stats", headers=headers_alice)
        assert res_stats.status_code == 200, f"GET /users/me/stats failed: {res_stats.status_code} - {res_stats.text}"
        stats_data = res_stats.json()
        expected_stat_fields = [
            "xp_points",
            "developer_level",
            "learning_streak",
            "completed_roadmaps_count",
            "completed_milestones_count",
            "completed_lessons_count",
            "completed_projects_count",
        ]
        for sfield in expected_stat_fields:
            assert sfield in stats_data, f"Missing field in user stats: {sfield}"

        assert isinstance(stats_data["xp_points"], int)
        assert isinstance(stats_data["developer_level"], str)
        assert isinstance(stats_data["learning_streak"], int)
        assert isinstance(stats_data["completed_roadmaps_count"], int)
        assert isinstance(stats_data["completed_milestones_count"], int)
        assert isinstance(stats_data["completed_lessons_count"], int)
        assert isinstance(stats_data["completed_projects_count"], int)
        print(f"  ✓ GET /api/v1/users/me/stats -> 200 OK:")
        print(f"    - XP Points: {stats_data['xp_points']}")
        print(f"    - Developer Level: {stats_data['developer_level']}")
        print(f"    - Learning Streak: {stats_data['learning_streak']}")
        print(f"    - Completed Roadmaps: {stats_data['completed_roadmaps_count']}")
        print(f"    - Completed Milestones: {stats_data['completed_milestones_count']}")
        print(f"    - Completed Lessons: {stats_data['completed_lessons_count']}")
        print(f"    - Completed Projects: {stats_data['completed_projects_count']}")
        passed_tests += 1

        # Unauthenticated request to /me/stats must fail with 401
        total_tests += 1
        res_unauth = await client.get("/api/v1/users/me/stats")
        assert res_unauth.status_code == 401, f"Expected 401 Unauthorized, got {res_unauth.status_code}"
        print("  ✓ GET /api/v1/users/me/stats -> 401 Unauthorized for unauthenticated request.")
        passed_tests += 1

        # -------------------------------------------------------------
        # 5. Username Uniqueness Check
        # -------------------------------------------------------------
        print("\n--- 5. Testing Username Uniqueness Check ---")
        total_tests += 1
        # Bob tries to claim Alice's username "sub1_alice"
        conflict_payload = {
            "username": "sub1_alice",
        }
        res_conflict = await client.put("/api/v1/auth/profile", json=conflict_payload, headers=headers_bob)
        assert res_conflict.status_code == 400, f"Expected 400 on username collision, got {res_conflict.status_code}: {res_conflict.text}"
        err_detail = res_conflict.json().get("detail", "")
        assert "already" in err_detail.lower(), f"Unexpected error detail: {err_detail}"
        print(f"  ✓ Conflict prevention: Bob cannot take Alice's username -> 400 Bad Request ('{err_detail}')")
        passed_tests += 1

        # Bob updates with his own unchanged username -> should succeed
        total_tests += 1
        res_self = await client.put("/api/v1/auth/profile", json={"username": "sub1_bob"}, headers=headers_bob)
        assert res_self.status_code == 200, f"Updating with own username failed: {res_self.status_code}"
        print("  ✓ Self-update with current username allowed -> 200 OK.")
        passed_tests += 1

        # Test PUT /api/v1/users/me/profile endpoint as well
        total_tests += 1
        me_profile_payload = {
            "full_name": "Bob The Builder",
            "username": "sub1_bob",
            "bio": "Building robust web apps.",
            "location": "Seattle, WA",
            "website_url": "https://bob-builds.dev",
            "profile_visibility": "public",
        }
        res_me = await client.put("/api/v1/users/me/profile", json=me_profile_payload, headers=headers_bob)
        assert res_me.status_code == 200, f"PUT /users/me/profile failed: {res_me.status_code} - {res_me.text}"
        data_me = res_me.json()
        assert data_me["website_url"] == "https://bob-builds.dev"
        assert data_me["profile_visibility"] == "public"
        print("  ✓ PUT /api/v1/users/me/profile -> 200 OK (website_url & profile_visibility updated).")
        passed_tests += 1

    # Cleanup
    await cleanup_test_users()

    print("\n" + "=" * 70)
    print(f"SUMMARY: {passed_tests}/{total_tests} TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_tests())
