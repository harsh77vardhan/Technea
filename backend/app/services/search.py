"""High-performance search service with fuzzy matching, synonym expansion, and metadata scoring."""

import re
from difflib import SequenceMatcher
from typing import Any
from collections.abc import Sequence

from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_path import LearningPath
from app.models.skill import Skill
from app.models.course import Course
from app.schemas.search import UnifiedSearchResponse
from app.schemas.learning_path import LearningPathResponse
from app.schemas.skill import SkillResponse
from app.schemas.course import CourseResponse

# =============================================================================
# SYNONYM & CONCEPT EXPANSION MAP
# =============================================================================

SYNONYMS: dict[str, list[str]] = {
    # 1. Python & Backend Scripting
    "python": [
        "python programming", "automation", "scripting", "backend", "django",
        "fastapi", "data science", "machine learning", "py", "cpython"
    ],
    "automation": [
        "python", "scripting", "bash", "shell scripting", "devops", "ci/cd",
        "cron", "ansible", "workflow"
    ],
    "scripting": [
        "python", "bash", "shell scripting", "javascript", "automation", "cli"
    ],
    "backend": [
        "backend development", "api", "rest api", "python", "fastapi", "django",
        "node.js", "express", "go", "java", "sql", "database", "server", "microservices"
    ],
    "django": [
        "python", "backend", "full stack", "django rest framework", "web framework"
    ],
    "fastapi": [
        "python", "backend", "rest api", "async api", "openapi", "microservices"
    ],

    # 2. JavaScript, TypeScript & Web
    "javascript": [
        "js", "ecmascript", "frontend", "web development", "react", "node.js",
        "full stack", "vanilla js", "dom", "browser"
    ],
    "typescript": [
        "ts", "typed javascript", "javascript", "type safety", "react", "next.js", "frontend"
    ],
    "web development": [
        "web dev", "frontend", "backend", "full stack", "html", "css",
        "javascript", "react", "next.js", "websites", "build websites"
    ],
    "frontend": [
        "frontend development", "client side", "html", "css", "javascript",
        "react", "next.js", "ui", "tailwind css", "web design"
    ],
    "react": [
        "reactjs", "frontend", "web development", "ui", "components", "jsx",
        "next.js", "javascript library", "state management"
    ],
    "next.js": [
        "nextjs", "react", "full stack", "ssr", "server components", "web development"
    ],
    "node": [
        "node.js", "javascript", "backend", "server", "express", "apis", "serverless"
    ],
    "html": [
        "html5", "semantic web", "web", "web development", "accessibility", "frontend"
    ],
    "css": [
        "css3", "styling", "responsive design", "flexbox", "grid", "tailwind css", "frontend"
    ],

    # 3. AI / Machine Learning
    "machine learning": [
        "ml", "ai", "artificial intelligence", "data science", "deep learning",
        "scikit-learn", "predictive modeling", "algorithms"
    ],
    "ai": [
        "artificial intelligence", "machine learning", "deep learning", "generative ai",
        "llm", "large language models", "ai agents", "nlp", "computer vision", "neural networks"
    ],
    "deep learning": [
        "dl", "neural networks", "pytorch", "tensorflow", "ai", "transformers", "backpropagation"
    ],
    "generative ai": [
        "genai", "llm", "large language models", "diffusion", "ai agents",
        "chatgpt", "openai", "prompts", "generative modeling"
    ],
    "llm": [
        "large language models", "generative ai", "gpt", "transformers",
        "prompt engineering", "rag", "fine tuning", "nlp"
    ],
    "nlp": [
        "natural language processing", "text analysis", "transformers", "bert",
        "embeddings", "llm", "semantic search"
    ],
    "computer vision": [
        "cv", "vision ai", "image recognition", "opencv", "yolo", "object detection", "deep learning"
    ],
    "ai agents": [
        "autonomous agents", "agentic workflows", "langchain", "crewai", "langgraph", "llm agents"
    ],

    # 4. Data
    "data science": [
        "data", "machine learning", "python", "pandas", "statistics",
        "analytics", "data analysis", "predictive modeling"
    ],
    "data analytics": [
        "analytics", "business intelligence", "bi", "sql", "power bi",
        "tableau", "dashboards", "excel", "metrics"
    ],
    "sql": [
        "sql & databases", "relational database", "queries", "postgresql",
        "mysql", "database", "joins", "data"
    ],
    "database": [
        "databases", "sql", "postgresql", "mongodb", "nosql", "data modeling", "storage"
    ],
    "statistics": [
        "stats", "probability", "data science", "inference", "hypothesis testing", "math"
    ],
    "big data": [
        "apache spark", "hadoop", "distributed computing", "data engineering", "kafka"
    ],

    # 5. Cybersecurity
    "cybersecurity": [
        "cyber security", "security", "infosec", "ethical hacking", "network security",
        "penetration testing", "defense", "vulnerabilities", "hacking"
    ],
    "ethical hacking": [
        "penetration testing", "pentesting", "kali linux", "cybersecurity",
        "metasploit", "exploits", "white hat", "bug bounty"
    ],
    "network security": [
        "networking", "wireshark", "firewalls", "protocols", "tcp/ip", "vpn", "packet analysis"
    ],

    # 6. Cloud & DevOps
    "cloud": [
        "cloud computing", "aws", "azure", "gcp", "devops", "infrastructure", "serverless"
    ],
    "devops": [
        "ci/cd", "docker", "kubernetes", "linux", "terraform", "automation",
        "infrastructure", "sre", "pipelines", "git"
    ],
    "docker": [
        "containerization", "containers", "dockerfile", "docker compose", "devops", "kubernetes"
    ],
    "kubernetes": [
        "k8s", "orchestration", "containers", "docker", "devops", "cloud native", "helm"
    ],
    "aws": [
        "amazon web services", "cloud", "ec2", "s3", "lambda", "cloud computing"
    ],
    "linux": [
        "linux administration", "sysadmin", "ubuntu", "bash", "cli", "terminal", "server"
    ],

    # 7. Design
    "design": [
        "ui design", "ux design", "figma", "product design", "graphic design",
        "web design", "visual design", "prototyping", "wireframing"
    ],
    "ui": [
        "ui design", "user interface", "visual design", "design systems", "figma", "web design"
    ],
    "ux": [
        "ux design", "user experience", "usability", "user research", "wireframing", "product design"
    ],
    "figma": [
        "ui design", "auto layout", "prototyping", "design tool", "components"
    ],

    # 8. Video Editing
    "video editing": [
        "video editor", "premiere pro", "davinci resolve", "after effects",
        "motion graphics", "youtube editing", "content creation"
    ],
    "premiere pro": [
        "adobe premiere", "video editing", "timeline", "youtube editing", "editing"
    ],
    "davinci resolve": [
        "davinci", "color grading", "video editing", "color correction", "post production"
    ],
    "motion graphics": [
        "mograph", "after effects", "animation", "kinetic typography", "visual effects"
    ],

    # 9. Business
    "business": [
        "entrepreneurship", "startups", "product management", "marketing",
        "freelancing", "sales", "finance", "venture capital"
    ],
    "entrepreneurship": [
        "startups", "founder", "lean startup", "mvp", "business model", "fundraising"
    ],
    "product management": [
        "product manager", "pm", "roadmaps", "agile", "user stories", "product strategy"
    ],
    "marketing": [
        "digital marketing", "growth marketing", "seo", "acquisition", "ads", "copywriting"
    ],
    "freelancing": [
        "tech freelancing", "consulting", "client work", "pricing", "remote work", "proposals"
    ],
}

