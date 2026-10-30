"""Database seed script for populating Technea's 100+ Production-Grade Learning Roadmaps.

Seeds 111 comprehensive, structured roadmaps across 9 technical and career domains:
1. Programming (Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, Kotlin, Swift, Elixir, PHP)
2. Web Development (Full Stack, React 19, Next.js, Vue, Angular, Node.js, Django, FastAPI, APIs, Web Performance, Micro-Frontends, GraphQL, Databases)
3. AI / ML (AI Engineering, LLM Engineering, Autonomous AI Agents, RAG Pipelines, Prompt Engineering, Computer Vision, NLP, PyTorch Deep Learning, MLOps, Diffusion Models, Reinforcement Learning, Graph Neural Networks, Edge AI)
4. Data (Data Science, Data Engineering, Modern Data Lakehouse, SQL & Relational Analytics, Big Data with Spark, Data Analytics, Business Intelligence, Graph Analytics, Streaming with Flink, Data Governance, Time Series Analytics, Vector Search)
5. Cloud / DevOps (AWS Cloud Solutions, Kubernetes, Docker & Containers, Terraform IaC, Linux Systems, DevOps CI/CD, Azure Cloud, GCP Cloud, Site Reliability Engineering, Cloud Security, Microservices & Service Mesh, Serverless, Observability)
6. Cybersecurity (Ethical Hacking & Pentesting, Security Operations (SOC), Web Application Security, Network Defense, Cloud Security & DevSecOps, Digital Forensics & Incident Response, Cryptography, Identity & Access Management, API Security, Malware Analysis, Zero Trust Architecture, IoT Security)
7. Mobile (iOS Development with Swift, Android Development with Kotlin, Flutter Cross-Platform, React Native & Expo, Mobile App Security, Offline-First Mobile, SwiftUI, Jetpack Compose, Mobile DevOps & CI/CD, Mobile Game Dev, AR Mobile, Mobile Performance)
8. Design & Creative Tech (UI/UX Product Design, Design Systems Engineering, 3D Graphics with WebGL & Three.js, Game Development with Unity, Game Development with Unreal, Blender 3D, Motion Design & GSAP, Creative Coding & Generative Art, Spatial Computing & WebXR, Audio Programming, Technical Writing, Accessibility)
9. Career (Software Engineer, AI Engineer, Full Stack Engineer, DevOps & Cloud Engineer, Data Scientist, Machine Learning Engineer, Cybersecurity Specialist, Frontend Architect, Backend Systems Architect, Mobile Engineer, Site Reliability Engineer, Data Platform Engineer)

Idempotent and safe to run repeatedly.
"""

import asyncio
import logging
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.db.roadmaps_catalog import ALL_ROADMAPS
from app.models.learning_path import LearningPath
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.services.learning_path import clean_slugify

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("technea.seed_roadmaps_100")


