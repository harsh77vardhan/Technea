"""Database seed script for populating Technea initial learning data."""

import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill

INITIAL_SKILLS = [
    {
        "name": "Python",
        "category": "Programming",
        "description": "Core programming language for software, automation, and data science.",
    },
    {
        "name": "Machine Learning",
        "category": "AI & ML",
        "description": "Techniques and algorithms for training predictive models and AI systems.",
    },
    {
        "name": "Web Development",
        "category": "Web Development",
        "description": "Building modern, responsive user interfaces and backend web services.",
    },
    {
        "name": "Data Science",
        "category": "Data",
        "description": "Data analysis, statistical modeling, visualization, and transformation.",
    },
    {
        "name": "Cyber Security",
        "category": "Security",
        "description": "Protecting systems, networks, and data from digital attacks and threats.",
    },
]

INITIAL_LEARNING_PATHS = [
    {
        "title": "Python Fundamentals",
        "category": "Programming",
        "level": "Beginner",
        "duration": "4 weeks",
        "description": "Master core Python syntax, logic, data structures, and best practices.",
    },
    {
        "title": "Machine Learning Beginner Roadmap",
        "category": "AI & ML",
        "level": "Beginner",
        "duration": "6 weeks",
        "description": "Foundational mathematics, supervised learning, and hands-on ML projects.",
    },
    {
        "title": "Full Stack Web Development",
        "category": "Web Development",
        "level": "Intermediate",
        "duration": "8 weeks",
        "description": "From frontend component architecture to backend REST APIs and database design.",
    },
]

SAMPLE_COURSES = [
    {
        "title": "Python for Beginners: From Zero to Hero",
        "skill_name": "Python",
        "platform": "Technea",
        "instructor": "Dr. Angela Yu",
        "duration": "12 hours",
        "description": "Comprehensive introduction to Python programming with practical exercises.",
    },
    {
        "title": "Machine Learning A-Z: Hands-On Python",
        "skill_name": "Machine Learning",
        "platform": "Technea",
        "instructor": "Andrew Ng",
        "duration": "20 hours",
        "description": "Learn to create and evaluate Machine Learning algorithms in Python.",
    },
    {
        "title": "Modern Full Stack Web Development with FastAPI & React",
        "skill_name": "Web Development",
        "platform": "Technea",
        "instructor": "Brad Traversy",
        "duration": "16 hours",
        "description": "Build scalable full-stack web applications using FastAPI and React.",
    },
]

PYTHON_ROADMAP_STEPS = [
    {
        "step_number": 1,
        "title": "Variables, Data Types, and Operators",
        "description": "Understand numbers, strings, booleans, arithmetic operators, and string formatting.",
    },
    {
        "step_number": 2,
        "title": "Control Flow & Conditionals",
        "description": "Learn if-elif-else branching, logical expressions, and boolean truthiness.",
    },
    {
        "step_number": 3,
        "title": "Loops and Iteration",
        "description": "Work with while and for loops, range, enumerate, zip, and list comprehensions.",
    },
    {
        "step_number": 4,
        "title": "Functions and Scope",
        "description": "Define reusable functions, parameters, return values, args/kwargs, and variable scope.",
    },
    {
        "step_number": 5,
        "title": "Data Structures & Collections",
        "description": "Deep dive into lists, tuples, sets, and dictionaries.",
    },
    {
        "step_number": 6,
        "title": "Modules, Packages, and Virtual Environments",
        "description": "Organize code into modules, work with pip, virtual environments, and standard library.",
    },
]


async def seed_database(session: AsyncSession) -> None:
    """Seed initial skills, learning paths, courses, and roadmap steps."""
    skill_map: dict[str, Skill] = {}

    # 1. Seed Skills
    for skill_info in INITIAL_SKILLS:
        stmt = select(Skill).where(Skill.name == skill_info["name"])
        result = await session.execute(stmt)
        existing_skill = result.scalars().first()

        if not existing_skill:
            skill = Skill(
                name=skill_info["name"],
                category=skill_info["category"],
                description=skill_info["description"],
            )
            session.add(skill)
            await session.flush()
            skill_map[skill.name] = skill
        else:
            skill_map[existing_skill.name] = existing_skill

    # 2. Seed Learning Paths
    path_map: dict[str, LearningPath] = {}
    for path_info in INITIAL_LEARNING_PATHS:
        stmt = select(LearningPath).where(LearningPath.title == path_info["title"])
        result = await session.execute(stmt)
        existing_path = result.scalars().first()

        if not existing_path:
            path = LearningPath(
                title=path_info["title"],
                category=path_info["category"],
                level=path_info["level"],
                duration=path_info["duration"],
                description=path_info["description"],
            )
            session.add(path)
            await session.flush()
            path_map[path.title] = path
        else:
            path_map[existing_path.title] = existing_path

    # 3. Seed Courses connected to Skills
    for course_info in SAMPLE_COURSES:
        stmt = select(Course).where(Course.title == course_info["title"])
        result = await session.execute(stmt)
        existing_course = result.scalars().first()

        if not existing_course:
            skill = skill_map.get(course_info["skill_name"])
            if skill:
                course = Course(
                    title=course_info["title"],
                    description=course_info["description"],
                    platform=course_info["platform"],
                    instructor=course_info["instructor"],
                    duration=course_info["duration"],
                    skill_id=skill.id,
                )
                session.add(course)

    # 4. Seed Roadmap Steps for Python Fundamentals
    python_path = path_map.get("Python Fundamentals")
    if python_path:
        for step_info in PYTHON_ROADMAP_STEPS:
            stmt = select(RoadmapStep).where(
                RoadmapStep.learning_path_id == python_path.id,
                RoadmapStep.step_number == step_info["step_number"],
            )
            result = await session.execute(stmt)
            existing_step = result.scalars().first()

            if not existing_step:
                step = RoadmapStep(
                    learning_path_id=python_path.id,
                    step_number=step_info["step_number"],
                    title=step_info["title"],
                    description=step_info["description"],
                )
                session.add(step)

    await session.commit()
    print("Database seeding completed successfully.")


async def main() -> None:
    """Run the seed operation."""
    async with async_session_maker() as session:
        await seed_database(session)


if __name__ == "__main__":
    asyncio.run(main())
