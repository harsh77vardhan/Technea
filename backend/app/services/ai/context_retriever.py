"""Context Retriever for Technea AI services.

Retrieves and extracts technical concepts from learner inquiries, performs targeted
database queries against Technea's catalog (Skills, Learning Paths, Courses, Projects),
and fetches learner-specific active roadmaps, enrolled tracks, and gamification standing.
Synthesizes structured system context blocks, deep-link actions, and dynamic follow-up suggestions.
"""

import logging
from datetime import datetime, timedelta, timezone
import re
import uuid
from typing import Any

from sqlalchemy import String, case, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.lesson import Lesson
from app.models.progress import UserLearningPath, UserLearningPathProgress, UserLessonProgress, UserRoadmapProgress
from app.models.project import Project, UserProject
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.models.user import User
from app.models.user_roadmap import DailyLearningActivity, UserGeneratedRoadmap, UserRoadmap
from app.services.ai.recommendation_engine import recommendation_engine
from app.services.ai.roadmap_context_extractor import roadmap_context_extractor
from app.services.ai.trusted_resources import get_trusted_resources_for_topic
from app.services.progress import progress_service

logger = logging.getLogger("technea.ai.context_retriever")

# Common domain concept phrases to match multi-word technical concepts first
DOMAIN_CONCEPTS: list[str] = [
    # Multi-word engineering & domain roles
    "ai engineer",
    "ai engineering",
    "ai agent",
    "ai agents",
    "autonomous agent",
    "autonomous agents",
    "multi-agent",
    "llm engineering",
    "large language models",
    "prompt engineering",
    "data engineering",
    "data engineer",
    "data science",
    "data analytics",
    "cloud computing",
    "cloud devops",
    "cloud engineering",
    "cloud native",
    "cloud security",
    "devsecops",
    "ethical hacking",
    "penetration testing",
    "network security",
    "web security",
    "linux security",
    "incident response",
    "soc analyst",
    "malware analysis",
    "reverse engineering",
    "full stack",
    "fullstack",
    "web development",
    "front end",
    "frontend",
    "back end",
    "backend",
    "machine learning",
    "deep learning",
    "computer vision",
    "natural language processing",
    "mobile development",
    "ios development",
    "android development",
    "systems programming",
    "competitive programming",
    "cyber security",
    "cybersecurity",
    "system design",
    "microservices",
    "devops",
    "artificial intelligence",
]

# Single-token technical keywords
TECH_KEYWORDS: set[str] = {
    "python",
    "react",
    "fastapi",
    "docker",
    "kubernetes",
    "k8s",
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
    "swift",
    "swiftui",
    "ios",
    "android",
    "kotlin",
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
    "cybersecurity",
    "pentesting",
    "infosec",
    "devsecops",
    "owasp",
    "siem",
    "mlops",
    "bash",
    "shell",
    "testing",
    "pytest",
    "data",
    "ai",
    "ml",
    "llm",
    "rag",
    "agent",
    "agents",
    "spark",
    "airflow",
    "snowflake",
    "dbt",
    "terraform",
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
    "help", "recommend", "best", "way", "guide", "roadmap", "roadmaps", "project", "projects",
    "skill", "skills", "course", "courses", "path", "paths", "want", "like", "need",
    "become", "becoming", "became", "career", "engineer", "engineering", "developer", "development",
}

