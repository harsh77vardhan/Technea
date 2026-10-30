"""High-performance search service with fuzzy matching, strict priority scoring, and smart filters."""

import re
from difflib import SequenceMatcher
from collections.abc import Sequence

from sqlalchemy import select, func
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
# DIRECT SYNONYMS & ACRONYMS MAP
# Only authentic synonyms, abbreviations, and canonical aliases belong here.
# Do NOT place sibling/unrelated technologies here (use RELATED_ECOSYSTEMS).
# =============================================================================

SYNONYMS: dict[str, list[str]] = {
    # Programming Languages
    "javascript": ["js", "vanilla js", "ecmascript", "es6", "esnext", "modern javascript"],
    "js": ["javascript", "vanilla js", "ecmascript"],
    "typescript": ["ts", "typed javascript"],
    "ts": ["typescript"],
    "python": ["py", "python3", "cpython"],
    "py": ["python"],
    "c++": ["cpp", "modern c++"],
    "cpp": ["c++"],
    "c#": ["csharp", ".net", "dotnet"],
    "csharp": ["c#", "dotnet"],
    "golang": ["go", "go language", "concurrent cloud backends"],
    "go": ["golang", "go programming", "goroutines"],
    "rust": ["rust lang", "rust programming", "systems programming", "memory safety"],
    "kotlin": ["kt", "android kotlin", "kotlin lang", "android development"],
    "swift": ["ios", "swiftui", "apple", "ios development", "mobile development"],
    "ios": ["swift", "swiftui", "swift & ios", "mobile development", "apple"],
    "swiftui": ["swift", "ios", "mobile development"],
    "android": ["kotlin", "mobile development", "android development"],
    "java": ["core java", "jdk", "jvm language"],
    "bash": ["shell", "terminal", "shell scripting", "linux cli"],
    "shell": ["bash", "shell scripting", "terminal automation"],

    # Web & Frameworks
    "react": ["reactjs", "react.js", "frontend"],
    "reactjs": ["react", "frontend"],
    "next.js": ["nextjs", "next", "full stack"],
    "nextjs": ["next.js", "next", "react"],
    "node.js": ["nodejs", "node", "express"],
    "node": ["node.js", "nodejs"],
    "nodejs": ["node.js"],
    "fastapi": ["python api", "async api", "rest api"],
    "django": ["django rest framework", "python web"],
    "html": ["html5", "semantic web"],
    "css": ["css3", "tailwind", "tailwind css", "styling"],
    "tailwind": ["tailwindcss", "tailwind css", "css"],
    "vue": ["vuejs", "vue.js"],
    "angular": ["angularjs"],
    "graphql": ["apollo", "rest api", "graphql api"],

    # Data & AI
    "sql": ["relational queries", "rdbms", "database queries", "databases"],
    "postgresql": ["postgres", "pgsql", "relational database"],
    "postgres": ["postgresql", "pgsql"],
    "mongodb": ["mongo", "nosql", "document database"],
    "mongo": ["mongodb", "nosql"],
    "machine learning": ["ml", "scikit-learn", "predictive modeling"],
    "ml": ["machine learning", "scikit-learn", "ai"],
    "artificial intelligence": ["ai", "machine learning", "deep learning"],
    "ai": ["artificial intelligence", "machine learning", "ai engineering"],
    "ai engineer": ["ai engineering", "artificial intelligence", "machine learning", "deep learning", "llm"],
    "ai engineering": ["ai engineer", "artificial intelligence", "machine learning", "deep learning"],
    "ai agent": ["ai agents", "autonomous agents", "langgraph", "crewai"],
    "ai agents": ["ai agent", "autonomous workflows", "langgraph", "crewai", "multi-agent"],
    "agent": ["ai agents", "autonomous agents", "langgraph"],
    "agents": ["ai agents", "autonomous agents", "langgraph"],
    "deep learning": ["dl", "neural networks", "pytorch", "tensorflow"],
    "dl": ["deep learning", "neural networks"],
    "generative ai": ["genai", "llm", "large language models"],
    "genai": ["generative ai", "llm", "large language models"],
    "llm": ["large language models", "generative ai", "prompt engineering", "fine-tuning"],
    "large language models": ["llm", "genai", "generative ai"],
    "llm engineering": ["llm", "large language models", "prompt engineering", "fine-tuning", "peft", "lora"],
    "prompt engineering": ["prompts", "in-context learning", "llm"],
    "rag": ["retrieval augmented generation", "vector database", "embeddings"],
    "nlp": ["natural language processing", "text analysis", "transformers"],
    "computer vision": ["cv", "vision ai", "image recognition"],
    "cv": ["computer vision", "vision ai"],
    "data science": ["data scientist", "applied machine learning", "data analytics"],
    "data analytics": ["data analysis", "business analytics", "data analyst", "bi"],
    "data engineering": ["data engineer", "etl", "data pipelines", "data warehousing", "big data", "airflow"],
    "data engineer": ["data engineering", "etl pipelines", "modern data stack", "big data"],

    # Cloud & DevOps
    "docker": ["containers", "containerization", "docker compose"],
    "kubernetes": ["k8s", "container orchestration", "helm", "cloud native"],
    "k8s": ["kubernetes", "container orchestration", "cloud native"],
    "devops": ["ci/cd", "infrastructure as code", "cloud engineering", "automation"],
    "ci/cd": ["continuous integration", "github actions", "pipelines", "devops"],
    "cloud": ["cloud computing", "aws", "gcp", "azure", "cloud native"],
    "cloud computing": ["cloud", "cloud platforms", "aws", "gcp"],
    "cloud native": ["cloud computing", "kubernetes", "k8s", "microservices"],
    "aws": ["amazon web services", "cloud"],
    "gcp": ["google cloud platform", "cloud"],
    "azure": ["microsoft azure", "cloud"],
    "terraform": ["iac", "infrastructure as code"],
    "linux": ["unix", "bash", "linux administration", "sysadmin"],

    # Cybersecurity & Defense
    "cybersecurity": ["cyber security", "infosec", "information security", "ethical hacking", "pentesting", "security"],
    "cyber security": ["cybersecurity", "infosec", "information security", "ethical hacking", "pentesting"],
    "infosec": ["cybersecurity", "cyber security", "information security", "ethical hacking"],
    "ethical hacking": ["pentesting", "penetration testing", "cybersecurity", "white hat", "ethical hacker"],
    "pentesting": ["penetration testing", "ethical hacking", "cybersecurity", "red teaming"],
    "penetration testing": ["pentesting", "ethical hacking", "cybersecurity", "vulnerability assessment"],
    "red teaming": ["penetration testing", "offensive security", "ethical hacking"],
    "blue team": ["soc analyst", "defensive security", "incident response"],
    "soc": ["soc analyst", "security operations", "siem", "incident triage"],
    "malware": ["malware analysis", "reverse engineering"],
    "network security": ["firewalls", "packet analysis", "wireshark", "cybersecurity"],
    "web security": ["owasp", "appsec", "application security", "web hacking"],
    "owasp": ["web security", "application security", "appsec"],
    "cryptography": ["crypto", "encryption", "pki"],

    # Design & Media
    "ui": ["user interface", "ui design"],
    "ux": ["user experience", "ux design"],
    "ui design": ["ui", "user interface", "figma"],
    "ux design": ["ux", "user experience"],
    "figma": ["ui design", "figma design"],
    "video editing": ["video editor", "premiere pro", "davinci resolve"],
    "mobile": ["mobile development", "swift", "ios", "kotlin", "android"],
}

