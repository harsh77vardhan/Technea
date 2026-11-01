"""Database initialization module for Technea backend.

Ensures that:
1. Database schema is migrated to the latest version using Alembic.
   Falls back to SQLAlchemy metadata.create_all if Alembic is unavailable or encounters an error.
2. Initial catalog data (skills, learning paths, courses, projects, rooms) is seeded if empty.
3. Fully safe, idempotent, and production-ready for automated Render, Railway, Docker, and local startup.
"""

import asyncio
from pathlib import Path
from sqlalchemy import func, select, text

from app.core.logger import logger
from app.db.base import Base
from app.db.session import async_session_maker, engine
from app.models.skill import Skill
from app.models.achievement import Achievement
from sqlalchemy.ext.asyncio import AsyncSession
import app.models  # noqa: F401 - Register all models for Base.metadata


def _run_alembic_upgrade_sync() -> None:
    """Run Alembic migrations synchronously up to 'head'."""
    from alembic import command
    from alembic.config import Config

    backend_dir = Path(__file__).resolve().parent.parent.parent
    ini_path = backend_dir / "alembic.ini"

    if not ini_path.exists():
        raise FileNotFoundError(f"Alembic configuration file not found at {ini_path}")

    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

    logger.info("Running Alembic migrations (upgrade head)...")
    command.upgrade(alembic_cfg, "head")
    logger.info("Alembic migrations applied successfully.")


async def migrate_database() -> None:
    """Apply database schema migrations via Alembic or fallback to metadata.create_all."""
    alembic_succeeded = False
    try:
        # Run Alembic in a separate thread so its internal event loop doesn't clash
        # with FastAPI's running async event loop
        await asyncio.to_thread(_run_alembic_upgrade_sync)
        alembic_succeeded = True
    except Exception as exc:
        logger.warning(
            "Alembic migration failed or was bypassed (%s). Falling back to Base.metadata.create_all...",
            exc,
        )

    if not alembic_succeeded:
        try:
            logger.info("Ensuring all tables exist via SQLAlchemy Base.metadata.create_all...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables verified/created via Base.metadata.create_all.")
        except Exception as exc:
            logger.error("Failed to create tables via Base.metadata.create_all: %s", exc)
            raise


async def run_auth_migrations(engine) -> None:
    """Run non-destructive startup migrations for auth columns on the users table.

    Checks information_schema.columns and executes ALTER TABLE if any column is missing.
    Gracefully catches and logs any errors without halting application startup.
    """
    auth_columns = [
        ("google_id", "ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE"),
        ("auth_provider", "ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email' NOT NULL"),
        ("is_email_verified", "ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE NOT NULL"),
        ("email_verification_token", "ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255)"),
        ("email_verification_expires", "ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP WITH TIME ZONE"),
        ("password_reset_token", "ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255)"),
        ("password_reset_expires", "ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE"),
        ("profile_completed", "ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE NOT NULL"),
        ("learning_goal", "ALTER TABLE users ADD COLUMN learning_goal VARCHAR(255)"),
        ("current_skill_level", "ALTER TABLE users ADD COLUMN current_skill_level VARCHAR(50)"),
        ("interests", "ALTER TABLE users ADD COLUMN interests TEXT"),
    ]

    try:
        async with engine.begin() as conn:
            # Check if users table exists in the database
            table_check = await conn.execute(
                text("SELECT 1 FROM information_schema.tables WHERE table_name = 'users'")
            )
            if table_check.fetchone():
                for col_name, alter_query in auth_columns:
                    result = await conn.execute(
                        text("""
                            SELECT column_name FROM information_schema.columns
                            WHERE table_name='users' AND column_name=:col
                        """),
                        {"col": col_name},
                    )
                    if not result.fetchone():
                        logger.info("Auth migration: adding missing column '%s' to users table...", col_name)
                        await conn.execute(text(alter_query))
                        logger.info("Auth migration: column '%s' successfully added.", col_name)

                # Ensure avatar_url column can store full SVG/Base64 strings
                try:
                    await conn.execute(text("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT"))
                except Exception as alter_avatar_exc:
                    logger.debug("Auth migration avatar_url type check: %s", alter_avatar_exc)

                # Crucial for existing users: backfill profile_completed for users who already have active profiles
                try:
                    await conn.execute(
                        text(
                            "UPDATE users SET profile_completed = TRUE WHERE (username IS NOT NULL AND username != '') OR (full_name IS NOT NULL AND full_name != '')"
                        )
                    )
                    logger.info("Auth migration: successfully backfilled profile_completed for active user profiles.")
                except Exception as backfill_exc:
                    logger.warning("Auth migration backfill warning: %s", backfill_exc)
            else:
                logger.info("Users table not present yet. Skipping auth columns migration.")

            # Ensure email_otps table and index exist
            logger.info("Auth migration: ensuring 'email_otps' table and index exist...")
            await conn.execute(
                text("""
                    CREATE TABLE IF NOT EXISTS email_otps (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        email VARCHAR(255) NOT NULL,
                        hashed_otp VARCHAR(255) NOT NULL,
                        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        attempts INTEGER NOT NULL DEFAULT 0,
                        is_used BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                """)
            )
            await conn.execute(
                text("CREATE INDEX IF NOT EXISTS ix_email_otps_email ON email_otps(email);")
            )
            logger.info("Auth migration: 'email_otps' table and index verified/created.")
    except Exception as exc:
        logger.warning("Auth startup migration warning (continuing startup): %s", exc)


