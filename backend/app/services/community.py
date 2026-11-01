"""Service handling Community Learning Rooms and Study Rooms."""

from datetime import datetime, timedelta, timezone
import re
import secrets
from typing import Any
import uuid

from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.community import (
    LearningRoom,
    RoomActivePeer,
    RoomMessage,
    RoomNotification,
    RoomQuestion,
    RoomQuestionReply,
    RoomResource,
    RoomSessionHistory,
    RoomSharedNote,
    RoomWebRTCSignal,
    UserLearningRoom,
)
from app.models.user import User
from app.schemas.community import (
    CodeSnippetResponse,
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
    SyncContentResponse,
    UpdateCodeSnippetRequest,
    UpdateMemberRoleRequest,
    UpdateSharedNoteRequest,
    UpdateStudyStatusRequest,
    UpdateSyncContentRequest,
    UpdateWebRTCStatusRequest,
    UpdateWhiteboardRequest,
    WebRTCPeerResponse,
    WebRTCSignalRequest,
    WebRTCSignalResponse,
    WhiteboardResponse,
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
        is_owner: bool = False,
        user_id: uuid.UUID | None = None,
    ) -> LearningRoomResponse:
        """Helper to format a LearningRoom ORM instance into Pydantic schema."""
        owner_flag = is_owner or bool(
            user_id and getattr(room, "created_by_id", None) and room.created_by_id == user_id
        )
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
            is_owner=owner_flag,
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
                user_id=user_id,
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
                            user_id=user_id,
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
                        user_id=user_id,
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
            role="owner",
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
            is_owner=True,
            user_id=user_id,
        )

    async def join_room_by_code(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        code_input: str,
    ) -> JoinRoomResponse:
        """Join a room using its unique invite code, slug, or ID."""
        cleaned = code_input.strip()
        # Handle full URL, query params, or trailing slash (e.g. /rooms/join/TECH-1234/, ?code=TECH-1234)
        if "?" in cleaned:
            from urllib.parse import parse_qs, urlparse
            try:
                parsed = urlparse(cleaned)
                qs = parse_qs(parsed.query)
                if "code" in qs and qs["code"]:
                    cleaned = qs["code"][0].strip()
                else:
                    path_parts = [p for p in parsed.path.split("/") if p]
                    cleaned = path_parts[-1].strip() if path_parts else cleaned
            except Exception:
                cleaned = cleaned.split("?")[0].rstrip("/").split("/")[-1].strip()
        elif "/" in cleaned:
            path_parts = [p for p in cleaned.split("/") if p]
            cleaned = path_parts[-1].strip() if path_parts else cleaned

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
            if getattr(room, "is_private", False):
                raise ValueError("This is a private study room. You must provide an invite code to join.")

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
            self._format_room_response(r, is_joined=True, joined_at=joined_at, user_id=user_id)
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

        return self._format_room_response(room, is_joined=is_joined, joined_at=joined_at, user_id=user_id)

    async def get_room_members(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[RoomMemberResponse]:
        """Fetch members belonging to a room with their study status, presence state, and role."""
        stmt = (
            select(UserLearningRoom, User)
            .join(User, UserLearningRoom.user_id == User.id)
            .where(UserLearningRoom.room_id == room_id)
            .order_by(desc(UserLearningRoom.joined_at))
        )
        res = await db.execute(stmt)
        rows = res.all()

        room_stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        room_res = await db.execute(room_stmt)
        room_obj = room_res.scalar_one_or_none()
        creator_id = room_obj.created_by_id if room_obj else None

        members_list: list[RoomMemberResponse] = []
        for ulr, u in rows:
            assigned_role = getattr(ulr, "role", "member") or "member"
            if creator_id and u.id == creator_id:
                assigned_role = "owner"
            elif room_obj and room_obj.study_session_host_id == u.id and assigned_role == "member":
                assigned_role = "host"

            members_list.append(
                RoomMemberResponse(
                    user_id=u.id,
                    full_name=u.full_name,
                    email=u.email,
                    avatar_url=u.avatar_url,
                    joined_at=ulr.joined_at,
                    study_status=ulr.study_status,
                    study_state=getattr(ulr, "study_state", "studying") or "studying",
                    role=assigned_role,
                )
            )
        return members_list

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

        assigned_role = getattr(ulr, "role", "member") or "member"
        room_res = await db.execute(select(LearningRoom).where(LearningRoom.id == room_id))
        r_obj = room_res.scalar_one_or_none()
        if r_obj and r_obj.created_by_id == user.id:
            assigned_role = "owner"
        elif r_obj and r_obj.study_session_host_id == user.id and assigned_role == "member":
            assigned_role = "host"

        return RoomMemberResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar_url=user.avatar_url,
            joined_at=ulr.joined_at,
            study_status=ulr.study_status,
            study_state=ulr.study_state,
            role=assigned_role,
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

    async def _generate_session_summary(
        self,
        topic: str,
        duration_minutes: int,
        participants_count: int,
        questions_count: int,
        room_topic: str | None = None,
        roadmap_name: str | None = None,
    ) -> tuple[str, str, str]:
        """
        Generate a concise, structured study session summary.
        Format:
        Session Duration: X mins / hours
        Topics covered:
        - ...
        Questions discussed: N
        Recommended next step: ...
        """
        if duration_minutes >= 60:
            hrs = duration_minutes // 60
            mins = duration_minutes % 60
            dur_str = f"{hrs} hour{'s' if hrs > 1 else ''}" + (f" {mins} mins" if mins > 0 else "")
        else:
            dur_str = f"{duration_minutes} minutes"

        clean_topic = topic.strip() if topic else "Focused Study"
        context_name = roadmap_name or room_topic or clean_topic

        # Derive 2-4 sub-topics from the study session topic & context
        topics_list: list[str] = []
        low_t = clean_topic.lower()
        low_ctx = context_name.lower()
        if "python" in low_t or "python" in low_ctx:
            topics_list = [
                "Python core syntax & data structures",
                "Functions, scope, and return values",
                "Modular code structure & error handling",
            ]
            next_step = "Complete 3 hands-on Python exercises on functions"
        elif "react" in low_t or "frontend" in low_ctx:
            topics_list = [
                "Component state & lifecycle management",
                "Hooks and event flow",
                "Responsive UI architecture",
            ]
            next_step = "Build an interactive UI component with React hooks"
        elif "dsa" in low_t or "algorithm" in low_ctx or "structure" in low_ctx:
            topics_list = [
                "Time & space complexity (Big-O) analysis",
                "Two-pointer & sliding window patterns",
                "Edge cases & recursion limits",
            ]
            next_step = "Solve 2 LeetCode problems on arrays/strings"
        elif "backend" in low_t or "api" in low_ctx or "sql" in low_ctx:
            topics_list = [
                "RESTful API endpoint design & HTTP verbs",
                "Relational database schema relationships",
                "Input validation & error responses",
            ]
            next_step = "Implement route unit tests and schema migrations"
        else:
            topics_list = [
                f"{clean_topic} core concepts and theory",
                f"Practical problem solving in {context_name}",
                "Code review & edge case handling",
            ]
            next_step = f"Complete the next milestone in {context_name}"

        topics_bullet_points = "\n".join([f"- {t}" for t in topics_list])
        topics_summary_str = ", ".join(topics_list)

        ai_summary = (
            f"Session Duration: {dur_str}\n"
            f"Topics covered:\n"
            f"{topics_bullet_points}\n"
            f"Questions discussed: {questions_count}\n"
            f"Recommended next step: {next_step}"
        )

        return ai_summary, topics_summary_str, next_step

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

        # Count questions in room
        q_cnt_stmt = select(func.count(RoomQuestion.id)).where(RoomQuestion.room_id == room.id)
        q_cnt_res = await db.execute(q_cnt_stmt)
        questions_discussed_count = q_cnt_res.scalar() or 0

        # Generate AI Study Session Summary
        ai_summary_text, topics_text, next_step_text = await self._generate_session_summary(
            topic=room.study_session_topic or "Focused Study Session",
            duration_minutes=duration,
            participants_count=participants_count,
            questions_count=questions_discussed_count,
            room_topic=room.topic,
            roadmap_name=room.roadmap_name,
        )

        # Log to study session history
        history_entry = RoomSessionHistory(
            room_id=room.id,
            host_user_id=room.study_session_host_id or user_id,
            host_name=room.study_session_host_name or user_name,
            topic=room.study_session_topic or "Focused Study Session",
            duration_minutes=duration,
            participants_count=participants_count,
            ended_at=now,
            ai_summary=ai_summary_text,
            topics_covered=topics_text,
            questions_discussed_count=questions_discussed_count,
            recommended_next_step=next_step_text,
        )
        db.add(history_entry)

        # Add AI Summary Ready notification
        summary_notif = RoomNotification(
            room_id=room.id,
            user_id=None,
            actor_name="Technea AI",
            title="AI Study Session Summary Ready",
            message=f"Session concluded ({duration} mins). Next step: {next_step_text}",
            notification_type="session_summary",
        )
        db.add(summary_notif)

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
                ai_summary=rec.ai_summary,
                topics_covered=rec.topics_covered,
                questions_discussed_count=rec.questions_discussed_count or 0,
                recommended_next_step=rec.recommended_next_step,
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

    async def update_member_role(
        self,
        db: AsyncSession,
        room_id: int,
        target_user_id: uuid.UUID,
        role: str,
        requester_id: uuid.UUID,
    ) -> RoomMemberResponse:
        """Update a member's role (owner, host, moderator, member) with permission gating."""
        r_stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        r_res = await db.execute(r_stmt)
        room = r_res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        req_mem_stmt = select(UserLearningRoom).where(
            UserLearningRoom.room_id == room_id,
            UserLearningRoom.user_id == requester_id,
        )
        req_res = await db.execute(req_mem_stmt)
        requester_mem = req_res.scalar_one_or_none()
        if not requester_mem and room.created_by_id != requester_id:
            raise ValueError("You are not a member of this room.")

        requester_role = "owner" if room.created_by_id == requester_id else getattr(requester_mem, "role", "member")
        if requester_role not in ["owner", "host", "moderator"]:
            raise ValueError("Permission denied: Only room owners, hosts, or moderators can assign roles.")

        if role in ["owner", "host"] and requester_role != "owner":
            raise ValueError("Permission denied: Only the room owner can assign host or owner roles.")

        target_stmt = select(UserLearningRoom).where(
            UserLearningRoom.room_id == room_id,
            UserLearningRoom.user_id == target_user_id,
        )
        target_res = await db.execute(target_stmt)
        target_mem = target_res.scalar_one_or_none()
        if not target_mem:
            raise ValueError("Target user is not a member of this room.")

        target_mem.role = role

        u_stmt = select(User).where(User.id == target_user_id)
        u_res = await db.execute(u_stmt)
        target_user = u_res.scalar_one()

        rq_stmt = select(User).where(User.id == requester_id)
        rq_res = await db.execute(rq_stmt)
        rq_user = rq_res.scalar_one_or_none()
        rq_name = rq_user.full_name or rq_user.email.split("@")[0] if rq_user else "Room Admin"

        sys_msg = RoomMessage(
            room_id=room_id,
            user_id=requester_id,
            content=f"🛡️ {rq_name} updated {target_user.full_name or target_user.email.split('@')[0]}'s role to **{role.capitalize()}**.",
            message_type="system",
        )
        db.add(sys_msg)

        await db.commit()
        await db.refresh(target_mem)

        return RoomMemberResponse(
            user_id=target_user.id,
            full_name=target_user.full_name,
            email=target_user.email,
            avatar_url=target_user.avatar_url,
            joined_at=target_mem.joined_at,
            study_status=target_mem.study_status,
            study_state=target_mem.study_state,
            role=target_mem.role,
        )

    async def get_sync_content(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> SyncContentResponse:
        """Fetch current synchronized content playback state."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        return SyncContentResponse(
            room_id=room.id,
            sync_content_title=room.sync_content_title,
            sync_content_url=room.sync_content_url,
            sync_content_type=room.sync_content_type or "video",
            sync_is_playing=room.sync_is_playing or False,
            sync_playback_time=room.sync_playback_time or 0.0,
            sync_playback_speed=room.sync_playback_speed or 1.0,
            sync_updated_at=room.sync_updated_at,
            host_name=room.study_session_host_name,
        )

    async def update_sync_content(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        data: UpdateSyncContentRequest,
    ) -> SyncContentResponse:
        """Update synchronized content playback (play, pause, seek, speed, content)."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        now = datetime.now(timezone.utc)
        if data.title is not None:
            room.sync_content_title = data.title.strip()
        if data.url is not None:
            room.sync_content_url = data.url.strip()
        if data.content_type is not None:
            room.sync_content_type = data.content_type.strip()

        room.sync_is_playing = data.is_playing
        room.sync_playback_time = data.playback_time
        room.sync_playback_speed = data.playback_speed
        room.sync_updated_at = now

        await db.commit()
        await db.refresh(room)

        return SyncContentResponse(
            room_id=room.id,
            sync_content_title=room.sync_content_title,
            sync_content_url=room.sync_content_url,
            sync_content_type=room.sync_content_type or "video",
            sync_is_playing=room.sync_is_playing or False,
            sync_playback_time=room.sync_playback_time or 0.0,
            sync_playback_speed=room.sync_playback_speed or 1.0,
            sync_updated_at=room.sync_updated_at,
            host_name=room.study_session_host_name,
        )

    async def get_code_snippet(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> CodeSnippetResponse:
        """Fetch collaborative code space snippet."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        now = datetime.now(timezone.utc)
        content = room.code_snippet_content
        if not content:
            content = (
                "# Technea Collaborative Code Space\n"
                "# Practice algorithms, review snippets, and debug together.\n\n"
                "def solve():\n"
                "    print('Hello Technea Study Room!')\n\n"
                "if __name__ == '__main__':\n"
                "    solve()\n"
            )

        return CodeSnippetResponse(
            room_id=room.id,
            code_content=content,
            language=room.code_snippet_language or "python",
            title=room.code_snippet_title or "DSA Practice Snippet",
            last_edited_by_name=room.code_snippet_last_edited_by,
            updated_at=room.updated_at or now,
        )

    async def update_code_snippet(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        data: UpdateCodeSnippetRequest,
    ) -> CodeSnippetResponse:
        """Update collaborative code space snippet."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one_or_none()
        user_name = user.full_name or user.email.split("@")[0] if user else "Learner"

        now = datetime.now(timezone.utc)
        room.code_snippet_content = data.code_content
        room.code_snippet_language = data.language.strip()
        room.code_snippet_title = data.title.strip()
        room.code_snippet_last_edited_by = user_name
        room.updated_at = now

        await db.commit()
        await db.refresh(room)

        return CodeSnippetResponse(
            room_id=room.id,
            code_content=room.code_snippet_content,
            language=room.code_snippet_language,
            title=room.code_snippet_title,
            last_edited_by_name=room.code_snippet_last_edited_by,
            updated_at=room.updated_at,
        )

    async def get_whiteboard(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> WhiteboardResponse:
        """Fetch collaborative whiteboard canvas state."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        now = datetime.now(timezone.utc)
        return WhiteboardResponse(
            room_id=room.id,
            whiteboard_data=room.whiteboard_data or "",
            last_edited_by_name=room.whiteboard_last_edited_by,
            updated_at=room.updated_at or now,
        )

    async def update_whiteboard(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        data: UpdateWhiteboardRequest,
    ) -> WhiteboardResponse:
        """Update collaborative whiteboard canvas state."""
        stmt = select(LearningRoom).where(LearningRoom.id == room_id)
        res = await db.execute(stmt)
        room = res.scalar_one_or_none()
        if not room:
            raise ValueError("Room not found.")

        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one_or_none()
        user_name = user.full_name or user.email.split("@")[0] if user else "Learner"

        now = datetime.now(timezone.utc)
        room.whiteboard_data = data.whiteboard_data
        room.whiteboard_last_edited_by = user_name
        room.updated_at = now

        await db.commit()
        await db.refresh(room)

        return WhiteboardResponse(
            room_id=room.id,
            whiteboard_data=room.whiteboard_data,
            last_edited_by_name=room.whiteboard_last_edited_by,
            updated_at=room.updated_at,
        )

    async def join_webrtc_call(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        is_audio_active: bool = True,
        is_video_active: bool = False,
        is_screen_sharing: bool = False,
    ) -> WebRTCPeerResponse:
        """Register or activate user in live voice/video session."""
        u_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one_or_none()
        if not user:
            raise ValueError("User not found.")

        now = datetime.now(timezone.utc)
        peer_stmt = select(RoomActivePeer).where(
            RoomActivePeer.room_id == room_id,
            RoomActivePeer.user_id == user_id,
        )
        peer_res = await db.execute(peer_stmt)
        peer = peer_res.scalar_one_or_none()

        user_name = user.full_name or user.email.split("@")[0]

        if not peer:
            peer = RoomActivePeer(
                room_id=room_id,
                user_id=user_id,
                user_name=user_name,
                avatar_url=user.avatar_url,
                is_audio_active=is_audio_active,
                is_muted=False if is_audio_active else True,
                is_video_active=is_video_active,
                is_screen_sharing=is_screen_sharing,
                last_heartbeat=now,
            )
            db.add(peer)
        else:
            peer.is_audio_active = is_audio_active
            peer.is_muted = False if is_audio_active else peer.is_muted
            peer.is_video_active = is_video_active
            peer.is_screen_sharing = is_screen_sharing
            peer.last_heartbeat = now
            peer.user_name = user_name
            peer.avatar_url = user.avatar_url

        await db.commit()
        await db.refresh(peer)

        return WebRTCPeerResponse(
            user_id=peer.user_id,
            user_name=peer.user_name,
            avatar_url=peer.avatar_url,
            is_audio_active=peer.is_audio_active,
            is_muted=peer.is_muted,
            is_video_active=peer.is_video_active,
            is_screen_sharing=peer.is_screen_sharing,
            last_heartbeat=peer.last_heartbeat,
        )

    async def leave_webrtc_call(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Remove user from live voice/video session."""
        stmt = select(RoomActivePeer).where(
            RoomActivePeer.room_id == room_id,
            RoomActivePeer.user_id == user_id,
        )
        res = await db.execute(stmt)
        peer = res.scalar_one_or_none()
        if peer:
            await db.delete(peer)
            await db.commit()

        return {"success": True, "message": "Left live session."}

    async def update_webrtc_status(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        data: UpdateWebRTCStatusRequest,
    ) -> WebRTCPeerResponse:
        """Update live voice/video status (mute, video toggle, screen sharing heartbeat)."""
        now = datetime.now(timezone.utc)
        stmt = select(RoomActivePeer).where(
            RoomActivePeer.room_id == room_id,
            RoomActivePeer.user_id == user_id,
        )
        res = await db.execute(stmt)
        peer = res.scalar_one_or_none()

        if not peer:
            u_stmt = select(User).where(User.id == user_id)
            u_res = await db.execute(u_stmt)
            user = u_res.scalar_one()
            peer = RoomActivePeer(
                room_id=room_id,
                user_id=user_id,
                user_name=user.full_name or user.email.split("@")[0],
                avatar_url=user.avatar_url,
                is_audio_active=data.is_audio_active,
                is_muted=data.is_muted,
                is_video_active=data.is_video_active,
                is_screen_sharing=data.is_screen_sharing,
                last_heartbeat=now,
            )
            db.add(peer)
        else:
            peer.is_audio_active = data.is_audio_active
            peer.is_muted = data.is_muted
            peer.is_video_active = data.is_video_active
            peer.is_screen_sharing = data.is_screen_sharing
            peer.last_heartbeat = now

        await db.commit()
        await db.refresh(peer)

        return WebRTCPeerResponse(
            user_id=peer.user_id,
            user_name=peer.user_name,
            avatar_url=peer.avatar_url,
            is_audio_active=peer.is_audio_active,
            is_muted=peer.is_muted,
            is_video_active=peer.is_video_active,
            is_screen_sharing=peer.is_screen_sharing,
            last_heartbeat=peer.last_heartbeat,
        )

    async def get_active_peers(
        self,
        db: AsyncSession,
        room_id: int,
    ) -> list[WebRTCPeerResponse]:
        """Fetch all peers currently connected in live voice/video room."""
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=60)
        stale_stmt = select(RoomActivePeer).where(
            RoomActivePeer.room_id == room_id,
            RoomActivePeer.last_heartbeat < cutoff,
        )
        stale_res = await db.execute(stale_stmt)
        for sp in stale_res.scalars().all():
            await db.delete(sp)

        stmt = (
            select(RoomActivePeer)
            .where(RoomActivePeer.room_id == room_id)
            .order_by(RoomActivePeer.last_heartbeat.desc())
        )
        res = await db.execute(stmt)
        peers = res.scalars().all()
        await db.commit()

        return [
            WebRTCPeerResponse(
                user_id=p.user_id,
                user_name=p.user_name,
                avatar_url=p.avatar_url,
                is_audio_active=p.is_audio_active,
                is_muted=p.is_muted,
                is_video_active=p.is_video_active,
                is_screen_sharing=p.is_screen_sharing,
                last_heartbeat=p.last_heartbeat,
            )
            for p in peers
        ]

    async def send_webrtc_signal(
        self,
        db: AsyncSession,
        room_id: int,
        sender_id: uuid.UUID,
        data: WebRTCSignalRequest,
    ) -> WebRTCSignalResponse:
        """Send a WebRTC signaling message (SDP offer/answer, ICE candidate)."""
        u_stmt = select(User).where(User.id == sender_id)
        u_res = await db.execute(u_stmt)
        user = u_res.scalar_one_or_none()
        sender_name = user.full_name or user.email.split("@")[0] if user else "Learner"

        now = datetime.now(timezone.utc)
        sig = RoomWebRTCSignal(
            room_id=room_id,
            from_user_id=sender_id,
            from_user_name=sender_name,
            target_user_id=data.target_user_id,
            signal_type=data.signal_type,
            payload=data.payload,
            created_at=now,
        )
        db.add(sig)
        await db.commit()
        await db.refresh(sig)

        return WebRTCSignalResponse(
            id=sig.id,
            room_id=sig.room_id,
            from_user_id=sig.from_user_id,
            from_user_name=sig.from_user_name,
            target_user_id=sig.target_user_id,
            signal_type=sig.signal_type,
            payload=sig.payload,
            created_at=sig.created_at,
        )

    async def get_webrtc_signals(
        self,
        db: AsyncSession,
        room_id: int,
        user_id: uuid.UUID,
        since_id: int = 0,
    ) -> list[WebRTCSignalResponse]:
        """Fetch incoming WebRTC signals intended for user (or broadcast) since last checkpoint."""
        stale_cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        del_stmt = select(RoomWebRTCSignal).where(
            RoomWebRTCSignal.room_id == room_id,
            RoomWebRTCSignal.created_at < stale_cutoff,
        )
        del_res = await db.execute(del_stmt)
        for s in del_res.scalars().all():
            await db.delete(s)

        stmt = (
            select(RoomWebRTCSignal)
            .where(
                RoomWebRTCSignal.room_id == room_id,
                RoomWebRTCSignal.id > since_id,
                RoomWebRTCSignal.from_user_id != user_id,
                or_(
                    RoomWebRTCSignal.target_user_id.is_(None),
                    RoomWebRTCSignal.target_user_id == user_id,
                ),
            )
            .order_by(RoomWebRTCSignal.id.asc())
            .limit(50)
        )
        res = await db.execute(stmt)
        signals = res.scalars().all()
        await db.commit()

        return [
            WebRTCSignalResponse(
                id=s.id,
                room_id=s.room_id,
                from_user_id=s.from_user_id,
                from_user_name=s.from_user_name,
                target_user_id=s.target_user_id,
                signal_type=s.signal_type,
                payload=s.payload,
                created_at=s.created_at,
            )
            for s in signals
        ]


community_service = CommunityService()

