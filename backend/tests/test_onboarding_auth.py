"""Tests for first-time user detection and profile setup onboarding APIs."""

import json
import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, text
from unittest.mock import AsyncMock, patch

from app.core.security import create_access_token
from app.db.init_db import run_auth_migrations
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.user import User


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_auth_migrations_adds_columns_and_backfills():
    """Verify run_auth_migrations adds new onboarding columns and backfills active users."""
    await run_auth_migrations(engine)

    async with async_session_maker() as session:
        # Create a user with username and full_name but profile_completed=False
        test_email = f"backfill_test_{uuid.uuid4().hex[:8]}@technea.dev"
        user = User(
            email=test_email,
            hashed_password="hashed_pw_test",
            full_name="Existing Active User",
            username=f"existing_{uuid.uuid4().hex[:6]}",
            profile_completed=False,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        assert user.profile_completed is False

    # Run migration again
    await run_auth_migrations(engine)

    async with async_session_maker() as session:
        stmt = select(User).where(User.email == test_email)
        refreshed = (await session.execute(stmt)).scalar_one()
        assert refreshed.profile_completed is True


@pytest.mark.asyncio
async def test_signup_includes_profile_completed_false():
    """Verify new user signup returns profile_completed=False in TokenResponse."""
    unique_email = f"new_signup_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "New Onboarding User",
            },
        )
        assert res.status_code == 201
        data = res.json()
        assert "profile_completed" in data
        assert data["profile_completed"] is False
        assert data["user"]["profile_completed"] is False


@pytest.mark.asyncio
async def test_login_includes_profile_completed():
    """Verify user login returns profile_completed correctly in TokenResponse."""
    unique_email = f"login_test_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )

        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert login_res.status_code == 200
        data = login_res.json()
        assert "profile_completed" in data
        assert data["profile_completed"] is False
        assert data["user"]["profile_completed"] is False


