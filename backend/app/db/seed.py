"""Database seed script for populating Technea's complete learning platform catalog.

Includes 24 comprehensive learning paths across 5 domains, with 7 roadmap steps each,
and 120 curated YouTube courses from top educators with embedded video player support
and structured multi-lesson playlists.
Idempotent and safe to run repeatedly.
"""

import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.lesson import Lesson
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.db.generate_catalog import DOMAINS

# 7 standard roadmap steps for each domain category
STEPS_BY_DOMAIN = {
    "Programming": [
        ("Variables, Primitive Types & Expressions", "Understand numerical types, string manipulation, booleans, arithmetic and logical operators."),
        ("Conditionals, Branching & Truthiness", "Control execution flows using if, elif, and else statements, matching patterns and boolean truth values."),
        ("Iteration, Loops & Comprehensions", "Harness while and for loops, iterate with range/enumerate/zip, and craft concise collections."),
        ("Functions, Scoping & Closures", "Write reusable functions, positional/keyword parameters, return values, and closures."),
        ("Data Structures & Collections", "Deep dive into lists, tuples, sets, dictionaries, and memory behaviors of mutable vs immutable structures."),
        ("Object-Oriented Programming Foundations", "Define classes, objects, magic methods, inheritance, composition, and encapsulation."),
        ("Modules, Packaging & Project Build", "Organize multi-file projects, isolate dependencies, install packages, and manage build configuration."),
    ],
    "AI & ML": [
        ("Mathematical Foundations (Linear Algebra & Calculus)", "Vectors, matrices, dot products, eigenvalues, partial derivatives, and gradient vectors."),
        ("Data Wrangling & Statistical Preprocessing", "Feature scaling, missing value imputation, one-hot encoding, and train-validation-test splitting."),
        ("Supervised Learning (Regression & Classification)", "Cost functions, gradient descent optimization, decision trees, and logistic regression."),
        ("Model Evaluation, Validation & Hyperparameter Tuning", "Confusion matrices, precision, recall, F1 score, ROC-AUC, and cross-validation."),
        ("Deep Learning Architectures (MLP, CNN & Transformers)", "Feedforward networks, backpropagation, convolutional layers, and self-attention mechanisms."),
        ("Transfer Learning & Pretrained Foundations", "Fine-tuning state-of-the-art vision and language models for domain-specific tasks."),
        ("Production Deployment & Model Serving", "Exporting weights with ONNX/TorchScript, containerization with Docker, and serving via FastAPI."),
    ],
    "Web Development": [
        ("HTML5 Semantic Architecture & Accessibility (a11y)", "Document structure, accessible forms, ARIA attributes, and SEO foundations."),
        ("Modern CSS: Flexbox, Grid, Custom Properties & Responsive Layout", "Two-dimensional layouts, clamp-based fluid typography, and media queries."),
        ("JavaScript Engine, Event Loop & Asynchronous APIs", "Execution contexts, promises, async/await, and browser DOM manipulation."),
        ("Frontend Component Architecture & Reactive State Management", "Component composition, reactive state, effects, and virtual DOM diffing."),
        ("RESTful API Design & Server Architecture", "Stateless HTTP routing, middleware, request validation, and status codes."),
        ("Database Modeling, Transactions & ORM Integration", "Schema design, migrations, relational queries, and connection pools."),
        ("Authentication, Authorization & Production Deployment", "JWT tokens, password hashing, HTTPS/CORS security, CI/CD, and cloud hosting."),
    ],
    "Data": [
        ("Relational Database Modeling & SQL Queries", "SELECT statements, aggregations, multi-table joins, subqueries, and window functions."),
        ("Data Cleaning, Imputation & Feature Engineering", "Handling missing values, outlier detection, string formatting, and date transformations."),
        ("Exploratory Data Analysis (EDA) & Summary Statistics", "Mean, median, variance, correlations, and distribution profiling."),
        ("Data Visualization & Business Dashboarding", "Visual design with Seaborn/Plotly, dashboard design, and stakeholder storytelling."),
        ("Advanced Analytical Modeling & Statistical Inference", "Hypothesis testing, p-values, confidence intervals, and regression inference."),
        ("Automated Data Pipelines & ETL Orchestration", "Scheduled workflows, data extract-transform-load scripts, and data lakes."),
        ("Production Reporting & Executive Presentation", "Synthesizing analytical findings into actionable business recommendations."),
    ],
    "DevOps & Security": [
        ("Linux Operating System, Shell Scripting & CLI Power", "File systems, permissions, process monitoring, piping, and automated bash scripts."),
        ("Computer Networking Protocols (TCP/IP, DNS, HTTP/S, SSH)", "OSI model, routing, socket connections, TLS certificates, and port mapping."),
        ("Containerization Foundations with Docker", "Container isolation, Dockerfile optimization, multi-stage builds, and Docker Compose."),
        ("Container Orchestration with Kubernetes", "Pods, ReplicaSets, Services, Deployments, Ingress, and ConfigMaps."),
        ("Continuous Integration & Continuous Delivery (CI/CD)", "Automated test pipelines, GitHub Actions workflows, artifact registries, and zero-downtime deploys."),
        ("Infrastructure as Code (IaC) & Cloud Architecture", "Declarative cloud provisioning, state management, security groups, and IAM roles."),
        ("Observability, Monitoring, Logging & Incident Response", "Metrics scraping, distributed tracing, structured logging, alerting, and post-mortems."),
    ],
}