# Nearby technologies for the separate "Related Learning Paths" section
RELATED_ECOSYSTEMS: dict[str, list[str]] = {
    "javascript": ["typescript", "react", "node.js", "frontend development", "next.js"],
    "js": ["typescript", "react", "node.js", "frontend development"],
    "typescript": ["javascript", "react", "next.js", "node.js", "full stack"],
    "ts": ["javascript", "react", "next.js", "node.js"],
    "python": ["data science", "fastapi", "django", "machine learning", "automation"],
    "react": ["next.js", "typescript", "javascript", "tailwind css", "frontend development"],
    "next.js": ["react", "typescript", "full stack", "tailwind css", "web development"],
    "node.js": ["express.js", "javascript", "typescript", "backend development", "full stack"],
    "machine learning": ["deep learning", "python", "data science", "ai agents", "nlp"],
    "deep learning": ["machine learning", "computer vision", "nlp", "generative ai", "pytorch"],
    "generative ai": ["llm", "ai agents", "prompt engineering", "deep learning", "machine learning"],
    "ai agents": ["generative ai", "llm", "python", "machine learning", "deep learning"],
    "llm": ["generative ai", "ai agents", "deep learning", "prompt engineering", "python"],
    "docker": ["kubernetes", "devops", "cloud platforms", "linux"],
    "kubernetes": ["docker", "devops", "cloud platforms", "microservices"],
    "k8s": ["docker", "devops", "cloud computing", "microservices"],
    "cloud": ["cloud computing", "kubernetes", "docker", "aws", "gcp", "devops", "terraform"],
    "cloud computing": ["kubernetes", "docker", "aws", "gcp", "devops", "terraform"],
    "sql": ["database design", "postgresql", "data analytics", "backend development"],
    "data engineering": ["data science", "sql", "postgresql", "big data", "python"],
    "cybersecurity": ["ethical hacking", "penetration testing", "network security", "linux security", "cloud security", "owasp"],
    "pentesting": ["ethical hacking", "cybersecurity", "web security", "penetration testing"],
    "swift": ["ios", "swiftui", "mobile development", "apple"],
    "ios": ["swift", "swiftui", "mobile development", "apple"],
    "rust": ["systems programming", "c++", "go", "linux", "concurrency"],
    "go": ["cloud computing", "microservices", "docker", "kubernetes", "concurrency"],
    "ui design": ["ux design", "figma", "web design", "design systems"],
}

