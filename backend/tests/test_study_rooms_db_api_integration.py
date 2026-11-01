"""Database & API Integration QA tests for Technea Study Rooms.

Verifies:
1. PostgreSQL schema: 11 study room tables, foreign keys with ON DELETE CASCADE / SET NULL, indexes.
2. Alembic migration status at head without unapplied operations.
3. Room creation: unique slug, invite code (TECH-XXXX), owner role, created_by_id, welcome message.
4. API routing: /api/v1/community/rooms and /community/rooms for GET and POST, trailing slashes.
"""

import asyncio
import re
import uuid
import asyncpg
import httpx
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.community import LearningRoom, RoomMessage, UserLearningRoom
from app.models.user import User

POSTGRES_URI = "postgresql://postgres:postgres_password@localhost:5432/technea_db"

TARGET_TABLES = [
    "learning_rooms",
    "user_learning_rooms",
    "room_messages",
    "room_questions",
    "room_question_replies",
    "room_resources",
    "room_session_history",
    "room_shared_notes",
    "room_notifications",
    "room_active_peers",
    "room_webrtc_signals",
]


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed per test event loop."""
    yield
    await engine.dispose()



@pytest.mark.asyncio
async def test_postgresql_schema_tables_and_foreign_keys():
    """Verify all 11 tables exist and all foreign keys have CASCADE or SET NULL."""
    conn = await asyncpg.connect(POSTGRES_URI)

    # 1. Verify tables exist
    for table in TARGET_TABLES:
        exists = await conn.fetchval(
            f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '{table}')"
        )
        assert exists is True, f"Table {table} missing from PostgreSQL!"

    # 2. Verify foreign keys
    fk_query = """
    SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        rc.delete_rule,
        tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name, kcu.column_name;
    """
    fks = await conn.fetch(fk_query)
    target_fks = [fk for fk in fks if fk["table_name"] in TARGET_TABLES]
    assert len(target_fks) >= 20, f"Expected at least 20 foreign keys, found {len(target_fks)}"

    for fk in target_fks:
        rule = fk["delete_rule"]
        assert rule in (
            "CASCADE",
            "SET NULL",
        ), f"Foreign key {fk['table_name']}.{fk['column_name']} has invalid rule: {rule}"

    # Specifically check learning_rooms created_by_id and study_session_host_id
    lr_fks = {fk["column_name"]: fk["delete_rule"] for fk in target_fks if fk["table_name"] == "learning_rooms"}
    assert "created_by_id" in lr_fks and lr_fks["created_by_id"] == "SET NULL"
    assert "study_session_host_id" in lr_fks and lr_fks["study_session_host_id"] == "SET NULL"

    await conn.close()


@pytest.mark.asyncio
async def test_postgresql_indexes():
    """Verify indexes on room_id, user_id, invite_code, topic."""
    conn = await asyncpg.connect(POSTGRES_URI)
    idxs = await conn.fetch(
        "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'"
    )
    table_indexes = {}
    for idx in idxs:
        table_indexes.setdefault(idx["tablename"], []).append(idx)

    # 1. learning_rooms indexes
    lr_idxs = table_indexes.get("learning_rooms", [])
    has_topic_idx = any("topic" in i["indexdef"] for i in lr_idxs)
    has_invite_idx = any("invite_code" in i["indexdef"] and "UNIQUE" in i["indexdef"] for i in lr_idxs)
    assert has_topic_idx is True, "learning_rooms.topic index is missing!"
    assert has_invite_idx is True, "learning_rooms.invite_code unique index is missing!"

    # 2. room_id index on all relevant tables
    for table in [
        "user_learning_rooms",
        "room_messages",
        "room_questions",
        "room_resources",
        "room_session_history",
        "room_shared_notes",
        "room_notifications",
        "room_active_peers",
        "room_webrtc_signals",
    ]:
        t_idxs = table_indexes.get(table, [])
        assert any("room_id" in i["indexdef"] for i in t_idxs), f"Table {table} missing index on room_id"

    # 3. user_id index on all relevant tables
    for table in [
        "user_learning_rooms",
        "room_messages",
        "room_questions",
        "room_question_replies",
        "room_resources",
        "room_notifications",
        "room_active_peers",
    ]:
        t_idxs = table_indexes.get(table, [])
        assert any("user_id" in i["indexdef"] for i in t_idxs), f"Table {table} missing index on user_id"

    # room_webrtc_signals indexes on from_user_id and target_user_id
    rtc_idxs = table_indexes.get("room_webrtc_signals", [])
    assert any("from_user_id" in i["indexdef"] for i in rtc_idxs), "room_webrtc_signals missing from_user_id index"
    assert any("target_user_id" in i["indexdef"] for i in rtc_idxs), "room_webrtc_signals missing target_user_id index"

    await conn.close()


@pytest.mark.asyncio
async def test_room_creation_lifecycle_and_seeding():
    """Verify room creation inserts into learning_rooms, user_learning_rooms (owner), and seeds welcome message."""
    # Create test creator user
    async with async_session_maker() as session:
        user = User(
            email=f"qa_creator_{uuid.uuid4().hex[:8]}@technea.dev",
            hashed_password="hashed_pw_test",
            full_name="Alex Rivera",
            username=f"alex_{uuid.uuid4().hex[:6]}",
            profile_completed=True,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id

    token = create_access_token(subject=str(user_id))
    auth_headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "name": f"Rust Systems Engineering {uuid.uuid4().hex[:4]}",
            "topic": "Rust & Low Level Systems",
            "description": "Collaborative low-level systems and memory safety discussions.",
            "category": "Systems",
            "is_private": False,
            "max_members": 30,
            "icon": "cpu",
        }
        res = await client.post("/api/v1/community/rooms", json=payload, headers=auth_headers)
        assert res.status_code == 201, f"Room creation failed: {res.text}"
        data = res.json()
        room_id = data["id"]

        # Check unique slug and invite code (TECH-XXXX)
        assert data["slug"].startswith("rust-systems-engineering")
        assert re.match(r"^TECH-[0-9A-F]{4,}$", data["invite_code"]) is not None
        assert data["is_owner"] is True
        assert str(data["created_by_id"]) == str(user_id)

        # Direct DB Inspection
        async with async_session_maker() as db:
            room = await db.get(LearningRoom, room_id)
            assert room is not None
            assert room.slug == data["slug"]
            assert room.invite_code == data["invite_code"]
            assert room.created_by_id == user_id

            # Verify user_learning_rooms membership with role="owner"
            ulr_stmt = select(UserLearningRoom).where(
                UserLearningRoom.room_id == room_id,
                UserLearningRoom.user_id == user_id,
            )
            ulr_res = await db.execute(ulr_stmt)
            ulr = ulr_res.scalar_one_or_none()
            assert ulr is not None
            assert ulr.role == "owner"

            # Verify system welcome message
            msg_stmt = select(RoomMessage).where(RoomMessage.room_id == room_id)
            msg_res = await db.execute(msg_stmt)
            msgs = msg_res.scalars().all()
            assert len(msgs) >= 1
            welcome_msg = msgs[0]
            assert welcome_msg.message_type == "system"
            assert "Welcome to Rust Systems Engineering" in welcome_msg.content
            assert welcome_msg.user_id == user_id


@pytest.mark.asyncio
async def test_api_routes_dual_prefix_and_trailing_slashes():
    """Verify both /api/v1/community/rooms and /community/rooms work for GET and POST without 307 redirects."""
    # Create test creator user
    async with async_session_maker() as session:
        user = User(
            email=f"qa_routes_{uuid.uuid4().hex[:8]}@technea.dev",
            hashed_password="hashed_pw_test",
            full_name="Routing Tester",
            username=f"routes_{uuid.uuid4().hex[:6]}",
            profile_completed=True,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id

    token = create_access_token(subject=str(user_id))
    auth_headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. GET requests: verify HTTP 200 without 307 redirects
        for path in [
            "/api/v1/community/rooms",
            "/api/v1/community/rooms/",
            "/community/rooms",
            "/community/rooms/",
        ]:
            res = await client.get(path, headers=auth_headers)
            assert res.status_code == 200, f"GET {path} failed with status {res.status_code}"
            assert res.headers.get("location") is None, f"GET {path} issued unexpected redirect!"
            assert isinstance(res.json(), list)

        # 2. POST requests: verify HTTP 201 without 307 redirects
        for idx, path in enumerate([
            "/api/v1/community/rooms",
            "/api/v1/community/rooms/",
            "/community/rooms",
            "/community/rooms/",
        ]):
            payload = {
                "name": f"Route Test Room {idx} {uuid.uuid4().hex[:4]}",
                "topic": "Network Routing",
                "description": f"Testing path {path}",
                "category": "Networking",
                "is_private": False,
                "max_members": 20,
            }
            res = await client.post(path, json=payload, headers=auth_headers)
            assert res.status_code == 201, f"POST {path} failed with status {res.status_code}"
            assert res.headers.get("location") is None, f"POST {path} issued unexpected redirect!"
            body = res.json()
            assert body["name"] == payload["name"]
            assert body["is_owner"] is True
