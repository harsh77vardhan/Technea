"""Strict Relevance Recommendation Engine for Technea AI.

Enforces the Strict Relevance Principle:
- ONLY recommend content from:
  1. Current Roadmap (milestones & lessons)
  2. Current Milestone (active milestone skills, lessons, and project)
  3. Next Milestone in the roadmap
  4. Relevant Projects matching the active tech stack / roadmap
  5. Relevant Courses matching the active tech stack / roadmap
- NEVER recommend unrelated topics (e.g. NEVER Blender or Business Analytics when user's milestone is Object-Oriented Design Patterns or Python).
- Surfaces Technea resources first, trusted public resources second.
"""

import logging
import re
from typing import Any

from app.services.ai.trusted_resources import get_trusted_resources_for_topic

logger = logging.getLogger("technea.ai.recommendation_engine")

# Blacklisted / orthogonal domains that must NEVER be recommended to software developers
# unless the user's active roadmap or explicit query is specifically in that domain.
UNRELATED_DOMAINS: list[str] = [
    "blender",
    "3d design",
    "3d modeling",
    "business analytics",
    "accounting",
    "financial analysis",
    "graphic design",
    "video editing",
    "premiere pro",
    "davinci",
    "after effects",
    "marketing",
]

# Track domain associations for strict cross-domain isolation
DOMAIN_STACKS: dict[str, set[str]] = {
    "python": {
        "python",
        "oop",
        "object-oriented",
        "design patterns",
        "pytest",
        "fastapi",
        "django",
        "flask",
        "pandas",
        "numpy",
        "asyncio",
        "clean code",
        "algorithms",
        "data structures",
    },
    "web_development": {
        "web",
        "frontend",
        "backend",
        "full stack",
        "html",
        "css",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "nextjs",
        "node",
        "express",
        "tailwind",
        "rest",
        "api",
        "graphql",
    },
    "cloud_devops": {
        "devops",
        "cloud",
        "docker",
        "kubernetes",
        "k8s",
        "linux",
        "ci/cd",
        "bash",
        "aws",
        "gcp",
        "azure",
        "terraform",
        "containers",
        "networking",
        "helm",
        "gitops",
        "observability",
        "prometheus",
        "grafana",
        "microservices",
    },
    "cloud": {
        "cloud",
        "cloud computing",
        "devops",
        "docker",
        "kubernetes",
        "k8s",
        "aws",
        "gcp",
        "azure",
        "terraform",
        "containers",
        "microservices",
    },
    "cybersecurity": {
        "cybersecurity",
        "cyber security",
        "infosec",
        "information security",
        "ethical hacking",
        "pentesting",
        "penetration testing",
        "red teaming",
        "blue team",
        "soc",
        "soc analyst",
        "network security",
        "web security",
        "owasp",
        "linux security",
        "cryptography",
        "cloud security",
        "devsecops",
        "malware",
        "malware analysis",
        "reverse engineering",
        "iam",
        "security",
        "firewall",
        "wireshark",
        "nmap",
        "metasploit",
        "zero trust",
    },
    "mobile": {
        "mobile",
        "ios",
        "android",
        "swift",
        "swiftui",
        "kotlin",
        "apple",
        "mobile development",
        "mobile app",
        "xcode",
        "coroutines",
    },
    "rust": {
        "rust",
        "cargo",
        "systems programming",
        "memory safety",
        "ownership",
        "borrowing",
        "lifetimes",
        "tokio",
        "concurrency",
        "smart pointers",
        "traits",
    },
    "go": {
        "go",
        "golang",
        "goroutines",
        "channels",
        "concurrency",
        "microservices",
        "backend",
        "docker",
        "cloud",
        "rest api",
        "standard library",
    },
    "ai_agents": {
        "ai agents",
        "ai agent",
        "autonomous agents",
        "langgraph",
        "crewai",
        "multi-agent",
        "agent",
        "agents",
        "autonomous workflows",
        "tool use",
        "llm",
        "langchain",
        "prompt engineering",
    },
    "llm_engineering": {
        "llm",
        "large language models",
        "prompt engineering",
        "fine-tuning",
        "peft",
        "lora",
        "rag",
        "retrieval augmented generation",
        "vector database",
        "chroma",
        "embeddings",
        "transformers",
        "generative ai",
        "genai",
    },
    "data_engineering": {
        "data engineering",
        "data engineer",
        "etl",
        "data pipelines",
        "airflow",
        "spark",
        "hadoop",
        "kafka",
        "flink",
        "dbt",
        "data lake",
        "data warehouse",
        "snowflake",
        "big data",
        "sql",
        "postgresql",
        "pipeline",
    },
    "ai_ml": {
        "ai",
        "machine learning",
        "deep learning",
        "neural",
        "pytorch",
        "tensorflow",
        "nlp",
        "llm",
        "rag",
        "computer vision",
        "python",
        "scikit-learn",
        "ai engineering",
    },
    "data": {
        "data",
        "sql",
        "postgres",
        "postgresql",
        "analytics",
        "pandas",
        "database",
        "etl",
        "warehouse",
        "python",
        "power bi",
        "tableau",
        "data science",
        "bi",
    },
    "dsa": {
        "dsa",
        "data structures",
        "algorithms",
        "leetcode",
        "neetcode",
        "trees",
        "graphs",
        "sorting",
        "binary search",
        "dynamic programming",
        "python",
        "c++",
        "java",
    },
}


