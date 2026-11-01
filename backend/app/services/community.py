"""Service handling Community Learning Rooms and Study Rooms."""

from datetime import datetime, timezone
import re
import secrets
from typing import Any
import uuid

from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.community import (
    LearningRoom,
    RoomMessage,
    RoomNotification,
    RoomQuestion,
    RoomQuestionReply,
    RoomResource,
    RoomSessionHistory,
    RoomSharedNote,
    UserLearningRoom,
)
from app.models.user import User
from app.schemas.community import (
    CreateQuestionReplyRequest,
    CreateQuestionRequest,
    CreateResourceRequest,
    CreateRoomRequest,
    JoinRoomResponse,
    LearningRoomResponse,
    RoomMemberResponse,
    RoomMessageResponse,
    RoomNotificationResponse,
    RoomQuestionReplyResponse,
    RoomQuestionResponse,
    RoomResourceResponse,
    SessionHistoryResponse,
    ShareContentRequest,
    SharedNoteResponse,
    StartStudySessionRequest,
    UpdateSharedNoteRequest,
    UpdateStudyStatusRequest,
)


def _slugify(text: str) -> str:
    """Generate URL-safe slug from title/name."""
    s = text.lower().strip().replace("&", "and").replace("/", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:80]


def _generate_invite_code() -> str:
    """Generate a clean, readable invite code like TECH-7B42."""
    suffix = secrets.token_hex(2).upper()
    return f"TECH-{suffix}"