async def run_roadmap_schema_migrations(engine) -> None:
    """Ensure learning_paths and roadmap_steps have all rich roadmap catalog columns."""
    learning_path_cols = [
        ("slug", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS slug VARCHAR(255)"),
        ("skills_covered", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS skills_covered JSON DEFAULT '[]'::json"),
        ("prerequisites", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS prerequisites JSON DEFAULT '[]'::json"),
        ("career_outcomes", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS career_outcomes JSON DEFAULT '[]'::json"),
        ("tech_stack", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS tech_stack JSON DEFAULT '[]'::json"),
        ("tags", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS tags JSON DEFAULT '[]'::json"),
        ("curated_resources", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS curated_resources JSON DEFAULT '[]'::json"),
        ("is_featured", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE"),
        ("popularity_rank", "ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS popularity_rank INTEGER"),
    ]

    step_cols = [
        ("topics_covered", "ALTER TABLE roadmap_steps ADD COLUMN IF NOT EXISTS topics_covered JSON DEFAULT '[]'::json"),
        ("duration", "ALTER TABLE roadmap_steps ADD COLUMN IF NOT EXISTS duration VARCHAR(100)"),
    ]

    try:
        async with engine.begin() as conn:
            dialect_name = conn.dialect.name
            if dialect_name == "postgresql":
                for _, alter_query in learning_path_cols:
                    await conn.execute(text(alter_query))
                for _, alter_query in step_cols:
                    await conn.execute(text(alter_query))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_learning_paths_slug ON learning_paths(slug);"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_learning_paths_is_featured ON learning_paths(is_featured);"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_learning_paths_popularity_rank ON learning_paths(popularity_rank);"))
            else:
                for col_name, _ in learning_path_cols:
                    try:
                        col_type = "BOOLEAN DEFAULT 0" if col_name == "is_featured" else ("INTEGER" if col_name == "popularity_rank" else ("TEXT" if col_name == "slug" else "JSON"))
                        await conn.execute(text(f"ALTER TABLE learning_paths ADD COLUMN {col_name} {col_type}"))
                    except Exception:
                        pass
                for col_name, _ in step_cols:
                    try:
                        col_type = "TEXT" if col_name == "duration" else "JSON"
                        await conn.execute(text(f"ALTER TABLE roadmap_steps ADD COLUMN {col_name} {col_type}"))
                    except Exception:
                        pass
        logger.info("Roadmap schema columns verified/migrated successfully.")
    except Exception as exc:
        logger.warning("Roadmap schema migration warning (continuing): %s", exc)


async def run_study_rooms_schema_migrations(engine) -> None:
    """Ensure study rooms tables and columns are migrated and seeded."""
    room_cols = [
        ("topic", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS topic VARCHAR(100) DEFAULT 'General' NOT NULL"),
        ("roadmap_name", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS roadmap_name VARCHAR(255)"),
        ("is_private", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE NOT NULL"),
        ("invite_code", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20)"),
        ("max_members", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 50 NOT NULL"),
        ("created_by_id", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES users(id) ON DELETE SET NULL"),
        ("study_session_active", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_active BOOLEAN DEFAULT FALSE NOT NULL"),
        ("study_session_topic", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_topic VARCHAR(255)"),
        ("study_session_started_at", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_started_at TIMESTAMP WITH TIME ZONE"),
    ]

    ulr_cols = [
        ("study_status", "ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS study_status VARCHAR(255)"),
    ]

    try:
        async with engine.begin() as conn:
            dialect_name = conn.dialect.name
            if dialect_name == "postgresql":
                # Check columns on learning_rooms
                lr_table_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_rooms'"))
                if lr_table_chk.fetchone():
                    for col_name, alter_query in room_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding missing column '%s' to learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                # Check columns on user_learning_rooms
                ulr_table_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'user_learning_rooms'"))
                if ulr_table_chk.fetchone():
                    for col_name, alter_query in ulr_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='user_learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding missing column '%s' to user_learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_learning_rooms_invite_code ON learning_rooms(invite_code);"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_learning_rooms_topic ON learning_rooms(topic);"))

                # Create child tables if not existing
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS room_messages (
                        id SERIAL PRIMARY KEY,
                        room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        message_type VARCHAR(20) DEFAULT 'chat' NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_messages_room_id ON room_messages(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_messages_user_id ON room_messages(user_id)"))

                await conn.execute(text("""
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
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_questions_room_id ON room_questions(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_questions_user_id ON room_questions(user_id)"))

                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS room_question_replies (
                        id SERIAL PRIMARY KEY,
                        question_id INTEGER NOT NULL REFERENCES room_questions(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_question_replies_question_id ON room_question_replies(question_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_question_replies_user_id ON room_question_replies(user_id)"))

                await conn.execute(text("""
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
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_resources_room_id ON room_resources(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_resources_user_id ON room_resources(user_id)"))
            else:
                for col_name, _ in room_cols:
                    try:
                        col_type = "BOOLEAN DEFAULT 0" if "BOOLEAN" in _ else ("INTEGER DEFAULT 50" if "INTEGER" in _ else "TEXT")
                        await conn.execute(text(f"ALTER TABLE learning_rooms ADD COLUMN {col_name} {col_type}"))
                    except Exception:
                        pass
                for col_name, _ in ulr_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE user_learning_rooms ADD COLUMN {col_name} TEXT"))
                    except Exception:
                        pass

            # Update initial rooms with invite codes and topic metadata
            defaults = [
                ("python-beginners", "Python", "Python Developer Roadmap", "TECH-PYTH"),
                ("react-frontend-architects", "React & Frontend", "Frontend Developer Roadmap", "TECH-RECT"),
                ("ai-ml-guild", "AI & Machine Learning", "AI Engineering Roadmap", "TECH-AIML"),
                ("devops-cloud", "Cloud & DevOps", "Cloud & DevOps Roadmap", "TECH-DVOP"),
                ("dsa-club", "Data Structures & Algorithms", "Computer Science Roadmap", "TECH-DSAC"),
                ("full-stack-builders", "Full Stack Web Development", "Full Stack Developer Roadmap", "TECH-FSTK"),
            ]
            for slug, topic, rm_name, code in defaults:
                try:
                    await conn.execute(
                        text("""
                            UPDATE learning_rooms 
                            SET topic = :topic, roadmap_name = :rm_name, invite_code = COALESCE(invite_code, :code)
                            WHERE slug = :slug
                        """),
                        {"slug": slug, "topic": topic, "rm_name": rm_name, "code": code},
                    )
                except Exception:
                    pass

        logger.info("Study rooms schema verified and seeded successfully.")
    except Exception as exc:
        logger.warning("Study rooms schema migration notice (continuing): %s", exc)


async def run_study_rooms_phase2_schema_migrations(engine) -> None:
    """Ensure Phase 2 study session fields, notes, history, and notifications exist."""
    lr_phase2_cols = [
        ("study_session_host_id", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_host_id UUID REFERENCES users(id) ON DELETE SET NULL"),
        ("study_session_host_name", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_host_name VARCHAR(255)"),
        ("study_session_timer_type", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_timer_type VARCHAR(50) DEFAULT 'pomodoro' NOT NULL"),
        ("study_session_timer_mode", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_timer_mode VARCHAR(50) DEFAULT 'study' NOT NULL"),
        ("study_session_duration_minutes", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS study_session_duration_minutes INTEGER DEFAULT 25 NOT NULL"),
    ]

    ulr_phase2_cols = [
        ("study_state", "ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS study_state VARCHAR(50) DEFAULT 'studying' NOT NULL"),
    ]

    res_phase2_cols = [
        ("content_badge", "ALTER TABLE room_resources ADD COLUMN IF NOT EXISTS content_badge VARCHAR(100)"),
        ("action_url", "ALTER TABLE room_resources ADD COLUMN IF NOT EXISTS action_url VARCHAR(500)"),
    ]

    try:
        async with engine.begin() as conn:
            dialect_name = conn.dialect.name
            if dialect_name == "postgresql":
                # Check learning_rooms columns
                lr_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_rooms'"))
                if lr_chk.fetchone():
                    for col_name, alter_query in lr_phase2_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 2 column '%s' to learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                # Check user_learning_rooms columns
                ulr_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'user_learning_rooms'"))
                if ulr_chk.fetchone():
                    for col_name, alter_query in ulr_phase2_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='user_learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 2 column '%s' to user_learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                # Check room_resources columns
                res_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'room_resources'"))
                if res_chk.fetchone():
                    for col_name, alter_query in res_phase2_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='room_resources' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 2 column '%s' to room_resources...", col_name)
                            await conn.execute(text(alter_query))

                # Create room_session_history table
                await conn.execute(text("""
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
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_session_history_room_id ON room_session_history(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_session_history_ended_at ON room_session_history(ended_at)"))

                # Create room_shared_notes table
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS room_shared_notes (
                        id SERIAL PRIMARY KEY,
                        room_id INTEGER NOT NULL UNIQUE REFERENCES learning_rooms(id) ON DELETE CASCADE,
                        title VARCHAR(255) DEFAULT 'Shared Notes' NOT NULL,
                        content TEXT DEFAULT '' NOT NULL,
                        last_edited_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
                        last_edited_by_name VARCHAR(255),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_shared_notes_room_id ON room_shared_notes(room_id)"))

                # Create room_notifications table
                await conn.execute(text("""
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
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_notifications_room_id ON room_notifications(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_notifications_user_id ON room_notifications(user_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_notifications_created_at ON room_notifications(created_at)"))

            else:
                for col_name, _ in lr_phase2_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE learning_rooms ADD COLUMN {col_name} TEXT"))
                    except Exception:
                        pass
                for col_name, _ in ulr_phase2_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE user_learning_rooms ADD COLUMN {col_name} TEXT"))
                    except Exception:
                        pass
                for col_name, _ in res_phase2_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE room_resources ADD COLUMN {col_name} TEXT"))
                    except Exception:
                        pass

        logger.info("Study rooms Phase 2 collaboration schema verified successfully.")
    except Exception as exc:
        logger.warning("Study rooms Phase 2 migration notice (continuing): %s", exc)


async def run_study_rooms_phase3_schema_migrations(engine) -> None:
    """Ensure Phase 3 synchronized content, code space, whiteboard, roles, AI summary, and WebRTC tables exist."""
    lr_phase3_cols = [
        ("sync_content_title", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_title VARCHAR(255)"),
        ("sync_content_url", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_url VARCHAR(500)"),
        ("sync_content_type", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_content_type VARCHAR(50) DEFAULT 'video' NOT NULL"),
        ("sync_is_playing", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_is_playing BOOLEAN DEFAULT FALSE NOT NULL"),
        ("sync_playback_time", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_playback_time DOUBLE PRECISION DEFAULT 0.0 NOT NULL"),
        ("sync_playback_speed", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_playback_speed DOUBLE PRECISION DEFAULT 1.0 NOT NULL"),
        ("sync_updated_at", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS sync_updated_at TIMESTAMP WITH TIME ZONE"),
        ("code_snippet_content", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_content TEXT DEFAULT ''"),
        ("code_snippet_language", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_language VARCHAR(50) DEFAULT 'python' NOT NULL"),
        ("code_snippet_title", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_title VARCHAR(255) DEFAULT 'DSA Practice Snippet' NOT NULL"),
        ("code_snippet_last_edited_by", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS code_snippet_last_edited_by VARCHAR(255)"),
        ("whiteboard_data", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS whiteboard_data TEXT DEFAULT ''"),
        ("whiteboard_last_edited_by", "ALTER TABLE learning_rooms ADD COLUMN IF NOT EXISTS whiteboard_last_edited_by VARCHAR(255)"),
    ]

    ulr_phase3_cols = [
        ("role", "ALTER TABLE user_learning_rooms ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' NOT NULL"),
    ]

    hist_phase3_cols = [
        ("ai_summary", "ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS ai_summary TEXT"),
        ("topics_covered", "ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS topics_covered TEXT"),
        ("questions_discussed_count", "ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS questions_discussed_count INTEGER DEFAULT 0 NOT NULL"),
        ("recommended_next_step", "ALTER TABLE room_session_history ADD COLUMN IF NOT EXISTS recommended_next_step VARCHAR(500)"),
    ]

    try:
        async with engine.begin() as conn:
            dialect_name = conn.dialect.name
            if dialect_name == "postgresql":
                # Check learning_rooms columns
                lr_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_rooms'"))
                if lr_chk.fetchone():
                    for col_name, alter_query in lr_phase3_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 3 column '%s' to learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                # Check user_learning_rooms columns
                ulr_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'user_learning_rooms'"))
                if ulr_chk.fetchone():
                    for col_name, alter_query in ulr_phase3_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='user_learning_rooms' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 3 column '%s' to user_learning_rooms...", col_name)
                            await conn.execute(text(alter_query))

                # Check room_session_history columns
                hist_chk = await conn.execute(text("SELECT 1 FROM information_schema.tables WHERE table_name = 'room_session_history'"))
                if hist_chk.fetchone():
                    for col_name, alter_query in hist_phase3_cols:
                        chk = await conn.execute(
                            text("SELECT column_name FROM information_schema.columns WHERE table_name='room_session_history' AND column_name=:col"),
                            {"col": col_name},
                        )
                        if not chk.fetchone():
                            logger.info("Adding Phase 3 column '%s' to room_session_history...", col_name)
                            await conn.execute(text(alter_query))

                # Create room_active_peers table
                await conn.execute(text("""
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
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_active_peers_room_id ON room_active_peers(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_active_peers_user_id ON room_active_peers(user_id)"))

                # Create room_webrtc_signals table
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS room_webrtc_signals (
                        id SERIAL PRIMARY KEY,
                        room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
                        from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        from_user_name VARCHAR(255) NOT NULL,
                        target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        signal_type VARCHAR(50) NOT NULL,
                        payload TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    )
                """))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_room_id ON room_webrtc_signals(room_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_from_user_id ON room_webrtc_signals(from_user_id)"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_room_webrtc_signals_target_user_id ON room_webrtc_signals(target_user_id)"))
                await conn.execute(text("DROP INDEX IF EXISTS ix_room_webrtc_signals_target"))
            else:
                # SQLite fallback
                for col_name, _ in lr_phase3_cols:
                    try:
                        col_type = "BOOLEAN DEFAULT 0" if "BOOLEAN" in _ else ("FLOAT DEFAULT 0.0" if "PRECISION" in _ else "TEXT")
                        await conn.execute(text(f"ALTER TABLE learning_rooms ADD COLUMN {col_name} {col_type}"))
                    except Exception:
                        pass
                for col_name, _ in ulr_phase3_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE user_learning_rooms ADD COLUMN {col_name} VARCHAR(50) DEFAULT 'member'"))
                    except Exception:
                        pass
                for col_name, _ in hist_phase3_cols:
                    try:
                        await conn.execute(text(f"ALTER TABLE room_session_history ADD COLUMN {col_name} TEXT"))
                    except Exception:
                        pass

        logger.info("Study rooms Phase 3 collaboration schema verified successfully.")
    except Exception as exc:
        logger.warning("Study rooms Phase 3 migration notice (continuing): %s", exc)




async def seed_initial_catalog_if_needed() -> None:
    """Check if skills table has records; if empty, seed the initial catalog idempotently."""
    try:
        async with async_session_maker() as session:
            result = await session.execute(select(func.count(Skill.id)))
            skill_count = result.scalar() or 0

            if skill_count == 0:
                logger.info("Database is empty (0 skills found). Seeding initial platform catalog...")
                from app.db.seed import seed_database
                await seed_database(session)

                from app.db.seed_projects_and_rooms import seed_data
                await seed_data()
                logger.info("Initial platform catalog and community projects seeded successfully.")
            else:
                logger.info("Database catalog is already populated (%d skills detected). Skipping seed.", skill_count)
    except Exception as exc:
        logger.warning("Error checking or seeding initial catalog: %s. Continuing startup.", exc)


DEFAULT_ACHIEVEMENTS = [
    {
        "achievement_id": "early_adopter",
        "title": "Early Adopter",
        "description": "Joined Technea AI engineering platform during early release.",
        "icon": "sparkles",
        "category": "Community",
        "xp_reward": 50,
        "criteria": "Account created during initial release",
    },
    {
        "achievement_id": "streak_master",
        "title": "Consistent Coder",
        "description": "Maintained daily learning momentum for 3+ consecutive days.",
        "icon": "flame",
        "category": "Consistency",
        "xp_reward": 100,
        "criteria": "Maintain a 3-day active learning streak",
    },
    {
        "achievement_id": "milestone_champion",
        "title": "Milestone Conqueror",
        "description": "Mastered 5 or more core engineering milestones.",
        "icon": "target",
        "category": "Learning",
        "xp_reward": 150,
        "criteria": "Complete 5 curriculum milestones",
    },
    {
        "achievement_id": "roadmap_architect",
        "title": "Roadmap Architect",
        "description": "Designed and initialized an AI-synthesized career roadmap.",
        "icon": "layers",
        "category": "AI & Planning",
        "xp_reward": 75,
        "criteria": "Generate and save a personalized AI roadmap",
    },
    {
        "achievement_id": "project_builder",
        "title": "Hands-on Builder",
        "description": "Started or completed an active software project deliverable.",
        "icon": "code",
        "category": "Projects",
        "xp_reward": 200,
        "criteria": "Start or complete a hands-on project",
    },
    {
        "achievement_id": "community_pioneer",
        "title": "Peer Collaborator",
        "description": "Connected with peers in Technea community learning rooms.",
        "icon": "users",
        "category": "Community",
        "xp_reward": 50,
        "criteria": "Join any community study room",
    },
    {
        "achievement_id": "polyglot_engineer",
        "title": "Polyglot Programmer",
        "description": "Explored multiple languages and runtime environments across learning paths.",
        "icon": "terminal",
        "category": "Mastery",
        "xp_reward": 125,
        "criteria": "Engage with courses in 2 or more programming languages",
    },
    {
        "achievement_id": "full_stack_hero",
        "title": "Full Stack Hero",
        "description": "Completed frontend and backend milestones with integrated API persistence.",
        "icon": "award",
        "category": "Engineering",
        "xp_reward": 300,
        "criteria": "Complete full-stack milestones",
    },
]


async def seed_achievements(session: AsyncSession | None = None) -> None:
    """Ensure achievements table exists and default achievements are populated."""
    try:
        # Ensure table exists via DDL if not created by Alembic/Base.metadata
        async with engine.begin() as conn:
            await conn.execute(
                text("""
                    CREATE TABLE IF NOT EXISTS achievements (
                        id SERIAL PRIMARY KEY,
                        achievement_id VARCHAR(100) UNIQUE NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        icon VARCHAR(50) DEFAULT 'award' NOT NULL,
                        category VARCHAR(100) DEFAULT 'General' NOT NULL,
                        xp_reward INTEGER DEFAULT 50 NOT NULL,
                        criteria VARCHAR(255),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    )
                """)
            )
            await conn.execute(
                text("CREATE INDEX IF NOT EXISTS ix_achievements_achievement_id ON achievements(achievement_id)")
            )

        async def _do_seed(s: AsyncSession) -> None:
            result = await s.execute(select(func.count(Achievement.id)))
            count = result.scalar() or 0
            if count == 0:
                logger.info("Achievements table is empty. Seeding default platform achievements...")
                for item in DEFAULT_ACHIEVEMENTS:
                    ach = Achievement(
                        achievement_id=item["achievement_id"],
                        title=item["title"],
                        description=item["description"],
                        icon=item["icon"],
                        category=item["category"],
                        xp_reward=item["xp_reward"],
                        criteria=item["criteria"],
                    )
                    s.add(ach)
                await s.commit()
                logger.info("Seeded %d default achievements.", len(DEFAULT_ACHIEVEMENTS))
            else:
                logger.info("Achievements already populated (%d records). Skipping seed.", count)

        if session:
            await _do_seed(session)
        else:
            async with async_session_maker() as s:
                await _do_seed(s)
    except Exception as exc:
        logger.warning("Error seeding achievements: %s. Continuing startup.", exc)


async def init_db() -> None:
    """Master database initialization function.

    Migrates tables and seeds initial data if missing.
    Safe to call repeatedly on every application startup.
    """
    logger.info("Starting database initialization check...")
    await migrate_database()
    await run_auth_migrations(engine)
    await run_roadmap_schema_migrations(engine)
    await run_study_rooms_schema_migrations(engine)
    await run_study_rooms_phase2_schema_migrations(engine)
    await run_study_rooms_phase3_schema_migrations(engine)
    await seed_initial_catalog_if_needed()
    try:
        from app.db.seed_roadmaps_100 import seed_100_roadmaps
        async with async_session_maker() as session:
            await seed_100_roadmaps(session)
    except Exception as exc:
        logger.warning("Error running seed_100_roadmaps: %s", exc)
    await seed_achievements()
    logger.info("Database initialization completed successfully.")


def run_init() -> None:
    """Synchronous CLI entry point."""
    asyncio.run(init_db())


if __name__ == "__main__":
    run_init()