# Domain synonym expansion map for AI Context Retriever
RETRIEVER_SYNONYMS: dict[str, list[str]] = {
    "k8s": ["kubernetes", "container orchestration"],
    "kubernetes": ["k8s", "container orchestration"],
    "ml": ["machine learning", "scikit-learn"],
    "machine learning": ["ml", "scikit-learn"],
    "ai": ["artificial intelligence", "ai engineering", "machine learning"],
    "artificial intelligence": ["ai", "machine learning"],
    "ai engineer": ["ai engineering", "artificial intelligence", "machine learning", "deep learning"],
    "ai engineering": ["ai engineer", "artificial intelligence", "machine learning", "deep learning"],
    "ai agent": ["ai agents", "autonomous agents"],
    "ai agents": ["ai agent", "autonomous agents", "langgraph", "crewai"],
    "agent": ["ai agents", "autonomous agents"],
    "agents": ["ai agents", "autonomous agents"],
    "pentesting": ["penetration testing", "ethical hacking", "cybersecurity"],
    "penetration testing": ["pentesting", "ethical hacking", "cybersecurity"],
    "ethical hacking": ["penetration testing", "pentesting", "cybersecurity"],
    "infosec": ["cybersecurity", "cyber security"],
    "cyber security": ["cybersecurity", "infosec", "ethical hacking"],
    "cybersecurity": ["cyber security", "ethical hacking", "infosec"],
    "ios": ["swift", "swiftui", "mobile development"],
    "swift": ["ios", "swiftui", "mobile development"],
    "swiftui": ["swift", "ios", "mobile development"],
    "android": ["kotlin", "mobile development"],
    "kotlin": ["android", "mobile development"],
    "nextjs": ["next.js", "next", "react"],
    "next.js": ["nextjs", "react"],
    "golang": ["go"],
    "go": ["golang"],
    "rust": ["systems programming", "rust lang"],
    "cloud": ["cloud computing", "devops", "aws", "gcp"],
    "cloud computing": ["cloud", "devops", "aws", "gcp"],
    "devops": ["ci/cd", "docker", "kubernetes"],
    "data engineering": ["data engineer", "etl", "data pipelines", "big data"],
    "data engineer": ["data engineering", "etl"],
    "llm": ["large language models", "generative ai", "prompt engineering"],
    "large language models": ["llm", "generative ai"],
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
        """Extract multi-word domain concepts, technical keywords, and synonym expansions from a query string.

        Args:
            query: Raw user query or prompt.

        Returns:
            List of prioritized technical concepts and keywords with synonym expansions.
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

        # 3. Direct checks for key aliases & abbreviations
        alias_checks = [
            ("k8s", "kubernetes"),
            ("ml", "machine learning"),
            ("pentesting", "penetration testing"),
            ("ios", "swift"),
            ("nextjs", "next.js"),
            ("agent", "ai agents"),
            ("agents", "ai agents"),
            ("ai", "artificial intelligence"),
            ("llm", "large language models"),
            ("golang", "go"),
        ]
        for trigger, canonical in alias_checks:
            pattern = r"(?:\b|_)" + re.escape(trigger) + r"(?:\b|_)"
            if re.search(pattern, q):
                if trigger not in extracted:
                    extracted.append(trigger)
                if canonical not in extracted:
                    extracted.append(canonical)

        # 4. If no technical keywords were found, extract salient non-stopword tokens (len >= 3)
        if not extracted:
            for w in words:
                clean_w = w.strip(".,;:?!")
                if len(clean_w) >= 3 and clean_w not in STOP_WORDS and clean_w not in extracted:
                    extracted.append(clean_w)

        # 5. Expand synonyms for all extracted terms
        expanded: list[str] = list(extracted)
        for term in extracted:
            syns = RETRIEVER_SYNONYMS.get(term, [])
            for s in syns:
                if s not in expanded:
                    expanded.append(s)

        return expanded

    def _extract_anchor_keywords(
        self,
        keywords: list[str] | None = None,
        user_progress: dict[str, Any] | None = None,
        current_track: str | None = None,
        domain: str | None = None,
    ) -> list[str]:
        """Extract prioritized anchor keywords to prevent random catalog lookups when query keywords are empty."""
        anchors: list[str] = []

        # 1. Existing valid keywords passed in
        if keywords:
            for kw in keywords:
                if kw and kw.strip() and kw.strip().lower() not in anchors:
                    anchors.append(kw.strip().lower())

        if anchors:
            return anchors

        # 2. Extract from user progress / active roadmaps
        if user_progress:
            active_rms = user_progress.get("active_roadmaps") or []
            if active_rms:
                top_rm = active_rms[0]
                if isinstance(top_rm, dict):
                    # Current milestone skills and title
                    cur_skills = top_rm.get("current_key_skills") or []
                    for s in cur_skills:
                        if str(s).lower() not in anchors:
                            anchors.append(str(s).lower())

                    cur_m_title = top_rm.get("current_milestone_title")
                    if cur_m_title:
                        words = self.extract_keywords(cur_m_title)
                        for w in words:
                            if w not in anchors:
                                anchors.append(w)

                    rm_title = top_rm.get("title", "")
                    for w in self.extract_keywords(rm_title):
                        if w not in anchors:
                            anchors.append(w)

            pref_lang = user_progress.get("preferred_language")
            if pref_lang and pref_lang.lower() not in anchors:
                anchors.append(pref_lang.lower())

            goal = user_progress.get("learning_goal")
            if goal:
                for w in self.extract_keywords(goal):
                    if w not in anchors:
                        anchors.append(w)

        # 3. Explicit current_track
        if current_track:
            for w in self.extract_keywords(current_track):
                if w not in anchors:
                    anchors.append(w)

        # 4. Domain context
        if domain:
            for w in self.extract_keywords(domain.replace("_", " ")):
                if w not in anchors:
                    anchors.append(w)

        # 5. Core foundational fallback (NEVER Blender or Business Analytics!)
        if not anchors:
            anchors = ["python", "web development", "programming fundamentals", "data structures"]

        return anchors

    async def search_skills(
        self,
        db: AsyncSession,
        keywords: list[str],
        limit: int = 4,
        user_progress: dict[str, Any] | None = None,
        current_track: str | None = None,
        domain: str | None = None,
    ) -> list[dict[str, Any]]:
        """Query matching skills from Technea database catalog with domain anchoring & relevance scoring."""
        effective_kws = self._extract_anchor_keywords(
            keywords=keywords,
            user_progress=user_progress,
            current_track=current_track,
            domain=domain,
        )

        filters = []
        for kw in effective_kws:
            pat = f"%{kw}%"
            filters.append(Skill.name.ilike(pat))
            filters.append(Skill.category.ilike(pat))
            filters.append(Skill.description.ilike(pat))
            filters.append(cast(Skill.keywords, String).ilike(pat))
            filters.append(cast(Skill.tags, String).ilike(pat))

        # Domain blacklist filtering to prevent random/unrelated recommendations
        exclusion_filters = []
        for bl in ["%blender%", "%3d design%", "%3d modeling%", "%business analytics%", "%accounting%", "%financial analysis%"]:
            if not any(bl.strip("%") in kw for kw in effective_kws):
                exclusion_filters.append(func.coalesce(Skill.name, "").notilike(bl))
                exclusion_filters.append(func.coalesce(Skill.category, "").notilike(bl))

        name_exact = or_(*[Skill.name.ilike(kw) for kw in effective_kws])
        name_like = or_(*[Skill.name.ilike(f"%{kw}%") for kw in effective_kws])
        category_like = or_(*[Skill.category.ilike(f"%{kw}%") for kw in effective_kws])

        stmt = (
            select(Skill)
            .where(or_(*filters))
            .where(*exclusion_filters)
            .order_by(
                case((name_exact, 0), (name_like, 1), (category_like, 2), else_=3),
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
        user_progress: dict[str, Any] | None = None,
        current_track: str | None = None,
        domain: str | None = None,
    ) -> list[dict[str, Any]]:
        """Query matching learning paths and step counts from database catalog with strict relevance."""
        effective_kws = self._extract_anchor_keywords(
            keywords=keywords,
            user_progress=user_progress,
            current_track=current_track,
            domain=domain,
        )

        filters = []
        for kw in effective_kws:
            pat = f"%{kw}%"
            filters.append(LearningPath.title.ilike(pat))
            filters.append(LearningPath.category.ilike(pat))
            filters.append(LearningPath.level.ilike(pat))
            filters.append(LearningPath.description.ilike(pat))
            filters.append(cast(LearningPath.search_terms, String).ilike(pat))
            filters.append(cast(LearningPath.related_concepts, String).ilike(pat))
            filters.append(cast(LearningPath.skills_covered, String).ilike(pat))
            filters.append(cast(LearningPath.technology_stack, String).ilike(pat))
            filters.append(cast(LearningPath.tags, String).ilike(pat))
            filters.append(cast(LearningPath.slug, String).ilike(pat))

        exclusion_filters = []
        for bl in ["%blender%", "%3d design%", "%3d modeling%", "%business analytics%", "%accounting%", "%financial analysis%"]:
            if not any(bl.strip("%") in kw for kw in effective_kws):
                exclusion_filters.append(func.coalesce(LearningPath.title, "").notilike(bl))
                exclusion_filters.append(func.coalesce(LearningPath.category, "").notilike(bl))

        title_exact = or_(*[LearningPath.title.ilike(kw) for kw in effective_kws])
        title_like = or_(*[LearningPath.title.ilike(f"%{kw}%") for kw in effective_kws])
        category_like = or_(*[LearningPath.category.ilike(f"%{kw}%") for kw in effective_kws])

        stmt = (
            select(LearningPath, func.count(RoadmapStep.id).label("step_count"))
            .outerjoin(RoadmapStep, RoadmapStep.learning_path_id == LearningPath.id)
            .where(or_(*filters))
            .where(*exclusion_filters)
            .group_by(LearningPath.id)
            .order_by(
                case((title_exact, 0), (title_like, 1), (category_like, 2), else_=3),
                LearningPath.title,
            )
            .limit(limit)
        )
        res = await db.execute(stmt)
        rows = res.all()

        results: list[dict[str, Any]] = []
        for lp, step_count in rows:
            slug = lp.slug or slugify(lp.title)
            direct_link = f"/learning-paths/{lp.id}"
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
                "skills_covered": lp.skills_covered or [],
                "technology_stack": lp.technology_stack or [],
                "direct_link": direct_link,
                "url": direct_link,
            })
        return results

    async def search_courses(
        self,
        db: AsyncSession,
        keywords: list[str],
        limit: int = 4,
        user_progress: dict[str, Any] | None = None,
        current_track: str | None = None,
        domain: str | None = None,
    ) -> list[dict[str, Any]]:
        """Query matching courses from database catalog with domain anchoring & relevance."""
        effective_kws = self._extract_anchor_keywords(
            keywords=keywords,
            user_progress=user_progress,
            current_track=current_track,
            domain=domain,
        )

        filters = []
        for kw in effective_kws:
            pat = f"%{kw}%"
            filters.append(Course.title.ilike(pat))
            filters.append(Course.description.ilike(pat))
            filters.append(Course.difficulty.ilike(pat))
            filters.append(cast(Course.tags, String).ilike(pat))

        exclusion_filters = []
        for bl in ["%blender%", "%3d design%", "%3d modeling%", "%business analytics%", "%accounting%", "%financial analysis%"]:
            if not any(bl.strip("%") in kw for kw in effective_kws):
                exclusion_filters.append(func.coalesce(Course.title, "").notilike(bl))

        title_like = or_(*[Course.title.ilike(f"%{kw}%") for kw in effective_kws])
        lvl_order = case(
            (Course.difficulty.ilike("%beginner%"), 0),
            (Course.difficulty.ilike("%intermediate%"), 1),
            else_=2,
        )

        stmt = (
            select(Course)
            .where(or_(*filters))
            .where(*exclusion_filters)
            .order_by(
                case((title_like, 0), else_=1),
                lvl_order,
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
        user_progress: dict[str, Any] | None = None,
        current_track: str | None = None,
        domain: str | None = None,
    ) -> list[dict[str, Any]]:
        """Query matching hands-on practice projects with strict tech stack relevance."""
        effective_kws = self._extract_anchor_keywords(
            keywords=keywords,
            user_progress=user_progress,
            current_track=current_track,
            domain=domain,
        )

        filters = []
        for kw in effective_kws:
            pat = f"%{kw}%"
            filters.append(Project.title.ilike(pat))
            filters.append(Project.description.ilike(pat))
            filters.append(Project.difficulty.ilike(pat))
            filters.append(cast(Project.technologies, String).ilike(pat))
            filters.append(cast(Project.required_skills, String).ilike(pat))
            filters.append(cast(Project.related_paths, String).ilike(pat))

        exclusion_filters = []
        for bl in ["%blender%", "%3d design%", "%3d modeling%", "%business analytics%", "%accounting%", "%financial analysis%"]:
            if not any(bl.strip("%") in kw for kw in effective_kws):
                exclusion_filters.append(func.coalesce(Project.title, "").notilike(bl))

        title_like = or_(*[Project.title.ilike(f"%{kw}%") for kw in effective_kws])

        stmt = (
            select(Project)
            .where(or_(*filters))
            .where(*exclusion_filters)
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

    async def get_user_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Fetch deep learner memory: profile, roadmaps, lessons, projects, and recent activity."""
        user_progress: dict[str, Any] = {
            "user_id": str(user_id),
            "user_name": "Developer",
            "full_name": "",
            "username": "",
            "developer_level": "Junior Developer",
            "current_skill_level": "Beginner",
            "xp_points": 0,
            "streak": 0,
            "streak_count": 0,
            "learning_goal": "Software Engineering Mastery",
            "interests": "Full Stack Development, Web APIs",
            "bio": "",
            "preferred_language": "Python",
            "time_available": "1-2 hours/day",
            "active_roadmaps": [],
            "enrolled_paths": [],
            "completed_milestones": [],
            "completed_lessons_count": 0,
            "recent_completed_lessons": [],
            "user_projects": [],
            "recent_activity": {
                "streak": 0,
                "total_study_minutes": 0,
                "study_time_hours": 0.0,
                "completed_goals_count": 0,
                "days_active_last_week": 0,
                "recent_logs": [],
            },
        }

        # 1. Fetch User model: full_name, username, developer_level, xp_points, learning_goal, current_skill_level, interests, bio
        try:
            stmt_user = select(User).where(User.id == user_id)
            user_obj = (await db.execute(stmt_user)).scalars().first()
            if user_obj:
                user_progress["full_name"] = user_obj.full_name or ""
                user_progress["username"] = user_obj.username or ""
                user_progress["user_name"] = user_obj.full_name or user_obj.username or "Developer"
                if user_obj.learning_goal:
                    user_progress["learning_goal"] = user_obj.learning_goal
                if user_obj.current_skill_level:
                    user_progress["current_skill_level"] = user_obj.current_skill_level
                if user_obj.interests:
                    user_progress["interests"] = user_obj.interests
                if user_obj.bio:
                    user_progress["bio"] = user_obj.bio
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
                if dash.developer_level:
                    user_progress["developer_level"] = dash.developer_level
                if dash.xp_points is not None:
                    user_progress["xp_points"] = dash.xp_points
                if dash.streak_count is not None:
                    user_progress["streak"] = dash.streak_count
                    user_progress["streak_count"] = dash.streak_count
        except Exception as exc:
            logger.debug("Failed to query progress dashboard in context retriever: %s", exc)

        # 3. Query Active Roadmaps (UserGeneratedRoadmap & UserLearningPath)
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

                # Extract preferred_language & time_commitment from roadmap_data
                r_data = getattr(r, "roadmap_data", None) or {}
                if isinstance(r_data, dict):
                    pref_lang = r_data.get("preferred_language") or r_data.get("language") or r_data.get("programming_language")
                    if pref_lang and (not user_progress.get("preferred_language") or user_progress.get("preferred_language") == "Python"):
                        user_progress["preferred_language"] = str(pref_lang)
                    time_com = r_data.get("time_commitment") or r_data.get("available_time") or r_data.get("time_available") or r_data.get("hours_per_week")
                    if time_com:
                        user_progress["time_available"] = str(time_com)

                # Ensure current_milestone has lessons key
                cur_m = extracted.get("current_milestone")
                if cur_m and isinstance(cur_m, dict):
                    if "lessons" not in cur_m:
                        cur_m["lessons"] = cur_m.get("courses") or []

                ar_dict = {
                    "id": r.id,
                    "title": extracted["roadmap_title"],
                    "goal": extracted["roadmap_goal"],
                    "target_role": extracted["target_role"],
                    "experience_level": getattr(r, "experience_level", None) or "Beginner",
                    "estimated_duration": getattr(r, "estimated_duration", None) or "3-6 Months",
                    "progress_percent": r.progress_percent,
                    "completed_milestone_ids": getattr(r, "completed_milestone_ids", None) or [],
                    "current_step": current_step,
                    "total_steps": total_steps,
                    "completed_milestones": extracted["completed_milestones"],
                    "completed_count": completed_count,
                    "current_milestone": cur_m,
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

            # Query Enrolled / In-Progress Learning Paths (UserLearningPath)
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

            # If user has no custom generated roadmap, treat active enrolled path as active roadmap
            if not user_progress["active_roadmaps"] and user_progress["enrolled_paths"]:
                for ulp, lp in res_enrolled:
                    if ulp.status == "active":
                        stmt_steps = (
                            select(RoadmapStep)
                            .where(RoadmapStep.learning_path_id == lp.id)
                            .order_by(RoadmapStep.step_order.asc())
                        )
                        steps = (await db.execute(stmt_steps)).scalars().all()
                        stmt_prog = (
                            select(UserRoadmapProgress.step_id)
                            .where(
                                UserRoadmapProgress.user_id == user_id,
                                UserRoadmapProgress.learning_path_id == lp.id,
                                UserRoadmapProgress.is_completed == True,
                            )
                        )
                        done_ids = set((await db.execute(stmt_prog)).scalars().all())

                        completed_titles = [s.title for s in steps if s.id in done_ids]
                        pending_steps = [s for s in steps if s.id not in done_ids]
                        curr_step = pending_steps[0] if pending_steps else (steps[-1] if steps else None)
                        next_step = pending_steps[1] if len(pending_steps) > 1 else None

                        curr_milestone_dict = {
                            "id": curr_step.id if curr_step else 0,
                            "title": curr_step.title if curr_step else "Foundations",
                            "description": curr_step.description if curr_step else "",
                            "key_skills": [lp.category] if lp.category else [],
                            "prerequisites": [],
                            "action_items": [],
                            "lessons": [],
                            "project": None,
                        } if curr_step else None

                        user_progress["active_roadmaps"].append({
                            "id": lp.id,
                            "title": lp.title,
                            "goal": f"Complete {lp.title}",
                            "target_role": lp.title,
                            "experience_level": lp.level or "Beginner",
                            "estimated_duration": lp.duration or "4-8 Weeks",
                            "progress_percent": ulp.progress_percent,
                            "completed_milestone_ids": list(done_ids),
                            "current_step": len(completed_titles) + 1,
                            "total_steps": len(steps) or 1,
                            "completed_milestones": completed_titles,
                            "completed_count": len(completed_titles),
                            "current_milestone": curr_milestone_dict,
                            "current_milestone_title": curr_step.title if curr_step else "Foundations",
                            "current_milestone_description": curr_step.description if curr_step else "",
                            "upcoming_milestone": next_step.title if next_step else None,
                            "upcoming_milestone_title": next_step.title if next_step else "",
                            "required_prerequisites": [],
                            "current_key_skills": [lp.category] if lp.category else [],
                            "current_action_items": [],
                            "current_project": None,
                            "milestones": [{"id": s.id, "title": s.title} for s in steps],
                            "formatted_guidance": f"Continue with milestone: {curr_step.title}" if curr_step else "",
                        })
                        break

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

        # 4. Retrieve Completed Lessons (UserLessonProgress)
        try:
            stmt_completed_lessons = (
                select(func.count(UserLessonProgress.id))
                .where(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.is_completed == True,
                )
            )
            completed_count = (await db.execute(stmt_completed_lessons)).scalar() or 0
            user_progress["completed_lessons_count"] = completed_count

            stmt_recent_lessons = (
                select(
                    Lesson.title.label("lesson_title"),
                    Course.title.label("course_title"),
                    UserLessonProgress.completed_at,
                )
                .join(Lesson, UserLessonProgress.lesson_id == Lesson.id)
                .outerjoin(Course, UserLessonProgress.course_id == Course.id)
                .where(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.is_completed == True,
                )
                .order_by(UserLessonProgress.completed_at.desc())
                .limit(5)
            )
            res_recent_lessons = (await db.execute(stmt_recent_lessons)).all()
            user_progress["recent_completed_lessons"] = [
                {
                    "lesson_title": row.lesson_title,
                    "course_title": row.course_title or "Technea Course",
                    "completed_at": row.completed_at.isoformat() if row.completed_at else None,
                }
                for row in res_recent_lessons
            ]
        except Exception as exc:
            logger.debug("Failed to query completed lessons in context retriever: %s", exc)

        # 5. Retrieve Current Projects (UserProject joining Project)
        try:
            stmt_user_projects = (
                select(Project, UserProject)
                .join(Project, UserProject.project_id == Project.id)
                .where(UserProject.user_id == user_id)
                .order_by(UserProject.started_at.desc())
                .limit(10)
            )
            res_projects = (await db.execute(stmt_user_projects)).all()
            user_progress["user_projects"] = [
                {
                    "title": p.title,
                    "difficulty": p.difficulty or "Beginner",
                    "status": up.status or "in_progress",
                    "technologies": p.technologies or [],
                    "github_url": up.github_url or "",
                }
                for p, up in res_projects
            ]
        except Exception as exc:
            logger.debug("Failed to query user projects in context retriever: %s", exc)

        # 6. Retrieve Recent Activity (DailyLearningActivity for last 7 days)
        try:
            seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
            stmt_activity = (
                select(DailyLearningActivity)
                .where(
                    DailyLearningActivity.user_id == user_id,
                    DailyLearningActivity.activity_date >= seven_days_ago,
                )
                .order_by(DailyLearningActivity.activity_date.desc())
            )
            res_activities = (await db.execute(stmt_activity)).scalars().all()
            total_study_minutes = sum(a.minutes_spent for a in res_activities) if res_activities else 0
            completed_goals = sum(a.task_count for a in res_activities) if res_activities else 0
            activity_streak = res_activities[0].streak_count if res_activities else user_progress.get("streak", 0)

            user_progress["recent_activity"] = {
                "streak": activity_streak,
                "total_study_minutes": total_study_minutes,
                "study_time_hours": round(total_study_minutes / 60, 1),
                "completed_goals_count": completed_goals,
                "days_active_last_week": len(res_activities),
                "recent_logs": [
                    {
                        "date": a.activity_date,
                        "minutes_spent": a.minutes_spent,
                        "tasks": a.completed_tasks,
                        "streak": a.streak_count,
                    }
                    for a in res_activities
                ],
            }
        except Exception as exc:
            logger.debug("Failed to query recent activity in context retriever: %s", exc)

        # Preferred language heuristics fallback if default Python:
        text_for_lang = f"{user_progress.get('interests', '')} {user_progress.get('learning_goal', '')}".lower()
        if user_progress["preferred_language"] == "Python":
            if "typescript" in text_for_lang:
                user_progress["preferred_language"] = "TypeScript"
            elif "javascript" in text_for_lang or "react" in text_for_lang:
                user_progress["preferred_language"] = "JavaScript"
            elif "golang" in text_for_lang or " go " in f" {text_for_lang} ":
                user_progress["preferred_language"] = "Go"
            elif "rust" in text_for_lang:
                user_progress["preferred_language"] = "Rust"
            elif "java" in text_for_lang:
                user_progress["preferred_language"] = "Java"
            elif "c++" in text_for_lang:
                user_progress["preferred_language"] = "C++"

        return user_progress

    async def retrieve_user_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Fetch active roadmaps, enrolled tracks, level, XP, and streak for a learner (backward compatible wrapper)."""
        return await self.get_user_progress(db=db, user_id=user_id)

    def formulate_user_progress_context(self, user_progress: dict[str, Any]) -> str:
        """Synthesize rich, high-signal Markdown block for AI Mentor 2.0 learner profile and memory."""
        if not user_progress or not user_progress.get("user_id"):
            return ""

        name = user_progress.get("full_name") or user_progress.get("user_name", "Developer")
        username = user_progress.get("username", "")
        lvl = user_progress.get("developer_level", "Junior Developer")
        skill_lvl = user_progress.get("current_skill_level") or lvl
        xp = user_progress.get("xp_points", 0)
        streak = user_progress.get("streak", 0)
        goal = user_progress.get("learning_goal") or "Master modern software engineering"
        interests = user_progress.get("interests") or "Full Stack Development, Web APIs"
        bio = user_progress.get("bio") or ""
        pref_lang = user_progress.get("preferred_language", "Python")
        time_avail = user_progress.get("time_available", "1-2 hours/day")

        lines: list[str] = [
            "### 👤 LEARNER PROFILE & MENTOR MEMORY",
            "#### 👤 Learner Profile & Standing (Active Milestone Context):",
            f"- **Learner**: **{name}**" + (f" (`@{username}`)" if username else "") + f" | Level: **{lvl}** (Skill: {skill_lvl}) | XP: **{xp}** | Daily Streak: **{streak} day(s)**",
            f"- **Primary Learning Goal**: {goal}",
            f"- **Preferred Language**: **{pref_lang}** | **Time Commitment / Availability**: **{time_avail}**",
            f"- **Technical Interests**: {interests}",
        ]
        if bio:
            lines.append(f"- **Bio**: {bio}")

        active_roadmaps = user_progress.get("active_roadmaps", [])
        if active_roadmaps:
            lines.append("\n#### 🗺️ Active Roadmap & Milestone Trajectory:")
            for ar in active_roadmaps:
                lines.append(
                    f"- Active Roadmap: **{ar['title']}** (Goal: *{ar['goal']}*, "
                    f"Milestone {ar['current_step']}/{ar['total_steps']}, Progress: {ar['progress_percent']}%)"
                )
                if ar.get("target_role"):
                    lines.append(f"  - Target Role: **{ar['target_role']}**")
                if ar.get("experience_level"):
                    lines.append(f"  - Experience Level: {ar['experience_level']}")
                if ar.get("estimated_duration"):
                    lines.append(f"  - Estimated Duration: {ar['estimated_duration']}")
                completed = ar.get("completed_milestones", [])
                comp_str = ", ".join(completed) if completed else "None yet"
                lines.append(f"  - Completed Milestones: {comp_str}")
                cur_title = ar.get("current_milestone_title") or f"Milestone {ar['current_step']}"
                lines.append(f"  - Current Milestone: **{cur_title}**")
                if ar.get("current_milestone_description"):
                    lines.append(f"    - Description: {ar['current_milestone_description']}")
                skills = ar.get("current_key_skills", [])
                if skills:
                    lines.append(f"    - Key Skills: {', '.join(skills)}")
                prereqs = ar.get("required_prerequisites", [])
                if prereqs:
                    lines.append(f"    - Required Prerequisites: {', '.join(prereqs)}")
                cur_m = ar.get("current_milestone") or {}
                action_items = cur_m.get("action_items") or ar.get("current_action_items", [])
                if action_items:
                    lines.append(f"    - Action Items: {'; '.join(action_items[:4])}")
                cur_proj = cur_m.get("project") or ar.get("current_project")
                if cur_proj and isinstance(cur_proj, dict) and cur_proj.get("title"):
                    lines.append(f"    - Hands-on Project: **{cur_proj['title']}** ({cur_proj.get('difficulty', 'Beginner')})")
                up_title = ar.get("upcoming_milestone_title") or ar.get("upcoming_milestone")
                if up_title:
                    lines.append(f"  - Upcoming Milestone: **{up_title}**")
                if ar.get("formatted_guidance"):
                    lines.append(f"  - Guidance: {ar['formatted_guidance']}")

        enrolled_paths = user_progress.get("enrolled_paths", [])
        if enrolled_paths:
            enrolled_titles = [f"{ep['title']} ({ep['progress_percent']}%)" for ep in enrolled_paths[:3]]
            lines.append(f"- Enrolled Learning Paths: {', '.join(enrolled_titles)}")

        # Completed Lessons
        completed_lessons_count = user_progress.get("completed_lessons_count", 0)
        recent_lessons = user_progress.get("recent_completed_lessons", [])
        lines.append(f"\n#### 🎓 Completed Lessons & Knowledge Baseline ({completed_lessons_count} total completed):")
        if recent_lessons:
            for l in recent_lessons[:5]:
                lines.append(f"- Completed Lesson: **{l['lesson_title']}** (Course: *{l['course_title']}*)")
        else:
            lines.append("- No individual video lessons marked as completed yet.")

        # Current Projects
        user_projects = user_progress.get("user_projects", [])
        lines.append("\n#### 🛠️ Current Hands-on Projects:")
        if user_projects:
            for up in user_projects[:5]:
                techs = ", ".join(up.get("technologies", [])[:4])
                gh = f" [GitHub: {up['github_url']}]" if up.get("github_url") else ""
                lines.append(f"- Project: **{up['title']}** (Status: `{up.get('status', 'in_progress')}`, Difficulty: {up.get('difficulty', 'Beginner')}, Stack: {techs}){gh}")
        else:
            lines.append("- No portfolio projects recorded yet.")

        # Recent Activity
        activity = user_progress.get("recent_activity", {})
        act_streak = activity.get("streak", streak)
        study_mins = activity.get("total_study_minutes", 0)
        study_hrs = activity.get("study_time_hours", round(study_mins / 60, 1))
        completed_goals = activity.get("completed_goals_count", 0)
        days_active = activity.get("days_active_last_week", activity.get("days_active", 0))
        lines.append("\n#### 📈 Recent Activity & Study Consistency (Last 7 Days):")
        lines.append(f"- Active Days: **{days_active}/7** | Total Study Time: **{study_mins} mins** (~{study_hrs} hrs) | Tasks/Goals Completed: **{completed_goals}** | Streak: **{act_streak} day(s)**")

        return "\n".join(lines)

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
                direct_url = f"/learning-paths/{lp['id']}"
                step_str = f", Steps: {lp['step_count']}" if lp.get("step_count") else ""
                lines.append(
                    f"- **[{lp['title']}]({direct_url})** (Direct Link: `{direct_url}`, Slug: `{lp['slug']}`, Level: {lp['level']}, "
                    f"Duration: {lp['estimated_hours']}{step_str})"
                )
                if lp.get("skills_covered"):
                    sc_preview = ", ".join(lp["skills_covered"][:5])
                    lines.append(f"  Skills Covered: {sc_preview}")
                if lp.get("technology_stack"):
                    tech_preview = ", ".join(lp["technology_stack"][:5])
                    lines.append(f"  Tech Stack: {tech_preview}")
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
            lines.append("\n" + self.formulate_user_progress_context(user_progress))

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
            direct_url = f"/learning-paths/{active['id']}"
            actions.append({
                "action_type": "view_roadmap",
                "title": action_title,
                "payload": {
                    "roadmap_id": active["id"],
                    "title": active["title"],
                    "current_step": active["current_step"],
                    "current_milestone_title": cur_m,
                    "slug": slugify(active["title"]),
                    "url": direct_url,
                    "direct_link": direct_url,
                    "status": "active",
                },
            })

        # 2. Surface top matched learning paths strictly relevant to active domain
        for lp in learning_paths[:2]:
            if len(actions) >= max_actions:
                break
            if user_progress and user_progress.get("active_roadmaps"):
                active_domain = recommendation_engine._infer_active_domain({"user_progress": user_progress})
                if not recommendation_engine.is_item_relevant(lp, active_domain, set()):
                    continue
            direct_url = f"/learning-paths/{lp['id']}"
            actions.append({
                "action_type": "view_roadmap",
                "title": f"Explore Roadmap: {lp['title']}",
                "payload": {
                    "slug": lp["slug"],
                    "path_id": lp["id"],
                    "title": lp["title"],
                    "level": lp["level"],
                    "url": direct_url,
                    "direct_link": direct_url,
                },
            })

        # 3. Surface top matched projects strictly relevant to active domain
        for p in projects[:2]:
            if len(actions) >= max_actions:
                break
            if user_progress and user_progress.get("active_roadmaps"):
                active_domain = recommendation_engine._infer_active_domain({"user_progress": user_progress})
                if not recommendation_engine.is_item_relevant(p, active_domain, set()):
                    continue
            actions.append({
                "action_type": "view_project",
                "title": f"Build Project: {p['title']}",
                "payload": {
                    "project_id": p["id"],
                    "title": p["title"],
                    "difficulty": p["difficulty"],
                },
            })

        # 4. Surface top matched skills strictly relevant to active domain
        for s in skills[:1]:
            if len(actions) >= max_actions:
                break
            if user_progress and user_progress.get("active_roadmaps"):
                active_domain = recommendation_engine._infer_active_domain({"user_progress": user_progress})
                if not recommendation_engine.is_item_relevant(s, active_domain, set()):
                    continue
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
            user_progress = await self.get_user_progress(db, user_id)

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

        # 5. Tier 4 & 5: Catalog database searches with query keywords anchored by user progress
        raw_skills = await self.search_skills(db, keywords, limit=6, user_progress=user_progress)
        raw_paths = await self.search_learning_paths(db, keywords, limit=6, user_progress=user_progress)
        raw_courses = await self.search_courses(db, keywords, limit=6, user_progress=user_progress)
        raw_projects = await self.search_projects(db, keywords, limit=6, user_progress=user_progress)

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

        # 10. Formulate recommendations with Strict Relevance
        rec_context = {
            "user_progress": user_progress,
            "active_roadmaps": user_progress.get("active_roadmaps", []) if user_progress else [],
            "matched_paths": learning_paths,
            "matched_skills": skills,
            "matched_projects": projects,
            "matched_courses": courses,
            "preferred_language": user_progress.get("preferred_language") if user_progress else "Python",
        }
        recs = recommendation_engine.get_recommendations(context=rec_context, query=query)

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
            "recommended_projects": recs.get("recommended_projects", []),
            "recommended_resources": recs.get("recommended_resources", []),
        }


# Global singleton instance of ContextRetriever
context_retriever = ContextRetriever()
