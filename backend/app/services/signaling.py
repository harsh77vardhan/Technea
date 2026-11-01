"""Real-time WebRTC Signaling Manager for Collaborative Study Rooms.

Provides full-duplex WebSocket communication for WebRTC mesh topology:
- Room peer presence tracking
- SDP Offer / Answer relaying
- ICE Candidate exchange
- Real-time media state synchronization (mute, camera, screen share)
- Graceful disconnect and leak prevention
"""

import asyncio
import json
import logging
import uuid
from typing import Any
from fastapi import WebSocket

logger = logging.getLogger("technea.signaling")


class SignalingManager:
    """In-memory connection and message router for WebRTC signaling."""

    def __init__(self) -> None:
        # room_id -> { user_id: WebSocket }
        self._rooms: dict[int, dict[uuid.UUID, WebSocket]] = {}
        # room_id -> { user_id: { user_id, user_name, avatar_url, is_audio_active, is_muted, is_video_active, is_screen_sharing } }
        self._peer_meta: dict[int, dict[uuid.UUID, dict[str, Any]]] = {}
        self._lock = asyncio.Lock()

    async def connect(
        self,
        room_id: int,
        user_id: uuid.UUID,
        websocket: WebSocket,
        user_info: dict[str, Any],
    ) -> None:
        """Register a connected WebSocket peer in a room."""
        await websocket.accept()
        async with self._lock:
            if room_id not in self._rooms:
                self._rooms[room_id] = {}
                self._peer_meta[room_id] = {}

            self._rooms[room_id][user_id] = websocket
            self._peer_meta[room_id][user_id] = {
                "user_id": str(user_id),
                "user_name": user_info.get("full_name") or "Learner",
                "avatar_url": user_info.get("avatar_url"),
                "is_audio_active": True,
                "is_muted": False,
                "is_video_active": False,
                "is_screen_sharing": False,
            }
        logger.info(
            "Peer %s connected to room %s via WebSocket (Total peers in room: %d)",
            user_id,
            room_id,
            len(self._rooms[room_id]),
        )

    async def disconnect(self, room_id: int, user_id: uuid.UUID) -> dict[str, Any] | None:
        """Unregister a peer and return their metadata if they were connected."""
        removed_meta = None
        async with self._lock:
            if room_id in self._rooms:
                self._rooms[room_id].pop(user_id, None)
            if room_id in self._peer_meta:
                removed_meta = self._peer_meta[room_id].pop(user_id, None)

            if room_id in self._rooms and not self._rooms[room_id]:
                del self._rooms[room_id]
                self._peer_meta.pop(room_id, None)

        if removed_meta:
            logger.info("Peer %s disconnected from room %s", user_id, room_id)
        return removed_meta

    async def get_room_peers(self, room_id: int, exclude_user_id: uuid.UUID | None = None) -> list[dict[str, Any]]:
        """Return list of active peer metadata currently in the room."""
        async with self._lock:
            peers_dict = self._peer_meta.get(room_id, {})
            return [
                meta.copy()
                for uid, meta in peers_dict.items()
                if exclude_user_id is None or uid != exclude_user_id
            ]

    async def update_peer_media_status(
        self,
        room_id: int,
        user_id: uuid.UUID,
        is_audio_active: bool,
        is_muted: bool,
        is_video_active: bool,
        is_screen_sharing: bool,
    ) -> dict[str, Any] | None:
        """Update media state flags for an active peer."""
        async with self._lock:
            if room_id in self._peer_meta and user_id in self._peer_meta[room_id]:
                meta = self._peer_meta[room_id][user_id]
                meta["is_audio_active"] = is_audio_active
                meta["is_muted"] = is_muted
                meta["is_video_active"] = is_video_active
                meta["is_screen_sharing"] = is_screen_sharing
                return meta.copy()
        return None

    async def send_to_peer(
        self,
        room_id: int,
        target_user_id: uuid.UUID,
        message: dict[str, Any],
    ) -> bool:
        """Send message directly to a specific peer."""
        ws: WebSocket | None = None
        async with self._lock:
            if room_id in self._rooms:
                ws = self._rooms[room_id].get(target_user_id)

        if ws:
            try:
                await ws.send_text(json.dumps(message))
                return True
            except Exception as exc:
                logger.warning(
                    "Failed to deliver signal to peer %s in room %s: %s",
                    target_user_id,
                    room_id,
                    exc,
                )
                await self.disconnect(room_id, target_user_id)
        return False

    async def broadcast(
        self,
        room_id: int,
        message: dict[str, Any],
        exclude_user_id: uuid.UUID | None = None,
    ) -> None:
        """Broadcast a message to all connected peers in a room."""
        receivers: list[tuple[uuid.UUID, WebSocket]] = []
        async with self._lock:
            if room_id in self._rooms:
                for uid, ws in self._rooms[room_id].items():
                    if exclude_user_id is None or uid != exclude_user_id:
                        receivers.append((uid, ws))

        if not receivers:
            return

        payload = json.dumps(message)
        dead_peers: list[uuid.UUID] = []

        for uid, ws in receivers:
            try:
                await ws.send_text(payload)
            except Exception as exc:
                logger.warning(
                    "Error broadcasting to peer %s in room %s: %s",
                    uid,
                    room_id,
                    exc,
                )
                dead_peers.append(uid)

        for uid in dead_peers:
            await self.disconnect(room_id, uid)


# Singleton instance
signaling_manager = SignalingManager()