def slugify(text: str) -> str:
    """Generate a clean URL slug from a title string."""
    s = text.lower().replace("&", "and").replace("/", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


class RecommendationEngine:
    """Recommendation engine enforcing the Strict Relevance Principle for Technea AI.

    Ensures zero random recommendations by strictly anchoring recommendations to:
    1. Active Roadmap & current milestone
    2. Upcoming milestone in progression
    3. Hands-on capstone project matching the active milestone
    4. Technea courses in the active tech stack first
    5. Curated trusted public resources (Official Docs, freeCodeCamp, Corey Schafer, Tech With Tim, CodeWithHarry, CS50) second.
    """

    def _infer_active_domain(
        self,
        context: dict[str, Any],
        query: str | None = None,
    ) -> str:
        """Infer the user's primary active technical domain from context and query."""
        candidates: list[str] = []

        if query:
            candidates.append(query.lower())

        # Check user active roadmaps
        user_prog = context.get("user_progress") or {}
        active_roadmaps = user_prog.get("active_roadmaps") or context.get("active_roadmaps") or []
        for r in active_roadmaps:
            if isinstance(r, dict):
                candidates.append(r.get("title", "").lower())
                candidates.append(r.get("current_milestone_title", "").lower())
                candidates.append(r.get("target_role", "").lower())
                for s in r.get("current_key_skills", []):
                    candidates.append(str(s).lower())
            elif isinstance(r, str):
                candidates.append(r.lower())

        # Check profile fields
        pref_lang = context.get("preferred_language") or user_prog.get("preferred_language")
        if pref_lang:
            candidates.append(str(pref_lang).lower())

        goal = context.get("learning_goal") or user_prog.get("learning_goal")
        if goal:
            candidates.append(str(goal).lower())

        domain_ctx = context.get("domain")
        if domain_ctx:
            candidates.append(str(domain_ctx).lower())

        combined_text = " ".join(candidates)

        # 1. Cybersecurity (Check first before generic Linux or Cloud)
        if any(w in combined_text for w in [
            "cyber", "security", "infosec", "ethical hack", "hack", "pentest", "penetration test",
            "owasp", "network security", "soc", "malware", "reverse engineer", "crypto", "encryption",
            "vulnerability", "red team", "blue team"
        ]):
            return "cybersecurity"

        # 2. AI Agents & Autonomous Workflows
        if any(w in combined_text for w in ["ai agent", "ai agents", "autonomous agent", "autonomous agents", "langgraph", "crewai", "multi-agent", "agent orchestration"]):
            return "ai_agents"

        # 3. LLM Engineering
        if any(w in combined_text for w in ["llm", "large language model", "fine-tuning", "prompt engineering", "rag", "peft", "lora", "genai", "generative ai"]):
            return "llm_engineering"

        # 4. Data Engineering
        if any(w in combined_text for w in ["data engineering", "data engineer", "data pipeline", "etl", "airflow", "spark", "hadoop", "kafka", "dbt", "data warehouse", "snowflake"]):
            return "data_engineering"

        # 5. Mobile (Swift / iOS / Kotlin / Android)
        if any(w in combined_text for w in ["swift", "ios", "kotlin", "android", "swiftui", "mobile"]):
            return "mobile"

        # 6. Rust
        if any(w in combined_text for w in ["rust", "cargo", "systems programming", "memory safety"]):
            return "rust"

        # 7. Go
        if any(w in combined_text for w in ["golang", "goroutine", "channels"]) or re.search(r"\bgo\b", combined_text):
            return "go"

        # 8. Cloud & DevOps
        if any(w in combined_text for w in ["devops", "docker", "kubernetes", "k8s", "cloud", "ci/cd", "linux", "aws", "gcp", "azure", "terraform"]):
            return "cloud_devops"

        # 9. AI / ML
        if any(w in combined_text for w in ["machine learning", "deep learning", "neural", "pytorch", "ai", "artificial intelligence", "computer vision", "nlp"]):
            return "ai_ml"

        # 10. DSA
        if any(w in combined_text for w in ["dsa", "data structures", "algorithms", "leetcode", "neetcode"]):
            return "dsa"

        # 11. Data / SQL / Analytics
        if any(w in combined_text for w in ["sql", "data analytics", "data science", "pandas", "bi", "tableau", "power bi", "database"]):
            return "data"

        # 12. React / Frontend / Full Stack Web
        if any(w in combined_text for w in ["react", "frontend", "next.js", "nextjs", "tailwind", "html", "css", "javascript", "backend", "full stack", "node", "express", "fastapi", "django"]):
            return "web_development"

        # 13. Python / OOP
        if any(w in combined_text for w in ["python", "oop", "object-oriented", "design patterns"]):
            return "python"

        return "python"

    def is_item_relevant(
        self,
        item: dict[str, Any],
        active_domain: str,
        anchor_keywords: set[str],
        allow_cross_domain: bool = False,
    ) -> bool:
        """Evaluate if an item strictly belongs to the active domain and does not contain blacklisted topics."""
        text = f"{item.get('title', '')} {item.get('name', '')} {item.get('category', '')} {item.get('description', '')}".lower()
        tech_stack = [str(t).lower() for t in item.get("tech_stack", []) + item.get("technologies", []) + item.get("tags", [])]
        combined = f"{text} {' '.join(tech_stack)}"

        # 1. Immediate rejection of unrelated domains (e.g. Blender, Business Analytics)
        for blacklisted in UNRELATED_DOMAINS:
            if blacklisted in combined:
                # Only permit if user's explicit anchor keywords specifically contain that term
                if not any(blacklisted in ak for ak in anchor_keywords):
                    return False

        if allow_cross_domain:
            return True

        # 2. Positive match: item must overlap with active domain stack or anchor keywords
        allowed_stack = DOMAIN_STACKS.get(active_domain, set())
        has_stack_match = any(term in combined for term in allowed_stack)
        has_anchor_match = any(ak in combined for ak in anchor_keywords if len(ak) >= 3)

        return has_stack_match or has_anchor_match

    def get_recommendations(
        self,
        context: dict[str, Any],
        query: str | None = None,
    ) -> dict[str, list[dict[str, Any]]]:
        """Synthesize strictly relevant recommendations matching the learner's active trajectory.

        Args:
            context: Learner context containing user_progress, active_roadmaps, catalog items.
            query: Optional prompt/query text from user.

        Returns:
            Dictionary with:
            - related_actions: Strictly relevant frontend actions (active milestone, roadmap, project)
            - recommended_projects: Hands-on projects matching the active milestone/tech stack
            - recommended_resources: Technea courses first, curated trusted public resources second
        """
        user_prog = context.get("user_progress") or {}
        active_roadmaps = user_prog.get("active_roadmaps") or context.get("active_roadmaps") or []

        # Determine primary domain
        active_domain = self._infer_active_domain(context, query)

        # Collect anchor keywords
        anchor_keywords: set[str] = set()
        if query:
            for w in re.findall(r"[a-zA-Z0-9+#\.\-]+", query.lower()):
                if len(w) >= 3:
                    anchor_keywords.add(w)

        top_rm: dict[str, Any] | None = None
        cur_m_title: str | None = None
        upcoming_m_title: str | None = None
        cur_proj: dict[str, Any] | None = None
        cur_lessons: list[dict[str, Any]] = []

        if active_roadmaps:
            first_rm = active_roadmaps[0]
            if isinstance(first_rm, dict):
                top_rm = first_rm
                cur_m_title = top_rm.get("current_milestone_title")
                cur_m = top_rm.get("current_milestone") or {}
                if not cur_m_title and isinstance(cur_m, dict):
                    cur_m_title = cur_m.get("title")

                upcoming_m_title = top_rm.get("upcoming_milestone_title") or top_rm.get("upcoming_milestone")
                cur_proj = cur_m.get("project") or top_rm.get("current_project")
                cur_lessons = cur_m.get("lessons") or cur_m.get("courses") or []

                for k in top_rm.get("current_key_skills", []):
                    anchor_keywords.add(str(k).lower())
                if cur_m_title:
                    for w in re.findall(r"[a-zA-Z0-9]+", cur_m_title.lower()):
                        if len(w) >= 3:
                            anchor_keywords.add(w)
            elif isinstance(first_rm, str):
                for w in re.findall(r"[a-zA-Z0-9]+", first_rm.lower()):
                    if len(w) >= 3:
                        anchor_keywords.add(w)

        pref_lang = context.get("preferred_language") or user_prog.get("preferred_language") or "Python"
        anchor_keywords.add(pref_lang.lower())

        # =====================================================================
        # 1. Related Actions (Strict Relevance)
        # =====================================================================
        related_actions: list[dict[str, Any]] = []

        if top_rm:
            rm_id = top_rm.get("id")
            rm_title = top_rm.get("title", "Active Roadmap")
            rm_slug = slugify(rm_title)

            # Priority 1: Current active milestone
            if cur_m_title:
                related_actions.append({
                    "action_type": "view_milestone",
                    "title": f"Continue Milestone: {cur_m_title}",
                    "payload": {
                        "roadmap_id": rm_id,
                        "milestone": cur_m_title,
                        "slug": rm_slug,
                        "current_step": top_rm.get("current_step", 1),
                        "total_steps": top_rm.get("total_steps", 1),
                    },
                })

            # Priority 2: Active Roadmap
            related_actions.append({
                "action_type": "view_roadmap",
                "title": f"Active Roadmap: {rm_title}",
                "payload": {
                    "roadmap_id": rm_id,
                    "title": rm_title,
                    "slug": rm_slug,
                    "current_step": top_rm.get("current_step", 1),
                },
            })

            # Priority 3: Upcoming Milestone
            if upcoming_m_title:
                related_actions.append({
                    "action_type": "view_milestone",
                    "title": f"Upcoming Milestone: {upcoming_m_title}",
                    "payload": {
                        "roadmap_id": rm_id,
                        "milestone": upcoming_m_title,
                        "slug": rm_slug,
                    },
                })

            # Priority 4: Milestone project
            if cur_proj and isinstance(cur_proj, dict) and cur_proj.get("title"):
                related_actions.append({
                    "action_type": "view_project",
                    "title": f"Build Project: {cur_proj['title']}",
                    "payload": {
                        "title": cur_proj["title"],
                        "difficulty": cur_proj.get("difficulty", "Intermediate"),
                    },
                })
        else:
            # Guest or no active roadmap: surface matched learning paths strictly in active domain
            matched_paths = context.get("matched_paths", [])
            for lp in matched_paths:
                if self.is_item_relevant(lp, active_domain, anchor_keywords):
                    related_actions.append({
                        "action_type": "view_roadmap",
                        "title": f"Explore Roadmap: {lp['title']}",
                        "payload": {
                            "slug": lp.get("slug") or slugify(lp["title"]),
                            "path_id": lp.get("id"),
                            "title": lp["title"],
                            "level": lp.get("level", "Beginner"),
                        },
                    })
                if len(related_actions) >= 3:
                    break

        # Filter matched catalog projects for remaining action slots
        if len(related_actions) < 4:
            matched_projs = context.get("matched_projects", [])
            for p in matched_projs:
                if self.is_item_relevant(p, active_domain, anchor_keywords):
                    action_title = f"Build Project: {p['title']}"
                    if not any(a["title"] == action_title for a in related_actions):
                        related_actions.append({
                            "action_type": "view_project",
                            "title": action_title,
                            "payload": {
                                "project_id": p.get("id"),
                                "title": p["title"],
                                "difficulty": p.get("difficulty", "Beginner"),
                            },
                        })
                if len(related_actions) >= 4:
                    break

        # =====================================================================
        # 2. Recommended Projects (Strict Relevance)
        # =====================================================================
        recommended_projects: list[dict[str, Any]] = []

        # Current milestone project first
        if cur_proj and isinstance(cur_proj, dict) and cur_proj.get("title"):
            recommended_projects.append({
                "title": cur_proj["title"],
                "difficulty": cur_proj.get("difficulty", "Intermediate"),
                "tech_stack": cur_proj.get("tech_stack", [pref_lang]),
                "description": cur_proj.get("description", f"Capstone project for milestone: {cur_m_title}"),
                "source": "milestone_project",
            })

        # Relevant catalog projects
        matched_projs = context.get("matched_projects", [])
        for p in matched_projs:
            if self.is_item_relevant(p, active_domain, anchor_keywords):
                if not any(rp["title"] == p["title"] for rp in recommended_projects):
                    recommended_projects.append({
                        "title": p["title"],
                        "difficulty": p.get("difficulty", "Beginner"),
                        "tech_stack": p.get("tech_stack", p.get("technologies", [])),
                        "description": p.get("description", ""),
                        "source": "technea_catalog",
                    })
            if len(recommended_projects) >= 4:
                break

        # =====================================================================
        # 3. Recommended Resources (Technea First, Trusted Public Second)
        # =====================================================================
        recommended_resources: list[dict[str, Any]] = []

        # 3A. Technea Resources First
        # Active milestone lessons/courses
        if cur_lessons:
            for les in cur_lessons:
                if isinstance(les, dict) and les.get("title"):
                    recommended_resources.append({
                        "title": les["title"],
                        "provider": les.get("instructor") or les.get("platform") or "Technea",
                        "url_or_channel": les.get("platform") or "Technea Learning Platform",
                        "type": "Course",
                        "description": les.get("description") or f"Curated course for milestone: {cur_m_title}",
                        "source": "technea",
                    })

        # Matched Technea courses
        matched_courses = context.get("matched_courses", [])
        for c in matched_courses:
            if self.is_item_relevant(c, active_domain, anchor_keywords):
                if not any(rr["title"] == c["title"] for rr in recommended_resources):
                    recommended_resources.append({
                        "title": c["title"],
                        "provider": c.get("instructor") or c.get("platform") or "Technea",
                        "url_or_channel": c.get("platform") or "Technea Catalog",
                        "type": "Course",
                        "description": c.get("description", ""),
                        "source": "technea",
                    })
            if len(recommended_resources) >= 3:
                break

        # 3B. Trusted Public Resources Second
        # Determine topic query for trusted resources
        trusted_topic = query if query and len(query.strip()) > 3 else (cur_m_title or active_domain)
        trusted_public = get_trusted_resources_for_topic(trusted_topic, language=pref_lang)

        # Append trusted public resources
        for tr in trusted_public:
            if not any(rr["title"] == tr["title"] for rr in recommended_resources):
                recommended_resources.append({
                    "title": tr["title"],
                    "provider": tr["provider"],
                    "url_or_channel": tr["url_or_channel"],
                    "type": tr["type"],
                    "description": tr["description"],
                    "source": "trusted_public",
                })
            if len(recommended_resources) >= 6:
                break

        return {
            "related_actions": related_actions[:4],
            "recommended_projects": recommended_projects[:3],
            "recommended_resources": recommended_resources[:6],
        }


# Global singleton instance of RecommendationEngine
recommendation_engine = RecommendationEngine()
