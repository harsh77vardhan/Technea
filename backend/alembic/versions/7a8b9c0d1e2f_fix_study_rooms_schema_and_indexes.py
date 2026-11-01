"""fix study rooms schema, foreign keys, and indexes

Revision ID: 7a8b9c0d1e2f
Revises: 6f7a8b9c0d1e
Create Date: 2026-11-01 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, None] = '6f7a8b9c0d1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    if dialect_name == "postgresql":
        # 1. Foreign keys on learning_rooms
        op.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'fk_learning_rooms_created_by_id'
                ) THEN
                    ALTER TABLE learning_rooms
                    ADD CONSTRAINT fk_learning_rooms_created_by_id
                    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
                END IF;
            END $$;
        """)

        op.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'fk_learning_rooms_study_session_host_id'
                ) THEN
                    ALTER TABLE learning_rooms
                    ADD CONSTRAINT fk_learning_rooms_study_session_host_id
                    FOREIGN KEY (study_session_host_id) REFERENCES users(id) ON DELETE SET NULL;
                END IF;
            END $$;
        """)

        # 2. Unique index on learning_rooms.invite_code
        op.execute("DROP INDEX IF EXISTS ix_learning_rooms_invite_code")
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_learning_rooms_invite_code ON learning_rooms(invite_code)")

        # 3. room_question_replies indexes
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_question_replies_user_id ON room_question_replies(user_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_question_replies_id ON room_question_replies(id)")

        # 4. room_resources indexes
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_resources_user_id ON room_resources(user_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_resources_id ON room_resources(id)")

        # 5. room_webrtc_signals indexes
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_from_user_id ON room_webrtc_signals(from_user_id)")
        op.execute("DROP INDEX IF EXISTS ix_room_webrtc_signals_target")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_target_user_id ON room_webrtc_signals(target_user_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_id ON room_webrtc_signals(id)")

        # 6. room_active_peers, messages, questions, session_history, notifications id indexes
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_active_peers_id ON room_active_peers(id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_messages_id ON room_messages(id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_questions_id ON room_questions(id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_session_history_id ON room_session_history(id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_notifications_id ON room_notifications(id)")

        # 7. room_shared_notes constraint and id index
        op.execute("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'room_shared_notes_room_id_key'
                ) THEN
                    ALTER TABLE room_shared_notes DROP CONSTRAINT room_shared_notes_room_id_key;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'uq_room_shared_note'
                ) THEN
                    ALTER TABLE room_shared_notes ADD CONSTRAINT uq_room_shared_note UNIQUE (room_id);
                END IF;
            END $$;
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_room_shared_notes_id ON room_shared_notes(id)")

        # 8. email_otps created_at NOT NULL
        op.execute("ALTER TABLE email_otps ALTER COLUMN created_at SET NOT NULL")

        # 9. achievements unique index and id index
        op.execute("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'achievements_achievement_id_key'
                ) THEN
                    ALTER TABLE achievements DROP CONSTRAINT achievements_achievement_id_key;
                END IF;
            END $$;
        """)
        op.execute("DROP INDEX IF EXISTS ix_achievements_achievement_id")
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_achievements_achievement_id ON achievements(achievement_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_achievements_id ON achievements(id)")

        # 10. users google_id unique index
        op.execute("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key'
                ) THEN
                    ALTER TABLE users DROP CONSTRAINT users_google_id_key;
                END IF;
            END $$;
        """)
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id)")


def downgrade() -> None:
    pass