# Inverted index for synonyms
SYNONYM_REVERSE: dict[str, set[str]] = {}
for canonical, related in SYNONYMS.items():
    for term in related:
        SYNONYM_REVERSE.setdefault(term.lower(), set()).add(canonical)
        SYNONYM_REVERSE.setdefault(canonical.lower(), set()).add(term.lower())


# Canonical technical keywords for fuzzy matching vocabulary
CANONICAL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "go", "rust", "kotlin",
    "html", "css", "react", "next.js", "node.js", "fastapi", "django", "tailwind",
    "docker", "kubernetes", "terraform", "aws", "azure", "gcp", "linux", "bash",
    "git", "github", "devops", "ci/cd", "microservices", "sql", "postgresql",
    "mongodb", "data science", "data analytics", "statistics", "machine learning",
    "deep learning", "generative ai", "llm", "ai agents", "nlp", "computer vision",
    "mlops", "cybersecurity", "ethical hacking", "network security", "pentesting",
    "ui design", "ux design", "figma", "product design", "graphic design",
    "video editing", "premiere pro", "davinci resolve", "after effects",
    "motion graphics", "content creation", "entrepreneurship", "product management",
    "marketing", "freelancing", "growth marketing", "seo", "sales", "finance"
]


class SearchEngine:
    """Core search intelligence engine providing fuzzy matching, synonym expansion, and scoring."""

    @staticmethod
    def normalize(text: str) -> str:
        """Strip punctuation and normalize whitespace for searching."""
        return re.sub(r"[^\w\s\+\#\.\-]", " ", text.lower()).strip()

    @staticmethod
    def get_synonyms(query_term: str) -> list[str]:
        """Retrieve relevant synonyms and related concepts for a search term."""
        norm = query_term.lower().strip()
        matched: set[str] = set()

        if norm in SYNONYMS:
            matched.update(SYNONYMS[norm])

        if norm in SYNONYM_REVERSE:
            matched.update(SYNONYM_REVERSE[norm])

        # Substring / partial term match
        for key, syns in SYNONYMS.items():
            if norm in key or any(norm in s for s in syns):
                matched.add(key)
                matched.update(syns[:4])

        return list(matched)

    @staticmethod
    def find_fuzzy_match(word: str, threshold: float = 0.78) -> str | None:
        """Correct typos like 'pyhton' -> 'python' using SequenceMatcher."""
        w = word.lower().strip()
        if len(w) < 3:
            return None

        best_cand = None
        best_ratio = 0.0

        for cand in CANONICAL_KEYWORDS:
            # Compare single words or matching token lengths
            if abs(len(w) - len(cand)) > 2 and len(cand) > 4:
                continue

            ratio = SequenceMatcher(None, w, cand).ratio()
            if ratio >= threshold and ratio > best_ratio:
                best_ratio = ratio
                best_cand = cand

        return best_cand

    def expand_query(self, query: str) -> tuple[str, list[str], list[str]]:
        """Normalize query, detect typo corrections, and expand synonyms."""
        norm_query = self.normalize(query)
        tokens = norm_query.split()

        fuzzy_corrections = []
        corrected_tokens = []

        for tok in tokens:
            fuzzy = self.find_fuzzy_match(tok)
            if fuzzy and fuzzy != tok:
                fuzzy_corrections.append(f"{tok} -> {fuzzy}")
                corrected_tokens.append(fuzzy)
            else:
                corrected_tokens.append(tok)

        effective_query = " ".join(corrected_tokens) if corrected_tokens else norm_query
        synonyms = self.get_synonyms(effective_query)

        # Also get synonyms for individual tokens
        for tok in corrected_tokens:
            for syn in self.get_synonyms(tok):
                if syn not in synonyms:
                    synonyms.append(syn)

        return effective_query, synonyms, fuzzy_corrections

    def score_item(
        self,
        query: str,
        synonyms: list[str],
        title: str,
        category: str,
        tags: list[str] | None = None,
        keywords: list[str] | None = None,
        aliases: list[str] | None = None,
        search_terms: list[str] | None = None,
        related_concepts: list[str] | None = None,
        description: str | None = None,
    ) -> float:
        """Calculate weighted relevance score (0 - 100) for a candidate item."""
        score = 0.0
        q = query.lower()
        title_norm = (title or "").lower()
        cat_norm = (category or "").lower()
        desc_norm = (description or "").lower()
        tag_list = [t.lower() for t in (tags or [])]
        kw_list = [k.lower() for k in (keywords or [])]
        alias_list = [a.lower() for a in (aliases or [])]
        term_list = [s.lower() for s in (search_terms or [])]
        concept_list = [c.lower() for c in (related_concepts or [])]

        # 1. Exact title match
        if q == title_norm:
            score += 100.0
        elif q in title_norm:
            score += 70.0
        elif any(tok in title_norm for tok in q.split() if len(tok) > 2):
            score += 40.0

        # 2. Aliases match
        if any(q == a for a in alias_list):
            score += 85.0
        elif any(q in a or a in q for a in alias_list):
            score += 65.0

        # 3. Category match
        if q == cat_norm or q in cat_norm:
            score += 50.0

        # 4. Search terms & Keywords
        for term in term_list + kw_list:
            if q == term:
                score += 75.0
                break
            elif q in term or term in q:
                score += 50.0
                break

        # 5. Tags match
        for tag in tag_list:
            if q == tag:
                score += 65.0
                break
            elif q in tag:
                score += 45.0
                break

        # 6. Synonym expansion matches
        for syn in synonyms:
            syn_norm = syn.lower()
            if syn_norm in title_norm:
                score += 45.0
                break
            elif any(syn_norm == t for t in tag_list + kw_list + term_list):
                score += 40.0
                break
            elif syn_norm in desc_norm or syn_norm in concept_list:
                score += 25.0
                break

        # 7. Fuzzy matching on title tokens
        for tok in q.split():
            if len(tok) > 2:
                for word in title_norm.split():
                    ratio = SequenceMatcher(None, tok, word).ratio()
                    if ratio >= 0.8:
                        score += 35.0
                        break

        # 8. Concepts and description matching
        if any(q in c for c in concept_list):
            score += 30.0
        elif q in desc_norm:
            score += 20.0

        return min(score, 100.0)

    async def search_learning_paths(
        self,
        db: AsyncSession,
        query: str,
        category: str | None = None,
        level: str | None = None,
        limit: int = 20,
    ) -> Sequence[LearningPath]:
        """Retrieve and rank learning paths with eager-loaded roadmap steps."""
        eff_query, synonyms, _ = self.expand_query(query)

        # Base database query with steps loaded
        stmt = select(LearningPath).options(selectinload(LearningPath.roadmap_steps))
        if category and isinstance(category, str):
            stmt = stmt.where(func.lower(LearningPath.category) == category.lower())
        if level and isinstance(level, str):
            stmt = stmt.where(
                or_(
                    func.lower(LearningPath.level) == level.lower(),
                    func.lower(LearningPath.difficulty) == level.lower(),
                )
            )

        res = await db.execute(stmt)
        all_paths = res.scalars().all()

        scored: list[tuple[float, LearningPath]] = []
        for path in all_paths:
            s = self.score_item(
                query=eff_query,
                synonyms=synonyms,
                title=path.title,
                category=path.category,
                search_terms=path.search_terms or [],
                related_concepts=path.related_concepts or [],
                description=path.description,
            )
            if s > 0:
                scored.append((s, path))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:limit]]

    async def search_skills(
        self,
        db: AsyncSession,
        query: str,
        category: str | None = None,
        limit: int = 20,
    ) -> Sequence[Skill]:
        """Retrieve and rank skills using fuzzy matching, aliases, and tags."""
        eff_query, synonyms, _ = self.expand_query(query)

        stmt = select(Skill)
        if category and isinstance(category, str):
            stmt = stmt.where(func.lower(Skill.category) == category.lower())

        res = await db.execute(stmt)
        all_skills = res.scalars().all()

        scored: list[tuple[float, Skill]] = []
        for sk in all_skills:
            s = self.score_item(
                query=eff_query,
                synonyms=synonyms,
                title=sk.name,
                category=sk.category,
                tags=sk.tags or [],
                keywords=sk.keywords or [],
                aliases=sk.aliases or [],
                description=sk.description,
            )
            if s > 0:
                scored.append((s, sk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [sk for _, sk in scored[:limit]]

    async def search_courses(
        self,
        db: AsyncSession,
        query: str,
        category: str | None = None,
        level: str | None = None,
        limit: int = 20,
    ) -> Sequence[Course]:
        """Retrieve and rank courses matching search criteria."""
        eff_query, synonyms, _ = self.expand_query(query)

        stmt = select(Course).options(selectinload(Course.lessons))
        if level and isinstance(level, str):
            stmt = stmt.where(func.lower(Course.difficulty) == level.lower())

        res = await db.execute(stmt)
        all_courses = res.scalars().all()

        scored: list[tuple[float, Course]] = []
        for c in all_courses:
            s = self.score_item(
                query=eff_query,
                synonyms=synonyms,
                title=c.title,
                category=c.platform or "",
                tags=c.tags or [],
                description=c.description,
            )
            # Bonus if instructor matches query
            if c.instructor and eff_query in c.instructor.lower():
                s += 50.0

            if s > 0:
                scored.append((s, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:limit]]

    async def unified_search(
        self,
        db: AsyncSession,
        query: str,
        category: str | None = None,
        level: str | None = None,
        limit: int = 15,
    ) -> UnifiedSearchResponse:
        """Unified multi-entity search returning skills, learning paths, and courses."""
        eff_query, synonyms, corrections = self.expand_query(query)

        paths = await self.search_learning_paths(db, query, category, level, limit=limit)
        skills = await self.search_skills(db, query, category, limit=limit)
        courses = await self.search_courses(db, query, category, level, limit=limit)

        return UnifiedSearchResponse(
            query=query,
            normalized_query=eff_query,
            synonyms_expanded=synonyms[:8],
            fuzzy_corrections=corrections,
            learning_paths=[LearningPathResponse.model_validate(p) for p in paths],
            skills=[SkillResponse.model_validate(s) for s in skills],
            courses=[CourseResponse.model_validate(c) for c in courses],
            total_matches=len(paths) + len(skills) + len(courses),
        )


search_service = SearchEngine()