@pytest.mark.asyncio
async def test_check_username_endpoint():
    """Verify GET /api/v1/auth/check-username handles availability, validation, and exclusions."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Available username
        unique_uname = f"avail_{uuid.uuid4().hex[:6]}"
        res = await client.get(f"/api/v1/auth/check-username?username={unique_uname}")
        assert res.status_code == 200
        assert res.json() == {
            "username": unique_uname,
            "available": True,
            "message": f"Username '{unique_uname}' is available.",
        }

        # Invalid username regex (contains invalid characters)
        res_invalid = await client.get("/api/v1/auth/check-username?username=bad-user@name!")
        assert res_invalid.status_code == 200
        assert res_invalid.json()["available"] is False
        assert "letters, numbers, and underscores" in res_invalid.json()["message"]

        # Too short username (<3 chars) -> 422
        res_short = await client.get("/api/v1/auth/check-username?username=ab")
        assert res_short.status_code == 422

        # Create a user with a taken username
        taken_uname = f"taken_{uuid.uuid4().hex[:6]}"
        unique_email = f"{taken_uname}@technea.dev"
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
                "username": taken_uname,
            },
        )
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]

        # Guest checks taken username (case-insensitive)
        res_taken = await client.get(f"/api/v1/auth/check-username?username={taken_uname.upper()}")
        assert res_taken.status_code == 200
        assert res_taken.json()["available"] is False
        assert "already taken" in res_taken.json()["message"]

        # Authenticated user checks their OWN username -> available=True
        headers = {"Authorization": f"Bearer {token}"}
        res_own = await client.get(
            f"/api/v1/auth/check-username?username={taken_uname}",
            headers=headers,
        )
        assert res_own.status_code == 200
        assert res_own.json()["available"] is True


@pytest.mark.asyncio
async def test_profile_setup_full_flow():
    """Verify POST /api/v1/auth/profile-setup successfully completes onboarding."""
    unique_email = f"setup_user_{uuid.uuid4().hex[:8]}@technea.dev"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Step 1: Sign up
        signup_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        assert signup_res.json()["profile_completed"] is False

        # Step 2: Call profile-setup unauthenticated -> 401
        unauth_res = await client.post(
            "/api/v1/auth/profile-setup",
            json={
                "full_name": "Test User",
                "username": f"user_{uuid.uuid4().hex[:6]}",
            },
        )
        assert unauth_res.status_code == 401

        # Step 3: Complete profile setup
        chosen_uname = f"pro_{uuid.uuid4().hex[:6]}"
        headers = {"Authorization": f"Bearer {token}"}
        setup_payload = {
            "full_name": "Antigravity Onboarded Engineer",
            "username": chosen_uname,
            "avatar_url": "https://storage.technea.dev/avatars/custom_pic.png",
            "bio": "Building cutting edge AI web applications",
            "learning_goal": "Full-Stack AI Engineering",
            "current_skill_level": "intermediate",
            "interests": ["Python", "FastAPI", "React", "Machine Learning"],
        }
        setup_res = await client.post(
            "/api/v1/auth/profile-setup",
            json=setup_payload,
            headers=headers,
        )
        assert setup_res.status_code == 200
        setup_data = setup_res.json()
        assert setup_data["profile_completed"] is True
        assert setup_data["message"] == "Profile setup completed successfully."
        assert setup_data["user"]["full_name"] == "Antigravity Onboarded Engineer"
        assert setup_data["user"]["username"] == chosen_uname
        assert setup_data["user"]["avatar_url"] == "https://storage.technea.dev/avatars/custom_pic.png"
        assert setup_data["user"]["bio"] == "Building cutting edge AI web applications"
        assert setup_data["user"]["learning_goal"] == "Full-Stack AI Engineering"
        assert setup_data["user"]["current_skill_level"] == "intermediate"
        assert setup_data["user"]["interests"] == ["Python", "FastAPI", "React", "Machine Learning"]
        assert setup_data["user"]["profile_completed"] is True

        # Step 4: Verify via GET /api/v1/auth/me
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["profile_completed"] is True
        assert me_data["learning_goal"] == "Full-Stack AI Engineering"
        assert me_data["interests"] == ["Python", "FastAPI", "React", "Machine Learning"]

        # Step 5: Verify subsequent login returns profile_completed=True
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert login_res.status_code == 200
        assert login_res.json()["profile_completed"] is True
        assert login_res.json()["user"]["profile_completed"] is True


@pytest.mark.asyncio
async def test_profile_setup_username_conflict():
    """Verify profile-setup rejects taken username from another user."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # User 1
        u1_name = f"first_{uuid.uuid4().hex[:6]}"
        u1_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": f"{u1_name}@technea.dev",
                "password": "Password123!",
                "username": u1_name,
            },
        )
        assert u1_res.status_code == 201

        # User 2
        u2_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": f"second_{uuid.uuid4().hex[:6]}@technea.dev",
                "password": "Password123!",
            },
        )
        assert u2_res.status_code == 201
        token2 = u2_res.json()["access_token"]

        # User 2 tries to take User 1's username
        conflict_res = await client.post(
            "/api/v1/auth/profile-setup",
            json={
                "full_name": "Second User",
                "username": u1_name.upper(),  # case-insensitive collision check
            },
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert conflict_res.status_code == 400
        assert "already taken" in conflict_res.json()["detail"]


@pytest.mark.asyncio
async def test_google_oauth_callback_profile_completed_flag():
    """Verify Google OAuth callback returns profile_completed in both redirect and JSON modes."""
    mock_email = f"google_profile_{uuid.uuid4().hex[:8]}@gmail.com"
    mock_user_info = {
        "email": mock_email,
        "name": "Google Onboard Tester",
        "google_id": f"gid_{uuid.uuid4().hex[:12]}",
        "avatar_url": "https://lh3.googleusercontent.com/avatar_test.jpg",
        "verified_email": True,
    }

    # 1. Standard Browser Flow redirects with &profile_completed=0
    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = mock_user_info
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/api/v1/auth/google/callback?code=mock_code_1", follow_redirects=False)
            assert res.status_code == 302
            location = res.headers.get("location")
            assert location is not None
            assert "profile_completed=0" in location

    # 2. JSON Format returns profile_completed=False for new user
    mock_user_info2 = {
        "email": f"google_json_flag_{uuid.uuid4().hex[:8]}@gmail.com",
        "name": "Google JSON Tester",
        "google_id": f"gid_{uuid.uuid4().hex[:12]}",
        "avatar_url": "https://lh3.googleusercontent.com/avatar_test2.jpg",
        "verified_email": True,
    }
    with patch("app.routers.auth.exchange_code_for_user_info", new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = mock_user_info2
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            res = await client.get("/api/v1/auth/google/callback?code=mock_code_2&format=json")
            assert res.status_code == 200
            data = res.json()
            assert "profile_completed" in data
            assert data["profile_completed"] is False
            assert data["user"]["profile_completed"] is False


@pytest.mark.asyncio
async def test_otp_user_onboarding_persistence_across_sessions():
    """Test scenario required by user:
    User A:
    1. Register/Login with OTP (returns profile_completed=False)
    2. Complete profile setup (saves to DB, returns profile_completed=True)
    3. Logout
    4. Login again with same email OTP (must return profile_completed=True directly)
    """
    from datetime import datetime, timezone, timedelta
    from app.models.email_otp import EmailOTP
    from app.routers.auth import _hash_otp

    test_email = f"user_a_{uuid.uuid4().hex[:8]}@example.com"
    otp_code_1 = "654321"

    # Step 1: User A registers/logs in via OTP for the first time
    async with async_session_maker() as session:
        otp_rec1 = EmailOTP(
            email=test_email,
            hashed_otp=_hash_otp(otp_code_1),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempts=0,
            is_used=False,
        )
        session.add(otp_rec1)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Verify first OTP
        res1 = await client.post(
            "/api/v1/auth/verify-otp",
            json={"email": test_email, "otp": otp_code_1},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["profile_completed"] is False
        token1 = data1["access_token"]

        # Step 2: Complete profile setup
        unique_handle = f"user_a_{uuid.uuid4().hex[:6]}"
        setup_res = await client.post(
            "/api/v1/auth/profile-setup",
            json={
                "full_name": "User Alpha",
                "username": unique_handle,
                "avatar_url": "data:image/svg+xml;utf8,<svg>test</svg>",
                "goal": "Build Production Apps",
                "level": "Advanced",
                "primary_focus": ["AI & Agents", "Full-Stack Web"],
            },
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert setup_res.status_code == 200
        setup_data = setup_res.json()
        assert setup_data["profile_completed"] is True
        assert setup_data["user"]["profile_completed"] is True

        # Step 3: Logout (session discarded)

        # Step 4: Login again with same email OTP
        otp_code_2 = "987654"
        async with async_session_maker() as session:
            otp_rec2 = EmailOTP(
                email=test_email,
                hashed_otp=_hash_otp(otp_code_2),
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
                attempts=0,
                is_used=False,
            )
            session.add(otp_rec2)
            await session.commit()

        res2 = await client.post(
            "/api/v1/auth/verify-otp",
            json={"email": test_email, "otp": otp_code_2},
        )
        assert res2.status_code == 200
        data2 = res2.json()
        # MUST BE TRUE DIRECTLY TO DASHBOARD!
        assert data2["profile_completed"] is True
        assert data2["user"]["profile_completed"] is True
        assert data2["user"]["username"] == unique_handle
        assert data2["user"]["full_name"] == "User Alpha"
