"""add study rooms phase 3 advanced collaborative learning features and tables

Revision ID: 6f7a8b9c0d1e
Revises: 5e6f7a8b9c0d
Create Date: 2026-11-01 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f7a8b9c0d1e'
down_revision: Union[str, None] = '5e6f7a8b9c0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    if dialect_name == "postgresql":
        # Learning Rooms - Synchronized Content & Collaborative Code & Whiteboard
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_title VARCHAR(255)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_url VARCHAR(500)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_type VARCHAR(50) DEFAULT 'video' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_is_playing BOOLEAN DEFAULT FALSE NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_playback_time DOUBLE PRECISION DEFAULT 0.0 NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_playback_speed DOUBLE PRECISION DEFAULT 1.0 NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_updated_at TIMESTAMP WITH TIME ZONE")

        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_content TEXT DEFAULT ''")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_language VARCHAR(50) DEFAULT 'python' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_title VARCHAR(255) DEFAULT 'DSA Practice Snippet' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_last_edited_by VARCHAR(255)")

        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS whiteboard_data TEXT DEFAULT ''")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS whiteboard_last_edited_by VARCHAR(255)")

        # User Learning Rooms - Roles
        op.execute("ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' NOT NULL")

        # Session History - AI Summary
        op.execute("ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS ai_summary TEXT")
        op.execute("ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS topics_covered TEXT")
        op.execute("ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS questions_discussed_count INTEGER DEFAULT 0 NOT NULL")
        op.execute("ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS recommended_next_step VARCHAR(500)")

        # WebRTC Active Peers
        op.execute("""
            CREATE TABLE IF NOT EXISTS room_active_peers (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_name VARCHAR(255) NOT NULL,
                avatar_url TEXT,
                is_audio_active BOOLEAN DEFAULT FALSE NOT NULL,
                is_muted BOOLEAN DEFAULT TRUE NOT NULL,
                is_video_active BOOLEAN DEFAULT FALSE NOT NULL,
                is_screen_sharing BOOLEAN DEFAULT FALSE NOT NULL,
                last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                CONSTRAINT uq_room_active_peer UNIQUE (room_id, user_id)
            );
            CREATE INDEX IF NOT EXISTS ix_room_active_peers_room_id ON room_active_peers(room_id);
            CREATE INDEX IF NOT EXISTS ix_room_active_peers_user_id ON room_active_peers(user_id);
        """)

        # WebRTC Signals
        op.execute("""
            CREATE TABLE IF NOT EXISTS room_webrtc_signals (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                from_user_name VARCHAR(255) NOT NULL,
                target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                signal_type VARCHAR(50) NOT NULL,
                payload TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_room_id ON room_webrtc_signals(room_id);
            CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_target ON room_webrtc_signals(target_user_id);
        """)
    else:
        # SQLite fallback
        pass


def downgrade() -> None:
    pass
