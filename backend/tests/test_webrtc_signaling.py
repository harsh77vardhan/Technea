import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from starlette.testclient import TestClient

from app.core.security import create_access_token
from app.db.session import async_session_maker, engine
from app.main import app
from app.models.community import LearningRoom
from app.models.user import User


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_webrtc_ice_servers_and_websocket_pipeline():
    """Test full WebRTC signaling pipeline:
    1. ICE servers endpoint returns STUN servers
    2. Two users connect to the room signaling WebSocket
    3. User A & User B exchange SDP offer, answer, and ICE candidates
    4. Media status synchronization
    5. Clean disconnect and peer-left broadcast
    """
    async with async_session_maker() as session:
        user_a = User(
            email=f"user_a_{uuid.uuid4().hex[:8]}@technea.in",
            username=f"user_a_{uuid.uuid4().hex[:8]}",
            hashed_password="hashed_pwd_placeholder",
            full_name="User A Learner",
            is_active=True,
        )
        user_b = User(
            email=f"user_b_{uuid.uuid4().hex[:8]}@technea.in",
            username=f"user_b_{uuid.uuid4().hex[:8]}",
            hashed_password="hashed_pwd_placeholder",
            full_name="User B Learner",
            is_active=True,
        )
        session.add(user_a)
        session.add(user_b)
        await session.commit()
        await session.refresh(user_a)
        await session.refresh(user_b)

        room = LearningRoom(
            name="WebRTC Test Room",
            slug=f"webrtc-test-{uuid.uuid4().hex[:8]}",
            description="WebRTC signaling test room",
            topic="WebRTC Audio & Video",
            is_private=False,
            created_by_id=user_a.id,
        )
        session.add(room)
        await session.commit()
        await session.refresh(room)

    token_a = create_access_token(subject=str(user_a.id))
    token_b = create_access_token(subject=str(user_b.id))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test ICE servers endpoint
        res = await client.get(
            f"/api/v1/community/rooms/{room.id}/ice-servers",
            headers={"Authorization": f"Bearer {token_a}"},
        )
        assert res.status_code == 200
        ice_data = res.json()
        assert "iceServers" in ice_data
        assert any("stun.l.google.com" in str(s) for s in ice_data["iceServers"])

    # Test WebSocket signaling using starlette test client / websocket
    with TestClient(app) as test_client:
        with test_client.websocket_connect(
            f"/api/v1/community/rooms/{room.id}/ws?token={token_a}"
        ) as ws_a:
            welcome_a = ws_a.receive_json()
            assert welcome_a["type"] == "welcome"
            assert welcome_a["user_id"] == str(user_a.id)
            assert len(welcome_a["peers"]) == 0

            with test_client.websocket_connect(
                f"/api/v1/community/rooms/{room.id}/ws?token={token_b}"
            ) as ws_b:
                welcome_b = ws_b.receive_json()
                assert welcome_b["type"] == "welcome"
                assert welcome_b["user_id"] == str(user_b.id)
                assert len(welcome_b["peers"]) == 1
                assert welcome_b["peers"][0]["user_id"] == str(user_a.id)

                joined_a = ws_a.receive_json()
                assert joined_a["type"] == "peer-joined"
                assert joined_a["user_id"] == str(user_b.id)

                # User B sends SDP Offer to User A
                dummy_offer = {"type": "offer", "sdp": "v=0\r\no=dummy 123 456..."}
                ws_b.send_json({
                    "type": "offer",
                    "target_user_id": str(user_a.id),
                    "sdp": dummy_offer,
                })

                offer_received = ws_a.receive_json()
                assert offer_received["type"] == "offer"
                assert offer_received["from_user_id"] == str(user_b.id)
                assert offer_received["target_user_id"] == str(user_a.id)
                assert offer_received["sdp"] == dummy_offer

                # User A sends SDP Answer back to User B
                dummy_answer = {"type": "answer", "sdp": "v=0\r\no=dummy 789 101..."}
                ws_a.send_json({
                    "type": "answer",
                    "target_user_id": str(user_b.id),
                    "sdp": dummy_answer,
                })

                answer_received = ws_b.receive_json()
                assert answer_received["type"] == "answer"
                assert answer_received["from_user_id"] == str(user_a.id)
                assert answer_received["sdp"] == dummy_answer

                # User B sends ICE Candidate to User A
                dummy_candidate = {"candidate": "candidate:1 1 UDP 2130706431 192.168.1.1 50000 typ host"}
                ws_b.send_json({
                    "type": "ice-candidate",
                    "target_user_id": str(user_a.id),
                    "candidate": dummy_candidate,
                })

                candidate_received = ws_a.receive_json()
                assert candidate_received["type"] == "ice-candidate"
                assert candidate_received["from_user_id"] == str(user_b.id)
                assert candidate_received["candidate"] == dummy_candidate

                # User A toggles Camera & Mute (media-status)
                ws_a.send_json({
                    "type": "media-status",
                    "is_audio_active": True,
                    "is_muted": True,
                    "is_video_active": True,
                    "is_screen_sharing": False,
                })

                status_received = ws_b.receive_json()
                assert status_received["type"] == "media-status"
                assert status_received["user_id"] == str(user_a.id)
                assert status_received["is_muted"] is True
                assert status_received["is_video_active"] is True

            # User B exited the context, triggering disconnect
            left_received = ws_a.receive_json()
            assert left_received["type"] == "peer-left"
            assert left_received["user_id"] == str(user_b.id)
