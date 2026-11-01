"""add study rooms phase 2 collaboration features and tables

Revision ID: 5e6f7a8b9c0d
Revises: 4d5e6f7a8b9c
Create Date: 2026-11-01 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e6f7a8b9c0d'
down_revision: Union[str, None] = '4d5e6f7a8b9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    if dialect_name == "postgresql":
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_host_id UUID REFERENCES users(id) ON DELETE SET NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_host_name VARCHAR(255)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_timer_type VARCHAR(50) DEFAULT 'pomodoro' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_timer_mode VARCHAR(50) DEFAULT 'study' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_duration_minutes INTEGER DEFAULT 25 NOT NULL")

        op.execute("ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS study_state VARCHAR(50) DEFAULT 'studying' NOT NULL")

        op.execute("ALTER TABLE room_resources ADD COLUMN IF NOT EXISTS content_badge VARCHAR(100)")
        op.execute("ALTER TABLE room_resources ADD COLUMN IF NOT EXISTS action_url VARCHAR(500)")

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_session_history (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                host_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                host_name VARCHAR(255) NOT NULL,
                topic VARCHAR(255) NOT NULL,
                duration_minutes INTEGER DEFAULT 0 NOT NULL,
                participants_count INTEGER DEFAULT 1 NOT NULL,
                ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_room_session_history_room_id ON room_session_history(room_id);
            CREATE INDEX IF NOT EXISTS ix_room_session_history_ended_at ON room_session_history(ended_at);
        """)

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_shared_notes (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL UNIQUE REFERENCES learning_rooms(id) ON DELETE CASCADE,
                title VARCHAR(255) DEFAULT 'Shared Notes' NOT NULL,
                content TEXT DEFAULT '' NOT NULL,
                last_edited_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
                last_edited_by_name VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_room_shared_notes_room_id ON room_shared_notes(room_id);
        """)

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_notifications (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                actor_name VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                notification_type VARCHAR(50) DEFAULT 'info' NOT NULL,
                link_url VARCHAR(500),
                is_read BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_room_notifications_room_id ON room_notifications(room_id);
            CREATE INDEX IF NOT EXISTS ix_room_notifications_user_id ON room_notifications(user_id);
            CREATE INDEX IF NOT EXISTS ix_room_notifications_created_at ON room_notifications(created_at);
        """)
    else:
        # SQLite fallback for in-memory unit tests
        pass


def downgrade() -> None:
    pass