# Canonical keywords for fuzzy typo matching vocabulary
CANONICAL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "golang", "rust", "kotlin",
    "swift", "swiftui", "html", "css", "react", "next.js", "node.js", "fastapi", "django", "tailwind",
    "docker", "kubernetes", "k8s", "terraform", "aws", "azure", "gcp", "linux", "bash",
    "git", "devops", "cloud", "cloud computing", "sql", "postgresql", "mongodb", "data science", "data analytics",
    "data engineering", "machine learning", "deep learning", "generative ai", "llm", "ai agents", "nlp",
    "computer vision", "cybersecurity", "ethical hacking", "penetration testing", "pentesting", "infosec",
    "network security", "web security", "devsecops", "cryptography", "malware analysis", "soc analyst",
    "ui design", "ux design", "figma", "video editing", "premiere pro", "davinci resolve", "product management",
    "microservices", "system design", "prompt engineering", "reinforcement learning",
]


def is_word_match(term: str, text: str) -> bool:
    """Check if term matches text as a whole word or exact token match.

    Prevents partial character substrings like 'ts' matching 'sheets' or 'js' matching 'rxjs' or 'next.js'.
    """
    t = term.strip().lower()
    txt = text.strip().lower()
    if not t or not txt:
        return False
    if t == txt:
        return True
    if len(t) <= 2:
        pattern = r"(?<![\.\w])" + re.escape(t) + r"(?![\.\w])"
    else:
        pattern = r"(?:\b|_)" + re.escape(t) + r"(?:\b|_)"
    return bool(re.search(pattern, txt))