async def seed_100_roadmaps(session: AsyncSession) -> dict:
    """Populate database with the 111 structured roadmaps and sequential milestones."""
    logger.info(f"Starting seed of {len(ALL_ROADMAPS)} production roadmaps across 9 domains...")

    created_paths = 0
    updated_paths = 0
    created_steps = 0
    updated_steps = 0

    # Cache skills by name for easy association
    skill_stmt = select(Skill)
    skill_res = await session.execute(skill_stmt)
    skills = skill_res.scalars().all()
    skill_by_name = {s.name.lower(): s for s in skills}

    for roadmap_data in ALL_ROADMAPS:
        title = roadmap_data["title"]
        slug = roadmap_data.get("slug") or clean_slugify(title)
        category = roadmap_data.get("category", "Programming")

        # 1. Look up existing path by slug first, then by title
        stmt = select(LearningPath).where(
            (LearningPath.slug == slug) | (LearningPath.title == title)
        )
        res = await session.execute(stmt)
        learning_path = res.scalars().first()

        # Find or link associated skill if available
        associated_skill_id = None
        for skill_key, skill_obj in skill_by_name.items():
            if skill_key in title.lower() or any(skill_key in s.lower() for s in roadmap_data.get("skills_covered", [])):
                associated_skill_id = skill_obj.id
                break

        tech_stack = roadmap_data.get("tech_stack") or roadmap_data.get("technology_stack", [])
        resources = roadmap_data.get("curated_resources") or roadmap_data.get("resources", [])
        projects = roadmap_data.get("capstone_projects") or roadmap_data.get("projects", [])
        skills_covered = roadmap_data.get("skills_covered", [])
        prerequisites = roadmap_data.get("prerequisites", [])
        career_outcomes = roadmap_data.get("career_outcomes", [])
        tags = roadmap_data.get("tags", [])

        # Build comprehensive search keywords
        search_terms = list(set(
            tags
            + [s.lower() for s in skills_covered]
            + [t.lower() for t in tech_stack]
            + [w.lower() for w in title.split() if len(w) > 2]
        ))

        if not learning_path:
            learning_path = LearningPath(
                title=title,
                slug=slug,
                category=category,
                level=roadmap_data.get("level", "Intermediate"),
                difficulty=roadmap_data.get("difficulty", roadmap_data.get("level", "Intermediate")),
                duration=roadmap_data.get("duration", "8 Weeks"),
                description=roadmap_data.get("description", ""),
                skills_covered=skills_covered,
                prerequisites=prerequisites,
                career_outcomes=career_outcomes,
                technology_stack=tech_stack,
                resources=resources,
                tags=tags,
                projects=projects,
                is_featured=roadmap_data.get("is_featured", False),
                popularity_rank=roadmap_data.get("popularity_rank", 100),
                search_terms=search_terms,
                related_concepts=skills_covered,
                goal="Career" if category == "Career" else "Job",
                goals=["Job", "Career", "Projects"],
                style="Projects",
                styles=["Projects", "Interactive", "Videos"],
                language="English",
                languages=["English"],
                skill_id=associated_skill_id,
            )
            session.add(learning_path)
            await session.flush()
            created_paths += 1
        else:
            learning_path.slug = slug
            learning_path.category = category
            learning_path.level = roadmap_data.get("level", learning_path.level)
            learning_path.difficulty = roadmap_data.get("difficulty", learning_path.difficulty)
            learning_path.duration = roadmap_data.get("duration", learning_path.duration)
            learning_path.description = roadmap_data.get("description", learning_path.description)
            learning_path.skills_covered = skills_covered
            learning_path.prerequisites = prerequisites
            learning_path.career_outcomes = career_outcomes
            learning_path.technology_stack = tech_stack
            learning_path.resources = resources
            learning_path.tags = tags
            learning_path.projects = projects
            learning_path.is_featured = roadmap_data.get("is_featured", learning_path.is_featured)
            learning_path.popularity_rank = roadmap_data.get("popularity_rank", learning_path.popularity_rank)
            learning_path.search_terms = list(set((learning_path.search_terms or []) + search_terms))
            learning_path.related_concepts = skills_covered
            if associated_skill_id and not learning_path.skill_id:
                learning_path.skill_id = associated_skill_id
            await session.flush()
            updated_paths += 1

        # 2. Synchronize Roadmap Steps (Milestones)
        existing_steps_stmt = select(RoadmapStep).where(
            RoadmapStep.learning_path_id == learning_path.id
        )
        existing_steps_res = await session.execute(existing_steps_stmt)
        existing_steps_by_num = {s.step_number: s for s in existing_steps_res.scalars().all()}

        steps_data = roadmap_data.get("roadmap_steps", [])
        for step_dict in steps_data:
            step_num = step_dict["step_number"]
            step_title = step_dict["title"]
            step_desc = step_dict.get("description", "")
            topics = step_dict.get("topics_covered") or step_dict.get("topics", [])
            duration = step_dict.get("duration")

            if step_num in existing_steps_by_num:
                step_obj = existing_steps_by_num[step_num]
                step_obj.title = step_title
                step_obj.description = step_desc
                step_obj.topics = topics
                step_obj.duration = duration
                updated_steps += 1
            else:
                new_step = RoadmapStep(
                    learning_path_id=learning_path.id,
                    step_number=step_num,
                    title=step_title,
                    description=step_desc,
                    topics=topics,
                    duration=duration,
                )
                session.add(new_step)
                created_steps += 1

    await session.commit()
    logger.info(
        f"Seeding completed successfully: "
        f"{created_paths} new roadmaps, {updated_paths} updated roadmaps, "
        f"{created_steps} new milestones, {updated_steps} updated milestones."
    )
    return {
        "created_paths": created_paths,
        "updated_paths": updated_paths,
        "created_steps": created_steps,
        "updated_steps": updated_steps,
        "total_catalog_roadmaps": len(ALL_ROADMAPS),
    }


async def main():
    async with async_session_maker() as session:
        result = await seed_100_roadmaps(session)
        print("SEED RESULT:", result)


if __name__ == "__main__":
    asyncio.run(main())
