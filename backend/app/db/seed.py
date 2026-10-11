"""Database seed script for populating Technea's complete learning platform catalog.

Includes 115+ skills across 9 domains, 230+ curated learning paths with
roadmap steps and capstone projects, and 1,150+ courses with multi-lesson playlists.
Idempotent and safe to run repeatedly without creating duplicates.
"""

import asyncio
import json
from pathlib import Path
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.lesson import Lesson
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill, SkillPrerequisite
from app.db.full_catalog_provider import build_full_catalog

CATALOG_JSON_PATH = Path(__file__).resolve().parent / "full_catalog.json"


def load_catalog() -> list[dict]:
    """Load pre-generated catalog or build fresh."""
    if CATALOG_JSON_PATH.exists():
        try:
            with open(CATALOG_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading full_catalog.json, generating fresh: {e}")
    return build_full_catalog()


async def seed_database(session: AsyncSession) -> None:
    """Populate database with skills, learning paths, roadmap steps, courses, and lessons idempotently."""
    catalog = load_catalog()
    print(f"Starting database seed with {len(catalog)} curated skills...")

    new_skills = 0
    updated_skills = 0
    new_paths = 0
    updated_paths = 0
    new_steps = 0
    updated_steps = 0
    new_courses = 0
    updated_courses = 0
    new_lessons = 0
    updated_lessons = 0
    new_prereqs = 0

    skill_map: dict[str, Skill] = {}

    for skill_idx, skill_data in enumerate(catalog, start=1):
        # ---------------------------------------------------------------------
        # 1. Upsert Skill
        # ---------------------------------------------------------------------
        stmt = select(Skill).where(Skill.name == skill_data["name"])
        res = await session.execute(stmt)
        skill = res.scalars().first()

        if not skill:
            skill = Skill(
                name=skill_data["name"],
                category=skill_data["category"],
                description=skill_data["description"],
                tags=skill_data.get("tags", []),
                keywords=skill_data.get("keywords", []),
                aliases=skill_data.get("aliases", []),
                prerequisites=skill_data.get("prerequisites", []),
                recommended_next=skill_data.get("recommended_next", []),
            )
            session.add(skill)
            await session.flush()
            new_skills += 1
        else:
            skill.category = skill_data["category"]
            skill.description = skill_data["description"]
            skill.tags = skill_data.get("tags", skill.tags or [])
            skill.keywords = skill_data.get("keywords", skill.keywords or [])
            skill.aliases = skill_data.get("aliases", skill.aliases or [])
            skill.prerequisites = skill_data.get("prerequisites", skill.prerequisites or [])
            skill.recommended_next = skill_data.get("recommended_next", skill.recommended_next or [])
            await session.flush()
            updated_skills += 1

        skill_map[skill.name] = skill

        # ---------------------------------------------------------------------
        # 2. Upsert Learning Paths for this Skill
        # ---------------------------------------------------------------------
        for path_data in skill_data.get("learning_paths", []):
            stmt = select(LearningPath).where(LearningPath.title == path_data["title"])
            res = await session.execute(stmt)
            learning_path = res.scalars().first()

            if not learning_path:
                learning_path = LearningPath(
                    title=path_data["title"],
                    category=path_data["category"],
                    level=path_data["level"],
                    difficulty=path_data.get("difficulty", path_data["level"]),
                    duration=path_data.get("duration", "4 Weeks"),
                    description=path_data.get("description"),
                    search_terms=path_data.get("search_terms", []),
                    related_concepts=path_data.get("related_concepts", []),
                    projects=path_data.get("projects", []),
                    skill_id=skill.id,
                )
                session.add(learning_path)
                await session.flush()
                new_paths += 1
            else:
                learning_path.category = path_data["category"]
                learning_path.level = path_data["level"]
                learning_path.difficulty = path_data.get("difficulty", path_data["level"])
                learning_path.duration = path_data.get("duration", learning_path.duration)
                learning_path.description = path_data.get("description", learning_path.description)
                learning_path.search_terms = path_data.get("search_terms", learning_path.search_terms or [])
                learning_path.related_concepts = path_data.get("related_concepts", learning_path.related_concepts or [])
                learning_path.projects = path_data.get("projects", learning_path.projects or [])
                learning_path.skill_id = skill.id
                await session.flush()
                updated_paths += 1

            # -----------------------------------------------------------------
            # 3. Upsert Roadmap Steps for this Learning Path
            # -----------------------------------------------------------------
            for step_data in path_data.get("roadmap_steps", []):
                step_num = step_data["step_number"]
                stmt = select(RoadmapStep).where(
                    and_(
                        RoadmapStep.learning_path_id == learning_path.id,
                        RoadmapStep.step_number == step_num,
                    )
                )
                res = await session.execute(stmt)
                step = res.scalars().first()

                if not step:
                    step = RoadmapStep(
                        learning_path_id=learning_path.id,
                        step_number=step_num,
                        title=step_data["title"],
                        description=step_data.get("description"),
                    )
                    session.add(step)
                    new_steps += 1
                else:
                    step.title = step_data["title"]
                    step.description = step_data.get("description", step.description)
                    updated_steps += 1

            # -----------------------------------------------------------------
            # 4. Upsert Courses for this Learning Path
            # -----------------------------------------------------------------
            for course_data in path_data.get("courses", []):
                # Try finding course by learning_path_id + lesson_order or title
                stmt = select(Course).where(
                    and_(
                        Course.learning_path_id == learning_path.id,
                        Course.lesson_order == course_data["lesson_order"],
                    )
                )
                res = await session.execute(stmt)
                course = res.scalars().first()

                if not course:
                    # Also try title fallback
                    stmt_title = select(Course).where(Course.title == course_data["title"])
                    res_title = await session.execute(stmt_title)
                    course = res_title.scalars().first()

                if not course:
                    course = Course(
                        title=course_data["title"],
                        description=course_data.get("description"),
                        platform=course_data.get("platform"),
                        instructor=course_data.get("instructor"),
                        duration=course_data.get("duration"),
                        difficulty=course_data.get("difficulty", "Beginner"),
                        tags=course_data.get("tags", []),
                        youtube_video_id=course_data.get("youtube_video_id"),
                        youtube_url=course_data.get("youtube_url"),
                        thumbnail_url=course_data.get("thumbnail_url"),
                        playlist_url=course_data.get("playlist_url"),
                        lesson_order=course_data.get("lesson_order"),
                        skill_id=skill.id,
                        learning_path_id=learning_path.id,
                    )
                    session.add(course)
                    await session.flush()
                    new_courses += 1
                else:
                    course.title = course_data["title"]
                    course.description = course_data.get("description", course.description)
                    course.platform = course_data.get("platform", course.platform)
                    course.instructor = course_data.get("instructor", course.instructor)
                    course.duration = course_data.get("duration", course.duration)
                    course.difficulty = course_data.get("difficulty", course.difficulty or "Beginner")
                    course.tags = course_data.get("tags", course.tags or [])
                    course.youtube_video_id = course_data.get("youtube_video_id", course.youtube_video_id)
                    course.youtube_url = course_data.get("youtube_url", course.youtube_url)
                    course.thumbnail_url = course_data.get("thumbnail_url", course.thumbnail_url)
                    course.playlist_url = course_data.get("playlist_url", course.playlist_url)
                    course.lesson_order = course_data.get("lesson_order", course.lesson_order)
                    course.skill_id = skill.id
                    course.learning_path_id = learning_path.id
                    await session.flush()
                    updated_courses += 1

                # -------------------------------------------------------------
                # 5. Upsert Lessons for this Course
                # -------------------------------------------------------------
                for lesson_data in course_data.get("lessons", []):
                    stmt = select(Lesson).where(
                        and_(
                            Lesson.course_id == course.id,
                            Lesson.lesson_order == lesson_data["lesson_order"],
                        )
                    )
                    res = await session.execute(stmt)
                    lesson = res.scalars().first()

                    if not lesson:
                        lesson = Lesson(
                            course_id=course.id,
                            title=lesson_data["title"],
                            description=lesson_data.get("description"),
                            youtube_video_id=lesson_data["youtube_video_id"],
                            youtube_url=lesson_data.get("youtube_url"),
                            thumbnail_url=lesson_data.get("thumbnail_url"),
                            duration=lesson_data.get("duration"),
                            lesson_order=lesson_data["lesson_order"],
                        )
                        session.add(lesson)
                        new_lessons += 1
                    else:
                        lesson.title = lesson_data["title"]
                        lesson.description = lesson_data.get("description", lesson.description)
                        lesson.youtube_video_id = lesson_data.get("youtube_video_id", lesson.youtube_video_id)
                        lesson.youtube_url = lesson_data.get("youtube_url", lesson.youtube_url)
                        lesson.thumbnail_url = lesson_data.get("thumbnail_url", lesson.thumbnail_url)
                        lesson.duration = lesson_data.get("duration", lesson.duration)
                        updated_lessons += 1

        # Periodically flush every 10 skills
        if skill_idx % 10 == 0:
            await session.flush()
            print(f"Processed {skill_idx}/{len(catalog)} skills...")

    # -------------------------------------------------------------------------
    # 6. Upsert Skill Prerequisite Relationships
    # -------------------------------------------------------------------------
    for skill_data in catalog:
        skill = skill_map.get(skill_data["name"])
        if not skill:
            continue
        for prereq_name in skill_data.get("prerequisites", []):
            prereq_skill = skill_map.get(prereq_name)
            if prereq_skill:
                stmt = select(SkillPrerequisite).where(
                    and_(
                        SkillPrerequisite.skill_id == skill.id,
                        SkillPrerequisite.prerequisite_id == prereq_skill.id,
                    )
                )
                res = await session.execute(stmt)
                existing = res.scalars().first()
                if not existing:
                    session.add(SkillPrerequisite(skill_id=skill.id, prerequisite_id=prereq_skill.id))
                    new_prereqs += 1

    await session.commit()
    print("Database seeding completed successfully!")
    print(
        f"Summary: Processed {len(catalog)} skills. "
        f"Skills (New: {new_skills}, Updated: {updated_skills}) | "
        f"Paths (New: {new_paths}, Updated: {updated_paths}) | "
        f"Courses (New: {new_courses}, Updated: {updated_courses}) | "
        f"Steps (New: {new_steps}, Updated: {updated_steps}) | "
        f"Lessons (New: {new_lessons}, Updated: {updated_lessons}) | "
        f"Prerequisites (New: {new_prereqs})"
    )


async def main() -> None:
    """Entry point for seed runner."""
    async with async_session_maker() as session:
        await seed_database(session)


if __name__ == "__main__":
    asyncio.run(main())
