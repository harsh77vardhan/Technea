"""Context Retriever for Technea AI services.

Retrieves and extracts technical concepts from learner inquiries, performs targeted
database queries against Technea's catalog (Skills, Learning Paths, Courses, Projects),
and fetches learner-specific active roadmaps, enrolled tracks, and gamification standing.
Synthesizes structured system context blocks, deep-link actions, and dynamic follow-up suggestions.
"""

import logging
import re
import uuid
from typing import Any

from sqlalchemy import String, case, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.progress import UserLearningPath, UserLearningPathProgress, UserRoadmapProgress
from app.models.project import Project
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.models.user import User
from app.models.user_roadmap import DailyLearningActivity, UserGeneratedRoadmap, UserRoadmap
from app.services.ai.roadmap_context_extractor import roadmap_context_extractor
from app.services.progress import progress_service

logger = logging.getLogger("technea.ai.context_retriever")

# Common domain concept phrases to match multi-word technical concepts first
DOMAIN_CONCEPTS: list[str] = [
    "full stack",
    "fullstack",
    "machine learning",
    "deep learning",
    "data science",
    "data analytics",
    "web development",
    "cloud computing",
    "cloud devops",
    "ethical hacking",
    "cyber security",
    "cybersecurity",
    "system design",
    "systems programming",
    "front end",
    "frontend",
    "back end",
    "backend",
    "devops",
    "artificial intelligence",
    "microservices",
    "computer vision",
    "natural language processing",
    "mobile development",
]

# Single-token technical keywords
TECH_KEYWORDS: set[str] = {
    "python",
    "react",
    "fastapi",
    "docker",
    "kubernetes",
    "sql",
    "postgres",
    "postgresql",
    "redis",
    "javascript",
    "typescript",
    "node",
    "nodejs",
    "next.js",
    "nextjs",
    "vue",
    "angular",
    "aws",
    "gcp",
    "azure",
    "linux",
    "git",
    "pandas",
    "pytorch",
    "tensorflow",
    "django",
    "flask",
    "java",
    "c++",
    "golang",
    "go",
    "rust",
    "graphql",
    "rest",
    "api",
    "html",
    "css",
    "tailwind",
    "mongodb",
    "kafka",
    "rabbitmq",
    "security",
    "mlops",
    "bash",
    "shell",
    "testing",
    "pytest",
    "data",
}

# English stop words to filter out when extracting general query tokens
STOP_WORDS: set[str] = {
    "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to", "for", "with",
    "about", "against", "between", "into", "through", "during", "before", "after",
    "above", "below", "from", "up", "down", "out", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just",
    "should", "now", "i", "me", "my", "myself", "we", "our", "you", "your", "he",
    "she", "it", "they", "them", "what", "which", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have",
    "has", "had", "having", "do", "does", "did", "doing", "get", "got", "getting",
    "start", "started", "starting", "learn", "learning", "tell", "show", "please",
    "help", "recommend", "best", "way", "guide", "roadmap", "project", "projects",
    "skill", "skills", "course", "courses", "path", "paths", "want", "like", "need",
}

# Advanced topics that must be hidden from Beginner / Code Initiate users unless explicitly requested
FORBIDDEN_ADVANCED_TOPICS: list[str] = [
    "enterprise",
    "distributed systems",
    "distributed",
    "advanced architecture",
    "production scaling",
    "kubernetes",
    "graphql advanced",
    "advanced graphql",
    "next.js advanced",
    "advanced next.js",
]


