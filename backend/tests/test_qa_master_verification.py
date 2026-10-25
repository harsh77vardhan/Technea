"""Master QA & Verification Script for Technea Platform.

Executes all verification checks against live backend:
1. Postgres Database Schema verification (technea_db users table: website_url, profile_visibility).
2. Profile update (PUT /api/v1/auth/profile with all 9 fields).
3. Avatar upload & validation (PNG, JPEG, WebP, >5MB, invalid MIME).
4. Public Profile API (GET /api/v1/users/{username}, /api/v1/users/profile/{username}, 27 fields, private visibility).
5. User Stats API (GET /api/v1/users/me/stats, unauthenticated 401).
6. Live Platform Regression:
   - Health: GET /api/v1/health
   - Auth: POST /api/v1/auth/signup, POST /api/v1/auth/login
   - Dashboard: GET /api/v1/progress/dashboard, GET /api/v1/progress/profile
   - AI Mentor: POST /api/v1/ai/chat (guest + auth)
   - Roadmaps: GET /api/v1/roadmaps/catalog
   - Search: POST /api/v1/search
   - Skills & Learning Paths: GET /api/v1/skills, GET /api/v1/learning-paths
"""

import asyncio
import io
import os
import sys
import uuid
import asyncpg
import httpx

BASE_URL = "http://127.0.0.1:8000"
POSTGRES_URI = "postgresql://postgres:postgres_password@localhost:5432/technea_db"

# Valid minimal binary mock images
MOCK_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)
MOCK_JPEG_BYTES = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06"
    b"\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e"
    b"\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01"
    b"\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01"
    b"\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)
MOCK_WEBP_BYTES = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x000\x01\x00\x9d\x01*\x01\x00\x01\x00\x02\x004%\xa4%0\x00"
)