def get_domain_steps(category: str):
    """Retrieve 7 structured steps matching the domain category."""
    if "Programming" in category:
        return STEPS_BY_DOMAIN["Programming"]
    elif "AI" in category or "ML" in category:
        return STEPS_BY_DOMAIN["AI & ML"]
    elif "Web" in category:
        return STEPS_BY_DOMAIN["Web Development"]
    elif "Data" in category:
        return STEPS_BY_DOMAIN["Data"]
    else:
        return STEPS_BY_DOMAIN["DevOps & Security"]


async def seed_database(session: AsyncSession) -> None:
    """Populate database with skills, learning paths, roadmap steps, courses, and lessons."""
    print(f"Starting database seed with {len(DOMAINS)} curated domains...")

    total_skills = 0
    total_paths = 0
    total_steps = 0
    total_courses = 0
    total_lessons = 0

    for domain_idx, domain_data in enumerate(DOMAINS, start=1):
        skill_data = domain_data["skill"]
        path_data = domain_data["path"]
        courses_data = domain_data["courses"]

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
            )
            session.add(skill)
            await session.flush()
            total_skills += 1
        else:
            skill.category = skill_data["category"]
            skill.description = skill_data["description"]
            await session.flush()

        # ---------------------------------------------------------------------
        # 2. Upsert LearningPath
        # ---------------------------------------------------------------------
        stmt = select(LearningPath).where(LearningPath.title == path_data["title"])
        res = await session.execute(stmt)
        learning_path = res.scalars().first()

        if not learning_path:
            learning_path = LearningPath(
                title=path_data["title"],
                category=path_data["category"],
                level=path_data["level"],
                duration=path_data["duration"],
                description=path_data["description"],
                skill_id=skill.id,
            )
            session.add(learning_path)
            await session.flush()
            total_paths += 1
        else:
            learning_path.category = path_data["category"]
            learning_path.level = path_data["level"]
            learning_path.duration = path_data["duration"]
            learning_path.description = path_data["description"]
            learning_path.skill_id = skill.id
            await session.flush()

        # ---------------------------------------------------------------------
        # 3. Upsert RoadmapSteps for LearningPath (7 steps)
        # ---------------------------------------------------------------------
        steps = get_domain_steps(learning_path.category)
        for step_num, (step_title, step_desc) in enumerate(steps, start=1):
            stmt = select(RoadmapStep).where(
                RoadmapStep.learning_path_id == learning_path.id,
                RoadmapStep.step_number == step_num,
            )
            res = await session.execute(stmt)
            step = res.scalars().first()

            if not step:
                step = RoadmapStep(
                    learning_path_id=learning_path.id,
                    step_number=step_num,
                    title=step_title,
                    description=step_desc,
                )
                session.add(step)
                total_steps += 1
            else:
                step.title = step_title
                step.description = step_desc

        # ---------------------------------------------------------------------
        # 4. Upsert Courses with YouTube Metadata
        # ---------------------------------------------------------------------
        for c_idx, c_tuple in enumerate(courses_data, start=1):
            title, instructor, platform, duration, yt_id, pl_url = c_tuple
            yt_url = f"https://www.youtube.com/watch?v={yt_id}"
            thumb_url = f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg"

            stmt = select(Course).where(Course.title == title)
            res = await session.execute(stmt)
            course = res.scalars().first()

            desc = f"Master {learning_path.title} with {instructor} on {platform}. Hands-on video training designed for modern developers."

            if not course:
                course = Course(
                    title=title,
                    description=desc,
                    platform=platform,
                    instructor=instructor,
                    duration=duration,
                    youtube_video_id=yt_id,
                    youtube_url=yt_url,
                    thumbnail_url=thumb_url,
                    playlist_url=pl_url,
                    lesson_order=c_idx,
                    skill_id=skill.id,
                    learning_path_id=learning_path.id,
                )
                session.add(course)
                await session.flush()
                total_courses += 1
            else:
                course.description = desc
                course.platform = platform
                course.instructor = instructor
                course.duration = duration
                course.youtube_video_id = yt_id
                course.youtube_url = yt_url
                course.thumbnail_url = thumb_url
                course.playlist_url = pl_url
                course.lesson_order = c_idx
                course.skill_id = skill.id
                course.learning_path_id = learning_path.id
                await session.flush()

            # -----------------------------------------------------------------
            # 5. Upsert 4 Structured Lessons per Course for the Course Player
            # -----------------------------------------------------------------
            lesson_templates = [
                (
                    f"Module 1: Introduction & Environment Setup",
                    f"Overview of {title}, tool installation, configuration, and foundational principles.",
                    "25 mins",
                ),
                (
                    f"Module 2: Core Concepts & Syntax Walkthrough",
                    f"Deep dive into the architecture, primary syntax patterns, and essential language features.",
                    "45 mins",
                ),
                (
                    f"Module 3: Hands-on Implementation & Practice",
                    f"Step-by-step practical coding, debugging techniques, and real-world application building.",
                    "35 mins",
                ),
                (
                    f"Module 4: Advanced Patterns & Capstone Project",
                    f"Production best practices, performance optimization, and comprehensive project walkthrough.",
                    "40 mins",
                ),
            ]

            for l_num, (l_title, l_desc, l_dur) in enumerate(lesson_templates, start=1):
                stmt = select(Lesson).where(
                    Lesson.course_id == course.id,
                    Lesson.lesson_order == l_num,
                )
                res = await session.execute(stmt)
                lesson = res.scalars().first()

                if not lesson:
                    lesson = Lesson(
                        course_id=course.id,
                        title=l_title,
                        description=l_desc,
                        youtube_video_id=yt_id,
                        youtube_url=yt_url,
                        thumbnail_url=f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg",
                        duration=l_dur,
                        lesson_order=l_num,
                    )
                    session.add(lesson)
                    total_lessons += 1
                else:
                    lesson.title = l_title
                    lesson.description = l_desc
                    lesson.youtube_video_id = yt_id
                    lesson.youtube_url = yt_url
                    lesson.thumbnail_url = f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg"
                    lesson.duration = l_dur

    await session.commit()
    print("Database seeding completed successfully!")
    print(f"Summary: Processed {len(DOMAINS)} domains.")
    print(f"Total new items added in this run: Skills: {total_skills}, Paths: {total_paths}, Steps: {total_steps}, Courses: {total_courses}, Lessons: {total_lessons}")


async def main() -> None:
    """Entry point for seed runner."""
    async with async_session_maker() as session:
        await seed_database(session)


if __name__ == "__main__":
    asyncio.run(main())
