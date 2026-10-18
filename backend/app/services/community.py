"""Service handling Community Learning Rooms and Peer Guilds."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.community import LearningRoom, UserLearningRoom
from app.schemas.community import JoinRoomResponse, LearningRoomResponse


class CommunityService:
    """Service handling learning rooms discovery and peer memberships."""

    async def get_rooms(
        self,
        db: AsyncSession,
        user_id: uuid.UUID | None = None,
    ) -> list[LearningRoomResponse]:
        """Fetch all learning rooms with user membership status."""
        stmt = select(LearningRoom).order_by(desc(LearningRoom.active_learners_count))
        res = await db.execute(stmt)
        rooms = list(res.scalars().all())

        joined_room_ids: dict[int, datetime] = {}
        if user_id:
            ulr_stmt = select(UserLearningRoom).where(UserLearningRoom.user_id == user_id)
            ulr_res = await db.execute(ulr_stmt)
            for ulr in ulr_res.scalars().all():
                joined_room_ids[ulr.room_id] = ulr.joined_at

        return [
            LearningRoomResponse(
                id=r.id,
                name=r.name,
                slug=r.slug,
                description=r.description,
                category=r.category,
                active_learners_count=r.active_learners_count,
                icon=r.icon,
                is_joined=r.id in joined_room_ids,
                joined_at=joined_room_ids.get(r.id),
            )
            for r in rooms
        ]

    async def toggle_room_membership(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        room_id: int,
    ) -> JoinRoomResponse:
        """Join or leave a learning room and update membership tally."""
        r_stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        r_res = await db.execute(r_stmt)
        room = r_res.scalar_one_or_none()
        if not room:
            raise ValueError("Learning room not found.")

        m_stmt = select(UserLearningRoom).where(
            UserLearningRoom.user_id == user_id,
            UserLearningRoom.room_id == room_id,
        )
        m_res = await db.execute(m_stmt)
        membership = m_res.scalar_one_or_none()

        if membership:
            # Leave room
            await db.delete(membership)
            room.active_learners_count = max(0, room.active_learners_count - 1)
            await db.commit()
            return JoinRoomResponse(
                room_id=room.id,
                is_joined=False,
                active_learners_count=room.active_learners_count,
                message=f"You have left {room.name}.",
            )
        else:
            # Join room
            now = datetime.now(timezone.utc)
            new_membership = UserLearningRoom(
                user_id=user_id,
                room_id=room_id,
                joined_at=now,
            )
            db.add(new_membership)
            room.active_learners_count += 1
            await db.commit()
            return JoinRoomResponse(
                room_id=room.id,
                is_joined=True,
                active_learners_count=room.active_learners_count,
                message=f"Welcome to {room.name}! You are now connected with active peers.",
            )

    async def get_user_rooms(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[LearningRoomResponse]:
        """Fetch all rooms joined by the user."""
        stmt = (
            select(LearningRoom, UserLearningRoom.joined_at)
            .join(UserLearningRoom, LearningRoom.id == UserLearningRoom.room_id)
            .where(UserLearningRoom.user_id == user_id)
            .order_by(desc(UserLearningRoom.joined_at))
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            LearningRoomResponse(
                id=r.id,
                name=r.name,
                slug=r.slug,
                description=r.description,
                category=r.category,
                active_learners_count=r.active_learners_count,
                icon=r.icon,
                is_joined=True,
                joined_at=joined_at,
            )
            for r, joined_at in rows
        ]


community_service = CommunityService()