def slugify(text: str) -> str:
    """Generate a clean URL slug from a title string."""
    s = text.lower().replace("&", "and").replace("/", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


class ContextRetriever:
    """Intelligent database catalog and user context retriever for Technea AI.

    Extracts technical keywords, queries relational catalog entities (Skills,
    Learning Paths, Courses, Projects), retrieves user roadmap progress, and builds
    high-signal markdown context blocks and actionable frontend deep links.
    """

    def extract_keywords(self, query: str) -> list[str]:
        """Extract multi-word domain concepts and technical keywords from a query string.

        Args:
            query: Raw user query or prompt.

        Returns:
            List of prioritized technical concepts and keywords.
        """
        if not query or not query.strip():
            return []

        q = query.lower()
        extracted: list[str] = []

        # 1. Match multi-word domain concepts first
        for concept in DOMAIN_CONCEPTS:
            if concept in q:
                if concept not in extracted:
                    extracted.append(concept)

        # 2. Match single-word technical keywords
        words = re.findall(r"[a-zA-Z0-9+#\.\-]+", q)
        for w in words:
            clean_w = w.strip(".,;:?!")
            if clean_w in TECH_KEYWORDS and clean_w not in extracted:
                extracted.append(clean_w)

        # 3. If no technical keywords were found, extract salient non-stopword tokens (len >= 3)
        if not extracted:
            for w in words:
                clean_w = w.strip(".,;:?!")
                if len(clean_w) >= 3 and clean_w not in STOP_WORDS and clean_w not in extracted:
                    extracted.append(clean_w)

        return extracted

    async def search_skills(self, db: AsyncSession, keywords: list[str], limit: int = 4) -> list[dict[str, Any]]:
        """Query matching skills from Technea database catalog."""
        if not keywords:
            stmt = select(Skill).limit(limit)
            res = await db.execute(stmt)
            skills = res.scalars().all()
        else:
            filters = []
            for kw in keywords:
                pat = f"%{kw}%"
                filters.append(Skill.name.ilike(pat))
                filters.append(Skill.category.ilike(pat))
                filters.append(Skill.description.ilike(pat))
                filters.append(cast(Skill.keywords, String).ilike(pat))
                filters.append(cast(Skill.tags, String).ilike(pat))

            name_exact = or_(*[Skill.name.ilike(kw) for kw in keywords])
            name_like = or_(*[Skill.name.ilike(f"%{kw}%") for kw in keywords])

            stmt = (
                select(Skill)
                .where(or_(*filters))
                .order_by(
                    case((name_exact, 0), (name_like, 1), else_=2),
                    Skill.name,
                )
                .limit(limit)
            )
            res = await db.execute(stmt)
            skills = res.scalars().all()

        results: list[dict[str, Any]] = []
        for s in skills:
            results.append({
                "id": s.id,
                "name": s.name,
                "title": s.name,
                "category": s.category,
                "level": getattr(s, "level", "All Levels") or "All Levels",
                "description": s.description or "",
                "tags": s.tags or [],
            })
        return results

    async def search_learning_paths(
        self,
        db: AsyncSession,
        keywords: list[str],
        limit: int = 4,
    ) -> list[dict[str, Any]]:
        """Query matching learning paths and step counts from database catalog."""
        if not keywords:
            stmt = (
                select(LearningPath, func.count(RoadmapStep.id).label("step_count"))
                .outerjoin(RoadmapStep, RoadmapStep.learning_path_id == LearningPath.id)
                .group_by(LearningPath.id)
                .limit(limit)
            )
            res = await db.execute(stmt)
            rows = res.all()
        else:
            filters = []
            for kw in keywords:
                pat = f"%{kw}%"
                filters.append(LearningPath.title.ilike(pat))
                filters.append(LearningPath.category.ilike(pat))
                filters.append(LearningPath.level.ilike(pat))
                filters.append(LearningPath.description.ilike(pat))
                filters.append(cast(LearningPath.search_terms, String).ilike(pat))
                filters.append(cast(LearningPath.related_concepts, String).ilike(pat))

            title_exact = or_(*[LearningPath.title.ilike(kw) for kw in keywords])
            title_like = or_(*[LearningPath.title.ilike(f"%{kw}%") for kw in keywords])

            stmt = (
                select(LearningPath, func.count(RoadmapStep.id).label("step_count"))
                .outerjoin(RoadmapStep, RoadmapStep.learning_path_id == LearningPath.id)
                .where(or_(*filters))
                .group_by(LearningPath.id)
                .order_by(
                    case((title_exact, 0), (title_like, 1), else_=2),
                    LearningPath.title,
                )
                .limit(limit)
            )
            res = await db.execute(stmt)
            rows = res.all()

        results: list[dict[str, Any]] = []
        for lp, step_count in rows:
            slug = slugify(lp.title)
            results.append({
                "id": lp.id,
                "title": lp.title,
                "slug": slug,
                "category": lp.category,
                "level": lp.level or "Beginner to Intermediate",
                "estimated_hours": lp.duration or "4-6 Weeks",
                "duration": lp.duration or "4-6 Weeks",
                "step_count": int(step_count or 0),
                "description": lp.description or "",
            })
        return results

    async def search_courses(
        self,
        db: AsyncSession,
        keywords: list[str],
        limit: int = 4,
    ) -> list[dict[str, Any]]:
        """Query matching courses from database catalog."""
        if not keywords:
            stmt = select(Course).limit(limit)
            res = await db.execute(stmt)
            courses = res.scalars().all()
        else:
            filters = []
            for kw in keywords:
                pat = f"%{kw}%"
                filters.append(Course.title.ilike(pat))
                filters.append(Course.description.ilike(pat))
                filters.append(Course.difficulty.ilike(pat))
                filters.append(cast(Course.tags, String).ilike(pat))

            title_like = or_(*[Course.title.ilike(f"%{kw}%") for kw in keywords])

            stmt = (
                select(Course)
                .where(or_(*filters))
                .order_by(
                    case((title_like, 0), else_=1),
                    Course.title,
                )
                .limit(limit)
            )
            res = await db.execute(stmt)
            courses = res.scalars().all()

        results: list[dict[str, Any]] = []
        for c in courses:
            results.append({
                "id": c.id,
                "title": c.title,
                "level": c.difficulty or "Beginner",
                "difficulty": c.difficulty or "Beginner",
                "category": c.platform or "Online",
                "platform": c.platform or "Online Course",
                "instructor": c.instructor or "Technea Instructor",
                "duration": c.duration or "Self-paced",
                "description": c.description or "",
            })
        return results

    async def search_projects(
        self,
        db: AsyncSession,
        keywords: list[str],
        limit: int = 4,
    ) -> list[dict[str, Any]]:
        """Query matching hands-on practice projects from database catalog."""
        if not keywords:
            stmt = select(Project).limit(limit)
            res = await db.execute(stmt)
            projects = res.scalars().all()
        else:
            filters = []
            for kw in keywords:
                pat = f"%{kw}%"
                filters.append(Project.title.ilike(pat))
                filters.append(Project.description.ilike(pat))
                filters.append(Project.difficulty.ilike(pat))
                filters.append(cast(Project.technologies, String).ilike(pat))
                filters.append(cast(Project.required_skills, String).ilike(pat))
                filters.append(cast(Project.related_paths, String).ilike(pat))

            title_like = or_(*[Project.title.ilike(f"%{kw}%") for kw in keywords])

            stmt = (
                select(Project)
                .where(or_(*filters))
                .order_by(
                    case((title_like, 0), else_=1),
                    Project.title,
                )
                .limit(limit)
            )
            res = await db.execute(stmt)
            projects = res.scalars().all()

        results: list[dict[str, Any]] = []
        for p in projects:
            results.append({
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty or "Beginner",
                "tech_stack": p.technologies or [],
                "technologies": p.technologies or [],
                "estimated_time": p.estimated_time or "1-2 Weeks",
                "description": p.description or "",
            })
        return results

    async def retrieve_user_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Fetch active roadmaps, enrolled tracks, level, XP, and streak for a learner."""
        user_progress: dict[str, Any] = {
            "user_id": str(user_id),
            "developer_level": "Junior Developer",
            "xp_points": 0,
            "streak": 0,
            "streak_count": 0,
            "active_roadmaps": [],
            "enrolled_paths": [],
            "user_name": "Developer",
        }

        # 1. Fetch user model
        try:
            stmt_user = select(User).where(User.id == user_id)
            user_obj = (await db.execute(stmt_user)).scalars().first()
            if user_obj:
                user_progress["user_name"] = user_obj.full_name or user_obj.username or "Developer"
                if getattr(user_obj, "developer_level", None):
                    user_progress["developer_level"] = user_obj.developer_level
                if getattr(user_obj, "xp_points", None) is not None:
                    user_progress["xp_points"] = user_obj.xp_points
        except Exception as exc:
            logger.debug("Failed to query User in context retriever: %s", exc)

        # 2. Fetch Gamification standing via progress_service
        try:
            dash = await progress_service.get_dashboard_summary(db, user_id=user_id)
            if dash:
                user_progress["developer_level"] = dash.developer_level
                user_progress["xp_points"] = dash.xp_points
                user_progress["streak"] = dash.streak_count
                user_progress["streak_count"] = dash.streak_count
        except Exception as exc:
            logger.debug("Failed to query progress dashboard in context retriever: %s", exc)

        # 3. Query Active Roadmaps (UserGeneratedRoadmap / UserRoadmap)
        try:
            stmt_roadmaps = (
                select(UserGeneratedRoadmap)
                .where(
                    UserGeneratedRoadmap.user_id == user_id,
                    UserGeneratedRoadmap.is_active == True,
                )
                .order_by(UserGeneratedRoadmap.updated_at.desc())
            )
            res_roadmaps = (await db.execute(stmt_roadmaps)).scalars().all()
            for r in res_roadmaps:
                extracted = roadmap_context_extractor.extract(r)
                total_steps = extracted.get("total_milestones") or 1
                completed_count = extracted.get("completed_count") or 0
                current_step = min(completed_count + 1, total_steps) if total_steps else 1

                ar_dict = {
                    "id": r.id,
                    "title": extracted["roadmap_title"],
                    "goal": extracted["roadmap_goal"],
                    "target_role": extracted["target_role"],
                    "progress_percent": r.progress_percent,
                    "current_step": current_step,
                    "total_steps": total_steps,
                    "completed_milestones": extracted["completed_milestones"],
                    "completed_count": completed_count,
                    "current_milestone": extracted["current_milestone"],
                    "current_milestone_title": extracted["current_milestone_title"],
                    "current_milestone_description": extracted["current_milestone_description"],
                    "upcoming_milestone": extracted["upcoming_milestone"],
                    "upcoming_milestone_title": extracted["upcoming_milestone_title"],
                    "required_prerequisites": extracted["required_prerequisites"],
                    "current_key_skills": extracted["current_key_skills"],
                    "current_action_items": extracted["current_action_items"],
                    "current_project": extracted["current_project"],
                    "milestones": extracted["all_milestones"],
                    "formatted_guidance": extracted["formatted_guidance"],
                }
                user_progress["active_roadmaps"].append(ar_dict)

            # Inject top-level milestone awareness fields for AI reasoning
            if user_progress["active_roadmaps"]:
                top_ar = user_progress["active_roadmaps"][0]
                user_progress["roadmap_goal"] = top_ar["goal"]
                user_progress["completed_milestones"] = top_ar["completed_milestones"]
                user_progress["current_milestone_title"] = top_ar["current_milestone_title"]
                user_progress["current_milestone_description"] = top_ar["current_milestone_description"]
                user_progress["upcoming_milestone"] = top_ar["upcoming_milestone_title"]
                user_progress["required_prerequisites"] = top_ar["required_prerequisites"]
                user_progress["current_key_skills"] = top_ar["current_key_skills"]
                user_progress["formatted_guidance"] = top_ar["formatted_guidance"]
        except Exception as exc:
            logger.debug("Failed to query active roadmaps in context retriever: %s", exc)

        # 4. Query Enrolled / In-Progress Learning Paths
        try:
            stmt_enrolled = (
                select(UserLearningPath, LearningPath)
                .join(LearningPath, UserLearningPath.learning_path_id == LearningPath.id)
                .where(UserLearningPath.user_id == user_id)
                .order_by(UserLearningPath.last_accessed_at.desc())
                .limit(5)
            )
            res_enrolled = (await db.execute(stmt_enrolled)).all()
            for ulp, lp in res_enrolled:
                user_progress["enrolled_paths"].append({
                    "path_id": lp.id,
                    "title": lp.title,
                    "slug": slugify(lp.title),
                    "status": ulp.status,
                    "progress_percent": ulp.progress_percent,
                    "category": lp.category,
                    "level": lp.level,
                })
        except Exception as exc:
            logger.debug("Failed to query enrolled paths in context retriever: %s", exc)

        return user_progress

    def formulate_catalog_context(
        self,
        keywords: list[str],
        skills: list[dict[str, Any]],
        learning_paths: list[dict[str, Any]],
        courses: list[dict[str, Any]],
        projects: list[dict[str, Any]],
        user_progress: dict[str, Any] | None = None,
    ) -> str:
        """Construct the TECHNEA_CATALOG_CONTEXT markdown block for prompt injection."""
        lines: list[str] = [
            "### TECHNEA_CATALOG_CONTEXT",
            "The following authentic curriculum items and hands-on learning resources are actively available in Technea's catalog:",
        ]

        if keywords:
            lines.append(f"Matching Inquired Concepts: {', '.join(keywords)}")

        # Learning Paths
        if learning_paths:
            lines.append("\n#### 🗺️ Technea Learning Paths & Interactive Roadmaps:")
            for lp in learning_paths:
                lines.append(
                    f"- **{lp['title']}** (Slug: `{lp['slug']}`, Level: {lp['level']}, "
                    f"Duration: {lp['estimated_hours']}, Steps: {lp['step_count']})"
                )
                if lp.get("description"):
                    lines.append(f"  Description: {lp['description'][:140]}...")

        # Skills
        if skills:
            lines.append("\n#### 🎯 Matching Skills & Competencies:")
            for s in skills:
                lines.append(f"- **{s['name']}** (Category: {s['category']}, Level: {s['level']})")

        # Hands-on Projects
        if projects:
            lines.append("\n#### 💻 Practice Projects in Technea Catalog:")
            for p in projects:
                techs = ", ".join(p["tech_stack"][:4]) if p.get("tech_stack") else "Standard Stack"
                lines.append(
                    f"- **{p['title']}** (Difficulty: {p['difficulty']}, Tech Stack: {techs}, Est. Time: {p['estimated_time']})"
                )
                if p.get("description"):
                    lines.append(f"  Description: {p['description'][:140]}...")

        # Courses
        if courses:
            lines.append("\n#### 📚 Curated Courses & Video Masterclasses:")
            for c in courses:
                lines.append(
                    f"- **{c['title']}** (Level: {c['level']}, Platform: {c['platform']}, Instructor: {c['instructor']}, Duration: {c['duration']})"
                )

        # User progress if authenticated
        if user_progress and user_progress.get("user_id"):
            lines.append("\n#### 👤 Learner Profile & Standing (Active Milestone Context):")
            lvl = user_progress.get("developer_level", "Junior Developer")
            xp = user_progress.get("xp_points", 0)
            streak = user_progress.get("streak", 0)
            lines.append(f"- Current Level: **{lvl}** | XP: **{xp}** | Daily Streak: **{streak} day(s)**")

            active_roadmaps = user_progress.get("active_roadmaps", [])
            if active_roadmaps:
                for ar in active_roadmaps:
                    lines.append(
                        f"- Active Roadmap: **{ar['title']}** (Goal: *{ar['goal']}*, "
                        f"Milestone {ar['current_step']}/{ar['total_steps']}, Progress: {ar['progress_percent']}%)"
                    )
                    completed = ar.get("completed_milestones", [])
                    comp_str = ", ".join(completed) if completed else "None yet"
                    lines.append(f"  - Completed Milestones: {comp_str}")
                    cur_title = ar.get("current_milestone_title") or f"Milestone {ar['current_step']}"
                    lines.append(f"  - Current Milestone: **{cur_title}**")
                    if ar.get("current_milestone_description"):
                        lines.append(f"    - Description: {ar['current_milestone_description']}")
                    prereqs = ar.get("required_prerequisites", [])
                    if prereqs:
                        lines.append(f"    - Required Prerequisites: {', '.join(prereqs)}")
                    up_title = ar.get("upcoming_milestone_title")
                    if up_title:
                        lines.append(f"  - Upcoming Milestone: **{up_title}**")
                    if ar.get("formatted_guidance"):
                        lines.append(f"  - Guidance: {ar['formatted_guidance']}")

            enrolled_paths = user_progress.get("enrolled_paths", [])
            if enrolled_paths:
                enrolled_titles = [f"{ep['title']} ({ep['progress_percent']}%)" for ep in enrolled_paths[:3]]
                lines.append(f"- Enrolled Learning Paths: {', '.join(enrolled_titles)}")

        return "\n".join(lines)

    def formulate_related_actions(
        self,
        learning_paths: list[dict[str, Any]],
        skills: list[dict[str, Any]],
        projects: list[dict[str, Any]],
        user_progress: dict[str, Any] | None = None,
        max_actions: int = 4,
    ) -> list[dict[str, Any]]:
        """Synthesize contextual deep links pointing to real database slugs, skills, and projects."""
        actions: list[dict[str, Any]] = []

        # 1. Surface user's active roadmap if present
        if user_progress and user_progress.get("active_roadmaps"):
            active = user_progress["active_roadmaps"][0]
            cur_m = active.get("current_milestone_title")
            action_title = f"Continue Roadmap: {active['title']} ({cur_m})" if cur_m else f"Continue Roadmap: {active['title']}"
            actions.append({
                "action_type": "view_roadmap",
                "title": action_title,
                "payload": {
                    "roadmap_id": active["id"],
                    "title": active["title"],
                    "current_step": active["current_step"],
                    "current_milestone_title": cur_m,
                    "slug": slugify(active["title"]),
                    "status": "active",
                },
            })

        # 2. Surface top matched learning paths
        for lp in learning_paths[:2]:
            if len(actions) >= max_actions:
                break
            actions.append({
                "action_type": "view_roadmap",
                "title": f"Explore Roadmap: {lp['title']}",
                "payload": {
                    "slug": lp["slug"],
                    "path_id": lp["id"],
                    "title": lp["title"],
                    "level": lp["level"],
                },
            })

        # 3. Surface top matched projects
        for p in projects[:1]:
            if len(actions) >= max_actions:
                break
            actions.append({
                "action_type": "view_project",
                "title": f"Build Project: {p['title']}",
                "payload": {
                    "project_id": p["id"],
                    "title": p["title"],
                    "difficulty": p["difficulty"],
                },
            })

        # 4. Surface top matched skills
        for s in skills[:1]:
            if len(actions) >= max_actions:
                break
            actions.append({
                "action_type": "explore_skill",
                "title": f"Skill: {s['name']}",
                "payload": {
                    "skill_id": s["id"],
                    "skill": s["name"],
                    "category": s["category"],
                },
            })

        # Fallback catalog action if actions count is low
        if len(actions) < 3:
            actions.append({
                "action_type": "browse_catalog",
                "title": "Browse Full Technea Catalog",
                "payload": {"view": "catalog"},
            })

        return actions[:max_actions]

    def formulate_suggestions(
        self,
        keywords: list[str],
        learning_paths: list[dict[str, Any]],
        skills: list[dict[str, Any]],
        projects: list[dict[str, Any]],
        user_progress: dict[str, Any] | None = None,
    ) -> list[str]:
        """Generate 3-4 natural follow-up prompt suggestions dynamically referencing catalog items."""
        suggestions: list[str] = []

        # 1. Active roadmap suggestion
        if user_progress and user_progress.get("active_roadmaps"):
            active = user_progress["active_roadmaps"][0]
            cur_m = active.get("current_milestone_title")
            if cur_m:
                suggestions.append(f"What should I focus on for my next milestone: {cur_m}?")
            else:
                suggestions.append(f"What should I focus on for my next milestone in {active['title']}?")
            prereqs = active.get("required_prerequisites")
            if prereqs:
                suggestions.append(f"What are the prerequisites to complete {cur_m or 'this milestone'}?")

        # 2. Matched learning path suggestion
        if learning_paths:
            lp = learning_paths[0]
            suggestions.append(f"How do I get started with the {lp['title']} roadmap?")

        # 3. Matched project suggestion
        if projects:
            p = projects[0]
            suggestions.append(f"Can you guide me through building {p['title']} step-by-step?")

        # 4. Matched skill suggestion
        if skills:
            s = skills[0]
            suggestions.append(f"What are the most crucial prerequisites to master {s['name']}?")

        # Fallback / domain enrichments if fewer than 3 suggestions
        default_pool = [
            "What hands-on capstone project best showcases this for hiring managers?",
            "What common production pitfalls should I avoid when scaling this?",
            "Can you explain the core architectural trade-offs with a code example?",
            "How many hours a week should I spend to complete this track efficiently?",
        ]
        for opt in default_pool:
            if len(suggestions) >= 4:
                break
            if opt not in suggestions:
                suggestions.append(opt)

        return suggestions[:4]

    async def retrieve_context(
        self,
        db: AsyncSession,
        query: str,
        user_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        """Retrieve full database catalog and user progress context for a query.

        Applies 5-tier catalog resource ranking:
        1. Active roadmap resources
        2. Current milestone related skills
        3. Required prerequisites
        4. Beginner appropriate resources
        5. Advanced related resources (suppressed for Beginner/Code Initiate unless requested)
        """
        # 1. Retrieve user progress first (if authenticated)
        user_progress: dict[str, Any] | None = None
        if user_id is not None:
            user_progress = await self.retrieve_user_progress(db, user_id)

        # 2. Determine learner level and whether to filter advanced/enterprise topics
        lvl_str = (user_progress.get("developer_level") if user_progress else "Beginner").lower()
        is_beginner = any(b in lvl_str for b in ["beginner", "code initiate", "explorer", "novice", "absolute", "junior"])
        q_lower = query.lower()
        user_asked_for_forbidden = any(term in q_lower for term in FORBIDDEN_ADVANCED_TOPICS)
        filter_advanced = is_beginner and not user_asked_for_forbidden

        def is_item_forbidden(item: dict[str, Any]) -> bool:
            if not filter_advanced:
                return False
            text = f"{item.get('title', '')} {item.get('name', '')} {item.get('description', '')} {item.get('category', '')}".lower()
            if any(term in text for term in FORBIDDEN_ADVANCED_TOPICS):
                return True
            lvl_val = str(item.get("level") or item.get("difficulty") or "").lower()
            if lvl_val in ["advanced", "expert"]:
                return True
            return False

        # 3. Keyword / Concept extraction
        keywords = self.extract_keywords(query)
        logger.debug("Extracted keywords for query '%s': %s", query[:60], keywords)

        # 4. Tier 1: Active Roadmap Resources
        tier1_paths: list[dict[str, Any]] = []
        tier1_projects: list[dict[str, Any]] = []
        tier1_courses: list[dict[str, Any]] = []
        tier2_skills: list[dict[str, Any]] = []
        tier3_skills: list[dict[str, Any]] = []
        tier3_paths: list[dict[str, Any]] = []

        if user_progress and user_progress.get("active_roadmaps"):
            top_ar = user_progress["active_roadmaps"][0]
            cur_milestone = top_ar.get("current_milestone") or {}

            # Tier 1 - Active roadmap learning path
            lp_id = cur_milestone.get("learning_path_id")
            lp_title = cur_milestone.get("learning_path_title")
            if lp_id:
                try:
                    stmt_lp = (
                        select(LearningPath, func.count(RoadmapStep.id).label("step_count"))
                        .outerjoin(RoadmapStep, RoadmapStep.learning_path_id == LearningPath.id)
                        .where(LearningPath.id == lp_id)
                        .group_by(LearningPath.id)
                    )
                    row = (await db.execute(stmt_lp)).first()
                    if row:
                        lp_obj, sc = row
                        tier1_paths.append({
                            "id": lp_obj.id,
                            "title": lp_obj.title,
                            "slug": slugify(lp_obj.title),
                            "category": lp_obj.category,
                            "level": lp_obj.level or "Beginner to Intermediate",
                            "estimated_hours": lp_obj.duration or "4-6 Weeks",
                            "duration": lp_obj.duration or "4-6 Weeks",
                            "step_count": int(sc or 0),
                            "description": lp_obj.description or "",
                        })
                except Exception as exc:
                    logger.debug("Tier 1 learning path lookup failed: %s", exc)
            elif lp_title:
                tier1_paths_res = await self.search_learning_paths(db, [lp_title], limit=1)
                if tier1_paths_res:
                    tier1_paths.extend(tier1_paths_res)

            # Tier 1 - Active roadmap project
            cur_proj = cur_milestone.get("project")
            if cur_proj and isinstance(cur_proj, dict) and cur_proj.get("title"):
                tier1_projects.append({
                    "id": 0,
                    "title": cur_proj["title"],
                    "difficulty": cur_proj.get("difficulty", "Beginner"),
                    "tech_stack": cur_proj.get("tech_stack", cur_milestone.get("key_skills", [])),
                    "technologies": cur_proj.get("tech_stack", cur_milestone.get("key_skills", [])),
                    "estimated_time": "1-2 Weeks",
                    "description": cur_proj.get("description", ""),
                })

            # Tier 1 - Active roadmap courses
            cur_courses = cur_milestone.get("courses") or []
            for c_ref in cur_courses:
                if isinstance(c_ref, dict) and c_ref.get("title"):
                    tier1_courses.append({
                        "id": c_ref.get("id") or 0,
                        "title": c_ref["title"],
                        "level": "Beginner",
                        "difficulty": "Beginner",
                        "category": "Online",
                        "platform": c_ref.get("platform") or "Online Course",
                        "instructor": c_ref.get("instructor") or "Technea Instructor",
                        "duration": c_ref.get("duration") or "Self-paced",
                        "description": "",
                    })

            # Tier 2: Current Milestone Related Skills
            cur_skills = cur_milestone.get("key_skills") or []
            if cur_skills:
                tier2_skills = await self.search_skills(db, cur_skills, limit=3)

            # Tier 3: Required Prerequisites
            prereqs = cur_milestone.get("prerequisites") or []
            if prereqs:
                tier3_skills = await self.search_skills(db, prereqs, limit=2)
                tier3_paths = await self.search_learning_paths(db, prereqs, limit=2)

        # 5. Tier 4 & 5: Catalog database searches with query keywords
        raw_skills = await self.search_skills(db, keywords, limit=6)
        raw_paths = await self.search_learning_paths(db, keywords, limit=6)
        raw_courses = await self.search_courses(db, keywords, limit=6)
        raw_projects = await self.search_projects(db, keywords, limit=6)

        # Apply recommendation filtering: remove forbidden advanced topics for beginners
        filtered_raw_skills = [s for s in raw_skills if not is_item_forbidden(s)]
        filtered_raw_paths = [p for p in raw_paths if not is_item_forbidden(p)]
        filtered_raw_courses = [c for c in raw_courses if not is_item_forbidden(c)]
        filtered_raw_projects = [p for p in raw_projects if not is_item_forbidden(p)]

        # 6. Merge in 5-Tier Priority Order with deduplication
        # Learning Paths: Tier 1 -> Tier 3 -> Tier 4
        all_paths = tier1_paths + [p for p in tier3_paths if not is_item_forbidden(p)] + filtered_raw_paths
        seen_path_titles: set[str] = set()
        deduped_paths: list[dict[str, Any]] = []
        for p in all_paths:
            norm_title = p["title"].strip().lower()
            if norm_title not in seen_path_titles:
                seen_path_titles.add(norm_title)
                deduped_paths.append(p)
        learning_paths = deduped_paths[:4]

        # Skills: Tier 2 -> Tier 3 -> Tier 4
        all_skills = [s for s in tier2_skills if not is_item_forbidden(s)] + [s for s in tier3_skills if not is_item_forbidden(s)] + filtered_raw_skills
        seen_skill_names: set[str] = set()
        deduped_skills: list[dict[str, Any]] = []
        for s in all_skills:
            norm_name = s["name"].strip().lower()
            if norm_name not in seen_skill_names:
                seen_skill_names.add(norm_name)
                deduped_skills.append(s)
        skills = deduped_skills[:4]

        # Projects: Tier 1 -> Tier 4
        all_projects = tier1_projects + filtered_raw_projects
        seen_proj_titles: set[str] = set()
        deduped_projects: list[dict[str, Any]] = []
        for p in all_projects:
            norm_title = p["title"].strip().lower()
            if norm_title not in seen_proj_titles:
                seen_proj_titles.add(norm_title)
                deduped_projects.append(p)
        projects = deduped_projects[:4]

        # Courses: Tier 1 -> Tier 4
        all_courses = tier1_courses + filtered_raw_courses
        seen_course_titles: set[str] = set()
        deduped_courses: list[dict[str, Any]] = []
        for c in all_courses:
            norm_title = c["title"].strip().lower()
            if norm_title not in seen_course_titles:
                seen_course_titles.add(norm_title)
                deduped_courses.append(c)
        courses = deduped_courses[:4]

        # 7. Formulate markdown catalog context block
        catalog_context = self.formulate_catalog_context(
            keywords=keywords,
            skills=skills,
            learning_paths=learning_paths,
            courses=courses,
            projects=projects,
            user_progress=user_progress,
        )

        # 8. Formulate related actions with real database slugs and titles
        related_actions = self.formulate_related_actions(
            learning_paths=learning_paths,
            skills=skills,
            projects=projects,
            user_progress=user_progress,
        )

        # 9. Formulate suggestions
        suggestions = self.formulate_suggestions(
            keywords=keywords,
            learning_paths=learning_paths,
            skills=skills,
            projects=projects,
            user_progress=user_progress,
        )

        return {
            "keywords": keywords,
            "skills": skills,
            "learning_paths": learning_paths,
            "courses": courses,
            "projects": projects,
            "user_progress": user_progress,
            "catalog_context": catalog_context,
            "related_actions": related_actions,
            "suggestions": suggestions,
        }


# Global singleton instance of ContextRetriever
context_retriever = ContextRetriever()
