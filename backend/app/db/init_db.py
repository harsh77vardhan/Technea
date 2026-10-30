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
