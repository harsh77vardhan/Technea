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
    ]

    try:
        async with engine.begin() as conn:
            # Check if users table exists in the database
            table_check = await conn.execute(
                text("SELECT 1 FROM information_schema.tables WHERE table_name = 'users'")
            )
            if not table_check.fetchone():
                logger.info("Users table not present yet. Skipping auth migrations (handled by metadata.create_all).")
                return

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
    except Exception as exc:
        logger.warning("Auth startup migration warning (continuing startup): %s", exc)


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


async def init_db() -> None:
    """Master database initialization function.

    Migrates tables and seeds initial data if missing.
    Safe to call repeatedly on every application startup.
    """
    logger.info("Starting database initialization check...")
    await migrate_database()
    await run_auth_migrations(engine)
    await seed_initial_catalog_if_needed()
    logger.info("Database initialization completed successfully.")


def run_init() -> None:
    """Synchronous CLI entry point."""
    asyncio.run(init_db())


if __name__ == "__main__":
    run_init()