class CommunityService:
    """Service handling learning rooms discovery, study sessions, and peer interactions."""

    def _format_room_response(
        self,
        room: LearningRoom,
        is_joined: bool = False,
        joined_at: datetime | None = None,
        recommendation_reason: str | None = None,
    ) -> LearningRoomResponse:
        """Helper to format a LearningRoom ORM instance into Pydantic schema."""
        return LearningRoomResponse(
            id=room.id,
            name=room.name,
            slug=room.slug,
            description=room.description,
            category=room.category,
            topic=getattr(room, "topic", "General") or "General",
            roadmap_name=getattr(room, "roadmap_name", None),
            is_private=getattr(room, "is_private", False) or False,
            invite_code=getattr(room, "invite_code", None),
            max_members=getattr(room, "max_members", 50) or 50,
            created_by_id=getattr(room, "created_by_id", None),
            active_learners_count=room.active_learners_count,
            icon=room.icon,
            is_joined=is_joined,
            joined_at=joined_at,
            study_session_active=getattr(room, "study_session_active", False) or False,
            study_session_topic=getattr(room, "study_session_topic", None),
            study_session_started_at=getattr(room, "study_session_started_at", None),
            study_session_host_id=getattr(room, "study_session_host_id", None),
            study_session_host_name=getattr(room, "study_session_host_name", None),
            study_session_timer_type=getattr(room, "study_session_timer_type", "pomodoro") or "pomodoro",
            study_session_timer_mode=getattr(room, "study_session_timer_mode", "study") or "study",
            study_session_duration_minutes=getattr(room, "study_session_duration_minutes", 25) or 25,
            recommendation_reason=recommendation_reason,
        )

    async def get_rooms(
        self,
        db: AsyncSession,
        user_id: uuid.UUID | None = None,
        search: str | None = None,
        category: str | None = None,
        topic: str | None = None,
        roadmap: str | None = None,
        is_private: bool | None = None,
    ) -> list[LearningRoomResponse]:
        """Fetch learning rooms with optional search and filters."""
        stmt = select(LearningRoom)

        # Filters
        conditions = []
        if search:
            q = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(LearningRoom.name).ilike(q),
                    func.lower(LearningRoom.description).ilike(q),
                    func.lower(LearningRoom.topic).ilike(q),
                    func.lower(LearningRoom.category).ilike(q),
                    func.lower(LearningRoom.roadmap_name).ilike(q),
                )
            )

        if category and category != "all":
            conditions.append(func.lower(LearningRoom.category) == category.strip().lower())

        if topic and topic != "all":
            conditions.append(func.lower(LearningRoom.topic).ilike(f"%{topic.strip().lower()}%"))

        if roadmap and roadmap != "all":
            conditions.append(func.lower(LearningRoom.roadmap_name).ilike(f"%{roadmap.strip().lower()}%"))

        if is_private is not None:
            conditions.append(LearningRoom.is_private == is_private)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        # Order by active study session first, then active learners, then ID
        stmt = stmt.order_by(
            desc(LearningRoom.study_session_active),
            desc(LearningRoom.active_learners_count),
            desc(LearningRoom.id),
        )
        res = await db.execute(stmt)
        rooms = list(res.scalars().all())

        # Get membership status for current user
        joined_room_ids: dict[int, datetime] = {}
        if user_id:
            ulr_stmt = select(UserLearningRoom).where(UserLearningRoom.user_id == user_id)
            ulr_res = await db.execute(ulr_stmt)
            for ulr in ulr_res.scalars().all():
                joined_room_ids[ulr.room_id] = ulr.joined_at

        return [
            self._format_room_response(
                r,
                is_joined=r.id in joined_room_ids,
                joined_at=joined_room_ids.get(r.id),
            )
            for r in rooms
        ]

    async def get_recommended_rooms(
        self,
        db: AsyncSession,
        user_id: uuid.UUID | None = None,
        active_roadmap: str | None = None,
        current_milestone: str | None = None,
        skills: list[str] | str | None = None,
        interests: str | None = None,
    ) -> list[LearningRoomResponse]:
        """Recommend rooms matching active roadmap, current milestone, skills, or learning goals."""
        all_rooms_stmt = select(LearningRoom).order_by(desc(LearningRoom.active_learners_count))
        res = await db.execute(all_rooms_stmt)
        rooms = list(res.scalars().all())

        joined_room_ids: dict[int, datetime] = {}
        user_goal = ""
        user_interests = ""
        if user_id:
            ulr_stmt = select(UserLearningRoom).where(UserLearningRoom.user_id == user_id)
            ulr_res = await db.execute(ulr_stmt)
            for ulr in ulr_res.scalars().all():
                joined_room_ids[ulr.room_id] = ulr.joined_at

            # Fetch user learning goal / interests
            u_stmt = select(User).where(User.id == user_id)
            u_res = await db.execute(u_stmt)
            curr_user = u_res.scalar_one_or_none()
            if curr_user:
                user_goal = curr_user.learning_goal or ""
                user_interests = curr_user.interests or ""

        # Extract context tags from current milestone, active roadmap, or user profile
        search_terms: list[tuple[str, str]] = []  # (term, reason_template)

        # 1. Highest priority: Current Milestone
        if current_milestone and current_milestone.strip():
            cm_clean = current_milestone.strip()
            cm_lower = cm_clean.lower()
            search_terms.append((cm_lower, f"Matches your current milestone: {cm_clean}"))
            for word in cm_lower.split():
                if len(word) > 3 and word not in ["module", "basics", "lesson", "chapter", "intro", "practice"]:
                    search_terms.append((word, f"You are studying: {cm_clean}"))

        # 2. Priority: Active Roadmap
        target_roadmap = active_roadmap or user_goal
        if target_roadmap:
            tr_lower = target_roadmap.lower()
            if "python" in tr_lower:
                search_terms.append(("python", "Because you are learning Python"))
            if "react" in tr_lower or "frontend" in tr_lower:
                search_terms.append(("frontend", "Because you are learning Frontend"))
                search_terms.append(("react", "Because you are learning React"))
            if "backend" in tr_lower or "api" in tr_lower:
                search_terms.append(("backend", "Because you are learning Backend Architecture"))
            if "ai" in tr_lower or "machine learning" in tr_lower or "ml" in tr_lower:
                search_terms.append(("ai", "Because you are studying AI & Machine Learning"))
            if "devops" in tr_lower or "cloud" in tr_lower or "docker" in tr_lower:
                search_terms.append(("devops", "Because you are studying Cloud & DevOps"))
            if "dsa" in tr_lower or "algorithm" in tr_lower or "data structure" in tr_lower:
                search_terms.append(("algorithm", "Because you are practicing Data Structures"))
            # Fallback general match
            search_terms.append((target_roadmap.split()[0].lower(), f"Matching your active roadmap '{target_roadmap}'"))

        # 3. Skills
        if skills:
            skill_list = skills if isinstance(skills, list) else [s.strip() for s in str(skills).split(",") if s.strip()]
            for sk in skill_list:
                if len(sk) > 1:
                    search_terms.append((sk.lower(), f"Matches your skill: {sk}"))

        # 4. Interests
        combined_interests = f"{interests or ''},{user_interests or ''}".strip(",")
        if combined_interests:
            for piece in combined_interests.split(","):
                p_clean = piece.strip().lower()
                if p_clean and len(p_clean) > 2:
                    search_terms.append((p_clean, f"Based on your interest in {piece.strip()}"))

        recommended: list[LearningRoomResponse] = []
        seen_ids = set()

        for term, reason in search_terms:
            for r in rooms:
                if r.id in seen_ids:
                    continue
                name_l = r.name.lower()
                topic_l = (r.topic or "").lower()
                cat_l = r.category.lower()
                desc_l = r.description.lower()
                rm_l = (r.roadmap_name or "").lower()

                if term in name_l or term in topic_l or term in cat_l or term in desc_l or term in rm_l:
                    seen_ids.add(r.id)
                    recommended.append(
                        self._format_room_response(
                            r,
                            is_joined=r.id in joined_room_ids,
                            joined_at=joined_room_ids.get(r.id),
                            recommendation_reason=reason,
                        )
                    )

        # If we have fewer than 4 recommendations, backfill with top active public rooms
        for r in rooms:
            if len(recommended) >= 4:
                break
            if r.id not in seen_ids and not getattr(r, "is_private", False):
                seen_ids.add(r.id)
                recommended.append(
                    self._format_room_response(
                        r,
                        is_joined=r.id in joined_room_ids,
                        joined_at=joined_room_ids.get(r.id),
                        recommendation_reason="Popular with active Technea learners",
                    )
                )

        return recommended

    async def create_room(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        room_data: CreateRoomRequest,
    ) -> LearningRoomResponse:
        """Create a new public or private study room and register creator."""
        base_slug = _slugify(room_data.name)
        slug = base_slug

        # Ensure unique slug
        chk = await db.execute(select(LearningRoom).where(LearningRoom.slug == slug))
        if chk.scalar_one_or_none():
            slug = f"{base_slug}-{secrets.token_hex(2)}"

        invite_code = _generate_invite_code()
        # Verify invite_code is unique
        chk_code = await db.execute(select(LearningRoom).where(LearningRoom.invite_code == invite_code))
        if chk_code.scalar_one_or_none():
            invite_code = f"TECH-{secrets.token_hex(3).upper()}"

        new_room = LearningRoom(
            name=room_data.name.strip(),
            slug=slug,
            description=room_data.description.strip() or f"Collaborative study room for {room_data.topic}.",
            category=room_data.category.strip() or "General",
            topic=room_data.topic.strip(),
            roadmap_name=room_data.roadmap_name.strip() if room_data.roadmap_name else None,
            is_private=room_data.is_private,
            invite_code=invite_code,
            max_members=room_data.max_members,
            created_by_id=user_id,
            active_learners_count=1,
            icon=room_data.icon or "users",
        )
        db.add(new_room)
        await db.flush()

        # Add creator as first member
        now = datetime.now(timezone.utc)
        creator_membership = UserLearningRoom(
            user_id=user_id,
            room_id=new_room.id,
            joined_at=now,
            study_status="Online & Hosting Room",
        )
        db.add(creator_membership)

        # Lookup creator name for welcome message
        u_res = await db.execute(select(User).where(User.id == user_id))
        user_obj = u_res.scalar_one_or_none()
        user_name = user_obj.full_name or user_obj.email.split("@")[0] if user_obj else "Host"

        # Welcome message in discussion chat
        welcome_msg = RoomMessage(
            room_id=new_room.id,
            user_id=user_id,
            content=f"Welcome to {new_room.name}! This room was created by {user_name} for collaborative learning.",
            message_type="system",
        )
        db.add(welcome_msg)

        await db.commit()
        await db.refresh(new_room)

        return self._format_room_response(
            new_room,
            is_joined=True,
            joined_at=now,
        )

    async def join_room_by_code(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        code_input: str,
    ) -> JoinRoomResponse:
        """Join a room using its unique invite code, slug, or ID."""
        cleaned = code_input.strip()
        # Handle full URL if user pasted an invite link (e.g. /rooms/join/TECH-1234)
        if "/" in cleaned:
            cleaned = cleaned.split("/")[-1].strip()

        stmt = select(LearningRoom).where(
            or_(
                func.upper(LearningRoom.invite_code) == cleaned.upper(),
                func.lower(LearningRoom.slug) == cleaned.lower(),
            )
        )
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()

        if not room:
            # Try numeric ID lookup
            if cleaned.isdigit():
                r_id = int(cleaned)
                id_stmt = select(LearningRoom).where(LearningRoom.id == r_id)
                id_res = await db.execute(id_stmt)
                room = id_res.scalar_one_or_none()

        if not room:
            raise ValueError(f"No study room found matching code '{code_input}'. Please check and try again.")

        # Check existing membership
        m_stmt = select(UserLearningRoom).where(
            UserLearningRoom.user_id == user_id,
            UserLearningRoom.room_id == room.id,
        )
        m_res = await db.execute(m_stmt)
        existing = m_res.scalar_one_or_none()

        if existing:
            return JoinRoomResponse(
                room_id=room.id,
                is_joined=True,
                active_learners_count=room.active_learners_count,
                message=f"You are already a member of {room.name}.",
                room=self._format_room_response(room, is_joined=True, joined_at=existing.joined_at),
            )

        # Check maximum capacity
        if room.active_learners_count >= getattr(room, "max_members", 50):
            raise ValueError(f"Room has reached maximum capacity ({room.max_members} members).")

        now = datetime.now(timezone.utc)
        new_membership = UserLearningRoom(
            user_id=user_id,
            room_id=room.id,
            joined_at=now,
            study_status="Ready to study",
        )
        db.add(new_membership)
        room.active_learners_count += 1

        # Post system message
        u_res = await db.execute(select(User).where(User.id == user_id))
        user_obj = u_res.scalar_one_or_none()
        user_name = user_obj.full_name or user_obj.email.split("@")[0] if user_obj else "A learner"

        join_msg = RoomMessage(
            room_id=room.id,
            user_id=user_id,
            content=f"{user_name} joined the study room via invite code.",
            message_type="system",
        )
        db.add(join_msg)

        await db.commit()
        await db.refresh(room)

        return JoinRoomResponse(
            room_id=room.id,
            is_joined=True,
            active_learners_count=room.active_learners_count,
            message=f"Successfully joined {room.name}!",
            room=self._format_room_response(room, is_joined=True, joined_at=now),
        )

    async def toggle_room_membership(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        room_id: int,
    ) -> JoinRoomResponse:
        """Join or leave a learning room."""
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
                room=self._format_room_response(room, is_joined=False),
            )
        else:
            # Join room
            if room.active_learners_count >= getattr(room, "max_members", 50):
                raise ValueError(f"Room has reached maximum capacity ({room.max_members} members).")

            now = datetime.now(timezone.utc)
            new_membership = UserLearningRoom(
                user_id=user_id,
                room_id=room_id,
                joined_at=now,
                study_status="Ready to study",
            )
            db.add(new_membership)
            room.active_learners_count += 1

            # System message
            u_res = await db.execute(select(User).where(User.id == user_id))
            user_obj = u_res.scalar_one_or_none()
            user_name = user_obj.full_name or user_obj.email.split("@")[0] if user_obj else "A learner"

            sys_msg = RoomMessage(
                room_id=room.id,
                user_id=user_id,
                content=f"{user_name} joined the room.",
                message_type="system",
            )
            db.add(sys_msg)

            await db.commit()
            return JoinRoomResponse(
                room_id=room.id,
                is_joined=True,
                active_learners_count=room.active_learners_count,
                message=f"Welcome to {room.name}! You are now connected with active peers.",
                room=self._format_room_response(room, is_joined=True, joined_at=now),
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
            self._format_room_response(r, is_joined=True, joined_at=joined_at)
            for r, joined_at in rows
        ]

    async def get_room_by_id_or_slug(
        self,
        db: AsyncSession,
        room_id_or_slug: str,
        user_id: uuid.UUID | None = None,
    ) -> LearningRoomResponse:
        """Fetch a single room's details."""
        if room_id_or_slug.isdigit():
            stmt = select(LearningRoom).where(LearningRoom.id == int(room_id_or_slug))
        else:
            stmt = select(LearningRoom).where(LearningRoom.slug == room_id_or_slug)

        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError(f"Study room '{room_id_or_slug}' not found.")

        is_joined = False
        joined_at = None
        if user_id:
            m_stmt = select(UserLearningRoom).where(
                UserLearningRoom.user_id == user_id,
                UserLearningRoom.room_id == room.id,
            )
            m_res = await db.execute(m_stmt)
            mem = m_res.scalar_one_or_none()
            if mem:
                is_joined = True
                joined_at = mem.joined_at

        return self._format_room_response(room, is_joined=is_joined, joined_at=joined_at)

    async def get_room_members(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[RoomMemberResponse]:
        """Fetch members belonging to a room with their study status and state."""
        stmt = (
            select(UserLearningRoom, User)
            .join(User, UserLearningRoom.user_id == User.id)
            .where(UserLearningRoom.room_id == room_id)
            .order_by(desc(UserLearningRoom.joined_at))
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            RoomMemberResponse(
                user_id=u.id,
                full_name=u.full_name,
                email=u.email,
                avatar_url=u.avatar_url,
                joined_at=ulr.joined_at,
                study_status=ulr.study_status,
                study_state=getattr(ulr, "study_state", "studying") or "studying",
            )
            for ulr, u in rows
        ]

    async def update_study_status(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        study_status: str | None = None,
        study_state: str = "studying",
    ) -> RoomMemberResponse:
        """Update a member's current study status and presence state inside a room."""
        stmt = (
            select(UserLearningRoom, User)
            .join(User, UserLearningRoom.user_id == User.id)
            .where(
                UserLearningRoom.room_id == room_id,
                UserLearningRoom.user_id == user_id,
            )
        )
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise ValueError("You must join this room before setting a study status.")

        ulr, user = row
        if study_status is not None:
            ulr.study_status = study_status.strip() if study_status.strip() else None
        if study_state:
            ulr.study_state = study_state
        await db.commit()

        return RoomMemberResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar_url=user.avatar_url,
            joined_at=ulr.joined_at,
            study_status=ulr.study_status,
            study_state=ulr.study_state,
        )

    async def start_study_session(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        topic: str,
        timer_type: str = "pomodoro",
        timer_mode: str = "study",
        duration_minutes: int = 25,
    ) -> LearningRoomResponse:
        """Start a synchronized study focus session with designated host, goal, and Pomodoro timer."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        u_res = await db.execute(select(User).where(User.id == user_id))
        user_obj = u_res.scalar_one_or_none()
        user_name = user_obj.full_name or user_obj.email.split("@")[0] if user_obj else "Host"

        now = datetime.now(timezone.utc)
        clean_topic = topic.strip()
        room.study_session_active = True
        room.study_session_topic = clean_topic
        room.study_session_started_at = now
        room.study_session_host_id = user_id
        room.study_session_host_name = user_name
        room.study_session_timer_type = timer_type
        room.study_session_timer_mode = timer_mode
        room.study_session_duration_minutes = duration_minutes

        # Add system message in chat
        mode_label = "25m Pomodoro Study" if timer_type == "pomodoro" else f"{duration_minutes}m Sprint"
        sys_msg = RoomMessage(
            room_id=room.id,
            user_id=user_id,
            content=f"🚀 {user_name} is hosting a Live Study Session!\nGoal: {clean_topic} • Duration: {mode_label}. Let's learn together!",
            message_type="system",
        )
        db.add(sys_msg)

        # Create room notification
        notif = RoomNotification(
            room_id=room.id,
            user_id=None,
            actor_name=user_name,
            title="Live Study Session Started",
            message=f"{user_name} is hosting: {clean_topic}",
            notification_type="session_started",
        )
        db.add(notif)

        await db.commit()
        await db.refresh(room)

        return self._format_room_response(room, is_joined=True)

    async def end_study_session(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
    ) -> LearningRoomResponse:
        """End an ongoing study session and log historical record."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        u_res = await db.execute(select(User).where(User.id == user_id))
        user_obj = u_res.scalar_one_or_none()
        user_name = user_obj.full_name or user_obj.email.split("@")[0] if user_obj else "Host"

        now = datetime.now(timezone.utc)

        # Calculate session duration
        duration = 0
        if room.study_session_started_at:
            delta = now - room.study_session_started_at
            duration = max(1, int(delta.total_seconds() // 60))
        else:
            duration = getattr(room, "study_session_duration_minutes", 25) or 25

        # Count active room members
        mem_cnt_stmt = select(func.count(UserLearningRoom.id)).where(UserLearningRoom.room_id == room.id)
        mem_cnt_res = await db.execute(mem_cnt_stmt)
        participants_count = max(1, mem_cnt_res.scalar() or 1)

        # Log to study session history
        history_entry = RoomSessionHistory(
            room_id=room.id,
            host_user_id=room.study_session_host_id or user_id,
            host_name=room.study_session_host_name or user_name,
            topic=room.study_session_topic or "Focused Study Session",
            duration_minutes=duration,
            participants_count=participants_count,
            ended_at=now,
        )
        db.add(history_entry)

        # Reset active session state
        room.study_session_active = False

        # Add system message in chat
        sys_msg = RoomMessage(
            room_id=room.id,
            user_id=user_id,
            content=f"🏁 Study Session concluded by {user_name}. Duration: {duration} mins • {participants_count} participants. Outstanding focus everyone!",
            message_type="system",
        )
        db.add(sys_msg)

        await db.commit()
        await db.refresh(room)

        return self._format_room_response(room, is_joined=True)

    async def get_messages(
        self,
        db: AsyncSession,
        room_id: int,
        limit: int = 60,
    ) -> list[RoomMessageResponse]:
        """Fetch discussion messages for a study room."""
        stmt = (
            select(RoomMessage, User)
            .join(User, RoomMessage.user_id == User.id)
            .where(RoomMessage.room_id == room_id)
            .order_by(RoomMessage.created_at.asc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            RoomMessageResponse(
                id=m.id,
                room_id=m.room_id,
                user_id=u.id,
                user_name=u.full_name or u.email.split("@")[0],
                user_avatar=u.avatar_url,
                content=m.content,
                message_type=m.message_type,
                created_at=m.created_at,
            )
            for m, u in rows
        ]

    async def create_message(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        content: str,
        message_type: str = "chat",
    ) -> RoomMessageResponse:
        """Send a discussion chat message."""
        # Ensure room exists
        r_stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        r_res = await db.execute(r_stmt)
        room = r_res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        # Ensure user is member
        m_stmt = select(UserLearningRoom).where(
            UserLearningRoom.user_id == user_id,
            UserLearningRoom.room_id == room_id,
        )
        m_res = await db.execute(m_stmt)
        if not m_res.scalar_one_or_none():
            # Auto-join if room is public
            if not getattr(room, "is_private", False):
                await self.toggle_room_membership(db, user_id=user_id, room_id=room_id)
            else:
                raise ValueError("You must be an invited member of this private room to post messages.")

        msg = RoomMessage(
            room_id=room_id,
            user_id=user_id,
            content=content.strip(),
            message_type=message_type,
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        # Fetch user
        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one()

        return RoomMessageResponse(
            id=msg.id,
            room_id=msg.room_id,
            user_id=user.id,
            user_name=user.full_name or user.email.split("@")[0],
            user_avatar=user.avatar_url,
            content=msg.content,
            message_type=msg.message_type,
            created_at=msg.created_at,
        )

    async def get_questions(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[RoomQuestionResponse]:
        """Fetch questions with their replies for a room."""
        stmt = (
            select(RoomQuestion)
            .options(
                selectinload(RoomQuestion.user),
                selectinload(RoomQuestion.replies).selectinload(RoomQuestionReply.user),
            )
            .where(RoomQuestion.room_id == room_id)
            .order_by(RoomQuestion.created_at.desc())
        )
        res = await db.execute(stmt)
        questions = res.scalars().all()

        formatted = []
        for q in questions:
            user = q.user
            replies_fmt = [
                RoomQuestionReplyResponse(
                    id=rep.id,
                    question_id=rep.question_id,
                    user_id=rep.user.id,
                    user_name=rep.user.full_name or rep.user.email.split("@")[0],
                    user_avatar=rep.user.avatar_url,
                    content=rep.content,
                    created_at=rep.created_at,
                )
                for rep in q.replies
            ]
            formatted.append(
                RoomQuestionResponse(
                    id=q.id,
                    room_id=q.room_id,
                    user_id=user.id,
                    user_name=user.full_name or user.email.split("@")[0],
                    user_avatar=user.avatar_url,
                    title=q.title,
                    content=q.content,
                    is_resolved=q.is_resolved,
                    created_at=q.created_at,
                    replies_count=len(replies_fmt),
                    replies=replies_fmt,
                )
            )

        return formatted

    async def create_question(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        question_data: CreateQuestionRequest,
    ) -> RoomQuestionResponse:
        """Ask a new question in the study room."""
        q = RoomQuestion(
            room_id=room_id,
            user_id=user_id,
            title=question_data.title.strip(),
            content=question_data.content.strip(),
            is_resolved=False,
        )
        db.add(q)
        await db.commit()
        await db.refresh(q)

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one()

        return RoomQuestionResponse(
            id=q.id,
            room_id=q.room_id,
            user_id=user.id,
            user_name=user.full_name or user.email.split("@")[0],
            user_avatar=user.avatar_url,
            title=q.title,
            content=q.content,
            is_resolved=False,
            created_at=q.created_at,
            replies_count=0,
            replies=[],
        )

    async def create_question_reply(
        self,
        db: AsyncSession,
        room_id: int,
        question_id: int,
        user_id: uuid.UUID,
        reply_data: CreateQuestionReplyRequest,
    ) -> RoomQuestionReplyResponse:
        """Reply to an existing study question."""
        q_stmt = select(RoomQuestion).where(
            RoomQuestion.id == question_id,
            RoomQuestion.room_id == room_id,
        )
        q_res = await db.execute(q_stmt)
        question = q_res.scalar_one_or_none()
        if not question:
            raise ValueError("Question not found in this room.")

        rep = RoomQuestionReply(
            question_id=question_id,
            user_id=user_id,
            content=reply_data.content.strip(),
        )
        db.add(rep)
        await db.commit()
        await db.refresh(rep)

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one()

        return RoomQuestionReplyResponse(
            id=rep.id,
            question_id=rep.question_id,
            user_id=user.id,
            user_name=user.full_name or user.email.split("@")[0],
            user_avatar=user.avatar_url,
            content=rep.content,
            created_at=rep.created_at,
        )

    async def toggle_question_resolved(
        self,
        db: AsyncSession,
        room_id: int,
        question_id: int,
        user_id: uuid.UUID,
    ) -> RoomQuestionResponse:
        """Mark a question as resolved or open."""
        stmt = (
            select(RoomQuestion)
            .options(
                selectinload(RoomQuestion.user),
                selectinload(RoomQuestion.replies).selectinload(RoomQuestionReply.user),
            )
            .where(
                RoomQuestion.id == question_id,
                RoomQuestion.room_id == room_id,
            )
        )
        res = await db.execute(stmt)
        q = res.scalar_one_or_none()
        if not q:
            raise ValueError("Question not found.")

        q.is_resolved = not q.is_resolved
        await db.commit()
        await db.refresh(q)

        user = q.user
        replies_fmt = [
            RoomQuestionReplyResponse(
                id=rep.id,
                question_id=rep.question_id,
                user_id=rep.user.id,
                user_name=rep.user.full_name or rep.user.email.split("@")[0],
                user_avatar=rep.user.avatar_url,
                content=rep.content,
                created_at=rep.created_at,
            )
            for rep in q.replies
        ]

        return RoomQuestionResponse(
            id=q.id,
            room_id=q.room_id,
            user_id=user.id,
            user_name=user.full_name or user.email.split("@")[0],
            user_avatar=user.avatar_url,
            title=q.title,
            content=q.content,
            is_resolved=q.is_resolved,
            created_at=q.created_at,
            replies_count=len(replies_fmt),
            replies=replies_fmt,
        )

    async def get_resources(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[RoomResourceResponse]:
        """Fetch shared learning resources for a room."""
        stmt = (
            select(RoomResource, User)
            .join(User, RoomResource.user_id == User.id)
            .where(RoomResource.room_id == room_id)
            .order_by(RoomResource.created_at.desc())
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            RoomResourceResponse(
                id=r.id,
                room_id=r.room_id,
                user_id=u.id,
                user_name=u.full_name or u.email.split("@")[0],
                user_avatar=u.avatar_url,
                title=r.title,
                resource_type=r.resource_type,
                url_or_content=r.url_or_content,
                description=r.description,
                content_badge=getattr(r, "content_badge", None),
                action_url=getattr(r, "action_url", None),
                created_at=r.created_at,
            )
            for r, u in rows
        ]

    async def create_resource(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        resource_data: CreateResourceRequest,
    ) -> RoomResourceResponse:
        """Share a video, link, note, PDF, or Technea content in the study room."""
        res_obj = RoomResource(
            room_id=room_id,
            user_id=user_id,
            title=resource_data.title.strip(),
            resource_type=resource_data.resource_type,
            url_or_content=resource_data.url_or_content.strip(),
            description=resource_data.description.strip() if resource_data.description else None,
            content_badge=resource_data.content_badge.strip() if resource_data.content_badge else None,
            action_url=resource_data.action_url.strip() if resource_data.action_url else None,
        )
        db.add(res_obj)
        await db.commit()
        await db.refresh(res_obj)

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one()

        return RoomResourceResponse(
            id=res_obj.id,
            room_id=res_obj.room_id,
            user_id=user.id,
            user_name=user.full_name or user.email.split("@")[0],
            user_avatar=user.avatar_url,
            title=res_obj.title,
            resource_type=res_obj.resource_type,
            url_or_content=res_obj.url_or_content,
            description=res_obj.description,
            content_badge=res_obj.content_badge,
            action_url=res_obj.action_url,
            created_at=res_obj.created_at,
        )

    async def share_learning_content(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        content_data: ShareContentRequest,
    ) -> RoomResourceResponse:
        """Share Technea course, lesson, or roadmap step card inside study room."""
        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one()
        user_name = user.full_name or user.email.split("@")[0]

        res_obj = RoomResource(
            room_id=room_id,
            user_id=user_id,
            title=content_data.title.strip(),
            resource_type=content_data.content_type,
            url_or_content=content_data.action_url.strip(),
            description=content_data.description.strip() if content_data.description else None,
            content_badge=content_data.content_badge.strip(),
            action_url=content_data.action_url.strip(),
        )
        db.add(res_obj)

        # Broadcast to room discussion chat
        chat_msg = RoomMessage(
            room_id=room_id,
            user_id=user_id,
            content=f"📌 Shared {content_data.content_badge}: **{content_data.title.strip()}**",
            message_type="chat",
        )
        db.add(chat_msg)

        # Create room notification
        notif = RoomNotification(
            room_id=room_id,
            user_id=None,
            actor_name=user_name,
            title=f"Shared {content_data.content_badge}",
            message=f"{user_name} shared '{content_data.title.strip()}'",
            notification_type="content_shared",
            link_url=content_data.action_url.strip(),
        )
        db.add(notif)

        await db.commit()
        await db.refresh(res_obj)

        return RoomResourceResponse(
            id=res_obj.id,
            room_id=res_obj.room_id,
            user_id=user.id,
            user_name=user_name,
            user_avatar=user.avatar_url,
            title=res_obj.title,
            resource_type=res_obj.resource_type,
            url_or_content=res_obj.url_or_content,
            description=res_obj.description,
            content_badge=res_obj.content_badge,
            action_url=res_obj.action_url,
            created_at=res_obj.created_at,
        )

    async def get_session_history(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[SessionHistoryResponse]:
        """Fetch chronological log of previous study sessions."""
        stmt = (
            select(RoomSessionHistory)
            .where(RoomSessionHistory.room_id == room_id)
            .order_by(desc(RoomSessionHistory.ended_at))
            .limit(30)
        )
        res = await db.execute(stmt)
        records = res.scalars().all()

        return [
            SessionHistoryResponse(
                id=rec.id,
                room_id=rec.room_id,
                host_user_id=rec.host_user_id,
                host_name=rec.host_name,
                topic=rec.topic,
                duration_minutes=rec.duration_minutes,
                participants_count=rec.participants_count,
                ended_at=rec.ended_at,
            )
            for rec in records
        ]

    async def get_shared_note(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> SharedNoteResponse:
        """Fetch or initialize collaborative shared notes for a study room."""
        stmt = select(RoomSharedNote).where(RoomSharedNote.room_id == room_id)
        res = await db.execute(stmt)
        note = res.scalar_one_or_none()

        if not note:
            # Initialize default shared note
            now = datetime.now(timezone.utc)
            note = RoomSharedNote(
                room_id=room_id,
                title="Shared Notes",
                content="### Collaborative Study Notes\n\n- Discussing core concepts & syntax\n- Key takeaways and formulas\n- Code snippets and references\n",
            )
            db.add(note)
            await db.commit()
            await db.refresh(note)

        return SharedNoteResponse(
            id=note.id,
            room_id=note.room_id,
            title=note.title,
            content=note.content,
            last_edited_by_id=note.last_edited_by_id,
            last_edited_by_name=note.last_edited_by_name,
            updated_at=note.updated_at,
        )

    async def save_shared_note(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        note_data: UpdateSharedNoteRequest,
    ) -> SharedNoteResponse:
        """Save updates to collaborative room shared notes."""
        stmt = select(RoomSharedNote).where(RoomSharedNote.room_id == room_id)
        res = await db.execute(stmt)
        note = res.scalar_one_or_none()

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one_or_none()
        user_name = user.full_name or user.email.split("@")[0] if user else "Learner"

        now = datetime.now(timezone.utc)

        if not note:
            note = RoomSharedNote(
                room_id=room_id,
                title=note_data.title.strip() if note_data.title else "Shared Notes",
                content=note_data.content,
                last_edited_by_id=user_id,
                last_edited_by_name=user_name,
            )
            db.add(note)
        else:
            if note_data.title:
                note.title = note_data.title.strip()
            note.content = note_data.content
            note.last_edited_by_id = user_id
            note.last_edited_by_name = user_name
            note.updated_at = now

        # Add lightweight notification
        notif = RoomNotification(
            room_id=room_id,
            user_id=None,
            actor_name=user_name,
            title="Shared Notes Updated",
            message=f"{user_name} updated the room's shared notes.",
            notification_type="note_updated",
        )
        db.add(notif)

        await db.commit()
        await db.refresh(note)

        return SharedNoteResponse(
            id=note.id,
            room_id=note.room_id,
            title=note.title,
            content=note.content,
            last_edited_by_id=note.last_edited_by_id,
            last_edited_by_name=note.last_edited_by_name,
            updated_at=note.updated_at,
        )

    async def get_room_notifications(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID | None = None,
    ) -> list[RoomNotificationResponse]:
        """Fetch latest in-app room notifications."""
        stmt = (
            select(RoomNotification)
            .where(
                RoomNotification.room_id == room_id,
                or_(RoomNotification.user_id.is_(None), RoomNotification.user_id == user_id)
                if user_id
                else RoomNotification.user_id.is_(None),
            )
            .order_by(desc(RoomNotification.created_at))
            .limit(25)
        )
        res = await db.execute(stmt)
        notifs = res.scalars().all()

        return [
            RoomNotificationResponse(
                id=n.id,
                room_id=n.room_id,
                user_id=n.user_id,
                actor_name=n.actor_name,
                title=n.title,
                message=n.message,
                notification_type=n.notification_type,
                link_url=n.link_url,
                is_read=n.is_read,
                created_at=n.created_at,
            )
            for n in notifs
        ]

    async def mark_room_notifications_read(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Mark all room notifications as read."""
        stmt = select(RoomNotification).where(
            RoomNotification.room_id == room_id,
            RoomNotification.is_read.is_(False),
        )
        res = await db.execute(stmt)
        for n in res.scalars().all():
            n.is_read = True
        await db.commit()
        return {"success": True, "message": "Notifications marked as read."}


community_service = CommunityService()