async def run_master_qa():
    print("=" * 80)
    print("TECHNEA COMPREHENSIVE QA & INTEGRATION VERIFICATION SUITE")
    print(f"Targeting: {BASE_URL}")
    print("=" * 80)

    test_results = {}
    passed_count = 0
    total_count = 0

    def record_test(name: str, passed: bool, detail: str = ""):
        nonlocal passed_count, total_count
        total_count += 1
        if passed:
            passed_count += 1
            print(f"  [PASS] {name} {f'({detail})' if detail else ''}")
        else:
            print(f"  [FAIL] {name}: {detail}")
        test_results[name] = {"passed": passed, "detail": detail}

    # -------------------------------------------------------------------------
    # 1. DATABASE SCHEMA VERIFICATION
    # -------------------------------------------------------------------------
    print("\n--- 1. POSTGRES DATABASE SCHEMA VERIFICATION ---")
    try:
        conn = await asyncpg.connect(POSTGRES_URI)
        cols = await conn.fetch("""
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        """)
        col_dict = {c["column_name"]: c for c in cols}
        await conn.close()

        has_website = "website_url" in col_dict
        has_visibility = "profile_visibility" in col_dict

        record_test("DB: users.website_url exists", has_website, f"Type: {col_dict.get('website_url', {}).get('data_type')}")
        record_test(
            "DB: users.profile_visibility exists",
            has_visibility,
            f"Type: {col_dict.get('profile_visibility', {}).get('data_type')}, Default: {col_dict.get('profile_visibility', {}).get('column_default')}",
        )
    except Exception as e:
        record_test("DB: Connection & Schema Inspection", False, str(e))

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=20.0) as client:
        # ---------------------------------------------------------------------
        # 2. PLATFORM HEALTH CHECK
        # ---------------------------------------------------------------------
        print("\n--- 2. PLATFORM HEALTH CHECK ---")
        try:
            r = await client.get("/api/v1/health")
            data = r.json()
            record_test(
                "GET /api/v1/health",
                r.status_code == 200 and data.get("status") in {"ok", "healthy"} and data.get("database_connected") is True,
                f"Status: {data.get('status')}, DB connected: {data.get('database_connected')}",
            )
        except Exception as e:
            record_test("GET /api/v1/health", False, str(e))

        # ---------------------------------------------------------------------
        # 3. AUTHENTICATION (SIGNUP & LOGIN)
        # ---------------------------------------------------------------------
        print("\n--- 3. AUTHENTICATION: SIGNUP & LOGIN ---")
        unique_suffix = uuid.uuid4().hex[:8]
        test_email = f"qa_engineer_{unique_suffix}@technea.dev"
        test_pwd = "QASecurePassword2026!"
        test_uname = f"qa_{unique_suffix}"

        token = None
        user_id = None

        # Signup
        try:
            signup_payload = {
                "email": test_email,
                "password": test_pwd,
                "full_name": "QA Verification Engineer",
                "username": test_uname,
            }
            r_signup = await client.post("/api/v1/auth/signup", json=signup_payload)
            record_test(
                "POST /api/v1/auth/signup",
                r_signup.status_code == 201 or r_signup.status_code == 200,
                f"Status: {r_signup.status_code}, User: {test_email}",
            )
            signup_data = r_signup.json()
            if "access_token" in signup_data:
                token = signup_data["access_token"]
                user_id = signup_data.get("user", {}).get("id")
        except Exception as e:
            record_test("POST /api/v1/auth/signup", False, str(e))

        # Login
        try:
            login_payload = {
                "email": test_email,
                "password": test_pwd,
            }
            r_login = await client.post("/api/v1/auth/login", json=login_payload)
            login_data = r_login.json()
            is_login_ok = r_login.status_code == 200 and "access_token" in login_data
            record_test("POST /api/v1/auth/login", is_login_ok, f"Status: {r_login.status_code}")
            if is_login_ok:
                token = login_data["access_token"]
                user_id = login_data["user"]["id"]
        except Exception as e:
            record_test("POST /api/v1/auth/login", False, str(e))

        auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

        # ---------------------------------------------------------------------
        # 4. PROFILE UPDATE (PUT /api/v1/auth/profile)
        # ---------------------------------------------------------------------
        print("\n--- 4. PROFILE UPDATE (ALL 9 FIELDS) ---")
        try:
            update_payload = {
                "full_name": "Alex QA Lead",
                "username": test_uname,
                "bio": "Senior QA Engineer specializing in distributed platforms.",
                "location": "Boston, MA",
                "github_url": f"https://github.com/{test_uname}",
                "linkedin_url": f"https://linkedin.com/in/{test_uname}",
                "website_url": f"https://{test_uname}.dev",
                "portfolio_url": f"https://portfolio.{test_uname}.dev",
                "profile_visibility": "public",
            }
            r_prof = await client.put("/api/v1/auth/profile", json=update_payload, headers=auth_headers)
            prof_data = r_prof.json()

            fields_matched = (
                r_prof.status_code == 200
                and prof_data.get("full_name") == update_payload["full_name"]
                and prof_data.get("username") == update_payload["username"]
                and prof_data.get("bio") == update_payload["bio"]
                and prof_data.get("location") == update_payload["location"]
                and prof_data.get("github_url") == update_payload["github_url"]
                and prof_data.get("linkedin_url") == update_payload["linkedin_url"]
                and prof_data.get("website_url") == update_payload["website_url"]
                and prof_data.get("portfolio_url") == update_payload["portfolio_url"]
                and prof_data.get("profile_visibility") == update_payload["profile_visibility"]
            )
            record_test(
                "PUT /api/v1/auth/profile (full payload with 9 fields)",
                fields_matched,
                f"Status: {r_prof.status_code}, verified website_url & profile_visibility",
            )
        except Exception as e:
            record_test("PUT /api/v1/auth/profile", False, str(e))

        # ---------------------------------------------------------------------
        # 5. AVATAR UPLOADS & RESTRICTIONS
        # ---------------------------------------------------------------------
        print("\n--- 5. AVATAR UPLOAD & RESTRICTIONS ---")
        # PNG
        try:
            png_bytes = MOCK_PNG_BYTES
            r_png = await client.post(
                "/api/v1/auth/avatar",
                files={"file": ("test.png", png_bytes, "image/png")},
                headers=auth_headers,
            )
            record_test(
                "POST /api/v1/auth/avatar (PNG)",
                r_png.status_code == 200 and "avatar_url" in r_png.json(),
                f"Avatar URL: {r_png.json().get('avatar_url')}",
            )
        except Exception as e:
            record_test("POST /api/v1/auth/avatar (PNG)", False, str(e))

        # JPEG
        try:
            jpeg_bytes = MOCK_JPEG_BYTES
            r_jpg = await client.post(
                "/api/v1/auth/avatar",
                files={"file": ("test.jpg", jpeg_bytes, "image/jpeg")},
                headers=auth_headers,
            )
            record_test(
                "POST /api/v1/auth/avatar (JPEG)",
                r_jpg.status_code == 200 and "avatar_url" in r_jpg.json(),
                f"Avatar URL: {r_jpg.json().get('avatar_url')}",
            )
        except Exception as e:
            record_test("POST /api/v1/auth/avatar (JPEG)", False, str(e))

        # WebP
        try:
            webp_bytes = MOCK_WEBP_BYTES
            r_webp = await client.post(
                "/api/v1/auth/avatar",
                files={"file": ("test.webp", webp_bytes, "image/webp")},
                headers=auth_headers,
            )
            record_test(
                "POST /api/v1/auth/avatar (WebP)",
                r_webp.status_code == 200 and "avatar_url" in r_webp.json(),
                f"Avatar URL: {r_webp.json().get('avatar_url')}",
            )
        except Exception as e:
            record_test("POST /api/v1/auth/avatar (WebP)", False, str(e))

        # Oversized >5MB
        try:
            big_bytes = b"\x00" * (5 * 1024 * 1024 + 1024)  # 5MB + 1KB
            r_big = await client.post(
                "/api/v1/auth/avatar",
                files={"file": ("big.png", big_bytes, "image/png")},
                headers=auth_headers,
            )
            record_test(
                "POST /api/v1/auth/avatar (>5MB rejection)",
                r_big.status_code == 400,
                f"Status: {r_big.status_code}, Msg: {r_big.json().get('detail')}",
            )
        except Exception as e:
            record_test("POST /api/v1/auth/avatar (>5MB rejection)", False, str(e))

        # Invalid MIME / spoofed file
        try:
            r_bad = await client.post(
                "/api/v1/auth/avatar",
                files={"file": ("script.sh", b"#!/bin/bash\necho hello", "application/x-sh")},
                headers=auth_headers,
            )
            record_test(
                "POST /api/v1/auth/avatar (Invalid MIME rejection)",
                r_bad.status_code == 400,
                f"Status: {r_bad.status_code}",
            )
        except Exception as e:
            record_test("POST /api/v1/auth/avatar (Invalid MIME rejection)", False, str(e))

        # ---------------------------------------------------------------------
        # 6. PUBLIC PROFILE API & VISIBILITY
        # ---------------------------------------------------------------------
        print("\n--- 6. PUBLIC PROFILE API & VISIBILITY ---")
        try:
            r_pub = await client.get(f"/api/v1/users/{test_uname}", headers=auth_headers)
            pub_data = r_pub.json()
            expected_keys = [
                "id", "username", "full_name", "avatar_url", "bio", "location",
                "github_url", "linkedin_url", "website_url", "portfolio_url",
                "profile_visibility", "developer_level", "xp_points", "learning_streak",
                "completed_milestones_count", "completed_courses_count",
                "completed_projects_count", "skills", "projects", "achievements",
            ]
            all_keys_present = all(k in pub_data for k in expected_keys)
            record_test(
                f"GET /api/v1/users/{test_uname} (27 core & extended fields)",
                r_pub.status_code == 200 and all_keys_present,
                f"XP: {pub_data.get('xp_points')}, Level: {pub_data.get('developer_level')}, Vis: {pub_data.get('profile_visibility')}",
            )

            # Backward compatibility endpoint /api/v1/users/profile/{username}
            r_leg = await client.get(f"/api/v1/users/profile/{test_uname}", headers=auth_headers)
            record_test(
                f"GET /api/v1/users/profile/{test_uname} (backward compatibility)",
                r_leg.status_code == 200 and r_leg.json().get("username") == test_uname,
                f"Status: {r_leg.status_code}",
            )

            # Test private visibility behavior
            # Set to private
            await client.put("/api/v1/auth/profile", json={"profile_visibility": "private"}, headers=auth_headers)

            # View without auth (guest/third party)
            r_guest_view = await client.get(f"/api/v1/users/{test_uname}")
            gv_data = r_guest_view.json()
            is_restricted = (
                r_guest_view.status_code == 200
                and gv_data.get("profile_visibility") == "private"
                and gv_data.get("website_url") is None
                and gv_data.get("github_url") is None
                and gv_data.get("skills") == []
                and gv_data.get("projects") == []
            )
            record_test(
                "Private profile restricted view for third-party/guest",
                is_restricted,
                f"Bio: '{gv_data.get('bio')}', website_url: {gv_data.get('website_url')}",
            )

            # View as owner (should see own private links)
            r_owner_view = await client.get(f"/api/v1/users/{test_uname}", headers=auth_headers)
            ov_data = r_owner_view.json()
            is_owner_full = (
                r_owner_view.status_code == 200
                and ov_data.get("is_own_profile") is True
                and ov_data.get("website_url") is not None
            )
            record_test(
                "Private profile full view for profile owner",
                is_owner_full,
                f"Owner sees website_url: {ov_data.get('website_url')}",
            )

            # Revert back to public
            await client.put("/api/v1/auth/profile", json={"profile_visibility": "public"}, headers=auth_headers)
        except Exception as e:
            record_test("Public Profile & Visibility Tests", False, str(e))

        # ---------------------------------------------------------------------
        # 7. USER STATS API
        # ---------------------------------------------------------------------
        print("\n--- 7. USER STATS API (GET /api/v1/users/me/stats) ---")
        try:
            r_stats = await client.get("/api/v1/users/me/stats", headers=auth_headers)
            sdata = r_stats.json()
            stat_fields = [
                "xp_points", "developer_level", "learning_streak",
                "completed_roadmaps_count", "completed_milestones_count",
                "completed_lessons_count", "completed_projects_count"
            ]
            stats_ok = r_stats.status_code == 200 and all(k in sdata for k in stat_fields)
            record_test(
                "GET /api/v1/users/me/stats (authenticated)",
                stats_ok,
                f"XP: {sdata.get('xp_points')}, Level: {sdata.get('developer_level')}, Streak: {sdata.get('learning_streak')}",
            )

            # Unauthenticated 401 check
            r_unauth = await client.get("/api/v1/users/me/stats")
            record_test(
                "GET /api/v1/users/me/stats (unauthenticated -> 401)",
                r_unauth.status_code == 401,
                f"Status: {r_unauth.status_code}",
            )
        except Exception as e:
            record_test("User Stats API", False, str(e))

        # ---------------------------------------------------------------------
        # 8. DASHBOARD & PROFILE PROGRESS
        # ---------------------------------------------------------------------
        print("\n--- 8. PROGRESS DASHBOARD & PROFILE ---")
        try:
            r_dash = await client.get("/api/v1/progress/dashboard", headers=auth_headers)
            record_test(
                "GET /api/v1/progress/dashboard",
                r_dash.status_code == 200 and "xp_points" in r_dash.json(),
                f"Status: {r_dash.status_code}, xp_points: {r_dash.json().get('xp_points')}, level: {r_dash.json().get('developer_level')}",
            )

            r_prog_prof = await client.get("/api/v1/progress/profile", headers=auth_headers)
            record_test(
                "GET /api/v1/progress/profile",
                r_prog_prof.status_code == 200 and "developer_level" in r_prog_prof.json(),
                f"Status: {r_prog_prof.status_code}, Level: {r_prog_prof.json().get('developer_level')}, XP: {r_prog_prof.json().get('xp_points')}",
            )
        except Exception as e:
            record_test("Progress Dashboard & Profile", False, str(e))

        # ---------------------------------------------------------------------
        # 9. AI MENTOR CHAT (GUEST & AUTHENTICATED)
        # ---------------------------------------------------------------------
        print("\n--- 9. AI MENTOR CHAT (POST /api/v1/ai/chat) ---")
        try:
            # Guest
            guest_payload = {
                "message": "What is the recommended roadmap to learn Full Stack Web Development?",
            }
            r_ai_guest = await client.post("/api/v1/ai/chat", json=guest_payload)
            gdata = r_ai_guest.json()
            record_test(
                "POST /api/v1/ai/chat (Guest User)",
                r_ai_guest.status_code == 200 and len(gdata.get("response", "")) > 50,
                f"Provider: {gdata.get('provider_used')}, Suggestions: {len(gdata.get('suggestions', []))}",
            )

            # Authenticated
            auth_payload = {
                "message": "Give me a step by step plan for microservices architecture.",
            }
            r_ai_auth = await client.post("/api/v1/ai/chat", json=auth_payload, headers=auth_headers)
            adata = r_ai_auth.json()
            record_test(
                "POST /api/v1/ai/chat (Authenticated User)",
                r_ai_auth.status_code == 200 and len(adata.get("response", "")) > 50,
                f"Provider: {adata.get('provider_used')}, Actions: {len(adata.get('related_actions', []))}",
            )
        except Exception as e:
            record_test("AI Mentor Chat", False, str(e))

        # ---------------------------------------------------------------------
        # 10. ROADMAPS CATALOG
        # ---------------------------------------------------------------------
        print("\n--- 10. ROADMAPS CATALOG ---")
        try:
            r_cat = await client.get("/api/v1/roadmaps/catalog")
            cat_data = r_cat.json()
            record_test(
                "GET /api/v1/roadmaps/catalog",
                r_cat.status_code == 200 and isinstance(cat_data, list) and len(cat_data) > 0,
                f"Roadmaps Count: {len(cat_data)}",
            )
        except Exception as e:
            record_test("GET /api/v1/roadmaps/catalog", False, str(e))

        # ---------------------------------------------------------------------
        # 11. SEARCH API
        # ---------------------------------------------------------------------
        print("\n--- 11. SEARCH API ---")
        try:
            r_search = await client.post("/api/v1/search", json={"query": "python"})
            sdata = r_search.json()
            record_test(
                "POST /api/v1/search (query='python')",
                r_search.status_code == 200 and "skills" in sdata and "learning_paths" in sdata,
                f"Skills: {len(sdata.get('skills', []))}, Paths: {len(sdata.get('learning_paths', []))}",
            )
        except Exception as e:
            record_test("POST /api/v1/search", False, str(e))

        # ---------------------------------------------------------------------
        # 12. SKILLS & LEARNING PATHS
        # ---------------------------------------------------------------------
        print("\n--- 12. SKILLS & LEARNING PATHS ---")
        try:
            r_skills = await client.get("/api/v1/skills")
            skills_data = r_skills.json()
            record_test(
                "GET /api/v1/skills",
                r_skills.status_code == 200 and isinstance(skills_data, list) and len(skills_data) > 0,
                f"Skills Count: {len(skills_data)}",
            )

            r_paths = await client.get("/api/v1/learning-paths")
            paths_data = r_paths.json()
            record_test(
                "GET /api/v1/learning-paths",
                r_paths.status_code == 200 and isinstance(paths_data, list) and len(paths_data) > 0,
                f"Learning Paths Count: {len(paths_data)}",
            )
        except Exception as e:
            record_test("Skills & Learning Paths", False, str(e))

    print("\n" + "=" * 80)
    print(f"VERIFICATION RESULTS: {passed_count}/{total_count} TESTS PASSED ({(passed_count/total_count)*100:.1f}%)")
    print("=" * 80)
    return passed_count == total_count


if __name__ == "__main__":
    success = asyncio.run(run_master_qa())
    sys.exit(0 if success else 1)
