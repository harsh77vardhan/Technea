"""add study rooms features and tables

Revision ID: 4d5e6f7a8b9c
Revises: 3a1b5c7d9e2f
Create Date: 2026-11-01 14:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4d5e6f7a8b9c'
down_revision: Union[str, None] = '3a1b5c7d9e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns to learning_rooms
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    if dialect_name == "postgresql":
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS topic VARCHAR(100) DEFAULT 'General' NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS roadmap_name VARCHAR(255)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 50 NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES users(id) ON DELETE SET NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_active BOOLEAN DEFAULT FALSE NOT NULL")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_topic VARCHAR(255)")
        op.execute("ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_started_at TIMESTAMP WITH TIME ZONE")

        op.execute("ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS study_status VARCHAR(255)")

        op.execute("CREATE INDEX IF NOT EXISTS ix_learning_rooms_invite_code ON learning_rooms(invite_code)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_learning_rooms_topic ON learning_rooms(topic)")

        # Create child tables
        op.execute("""
            CREATE TABLE IF NOT EXISTS room_messages (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'chat' NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_messages_room_id ON room_messages(room_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_messages_user_id ON room_messages(user_id)")

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_questions (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_questions_room_id ON room_questions(room_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_questions_user_id ON room_questions(user_id)")

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_question_replies (
                id SERIAL PRIMARY KEY,
                question_id INTEGER NOT NULL REFERENCES room_questions(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_question_replies_question_id ON room_question_replies(question_id)")

        op.execute("""
            CREATE TABLE IF NOT EXISTS room_resources (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                resource_type VARCHAR(50) NOT NULL,
                url_or_content TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_resources_room_id ON room_resources(room_id)")
    else:
        # SQLite fallback
        try:
            op.add_column('learning_rooms', sa.Column('topic', sa.String(length=100), server_default='General', nullable=False))
            op.add_column('learning_rooms', sa.Column('roadmap_name', sa.String(length=255), nullable=True))
            op.add_column('learning_rooms', sa.Column('is_private', sa.Boolean(), server_default='0', nullable=False))
            op.add_column('learning_rooms', sa.Column('invite_code', sa.String(length=20), nullable=True))
            op.add_column('learning_rooms', sa.Column('max_members', sa.Integer(), server_default='50', nullable=False))
            op.add_column('learning_rooms', sa.Column('study_session_active', sa.Boolean(), server_default='0', nullable=False))
            op.add_column('learning_rooms', sa.Column('study_session_topic', sa.String(length=255), nullable=True))
            op.add_column('learning_rooms', sa.Column('study_session_started_at', sa.DateTime(timezone=True), nullable=True))
            op.add_column('user_learning_rooms', sa.Column('study_status', sa.String(length=255), nullable=True))
        except Exception:
            pass


def downgrade() -> None:
    pass