class SearchEngine:
    """Search intelligence engine providing priority scoring, fuzzy matching, and robust filtering."""

    @staticmethod
    def normalize(text: str) -> str:
        """Strip punctuation and normalize whitespace for searching."""
        return re.sub(r"[^\w\s\+\#\.\-]", " ", text.lower()).strip()

    @staticmethod
    def get_synonyms(query_term: str) -> list[str]:
        """Retrieve direct synonyms and abbreviations for a search term."""
        norm = query_term.lower().strip()
        matched: list[str] = []

        if norm in SYNONYMS:
            matched.extend(SYNONYMS[norm])

        for key, syns in SYNONYMS.items():
            if norm == key or norm in syns:
                if key not in matched and key != norm:
                    matched.append(key)
                for s in syns:
                    if s not in matched and s != norm:
                        matched.append(s)

        return matched

    @staticmethod
    def find_fuzzy_match(word: str, threshold: float = 0.82) -> str | None:
        """Correct typos like 'pyhton' -> 'python' and 'swfit' -> 'swift' using SequenceMatcher and transposition checks."""
        w = word.lower().strip()
        if len(w) < 4:
            return None

        best_cand = None
        best_ratio = 0.0

        for cand in CANONICAL_KEYWORDS:
            if abs(len(w) - len(cand)) > 2:
                continue
            ratio = SequenceMatcher(None, w, cand).ratio()
            # Also check if sorted chars match for single-transposition typos (e.g. swfit -> swift)
            if ratio < threshold and len(w) == len(cand) and sorted(w) == sorted(cand):
                mismatches = sum(1 for a, b in zip(w, cand) if a != b)
                if mismatches <= 2:
                    ratio = 0.85
            if ratio >= threshold and ratio > best_ratio:
                best_ratio = ratio
                best_cand = cand

        return best_cand

    def expand_query(self, query: str) -> tuple[str, list[str], list[str]]:
        """Normalize query, detect typo corrections, and expand direct synonyms."""
        norm_query = self.normalize(query)
        tokens = norm_query.split()

        fuzzy_corrections: list[str] = []
        corrected_tokens: list[str] = []

        for tok in tokens:
            fuzzy = self.find_fuzzy_match(tok)
            if fuzzy and fuzzy != tok:
                fuzzy_corrections.append(f"{tok} -> {fuzzy}")
                corrected_tokens.append(fuzzy)
            else:
                corrected_tokens.append(tok)

        effective_query = " ".join(corrected_tokens) if corrected_tokens else norm_query
        synonyms = self.get_synonyms(effective_query)

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
        skill_name: str | None = None,
        tags: list[str] | None = None,
        keywords: list[str] | None = None,
        aliases: list[str] | None = None,
        search_terms: list[str] | None = None,
        related_concepts: list[str] | None = None,
        description: str | None = None,
        skills_covered: list[str] | None = None,
        technology_stack: list[str] | None = None,
    ) -> float:
        """Calculate weighted relevance score with strict hierarchical tiering.

        Priority order:
        Exact title > Aliases > Category > Skills covered > Tech stack > Tags > Keywords > Related concepts > Synonyms > Description > Fuzzy matches
        """
        if not query or not query.strip():
            return 100.0

        q = self.normalize(query).lower()
        title_norm = (title or "").strip().lower()
        desc_norm = (description or "").strip().lower()
        skill_norm = (skill_name or "").strip().lower()
        cat_norm = self.normalize(category or "").strip().lower()

        tag_list = [self.normalize(t).lower() for t in (tags or []) if t]
        kw_list = [self.normalize(k).lower() for k in (keywords or []) if k] + [
            self.normalize(s).lower() for s in (search_terms or []) if s
        ]
        alias_list = [self.normalize(a).lower() for a in (aliases or []) if a]
        concept_list = [self.normalize(c).lower() for c in (related_concepts or []) if c]
        sc_list = [self.normalize(s).lower() for s in (skills_covered or []) if s]
        tech_list = [self.normalize(t).lower() for t in (technology_stack or []) if t]
        syn_list = [self.normalize(s).lower() for s in (synonyms or []) if s]

        score = 0.0

        # Tier 1: Exact / Primary Title or Skill Match (1,000,000 to 500,000)
        if q == title_norm:
            score += 1000000.0
        elif q == skill_norm:
            score += 900000.0
        elif is_word_match(q, title_norm):
            score += 800000.0
        elif is_word_match(q, skill_norm):
            score += 700000.0
        elif title_norm.startswith(q + " ") or f" {q} " in f" {title_norm} ":
            score += 600000.0
        elif len(q) >= 4 and q in title_norm:
            score += 500000.0

        # Tier 2: Aliases Match (300,000 to 400,000)
        if any(q == a for a in alias_list):
            score += 400000.0
        elif any(is_word_match(q, a) for a in alias_list):
            score += 300000.0

        # Tier 3A: Category Match (250,000 to 350,000)
        if q == cat_norm:
            score += 350000.0
        elif is_word_match(q, cat_norm):
            score += 250000.0
        elif len(q) >= 4 and q in cat_norm:
            score += 150000.0

        # Tier 3B: Skills Covered Match (90,000 to 200,000)
        if any(q == sc for sc in sc_list):
            score += 200000.0
        elif any(is_word_match(q, sc) for sc in sc_list):
            score += 140000.0
        elif any(len(q) >= 4 and q in sc for sc in sc_list):
            score += 90000.0

        # Tier 3C: Technology Stack Match (85,000 to 180,000)
        if any(q == tech for tech in tech_list):
            score += 180000.0
        elif any(is_word_match(q, tech) for tech in tech_list):
            score += 130000.0
        elif any(len(q) >= 4 and q in tech for tech in tech_list):
            score += 85000.0

        # Tier 3D: Tags Match (100,000 to 150,000)
        if any(q == t for t in tag_list):
            score += 150000.0
        elif any(is_word_match(q, t) for t in tag_list):
            score += 100000.0

        # Tier 4: Keywords & Search Terms Match (30,000 to 50,000)
        if any(q == k for k in kw_list):
            score += 50000.0
        elif any(is_word_match(q, k) for k in kw_list):
            score += 30000.0

        # Tier 5: Related Concepts Match (10,000 to 15,000)
        if any(q == c for c in concept_list):
            score += 15000.0
        elif any(is_word_match(q, c) for c in concept_list):
            score += 10000.0

        # Tier 6: Synonyms Match
        for syn in syn_list:
            if syn == title_norm:
                score += 850000.0
                break
            elif is_word_match(syn, title_norm) or is_word_match(syn, skill_norm):
                score += 750000.0
                break
            elif any(syn == a or is_word_match(syn, a) for a in alias_list):
                score += 250000.0
                break
            elif syn == cat_norm or is_word_match(syn, cat_norm):
                score += 220000.0
                break
            elif any(syn == sc or is_word_match(syn, sc) for sc in sc_list):
                score += 110000.0
                break
            elif any(syn == tech or is_word_match(syn, tech) for tech in tech_list):
                score += 100000.0
                break
            elif any(syn == t or is_word_match(syn, t) for t in tag_list):
                score += 80000.0
                break
            elif any(syn == k or is_word_match(syn, k) for k in kw_list):
                score += 25000.0
                break

        # Tier 7: Description Match
        if desc_norm:
            if q == desc_norm or is_word_match(q, desc_norm):
                score += 20000.0 if score == 0 else 500.0
            elif len(q) >= 4 and q in desc_norm:
                score += 12000.0 if score == 0 else 300.0
            else:
                desc_tokens_hit = sum(
                    1 for tok in q.split() if len(tok) >= 3 and is_word_match(tok, desc_norm)
                )
                if desc_tokens_hit > 0:
                    score += (5000.0 * desc_tokens_hit) if score == 0 else (100.0 * desc_tokens_hit)

        # Tier 8: Fuzzy Matches
        for tok in q.split():
            if len(tok) >= 4:
                matched_fuzzy = False
                for word in title_norm.split():
                    if len(word) >= 4 and abs(len(tok) - len(word)) <= 2:
                        ratio = SequenceMatcher(None, tok, word).ratio()
                        if ratio >= 0.82:
                            score += 1000.0
                            matched_fuzzy = True
                            break
                if not matched_fuzzy:
                    for sc in sc_list:
                        for word in sc.split():
                            if len(word) >= 4 and abs(len(tok) - len(word)) <= 2:
                                if SequenceMatcher(None, tok, word).ratio() >= 0.82:
                                    score += 800.0
                                    matched_fuzzy = True
                                    break
                        if matched_fuzzy:
                            break

        return score

    @staticmethod
    def parse_weeks(duration_str: str | None) -> int:
        """Extract week count from duration string like '2 Weeks', '8+ Weeks', '4 weeks'."""
        if not duration_str:
            return 4
        match = re.search(r"(\d+)", str(duration_str))
        return int(match.group(1)) if match else 4

    @staticmethod
    def check_level(path: LearningPath, target_level: str | None) -> bool:
        """Check if learning path matches selected experience level."""
        if not target_level or not isinstance(target_level, str):
            return True
        tgt = target_level.strip().lower()
        p_lvl = (path.level or "").strip().lower()
        p_diff = (path.difficulty or "").strip().lower()
        return tgt == p_lvl or tgt == p_diff or tgt in p_lvl or tgt in p_diff

    @staticmethod
    def check_category(path: LearningPath, target_cat: str | None) -> bool:
        """Check if learning path matches selected category."""
        if not target_cat or not isinstance(target_cat, str):
            return True
        return target_cat.strip().lower() == (path.category or "").strip().lower()

    @staticmethod
    def check_goal(path: LearningPath, target_goal: str | None) -> bool:
        """Check if learning path matches selected learning goal."""
        if not target_goal or not isinstance(target_goal, str):
            return True
        tgt = target_goal.strip().lower()
        if path.goal and path.goal.strip().lower() == tgt:
            return True
        return False

    @staticmethod
    def check_style(path: LearningPath, target_style: str | None) -> bool:
        """Check if learning path matches selected learning style."""
        if not target_style or not isinstance(target_style, str):
            return True
        tgt = target_style.strip().lower()
        if path.style and path.style.strip().lower() == tgt:
            return True
        return False

    @staticmethod
    def check_language(path: LearningPath, target_lang: str | None) -> bool:
        """Check if learning path matches selected language."""
        if not target_lang or not isinstance(target_lang, str):
            return True
        tgt = target_lang.strip().lower()
        if path.language and path.language.strip().lower() == tgt:
            return True
        return False

    @classmethod
    def check_duration_exact(cls, path: LearningPath, target_duration: str | None) -> bool:
        """Check if duration is an exact match."""
        if not target_duration or not isinstance(target_duration, str):
            return True
        target_weeks = cls.parse_weeks(target_duration)
        path_weeks = cls.parse_weeks(path.duration)
        is_plus = "+" in target_duration
        if is_plus:
            return path_weeks >= target_weeks
        return path_weeks == target_weeks

    async def search_learning_paths(
        self,
        db: AsyncSession,
        query: str = "",
        category: str | None = None,
        level: str | None = None,
        duration: str | None = None,
        goal: str | None = None,
        style: str | None = None,
        language: str | None = None,
        limit: int = 50,
    ) -> tuple[Sequence[LearningPath], Sequence[LearningPath], bool, str | None]:
        """Retrieve and rank learning paths with strict filter support, relevance scoring, and related section.

        Returns:
            (direct_results, related_results, is_fallback, fallback_message)
        """
        eff_query, synonyms, _ = self.expand_query(query) if query else ("", [], [])

        stmt = select(LearningPath).options(
            selectinload(LearningPath.roadmap_steps),
            selectinload(LearningPath.skill),
        )
        res = await db.execute(stmt)
        all_paths = res.scalars().all()

        # Score all paths
        scores: dict[int, float] = {}
        for path in all_paths:
            # Aggregate skills_covered
            raw_skills_cov = list(path.skills_covered or [])
            if path.skill and path.skill.name and path.skill.name not in raw_skills_cov:
                raw_skills_cov.append(path.skill.name)
            for step in (path.roadmap_steps or []):
                if step.title and step.title not in raw_skills_cov:
                    raw_skills_cov.append(step.title)
            for c in (path.related_concepts or []):
                if c and c not in raw_skills_cov:
                    raw_skills_cov.append(c)

            # Aggregate technology_stack
            raw_tech_stack = list(path.technology_stack or [])
            if path.skill:
                for t in (path.skill.tags or []):
                    if t and t not in raw_tech_stack:
                        raw_tech_stack.append(t)
                for k in (path.skill.keywords or []):
                    if k and k not in raw_tech_stack:
                        raw_tech_stack.append(k)
            for proj in (path.projects or []):
                if isinstance(proj, dict):
                    proj_techs = proj.get("technologies") or proj.get("tech_stack") or []
                    for pt in proj_techs:
                        if pt and pt not in raw_tech_stack:
                            raw_tech_stack.append(pt)

            # Aggregate tags
            raw_tags = list(path.tags or [])
            if not raw_tags and path.skill:
                raw_tags.extend(path.skill.tags or [])

            s = self.score_item(
                query=eff_query,
                synonyms=synonyms,
                title=path.title,
                category=path.category,
                skill_name=path.skill.name if path.skill else None,
                tags=raw_tags,
                keywords=path.skill.keywords if path.skill else [],
                aliases=path.skill.aliases if path.skill else [],
                search_terms=path.search_terms or [],
                related_concepts=path.related_concepts or [],
                description=path.description,
                skills_covered=raw_skills_cov,
                technology_stack=raw_tech_stack,
            )
            scores[path.id] = s

        # Candidates pool for query matching
        if eff_query:
            direct_pool = [p for p in all_paths if scores[p.id] > 0.0]
        else:
            direct_pool = list(all_paths)

        # Apply all active filters strictly (Level, Duration, Goal, Style, Language, Category)
        valid_candidates = [
            p
            for p in direct_pool
            if self.check_category(p, category)
            and self.check_level(p, level)
            and self.check_duration_exact(p, duration)
            and self.check_goal(p, goal)
            and self.check_style(p, style)
            and self.check_language(p, language)
        ]

        valid_candidates.sort(key=lambda p: -scores[p.id])
        direct_results = valid_candidates
        is_fallback = False
        fallback_msg = None

        # ---------------------------------------------------------------------
        # Related Learning Paths Section (Requirements 1 & 8)
        # Separate section containing nearby technologies in the ecosystem
        # ---------------------------------------------------------------------
        related_results: list[LearningPath] = []
        if eff_query and direct_results:
            direct_ids = {p.id for p in direct_results}

            # Find ecosystem keywords for this search
            related_terms = RELATED_ECOSYSTEMS.get(eff_query.lower(), [])
            if not related_terms:
                for k, v in RELATED_ECOSYSTEMS.items():
                    if k in eff_query.lower() or eff_query.lower() in k:
                        related_terms = v
                        break

            # Find matching related paths
            related_candidates: list[tuple[float, LearningPath]] = []
            for path in all_paths:
                if path.id in direct_ids:
                    continue
                # Path matches a related term in title or skill, or has secondary score
                p_title = (path.title or "").lower()
                p_skill = (path.skill.name if path.skill else "").lower()

                match_weight = 0.0
                for idx, term in enumerate(related_terms):
                    if is_word_match(term, p_title) or is_word_match(term, p_skill):
                        match_weight = 1000.0 - idx * 100.0
                        break

                if match_weight == 0.0 and scores[path.id] > 0:
                    match_weight = scores[path.id]

                if match_weight > 0:
                    if (
                        self.check_level(path, level)
                        and self.check_goal(path, goal)
                        and self.check_language(path, language)
                    ):
                        related_candidates.append((match_weight, path))

            related_candidates.sort(key=lambda x: -x[0])
            related_results = [p for _, p in related_candidates[:4]]

        return direct_results[:limit], related_results, is_fallback, fallback_msg

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
        duration: str | None = None,
        goal: str | None = None,
        style: str | None = None,
        language: str | None = None,
        limit: int = 15,
    ) -> UnifiedSearchResponse:
        """Unified multi-entity search returning skills, learning paths, and courses with full filter support."""
        eff_query, synonyms, corrections = self.expand_query(query)

        paths, related_paths, is_fallback, fallback_msg = await self.search_learning_paths(
            db,
            query=query,
            category=category,
            level=level,
            duration=duration,
            goal=goal,
            style=style,
            language=language,
            limit=limit,
        )
        skills = await self.search_skills(db, query, category, limit=limit)
        courses = await self.search_courses(db, query, category, level, limit=limit)

        return UnifiedSearchResponse(
            query=query,
            normalized_query=eff_query,
            synonyms_expanded=synonyms[:8],
            fuzzy_corrections=corrections,
            learning_paths=[LearningPathResponse.model_validate(p) for p in paths],
            related_learning_paths=[LearningPathResponse.model_validate(p) for p in related_paths],
            skills=[SkillResponse.model_validate(s) for s in skills],
            courses=[CourseResponse.model_validate(c) for c in courses],
            is_fallback=is_fallback,
            fallback_message=fallback_msg,
            total_matches=len(paths) + len(skills) + len(courses),
        )


search_service = SearchEngine()
