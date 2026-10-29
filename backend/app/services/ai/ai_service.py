"""Unified AI Service orchestrator for Technea.

Manages primary (Gemini) and resilient fallback (Rule-Based / Mock) AI providers,
ensuring consistent, safe, high-quality responses for learners across all platform features.
"""

from datetime import datetime, timezone
import logging
import random
import re
from typing import Any

from app.core.config import settings
from app.services.ai.base_provider import BaseAIProvider
from app.services.ai.gemini_client import GeminiProvider, sanitize_text
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CAREER_GUIDANCE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODE_REVIEW,
    INTENT_CODING_ARCHITECTURE,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_DEBUGGING,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_LEARNING_QUESTION,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_RECOMMENDATION,
    INTENT_PROJECT_SUGGESTION,
    INTENT_QUIZ,
    INTENT_RESOURCE_SEARCH,
    INTENT_REVISION,
    INTENT_ROADMAP_PLANNING,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    INTENT_WEEKLY_PLAN,
    build_system_prompt,
    construct_prompt,
    classify_intent,
)
from app.services.ai.quiz_engine import QuizEngine, quiz_engine
from app.services.ai.special_router import SpecialRouter, special_router
from app.services.ai.memory_engine import MemoryEngine, memory_engine

logger = logging.getLogger("technea.ai.service")


class RuleBasedProvider(BaseAIProvider):
    """High-quality pedagogical fallback AI provider.

    Operates without external API dependencies or costs. Synthesizes structured,
    domain-aware curriculums, debugging guidance, project recommendations,
    and mentor coaching strictly adhering to Technea's AI Mentor personality.
    """

    def __init__(
        self,
        special_router_inst: SpecialRouter | None = None,
        memory_engine_inst: MemoryEngine | None = None,
    ) -> None:
        self.special_router: SpecialRouter = special_router_inst or special_router
        self.memory_engine: MemoryEngine = memory_engine_inst or memory_engine
        self._last_greeting: str | None = None

    @property
    def provider_name(self) -> str:
        return "rule_based"

    @property
    def is_configured(self) -> bool:
        return True

    def _choose(self, options: list[Any], rng: random.Random | None = None, seed: Any = None) -> Any:
        """Select a random option, using rng instance, seed, or global random."""
        if not options:
            return ""
        if rng is not None:
            return rng.choice(options)
        if seed is not None:
            return random.Random(seed).choice(options)
        return random.choice(options)

    def _detect_domain(self, text: str, context: dict[str, Any] | None = None) -> str:
        """Infer tech domain from query and context."""
        if context and context.get("domain"):
            return str(context["domain"]).lower()

        t = text.lower()
        if "python" in t and not any(w in t for w in ["machine learning", "deep learning", "neural", "rag"]):
            return "python"
        elif re.search(r"\b(?:golang|go)\b", t) and not any(w in t for w in ["django", "algorithm", "cargo", "mongodb"]):
            return "go"
        elif re.search(r"\brust\b", t):
            return "rust"
        elif any(w in t for w in ["web", "html", "css", "javascript", "react", "frontend", "full stack", "next.js", "node", "typescript"]):
            return "web_development"
        elif any(w in t for w in ["ai", "machine learning", "ml", "deep learning", "neural", "llm", "rag", "pytorch", "gpt"]):
            return "ai_ml"
        elif any(w in t for w in ["cyber", "hack", "security", "pentest", "owasp", "network", "linux"]):
            return "cybersecurity"
        elif any(w in t for w in ["data", "sql", "analytics", "power bi", "pandas", "tableau", "warehouse"]):
            return "data"
        elif any(w in t for w in ["cloud", "devops", "docker", "kubernetes", "aws", "terraform", "ci/cd"]):
            return "cloud_devops"
        elif any(w in t for w in ["design", "ui", "ux", "figma", "prototype", "wireframe"]):
            return "design"
        elif any(w in t for w in ["video", "edit", "premiere", "davinci", "after effects", "youtube"]):
            return "video_editing"
        elif any(w in t for w in ["startup", "business", "freelance", "mvp", "marketing"]):
            return "business"
        elif "python" in t:
            return "python"
        return "general_tech"

    def _detect_level(self, text: str, context: dict[str, Any] | None = None) -> str:
        """Infer learner level from text and context."""
        if context:
            lvl = context.get("level") or context.get("learner_level") or context.get("experience_level")
            if lvl:
                return str(lvl).strip().title()

        t = text.lower()
        if any(w in t for w in ["never coded", "from zero", "scratch", "absolute beginner", "brand new"]):
            return "Absolute Beginner"
        elif any(w in t for w in ["advanced", "architect", "scale", "performance", "high throughput", "senior"]):
            return "Advanced"
        elif any(w in t for w in ["intermediate", "experienced", "transition", "next level", "mid-level"]):
            return "Intermediate"
        return "Beginner"

    def _is_beginner(self, level: str) -> bool:
        """Check whether the level corresponds to beginner tier."""
        lvl = level.lower()
        return any(b in lvl for b in ["beginner", "code initiate", "explorer", "novice", "absolute", "junior"])

    def _generate_greeting_response(
        self,
        user_name: str | None = None,
        level: str = "Beginner",
        seed: Any = None,
    ) -> str:
        name_str = f", **{user_name}**" if user_name else ""
        header = "### Technea AI Mentor"

        greetings = [
            f"Hey{name_str}, welcome back! Good to see you continuing your coding journey at the **{level}** level.",
            f"Hello{name_str}! Great to connect. Ready to help you tackle your next coding goals at the **{level}** stage.",
            f"Hi{name_str}, welcome! Good to see you here continuing at the **{level}** level.",
            f"Hey{name_str}! Hope your coding is going well today as you build your **{level}** skills.",
        ]

        closings = [
            "What would you like to build or learn today? (You can explore a tailored **Roadmap**, plan hands-on **Projects**, or tackle a coding milestone.)",
            "Where should we focus our attention today? (You can request a tailored **Roadmap**, plan **Projects**, or tackle what you want to build or learn.)",
            "What technical challenge should we tackle today? (Explore structured **Roadmaps**, plan **Projects**, or build or master an algorithm.)",
            "What would you like to build or master in our session? (You can explore **Roadmaps**, plan **Projects**, or tackle your next step.)",
        ]

        rng = random.Random(seed) if seed is not None else None
        if seed is None and hasattr(self, "_last_greeting") and self._last_greeting:
            avail = [g for g in greetings if g != self._last_greeting]
            selected_greeting = random.choice(avail) if avail else self._choose(greetings)
        else:
            selected_greeting = self._choose(greetings, rng=rng)
        
        if seed is None:
            self._last_greeting = selected_greeting

        selected_closing = self._choose(closings, rng=rng)

        return (
            f"{header}\n\n"
            f"{selected_greeting}\n\n"
            f"{selected_closing}"
        )

    def _generate_next_step_response(
        self,
        domain: str,
        level: str,
        prompt: str = "",
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Generate a personalized next step action plan with natural conversational flow."""
        user_progress = (context.get("user_progress") or {}) if context else {}
        active_roadmaps = user_progress.get("active_roadmaps", []) if isinstance(user_progress, dict) else []
        completed_milestones = context.get("completed_milestones", 0) if context else 0
        if isinstance(completed_milestones, list):
            completed_milestones = len(completed_milestones)
        is_beg = self._is_beginner(level)
        p_lower = prompt.lower()
        user_name = context.get("user_name") if context else None
        name_prefix = f"{user_name}, " if user_name else ""

        header = "### Action Plan: Your Next Engineering Steps"

        # Check for HTML/CSS prerequisite completion
        if ("html" in p_lower and "css" in p_lower) and any(w in p_lower for w in ["completed", "finished", "done"]):
            conversation_body = (
                f"{name_prefix}you have completed foundational HTML semantic markup and responsive CSS layout systems.\n\n"
                "Your next focus should be **Modern JavaScript (ES6+)**. "
                "Focus on core programming mechanics: functions, array methods (`map`/`filter`/`reduce`), DOM manipulation, and asynchronous `fetch` calls.\n\n"
                "JavaScript provides the dynamic programming engine of the web. "
                "Jumping directly into frontend frameworks like React without solid JavaScript fundamentals creates fragile code.\n\n"
                "Once completed, you will have built an interactive, responsive single-page application with dynamic DOM updates and API data fetching without third-party frameworks."
            )
        # 1. Milestone Awareness from Active Roadmap
        elif active_roadmaps:
            ar = active_roadmaps[0]
            current_step = ar.get("current_step", 1)
            total_steps = ar.get("total_steps", 5)
            roadmap_title = ar.get("title", "Active Track")
            goal = ar.get("goal") or "Engineering Mastery"
            cur_m = ar.get("current_milestone") or {}
            cur_title = ar.get("current_milestone_title") or cur_m.get("title") or f"Milestone {current_step}"
            cur_desc = ar.get("current_milestone_description") or cur_m.get("description") or ""
            cur_proj = ar.get("current_project") or cur_m.get("project")

            # Build precise milestone focus instruction
            desc_focus = cur_desc.rstrip(".") if cur_desc else "core competencies"
            proj_hint = ""
            if cur_proj and isinstance(cur_proj, dict) and cur_proj.get("title"):
                proj_hint = f" and build the practical deliverable: **{cur_proj['title']}**."
            elif cur_desc and "build" not in cur_desc.lower():
                proj_hint = " and build 2 responsive pages."
            else:
                proj_hint = "."

            conversation_body = (
                f"{name_prefix}you are currently at **{cur_title}** in your **{roadmap_title}** track "
                f"({completed_milestones} milestone(s) completed, Goal: *{goal}*).\n\n"
                f"Your next focus should be {desc_focus}{proj_hint}\n\n"
                f"Mastering **{cur_title}** builds directly upon your earlier milestones "
                f"and sets up the solid foundation you need before advancing to subsequent modules.\n\n"
                f"Once completed, you will have a working deliverable pushed to GitHub showcasing your skills in "
                f"**{cur_title}**."
            )
        else:
            domain_label = domain.replace("_", " ").title()
            if is_beg:
                if domain == "ai_ml":
                    conversation_body = (
                        f"{name_prefix}you are currently building your foundational skills in **{domain_label}** at the **{level}** level.\n\n"
                        "Your next focus should be Python data manipulation fundamentals: NumPy array operations, basic Pandas dataframes, "
                        "and writing clean, parameterized functions.\n\n"
                        "Machine learning algorithms require fluid numerical computing and data wrangling skills. "
                        "Skipping straight to models or neural networks without data foundations leads to fragile code.\n\n"
                        "Once completed, you will have an exploratory data analysis (EDA) notebook analyzing a real-world CSV dataset with summary statistics and visualizations."
                    )
                elif domain == "web_development":
                    conversation_body = (
                        f"{name_prefix}you are currently building your foundational skills in **{domain_label}** at the **{level}** level.\n\n"
                        "Your next focus should be Modern JavaScript syntax and DOM manipulation fundamentals: functions, array methods (`map`/`filter`/`reduce`), "
                        "and async/fetch calls before jumping into frontend frameworks.\n\n"
                        "React and full-stack frameworks rely heavily on functional JavaScript patterns. "
                        "Getting comfortable with them first makes learning frameworks so much easier.\n\n"
                        "Once completed, you will have built an interactive, responsive single-page application communicating with an open API without third-party frameworks."
                    )
                else:
                    conversation_body = (
                        f"{name_prefix}you are currently establishing your programming foundations in **{domain_label}** at the **{level}** level.\n\n"
                        "Your next focus should be core language syntax, control flow (loops/conditionals), and functions by completing "
                        "3 small algorithmic or CLI exercises.\n\n"
                        "Strong syntax fluency is the essential prerequisite before attempting web frameworks, APIs, or database integration.\n\n"
                        "Once completed, you will have a working command-line interface (CLI) tool with input validation, error handling, and clean modular structure."
                    )
            else:
                conversation_body = (
                    f"{name_prefix}you are established at the **{level}** level in **{domain_label}**.\n\n"
                    "Your next focus should be building an integrated, multi-tier project incorporating asynchronous API endpoints, persistent database storage, and unit test coverage.\n\n"
                    "Bridging intermediate to senior capability requires shipping complete systems rather than isolated scripts.\n\n"
                    "Once completed, you will have a fully containerized REST microservice with automated tests and CI workflow deployed to a staging environment."
                )

        action_steps = (
            "#### Immediate Step-by-Step Action Plan:\n"
            "1. **Next study session**: Focus strictly on the single concept outlined above. Write working code in your editor.\n"
            "2. **This week**: Complete and test the practical deliverable. Avoid switching topics until this milestone passes verification.\n"
            "3. **Verification**: Push your code to GitHub with a descriptive commit message and run tests.\n"
        )

        return f"{header}\n\n{conversation_body}\n\n{action_steps}"

    def _generate_milestone_deep_dive_response(
        self,
        prompt: str,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Deeply breakdown the learner's active milestone: concepts, action items, deliverable, verification."""
        user_progress = (context.get("user_progress") or {}) if context else {}
        active_roadmaps = user_progress.get("active_roadmaps", []) if isinstance(user_progress, dict) else []

        if active_roadmaps:
            ar = active_roadmaps[0]
            cur_m = ar.get("current_milestone") or {}
            cur_title = ar.get("current_milestone_title") or cur_m.get("title") or "Active Milestone"
            cur_desc = ar.get("current_milestone_description") or cur_m.get("description") or "Master core competencies."
            key_skills = ar.get("current_key_skills") or cur_m.get("key_skills", [])
            prereqs = ar.get("required_prerequisites") or cur_m.get("prerequisites", [])
            action_items = ar.get("current_action_items") or cur_m.get("action_items", [])
            project = ar.get("current_project") or cur_m.get("project")
            upcoming = ar.get("upcoming_milestone_title") or "Upcoming Phase"
            roadmap_title = ar.get("title", "Active Roadmap")
        else:
            cur_title = "Responsive Web Design & Foundations"
            cur_desc = "HTML semantic markup, CSS Flexbox/Grid, and responsive layout principles."
            key_skills = ["HTML5", "CSS3", "Flexbox", "CSS Grid", "Responsive Design"]
            prereqs = ["Web Fundamentals"]
            action_items = [
                "Structure accessible semantic HTML markup with header, nav, main, section, and footer elements.",
                "Implement a mobile-first responsive layout using modern CSS Flexbox and Grid.",
                "Build and test responsive breakpoints across mobile, tablet, and desktop viewports.",
            ]
            project = {
                "title": "Responsive Product Landing Page",
                "description": "A fully responsive, accessible 2-page product site with interactive navigation.",
                "tech_stack": ["HTML5", "CSS3", "Flexbox", "Grid"],
            }
            upcoming = "Modern JavaScript (ES6+) Fundamentals"
            roadmap_title = "Web Development"

        header = f"### Milestone Deep Dive: {cur_title}"

        intro = (
            f"Here is your in-depth technical focus for **{cur_title}** within your **{roadmap_title}** track.\n\n"
            f"**Objective**: {cur_desc}"
        )

        # 1. Key Skills
        skills_str = ", ".join(f"`{s}`" for s in key_skills) if key_skills else "`Foundations`"
        skills_sec = f"#### 1. Core Competencies & Skills to Acquire:\n- Key Skills: {skills_str}"
        if prereqs:
            prereqs_str = ", ".join(f"`{p}`" for p in prereqs)
            skills_sec += f"\n- Verified Prerequisites: {prereqs_str}"

        # 2. Action Items
        action_lines = ["#### 2. Practical Action Steps:"]
        if action_items:
            for idx, item in enumerate(action_items, 1):
                action_lines.append(f"{idx}. {item}")
        else:
            action_lines.append("1. Set up your local workspace and repository with clean folder structure.")
            action_lines.append(f"2. Implement the core concepts of {cur_title} in working code.")
            action_lines.append("3. Write verification checks and edge-case tests.")
        action_sec = "\n".join(action_lines)

        # 3. Deliverable Lab Project
        if project and isinstance(project, dict):
            proj_title = project.get("title", "Hands-on Milestone Lab")
            proj_desc = project.get("description", "A practical deliverable demonstrating milestone mastery.")
            proj_stack = ", ".join(project.get("tech_stack", [])) if project.get("tech_stack") else "Modern Stack"
            lab_sec = (
                f"#### 3. Milestone Deliverable:\n"
                f"- **Project**: **{proj_title}**\n"
                f"- **Specification**: {proj_desc}\n"
                f"- **Tech Stack**: {proj_stack}"
            )
        else:
            lab_sec = (
                f"#### 3. Milestone Deliverable:\n"
                f"- Build 2 verified pages or modules showcasing your implementation of {cur_title}."
            )

        # 4. Schedule and verification
        schedule_sec = (
            "#### 4. Study Schedule & Verification Checklist:\n"
            f"- **Next study session**: Implement the first action item in your editor and commit the initial scaffold.\n"
            f"- **This week**: Complete the milestone deliverable, push to GitHub, and verify against prerequisites before advancing to **{upcoming}**."
        )

        return f"{header}\n\n{intro}\n\n{skills_sec}\n\n{action_sec}\n\n{lab_sec}\n\n{schedule_sec}"

    def _generate_roadmap_response(
        self,
        domain: str,
        level: str,
        topic: str = "",
        seed: Any = None,
    ) -> str:
        curricula = {
            "python": [
                ("Phase 1: Python Core Foundations & Data Structures", "2-3 Weeks", "Variables, control flow, functions, lists, dicts, tuples, sets, comprehensions, and type annotations. Milestone: Build an interactive CLI personal data manager."),
                ("Phase 2: Object-Oriented Design & Pythonic Idioms", "3 Weeks", "Classes, inheritance, dunder methods, decorators, context managers, generators, and exception hierarchy. Milestone: Extensible event-driven plugin system."),
                ("Phase 3: Asynchronous Programming & Concurrency", "3 Weeks", "Asyncio event loop, coroutines, tasks, gather, ThreadPoolExecutor, and non-blocking I/O patterns. Milestone: High-throughput concurrent web scraper and API aggregator."),
                ("Phase 4: Modern Web APIs & Persistence with FastAPI", "4 Weeks", "FastAPI routing, Pydantic v2 schemas, SQLAlchemy 2.0 async ORM, PostgreSQL, and Alembic migrations. Milestone: Production REST API with JWT authentication and rate limiting."),
                ("Phase 5: Production Architecture, Testing & CI/CD", "3-4 Weeks", "Pytest unit & integration suites, Docker multi-stage containerization, GitHub Actions CI, and Redis caching. Milestone: Production-ready microservice deployed with automated CI."),
            ],
            "web_development": [
                ("Phase 1: Modern HTML5 & Semantic Web Foundations", "1-2 Weeks", "Semantic tags, accessible forms (WCAG), CSS Grid, Flexbox, and Tailwind CSS design systems. Milestone: Responsive multi-page portfolio."),
                ("Phase 2: Modern JavaScript (ES2024+) & Async Programming", "3-4 Weeks", "Closures, event loop, Promises, Async/Await, Fetch API, and DOM manipulation. Milestone: Interactive state-driven web dashboard."),
                ("Phase 3: React & Component Architecture", "4 Weeks", "Custom Hooks, reactive state, component composition, Context API, and client routing. Milestone: Collaborative task Kanban application."),
                ("Phase 4: Full-Stack Backend & Database Capstone", "4-5 Weeks", "FastAPI or Node.js backend, PostgreSQL with async ORM, and REST/GraphQL API design. Milestone: Full-stack platform with secure user auth."),
                ("Phase 5: Production Deployment & Observability", "3 Weeks", "Docker containerization, CI/CD automated deployment, caching with Redis, and monitoring. Milestone: Production cloud deployment."),
            ],
            "ai_ml": [
                ("Phase 1: Python for AI & Numerical Foundations", "3-4 Weeks", "NumPy array vectorization, Pandas data structures, and mathematical intuition (linear algebra & calculus). Milestone: Exploratory data analysis suite."),
                ("Phase 2: Supervised & Classical Machine Learning", "4-5 Weeks", "Scikit-Learn algorithms, feature engineering, cross-validation metrics, and hyperparameter tuning. Milestone: Predictive ML classification service."),
                ("Phase 3: Deep Learning & PyTorch Foundations", "5 Weeks", "Tensors, autograd, neural network modules, loss functions, and backpropagation. Milestone: Computer vision image classifier."),
                ("Phase 4: LLMs, Transformers & RAG Systems", "4-5 Weeks", "Attention mechanisms, vector databases (Chroma/Pinecone), embedding retrieval, and prompt engineering. Milestone: Production RAG question-answering assistant."),
                ("Phase 5: Autonomous AI Agents & Production Capstone", "4 Weeks", "LangChain/LangGraph agent orchestration, tool execution loops, and streaming API endpoints. Milestone: Autonomous multi-tool coding agent."),
            ],
            "cybersecurity": [
                ("Phase 1: Computing Fundamentals & Linux Mastery", "3 Weeks", "Linux CLI navigation, process permissions, bash scripting, and system security fundamentals. Milestone: Hardened Linux server setup."),
                ("Phase 2: Computer Networking & Packet Analysis", "4 Weeks", "TCP/IP 3-way handshake, OSI layers, DNS, and Wireshark traffic inspection. Milestone: Network traffic inspection report."),
                ("Phase 3: Ethical Hacking & Vulnerability Scanning", "4-5 Weeks", "Nmap reconnaissance, vulnerability assessment, and Metasploit fundamentals. Milestone: Isolated penetration testing lab."),
                ("Phase 4: Web Application Security & OWASP Top 10", "4-5 Weeks", "SQL injection, XSS, CSRF, authentication bypass, and defensive remediation. Milestone: OWASP vulnerability audit and patch."),
                ("Phase 5: Defensive Hardening & SOC Capstone", "4 Weeks", "SIEM log monitoring, firewall configuration, and incident triage protocols. Milestone: Incident response playbook implementation."),
            ],
            "cloud_devops": [
                ("Phase 1: Linux Systems & Shell Automation", "3 Weeks", "Server administration, user privileges, systemd services, and Bash automation. Milestone: Automated server provisioning script."),
                ("Phase 2: Git Version Control & Branching Workflows", "2 Weeks", "Feature branching, pull request reviews, and GitHub Actions CI triggers. Milestone: Automated linting and test pipeline."),
                ("Phase 3: Docker Containerization", "3-4 Weeks", "Multi-stage Dockerfiles, image optimization, volume storage, and Docker Compose. Milestone: Containerized multi-tier web application."),
                ("Phase 4: Cloud Infrastructure (AWS / GCP)", "4-5 Weeks", "VPCs, IAM policies, compute instances, object storage, and managed databases. Milestone: Cloud infrastructure deployment."),
                ("Phase 5: Kubernetes & Infrastructure as Code", "5 Weeks", "Terraform declarative provisioning, Kubernetes pods, deployments, and Helm charts. Milestone: Auto-scaling Kubernetes cluster."),
            ],
            "data": [
                ("Phase 1: SQL Mastery & Relational Databases", "3-4 Weeks", "Complex joins, window functions, aggregations, and query execution planning. Milestone: Analytical database schema and query suite."),
                ("Phase 2: Python for Data Analytics (Pandas & Polars)", "4 Weeks", "Data wrangling, cleaning missing values, exploratory data analysis (EDA). Milestone: Automated dataset cleaning pipeline."),
                ("Phase 3: Business Intelligence & Dashboarding", "3 Weeks", "Interactive dashboards using Power BI / Tableau and storytelling metrics. Milestone: Executive KPI reporting dashboard."),
                ("Phase 4: Data Engineering Pipelines & ETL", "4-5 Weeks", "Automated pipelines, Parquet columnar storage, and Apache Airflow DAGs. Milestone: Production ETL pipeline with automated scheduling."),
                ("Phase 5: Predictive Modeling & Machine Learning", "4 Weeks", "Supervised classification, regression, and model interpretability. Milestone: Production predictive analytics model."),
            ],
            "go": [
                ("Phase 1: Go Syntax & Core Foundations", "2-3 Weeks", "Variables, static typing, control flow, functions, pointers, arrays, slices, maps, and packages. Milestone: High-efficiency CLI tool."),
                ("Phase 2: Structs, Methods & Interfaces", "3 Weeks", "Struct embedding, value vs pointer receivers, interfaces, polymorphism, and error handling idioms. Milestone: Extensible logging and data pipeline."),
                ("Phase 3: Goroutines, Channels & Concurrency", "3-4 Weeks", "Goroutines, unbuffered/buffered channels, select statements, sync.WaitGroup, sync.Mutex, and context cancellation. Milestone: High-throughput concurrent web crawler."),
                ("Phase 4: Standard Library & HTTP Microservices", "4 Weeks", "net/http server, REST routing, JSON encoding/decoding, middleware, and database/sql with PostgreSQL. Milestone: Production REST API microservice."),
                ("Phase 5: Production Tooling, Testing & Deployment", "3 Weeks", "Unit & benchmark testing with testing package, pprof profiling, multi-stage Docker scratch build, and CI/CD. Milestone: High-performance containerized microservice."),
            ],
            "rust": [
                ("Phase 1: Rust Foundations & Cargo Tooling", "2-3 Weeks", "Cargo, rustc, variables, mutability, scalar & compound types, functions, and control flow. Milestone: Interactive CLI tool."),
                ("Phase 2: Ownership, Borrowing & Lifetimes", "3-4 Weeks", "Memory safety without a garbage collector, ownership rules, references, borrowing, slices, and lifetime annotations. Milestone: Safe in-memory cache data structure."),
                ("Phase 3: Structs, Enums & Pattern Matching", "3 Weeks", "Custom structs, methods, enums with data, Option and Result types, pattern matching with match and if let. Milestone: Robust parser."),
                ("Phase 4: Generics, Traits & Error Handling", "3-4 Weeks", "Trait definitions, trait bounds, generic data types, operator overloading, and custom error types. Milestone: Type-safe plugin system."),
                ("Phase 5: Concurrency, Smart Pointers & Systems Projects", "4 Weeks", "Threads, message passing with channels, Mutex, Arc, Rc, RefCell, async with Tokio, and systems programming. Milestone: Concurrent network server."),
            ],
            "javascript": [
                ("Phase 1: Foundations (Syntax, DOM, Events)", "2-3 Weeks", "Variables (let/const), data types, operators, conditionals, functions, DOM manipulation (querySelector, dynamic elements), and event listeners/handling. Milestone: Interactive Task Manager application."),
                ("Phase 2: Modern JS (ES6+, Async/Await, Fetch)", "3 Weeks", "Arrow functions, destructuring, rest/spread operators, Promises, async/await asynchronous flow, and HTTP requests via Fetch API. Milestone: Live REST API Weather Dashboard."),
                ("Phase 3: Advanced (Closures, Prototypes, Modules)", "3-4 Weeks", "Closures, lexical scope, prototypal inheritance, 'this' keyword binding, ES Modules (import/export), and the JavaScript Event Loop. Milestone: Modular custom state management library."),
                ("Phase 4: Frameworks (React/Node)", "4-5 Weeks", "Frontend component architecture with React (Hooks, state, Context) and server-side JavaScript with Node.js & Express. Milestone: Production full-stack JavaScript application."),
            ],
        }

        # Resolve curriculum track
        track_key = domain
        t_low = topic.lower()
        if any(w in t_low for w in ["ai engineer", "ai engineering", "machine learning", "deep learning"]) or domain == "ai_ml":
            track_key = "ai_ml"
        elif "python" in t_low or domain == "python":
            track_key = "python"
        elif any(w in t_low for w in ["go", "golang"]) or domain in ["go", "golang"]:
            track_key = "go"
        elif "rust" in t_low or domain == "rust":
            track_key = "rust"
        elif any(w in t_low for w in ["javascript", "js"]) or domain in ["javascript", "js"]:
            track_key = "javascript"
        elif any(w in t_low for w in ["cyber", "security", "hack"]) or domain == "cybersecurity":
            track_key = "cybersecurity"
        elif any(w in t_low for w in ["devops", "cloud", "docker", "kubernetes"]) or domain == "cloud_devops":
            track_key = "cloud_devops"
        elif any(w in t_low for w in ["data", "sql", "analytics"]) or domain == "data":
            track_key = "data"
        elif track_key not in curricula:
            track_key = "web_development"

        steps = curricula[track_key]
        domain_title = track_key.replace("_", " ").title()
        if track_key == "python":
            domain_title = "Python Programming"
        elif track_key == "ai_ml":
            domain_title = "AI Engineering"
        elif track_key == "go":
            domain_title = "Go (Golang) Engineering"
        elif track_key == "rust":
            domain_title = "Rust Systems Programming"
        elif track_key == "javascript":
            domain_title = "Modern JavaScript Development"

        intros = [
            f"### Engineering Roadmap: {domain_title} ({level})\n\n"
            f"Here is your step-by-step roadmap to guide you through **{domain_title}**:",
            f"### Learning Roadmap: {domain_title} ({level})\n\n"
            f"Here is a practical path tailored for the **{level}** stage to build lasting capability in **{domain_title}**:",
            f"### Phased Curriculum Roadmap: {domain_title} ({level})\n\n"
            f"To achieve deep proficiency in **{domain_title}**, follow this sequential progression starting with your current phase:",
        ]

        action_tips = [
            "*Mentor Note: Complete each milestone before jumping ahead. Building small, verified projects produces 10x deeper retention than skimming syntax.*",
            "*Mentor Note: Commit your code daily to GitHub. A consistent commit history shows disciplined engineering habits to future employers.*",
            "*Mentor Note: When you encounter errors in any phase, embrace the debugging process—reading stack traces is a core senior skill.*",
        ]

        rng = random.Random(seed) if seed is not None else None

        p1_title, p1_duration, p1_desc = steps[0]
        p2_title, p2_duration, p2_desc = steps[1] if len(steps) > 1 else ("Advanced Topics", "Ongoing", "")

        p1_concepts = p1_desc.split("Milestone:")[0].strip().rstrip(".")
        p1_project = p1_desc.split("Milestone:")[1].strip() if "Milestone:" in p1_desc else "Milestone deliverable"

        lines = [
            self._choose(intros, rng=rng),
            "\n\n",
            f"#### 1. Current Phase: {p1_title} *(Estimated Duration: {p1_duration})*\n",
            f"Start by establishing rock-solid fundamentals in {p1_title.split(': ')[-1] if ': ' in p1_title else p1_title}. "
            "Rushing ahead to frameworks or complex tooling without mastering core syntax creates debugging headaches later.\n\n",
            "#### 2. This Week's Focus\n",
            f"- **Key Concepts to Write in Code**: {p1_concepts}.\n",
            "- **Daily Practice**: Open your editor, write small scripts for each concept, and inspect the outputs rather than only watching tutorials.\n\n",
            "#### 3. Practice Project\n",
            f"- **Project**: **{p1_project}**\n",
            "- **Milestone Deliverable**: Build, test, and push the project to GitHub with a clean README.\n\n",
            "#### 4. What Comes Next\n",
            f"Once you complete Phase 1 and push your project deliverable, your immediate next phase is **{p2_title}** (*{p2_duration}*).\n\n",
            "**Upcoming Roadmap Progression**:\n",
        ]

        for idx, (title, duration, desc) in enumerate(steps[1:], 2):
            short_desc = desc.split(".")[0].strip()
            lines.append(f"- **{title}** *({duration})*: {short_desc}.\n")

        lines.append("\n### Recommended Next Actions on Technea:\n")
        lines.append("1. **Set Up Your Workspace**: Initialize your repository and configure your development environment.\n")
        lines.append("2. **Join Community Learning Rooms**: Connect with peers tackling the same milestones on Technea.\n")
        lines.append("3. **Daily Coding Habit**: Log your practice and build your streak on the Technea Dashboard.\n\n")
        lines.append(self._choose(action_tips, rng=rng))

        return "".join(lines)

    def _generate_coding_response(
        self,
        prompt: str,
        domain: str,
        level: str,
        seed: Any = None,
    ) -> str:
        rng = random.Random(seed) if seed is not None else None
        p = prompt.lower()

        # 1. Recursion inquiry
        if any(w in p for w in ["recursion", "recursive"]):
            intros = [
                "### Recursion: Intuition, Mechanics & Implementation\n\n"
                "Recursion is one of computer science's most foundational problem-solving techniques. At its core, "
                "**recursion is simply a function solving a problem by calling itself with a smaller subproblem**.",
                "### Understanding Recursion: Mental Model & Execution Trace\n\n"
                "Recursion follows two non-negotiable architectural rules: "
                "a **Base Case** to stop, and a **Recursive Step** to advance toward termination.",
                "### Demystifying Recursion: Step-by-Step Breakdown\n\n"
                "Let's break down recursion systematically. Think of recursion like Russian nesting dolls (Matryoshka): "
                "each doll opens to reveal a smaller version of itself, until you reach the smallest solid doll (the base case).",
            ]

            examples = [
                (
                    "Factorial Calculation (`n!`)",
                    "```python\ndef factorial(n: int) -> int:\n"
                    '    """Calculate factorial of n recursively.\n\n'
                    "    Intuition:\n"
                    "    - Base Case: 0! = 1! = 1. Without this, recursion runs forever!\n"
                    "    - Recursive Step: n! = n * factorial(n - 1)\n"
                    '    """\n'
                    "    # 1. BASE CASE: Stop condition preventing infinite recursion\n"
                    "    if n <= 1:\n"
                    "        return 1\n\n"
                    "    # 2. RECURSIVE STEP: Self-call with a strictly smaller problem\n"
                    "    return n * factorial(n - 1)\n\n\n"
                    "# Verify execution\n"
                    "if __name__ == '__main__':\n"
                    "    number = 5\n"
                    '    result = factorial(number)\n'
                    '    print(f"Factorial of {number} is: {result}")  # Outputs 120\n```',
                    "**Execution Trace on the Call Stack:**\n"
                    "1. `factorial(5)` pushes frame -> waits for `5 * factorial(4)`\n"
                    "2. `factorial(4)` pushes frame -> waits for `4 * factorial(3)`\n"
                    "3. `factorial(3)` pushes frame -> waits for `3 * factorial(2)`\n"
                    "4. `factorial(2)` pushes frame -> waits for `2 * factorial(1)`\n"
                    "5. `factorial(1)` hits **Base Case** -> returns `1` immediately!\n"
                    "6. Frames pop in reverse order (LIFO): `2 * 1 = 2` -> `3 * 2 = 6` -> `4 * 6 = 24` -> `5 * 24 = 120`.",
                ),
                (
                    "Countdown Timer with Base Case",
                    "```python\ndef countdown(n: int) -> None:\n"
                    '    """Print numbers counting down to blastoff recursively.\n\n'
                    "    Intuition:\n"
                    "    - Base Case: When n <= 0, print 'Blastoff!' and return.\n"
                    "    - Recursive Step: Print current number, then countdown(n - 1).\n"
                    '    """\n'
                    "    # 1. BASE CASE\n"
                    "    if n <= 0:\n"
                    '        print("Blastoff!")\n'
                    "        return None\n\n"
                    "    # 2. WORK & RECURSIVE STEP\n"
                    '    print(f"T-minus: {n}")\n'
                    "    countdown(n - 1)\n\n\n"
                    "# Verify execution\n"
                    "if __name__ == '__main__':\n"
                    "    countdown(3)\n```",
                    "**Execution Trace on the Call Stack:**\n"
                    "1. `countdown(3)` prints `T-minus: 3`, calls `countdown(2)`\n"
                    "2. `countdown(2)` prints `T-minus: 2`, calls `countdown(1)`\n"
                    "3. `countdown(1)` prints `T-minus: 1`, calls `countdown(0)`\n"
                    "4. `countdown(0)` hits **Base Case**, prints `Blastoff!`, and returns!\n"
                    "5. Each stack frame unwinds cleanly.",
                ),
            ]

            tips = [
                "*Senior Note: In Python, the default recursion depth limit is 1,000 (`sys.getrecursionlimit()`). For deeper calls, prefer iteration or tail-call patterns.*",
                "*Senior Note: Every recursive call adds a frame to your call stack ($O(n)$ space complexity). Always identify the base case before writing any code.*",
                "*Senior Note: If a recursive tree makes identical subproblem calculations (like naive Fibonacci), use memoization (`@functools.lru_cache`) to optimize from $O(2^n)$ to $O(n)$.*",
            ]

            chosen_intro = self._choose(intros, rng=rng)
            chosen_example = self._choose(examples, rng=rng)
            chosen_tip = self._choose(tips, rng=rng)

            return (
                f"{chosen_intro}\n\n"
                "#### The Two Non-Negotiable Components:\n"
                "1. **The Base Case**: The simplest terminating condition where the answer is known without further calls. It halts the recursion.\n"
                "2. **The Recursive Step**: The logic that shrinks the problem and moves closer to the base case with every call.\n\n"
                f"#### Practical Code Example: {chosen_example[0]}\n"
                f"{chosen_example[1]}\n\n"
                "#### Step-by-Step Intuition & Stack Mechanics\n"
                f"{chosen_example[2]}\n\n"
                "#### Key Takeaways for Everyday Engineering:\n"
                "- Recursion is ideal for tree traversals (DOM trees, ASTs, file systems) and divide-and-conquer algorithms (Merge Sort, Binary Search).\n"
                "- Always verify that every path leads toward your base case to prevent a `RecursionError: maximum recursion depth exceeded`.\n\n"
                f"{chosen_tip}"
            )

        # 2. Async / Concurrency inquiry
        if any(w in p for w in ["async", "asyncio", "await", "concurrency"]):
            intros = [
                "### Asynchronous Programming in Python: Intuition, Event Loop & Code\n\n"
                "In traditional synchronous code, your program freezes while waiting for network requests, database queries, or disk I/O. "
                "**Asynchronous programming allows your program to pause waiting tasks and execute other work concurrently on a single thread.**",
                "### Python Concurrency: Async, Await & Non-Blocking I/O\n\n"
                "Asynchronous concurrency in Python is powered by an **Event Loop**. While one task waits for an I/O response, "
                "the event loop switches execution to another ready task—yielding massive throughput gains for I/O-bound systems.",
            ]

            code_block = (
                "```python\n"
                "import asyncio\n"
                "import time\n"
                "\n"
                "async def fetch_service_data(service_name: str, delay_seconds: float) -> dict:\n"
                '    """Simulate a non-blocking external API or database call."""\n'
                '    print(f"[{time.strftime(\'%X\')}] Request sent to: {service_name}")\n'
                "    # 'await' cooperatively yields control back to the event loop\n"
                "    await asyncio.sleep(delay_seconds)\n"
                '    print(f"[{time.strftime(\'%X\')}] Response received from: {service_name}")\n'
                '    return {"service": service_name, "status": "200_OK", "latency": delay_seconds}\n'
                "\n"
                "async def main() -> None:\n"
                "    start_time = time.perf_counter()\n"
                "    \n"
                "    # Run all 3 network queries concurrently in parallel!\n"
                "    results = await asyncio.gather(\n"
                '        fetch_service_data("UserAuthService", 1.0),\n'
                '        fetch_service_data("CatalogService", 1.2),\n'
                '        fetch_service_data("BillingService", 0.8),\n'
                "    )\n"
                "    \n"
                "    total_time = time.perf_counter() - start_time\n"
                '    print(f"\\nAll {len(results)} services fetched in {total_time:.2f}s (Synchronous would take 3.00s!)")\n'
                "\n"
                "if __name__ == '__main__':\n"
                "    asyncio.run(main())\n"
                "```"
            )

            tips = [
                "*Senior Note: Never use blocking calls like `time.sleep()` or synchronous `requests.get()` inside `async` code; they block the entire event loop thread! Use `asyncio.sleep()` and `httpx.AsyncClient` instead.*",
                "*Senior Note: Async does not mean multi-threading or multi-processing. It is cooperative single-threaded concurrency tailored for I/O operations.*",
            ]

            return (
                f"{self._choose(intros, rng=rng)}\n\n"
                "#### Core Concepts to Know:\n"
                "- **`async def`**: Declares a coroutine function that returns a coroutine object when called.\n"
                "- **`await`**: Pauses the execution of the coroutine until the awaited operation completes, allowing other tasks to run.\n"
                "- **`asyncio.gather()`**: Fires multiple coroutines concurrently and waits for all of them to resolve.\n\n"
                "#### Practical Code Example: Concurrent Microservice Fetching\n"
                f"{code_block}\n\n"
                "#### Step-by-Step Execution Breakdown:\n"
                "1. `main()` fires `asyncio.gather()` with 3 tasks.\n"
                "2. `UserAuthService` starts and hits `await asyncio.sleep(1.0)`. It yields control.\n"
                "3. The event loop immediately switches to `CatalogService`, which also awaits.\n"
                "4. The event loop switches to `BillingService`. All 3 are waiting simultaneously.\n"
                "5. At 0.8s, `BillingService` finishes first and resumes. At 1.0s, `UserAuthService` finishes. At 1.2s, `CatalogService` finishes.\n"
                "6. Total wall-clock elapsed time is ~1.2s instead of 3.0s!\n\n"
                f"{self._choose(tips, rng=rng)}"
            )

        # 3. General Python / Coding question
        intros = [
            f"### Engineering Breakdown: {prompt[:60]}\n\n"
            "Let's explore this with clean, modern code, step-by-step intuition, and production best practices.",
            f"### Code Architecture Deep-Dive: {prompt[:60]}\n\n"
            "Here is the practical, step-by-step implementation designed to build lasting technical intuition.",
        ]

        generic_code = (
            "```python\n"
            "from typing import Any\n"
            "\n"
            "def process_pipeline_data(items: list[dict[str, Any]]) -> list[dict[str, Any]]:\n"
            '    """Filter and transform data with defensive type checking.\n'
            '    \n'
            '    Time Complexity: O(n) single pass.\n'
            '    Space Complexity: O(n) for the transformed collection.\n'
            '    """\n'
            "    # Modern, readable list comprehension with conditional guard\n"
            "    return [\n"
            '        {"id": item["id"], "score": item.get("score", 0) * 1.1}\n'
            "        for item in items\n"
            '        if item.get("is_active", False)\n'
            "    ]\n"
            "\n"
            "# Usage Example\n"
            "sample_input = [\n"
            '    {"id": 1, "is_active": True, "score": 100},\n'
            '    {"id": 2, "is_active": False, "score": 80},\n'
            '    {"id": 3, "is_active": True, "score": 50},\n'
            "]\n"
            "output = process_pipeline_data(sample_input)\n"
            'print("Processed Active Items:", output)\n'
            "```"
        )

        return (
            f"{self._choose(intros, rng=rng)}\n\n"
            "#### 1. Intuition & Architectural Mental Model\n"
            "- Always aim for **pure functions**: given the same input, they should always return the same output without side effects.\n"
            "- Prioritize **explicit type hints** (`typing` / built-in generics) so tools and peers understand data contracts instantly.\n"
            "- Design for **fail-safe execution**: gracefully handle missing dictionary keys and unexpected types.\n\n"
            "#### 2. Practical, Idiomatic Implementation\n"
            f"{generic_code}\n\n"
            "#### 3. Step-by-Step Code Walkthrough\n"
            "- The list comprehension iterates across each record in a single linear pass ($O(n)$).\n"
            "- The `.get('is_active', False)` guard protects against `KeyError` exceptions when records have missing fields.\n"
            "- The transformed dictionary produces a clean, immutable payload ready for downstream consumption.\n\n"
            "*Mentor Challenge: Try writing a unit test for this function using `pytest` covering empty lists and invalid inputs!*"
        )

    def _generate_project_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        intros = [
            f"### Recommended Portfolio Projects ({level} Level)\n\n"
            "The fastest way to achieve technical mastery is to build real projects from scratch. "
            f"Here are 3 specific, portfolio-grade projects calibrated directly to your **{level}** standing:",
            f"### Capstone Project Specifications ({level} Level)\n\n"
            "Employers and senior engineers look for production hygiene, clear architecture, and working deployments. "
            f"Here are 3 high-signal project ideas calibrated for a **{level}** developer:",
            f"### Portfolio Project Roadmap ({level} Level)\n\n"
            "Building these projects will bridge the gap between reading syntax and shipping production software. "
            f"Here is your 3-tier project roadmap for **{level}** skills:",
        ]

        if self._is_beginner(level):
            projects = [
                (
                    "1. Personal Habit & Streak Tracker CLI",
                    "- **Problem Solved**: Daily habit tracking with persistence and streak statistics.\n"
                    "- **Key Features**: Add habits, mark daily completion, view current & longest streaks, JSON/SQLite persistence, and clean terminal formatting.\n"
                    "- **Tech Stack**: Python 3.12+, Typer/Click, SQLite or JSON file storage.\n"
                    "- **Portfolio Value**: Proves command-line UX design, file I/O, error handling, modular functions, and data validation."
                ),
                (
                    "2. Responsive Developer Portfolio & Project Showcase",
                    "- **Problem Solved**: An accessible, personal platform showcasing technical skills, live project demos, and resume links.\n"
                    "- **Key Features**: Dark/light theme toggle, filterable project tags, responsive mobile-first navigation, WCAG AA accessibility, and contact modal.\n"
                    "- **Tech Stack**: HTML5, Tailwind CSS, TypeScript, Vite.\n"
                    "- **Portfolio Value**: Demonstrates modern CSS Grid/Flexbox layouts, semantic markup, DOM event handling, and clean code hygiene."
                ),
                (
                    "3. Interactive Markdown Quiz & Flashcard Tool",
                    "- **Problem Solved**: Spaced-repetition technical interview practice from local markdown notes.\n"
                    "- **Key Features**: Parses markdown flashcards, tracks correct/incorrect answer streaks, stores scores in browser LocalStorage, and provides timer controls.\n"
                    "- **Tech Stack**: JavaScript/React, LocalStorage API, CSS Modules.\n"
                    "- **Portfolio Value**: Proves state management, string parsing, client-side storage, and user-centric UI design."
                ),
            ]
        elif level == "Intermediate":
            projects = [
                (
                    "1. Real-Time Collaborative Kanban Board",
                    "- **Problem Solved**: Multi-user task coordination with live drag-and-drop state synchronization.\n"
                    "- **Key Features**: WebSocket real-time board updates, JWT authentication with refresh tokens, task swimlanes, and PostgreSQL audit history.\n"
                    "- **Tech Stack**: FastAPI or Node.js, WebSockets, React/Next.js, PostgreSQL, Tailwind CSS.\n"
                    "- **Portfolio Value**: Proves full-stack competency, real-time bidirectional communication, relational database schemas, and state sync."
                ),
                (
                    "2. Automated Content Aggregator & Digest Engine",
                    "- **Problem Solved**: Curates technical articles and news via RSS/APIs with background worker scheduling and email digests.\n"
                    "- **Key Features**: Scheduled background cron tasks, content deduplication, Redis caching, async task queue (Celery/RQ), and email notification dispatch.\n"
                    "- **Tech Stack**: Python FastAPI, Celery, Redis, PostgreSQL, Docker, SendGrid/SMTP.\n"
                    "- **Portfolio Value**: Demonstrates distributed background workers, rate limiting, caching strategies, and third-party API integration."
                ),
                (
                    "3. RESTful E-Commerce Catalog & Checkout Service",
                    "- **Problem Solved**: Micro-catalog platform handling inventory, cart sessions, and mock payment lifecycle.\n"
                    "- **Key Features**: Full-text product search, transactional cart reservations, mock Stripe payment integration, OpenAPI schema docs, and unit test suite.\n"
                    "- **Tech Stack**: Python FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Stripe API, pytest.\n"
                    "- **Portfolio Value**: Demonstrates robust API architecture, ACID transactional integrity, mock third-party payment workflows, and automated testing."
                ),
            ]
        else:  # Advanced
            projects = [
                (
                    "1. High-Throughput Distributed Event Ingestion Pipeline",
                    "- **Problem Solved**: Ingests, validates, and partitions streaming telemetry events with backpressure and dead-letter queues.\n"
                    "- **Key Features**: Distributed stream ingestion, Kafka/Redis Streams consumer groups, ClickHouse analytics sink, and Prometheus metrics exporter.\n"
                    "- **Tech Stack**: Apache Kafka / Redis Streams, Python (asyncio) / Go, ClickHouse, Prometheus & Grafana, Docker.\n"
                    "- **Portfolio Value**: Demonstrates distributed systems engineering, backpressure handling, high throughput, and observability."
                ),
                (
                    "2. Multi-Tenant SaaS Platform with Rate Limiting & RLS",
                    "- **Problem Solved**: Multi-tenant workspace platform enforcing strict tenant isolation and distributed rate limits.\n"
                    "- **Key Features**: Row-Level Security (RLS) in PostgreSQL, distributed sliding-window rate limiter in Redis, webhook delivery engine with retries, and Terraform provisioning.\n"
                    "- **Tech Stack**: FastAPI, PostgreSQL RLS, Redis, Docker Compose, Terraform, GitHub Actions.\n"
                    "- **Portfolio Value**: Proves enterprise-grade multi-tenancy, defense-in-depth security, cloud infrastructure provisioning, and production CI/CD."
                ),
                (
                    "3. Autonomous RAG Knowledge Base Agent with Tool Sandbox",
                    "- **Problem Solved**: Context-aware AI assistant that indexes documentation, executes sandboxed code, and answers developer queries.\n"
                    "- **Key Features**: Hybrid vector/keyword retrieval, streaming LLM token completion, AST-sandboxed Python code execution, and evaluation metrics (RAGAS).\n"
                    "- **Tech Stack**: Python, Qdrant/Pinecone, LangGraph, FastAPI, Docker sandbox.\n"
                    "- **Portfolio Value**: Demonstrates advanced AI engineering, grounded retrieval pipelines, safe code sandboxing, and LLM evaluation."
                ),
            ]

        starter_proj = projects[0][0].split(". ")[-1]
        intro_guidance = (
            f"For your current stage at the **{level}** level, I recommend starting with **Project 1: {starter_proj}**. "
            "Building focused, hands-on projects reinforces input validation, clean code structure, and practical error handling "
            "without getting bogged down in complex distributed systems. Once you push it to GitHub with tests and documentation, "
            "you'll have a solid project to showcase on your portfolio.\n\n"
        )

        tips = [
            "*Mentor Note: For whichever project you choose, deploy it live on a free platform (Railway, Render, Vercel) and include a 1-minute demo GIF in your GitHub README!*",
            "*Mentor Note: Write a clear 'Architecture & Trade-offs' section in your README explaining why you chose your tech stack and how you handled edge cases.*",
            "*Mentor Note: Commit feature branches and open Pull Requests against your own main branch to showcase professional Git etiquette.*",
        ]

        rng = random.Random(seed) if seed is not None else None
        lines = [self._choose(intros, rng=rng), "\n\n", intro_guidance]
        for title, details in projects:
            lines.append(f"#### {title}\n{details}\n\n")

        lines.append(self._choose(tips, rng=rng))
        return "".join(lines)

    def _generate_career_response(
        self,
        level: str,
        domain: str,
        seed: Any = None,
    ) -> str:
        rng = random.Random(seed) if seed is not None else None
        intros = [
            f"### Engineering Career Strategy ({level} Level)\n\n"
            "Navigating a software engineering career requires more than just memorizing syntax. "
            "Engineering leaders look for engineers who can **solve ambiguous problems, reason about trade-offs, and ship reliable software**.",
            f"### Strategic Career Coaching ({level} Level)\n\n"
            "To advance rapidly and stand out in hiring pipelines, you need a pragmatic strategy focused on "
            "high-leverage skills rather than superficial resume padding.",
            f"### Engineering Career Blueprint ({level} Level)\n\n"
            "Here is the realistic, high-signal playbook for engineering career growth, technical interview readiness, and production excellence:",
        ]

        intro_guidance = (
            f"At the **{level}** stage, your highest-leverage move is building one deep, production-tested capstone project "
            "with automated tests and a live deployment. Senior engineering hiring teams prioritize code craftsmanship, "
            "testing discipline, and architectural clarity over shallow tutorial clones.\n\n"
        )

        tips = [
            "*Career Action: Schedule 1 hour this week to audit your GitHub profile. Archive dead repositories and polish the README of your top 2 projects.*",
            "*Career Action: Practice explaining a tricky technical decision out loud. Being articulate during system design and code reviews is what distinguishes senior engineers.*",
            "*Career Action: Connect with 2 developers in the Technea Community Rooms this week to do a peer code review or mock interview!*",
        ]

        return (
            f"{self._choose(intros, rng=rng)}\n\n"
            f"{intro_guidance}"
            "#### 1. Portfolio Strategy: Depth Over Quantity\n"
            "- **The Golden Rule**: One comprehensive, end-to-end deployed project with automated tests and a live URL beats 10 shallow tutorial clones every single time.\n"
            "- **The README is Your Resume**: Document the problem statement, system architecture diagram, key technical challenges overcome, and instructions for running the test suite locally.\n"
            "- **Showcase Code Craftsmanship**: Include typed function signatures, modular architecture, defensive input validation, and meaningful commit messages.\n\n"
            "#### 2. System Design & Architectural Intuition\n"
            "- **Master Trade-Offs**: Senior engineers don't have 'favorite' tools; they have trade-off evaluations (e.g. SQL vs. NoSQL, sync REST vs. async queues, horizontal vs. vertical scaling).\n"
            "- **Understand the 'Why' Behind Caching & Indexing**: Learn when a Redis cache improves latency and when it introduces dangerous cache invalidation bugs.\n"
            "- **Data Modeling Matters**: Spend time designing clean relational schemas and normalizing tables before writing a single API endpoint.\n\n"
            "#### 3. Technical Interview Mastery\n"
            "- **Pattern Recognition Over LeetCode Grinding**: Master fundamental patterns (Sliding Window, Two Pointers, BFS/DFS tree traversal, Hash Map lookups) rather than memorizing 500 solutions.\n"
            "- **Communicate Out Loud**: Interviewers evaluate your problem formulation, clarifying questions, edge-case identification, and debugging poise when code fails.\n"
            "- **Ask Great Questions**: At the end of interviews, ask about deployment cadence, incident post-mortems, and engineering on-call culture.\n\n"
            "#### 4. Production Engineering Practices\n"
            "- **Write Automated Tests**: Learn `pytest` or `jest`. Code without tests is technical debt from the minute it is written.\n"
            "- **Containerization & CI/CD**: Package your applications in multi-stage `Dockerfiles` and set up a GitHub Actions workflow to run lints and tests on every push.\n"
            "- **Observability & Logging**: Use structured logging (JSON format) and know how to trace a request across services using correlation IDs.\n\n"
            "#### 5. Concrete Action Plan for Your Current Level:\n"
            f"- **Focus for {level}**: Build one capstone project incorporating unit tests, containerization, and a deployed live demo URL. Actively participate in peer code reviews on Technea.\n\n"
            f"{self._choose(tips, rng=rng)}"
        )

    def _generate_daily_goal_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: int | None = None,
    ) -> str:
        """Synthesize a structured daily learning goal broken into 45-60 min deep work blocks."""
        cur_m = "Core Foundations"
        pref_lang = "Python"
        time_avail = "1-2 hours/day"

        if context:
            cur_m = context.get("current_milestone_title") or context.get("current_milestone") or cur_m
            if isinstance(cur_m, dict):
                cur_m = cur_m.get("title", "Core Foundations")
            pref_lang = context.get("preferred_language") or pref_lang
            time_avail = context.get("time_available") or time_avail

        return (
            f"Here is your high-impact daily study plan calibrated for **{cur_m}**:\n\n"
            f"### 🎯 Today's Deep-Work Objectives ({time_avail})\n\n"
            f"#### ⏱️ Block 1: Conceptual Foundation (45–60 min)\n"
            f"- Master the foundational mental models and architectural principles of **{cur_m}**.\n"
            f"- Identify 2–3 key trade-offs and review documentation before coding.\n\n"
            f"#### 💻 Block 2: Hands-on Implementation ({pref_lang}) (45–60 min)\n"
            f"- Open your editor and write a working implementation in **{pref_lang}** applying today's concepts.\n"
            f"- Build a minimal feature or refactor your active milestone deliverable.\n"
            f"- Focus on clean code hygiene, idiomatic syntax, and proper error boundaries.\n\n"
            f"#### ✅ Verification & Completion Checkpoint (15 min)\n"
            f"- Run automated tests or execute a manual test suite to verify correctness.\n"
            f"- Commit your changes to git with a clear, descriptive message (`feat({cur_m.lower().replace(' ', '-')})`)."
        )

    def _generate_weekly_plan_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: int | None = None,
    ) -> str:
        """Synthesize a tactical Monday-Sunday weekly learning roadmap."""
        cur_m = "Core Milestone"
        target_role = "Software Engineer"
        pref_lang = "Python"

        if context:
            cur_m = context.get("current_milestone_title") or cur_m
            pref_lang = context.get("preferred_language") or pref_lang
            active_rms = context.get("active_roadmaps") or []
            if active_rms and isinstance(active_rms[0], dict):
                target_role = active_rms[0].get("target_role") or target_role

        return (
            f"Here is your tactical Monday-to-Sunday progression for **{cur_m}** ({target_role}):\n\n"
            f"### 📅 Weekly Engineering Deliverables\n\n"
            f"- **Monday – Tuesday: Deep Dive into Core Principles**\n"
            f"  - Deconstruct core patterns and standard libraries in **{pref_lang}**.\n"
            f"  - Complete guided exercises and take structured conceptual notes.\n\n"
            f"- **Wednesday – Thursday: Active Feature Implementation**\n"
            f"  - Build out the primary business logic and interfaces for this milestone.\n"
            f"  - Implement edge-case validation and clean function abstractions.\n\n"
            f"- **Friday: Hands-on Practice Project Integration**\n"
            f"  - Connect your components into a cohesive deliverable.\n"
            f"  - Write automated tests and perform a senior-style code review.\n\n"
            f"- **Saturday – Sunday: Review, Documentation & Milestone Sign-off**\n"
            f"  - Polish README documentation and push code to your GitHub portfolio.\n"
            f"  - Consolidate learned concepts with a quick revision check before advancing."
        )

    def _generate_revision_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: int | None = None,
    ) -> str:
        """Synthesize spaced repetition quizzes and diagnostic conceptual checks."""
        cur_m = "your recent lessons"
        pref_lang = "Python"

        if context:
            cur_m = (
                context.get("active_topic")
                or context.get("current_milestone_title")
                or context.get("topic")
                or cur_m
            )
            pref_lang = context.get("preferred_language") or pref_lang

        t_lower = cur_m.lower()
        if "design pattern" in t_lower or "object-oriented" in t_lower or "oop" in t_lower:
            return (
                f"### 🧠 Spaced Repetition Revision: {cur_m}\n\n"
                f"Let's test and reinforce your active recall on **{cur_m}**:\n\n"
                f"#### 1. Conceptual Diagnostic Question\n"
                f"- In **{pref_lang}**, what is the primary architectural trade-off between Inheritance and Composition (such as in the Strategy Pattern)?\n"
                f"- How does the Factory Pattern decouple business logic from concrete class instantiations?\n\n"
                f"#### 2. Code Review & Anti-Pattern Diagnosis\n"
                f"```python\n"
                f"# Identify the design pattern anti-pattern or tight coupling in this class:\n"
                f"class PaymentProcessor:\n"
                f"    def process(self, method: str, amount: float):\n"
                f"        if method == 'stripe':\n"
                f"            return StripeGateway().charge(amount)\n"
                f"        elif method == 'paypal':\n"
                f"            return PayPalGateway().pay(amount)\n"
                f"```\n"
                f"- *Question*: Why does this violate the Open/Closed Principle (OCP), and how would you refactor it using Dependency Injection and the Strategy Pattern?\n\n"
                f"#### 3. Active Implementation Challenge\n"
                f"- Write a clean, typed Singleton or Strategy interface in {pref_lang} demonstrating runtime extensibility."
            )

        return (
            f"### 🧠 Spaced Repetition Revision: {cur_m}\n\n"
            f"Let's test and reinforce your active recall on **{cur_m}**:\n\n"
            f"#### 1. Conceptual Diagnostic Question\n"
            f"- In **{pref_lang}**, what is the primary architectural trade-off between procedural execution and modular abstractions?\n"
            f"- How does the underlying runtime manage resource allocation during peak workloads?\n\n"
            f"#### 2. Code Review & Pitfall Diagnosis\n"
            f"```python\n"
            f"# Identify the potential regression or memory leak in this pattern:\n"
            f"def process_stream(data_chunks):\n"
            f"    buffer = []\n"
            f"    for chunk in data_chunks:\n"
            f"        buffer.append(chunk)\n"
            f"    return buffer\n"
            f"```\n"
            f"- *Question*: Why is accumulating unbounded chunks in a list dangerous for large payloads, and how would you rewrite this using generators?\n\n"
            f"#### 3. Active Implementation Challenge\n"
            f"- Write a clean, parameterized test verifying that unexpected null or invalid inputs are caught gracefully."
        )

    def _generate_interview_prep_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: int | None = None,
    ) -> str:
        """Synthesize role-calibrated technical and system design interview checkpoints."""
        cur_m = "Active Technical Track"
        target_role = "Software Engineer"
        pref_lang = "Python"

        if context:
            cur_m = context.get("current_milestone_title") or cur_m
            pref_lang = context.get("preferred_language") or pref_lang
            active_rms = context.get("active_roadmaps") or []
            if active_rms and isinstance(active_rms[0], dict):
                target_role = active_rms[0].get("target_role") or target_role

        return (
            f"### 💼 Technical Interview Preparation: {target_role}\n\n"
            f"Here are your high-yield interview checkpoints calibrated for **{cur_m}**:\n\n"
            f"#### 🎯 1. Behavioral & Project Deep-Dive (STAR Method)\n"
            f"- **Question**: *'Walk me through the architecture of your recent project. What was the toughest technical bottleneck you faced, and how did you resolve it?'*\n"
            f"- **Senior Mentor Tip**: Focus on measurable metrics—latency reduction, error rates, and why you selected your chosen stack in {pref_lang}.\n\n"
            f"#### ⚡ 2. Algorithmic & Coding Checkpoint\n"
            f"- **Question**: *'Given an input stream of data, design an in-memory data structure that supports insert and lookup in O(1) average time while maintaining insertion order.'*\n"
            f"- **Language Focus**: Explain how hash maps and doubly-linked nodes interact under the hood in {pref_lang}.\n\n"
            f"#### 🏛️ 3. System Design & Architectural Trade-off\n"
            f"- **Question**: *'How would you design a rate limiter to protect backend APIs from abusive traffic spikes?'*\n"
            f"- **Key Concepts**: Token bucket vs Leaky bucket algorithms, Redis atomic operations, and graceful degradation."
        )

    def _generate_debugging_response(self, prompt: str, seed: Any = None) -> str:
        rng = random.Random(seed) if seed is not None else None
        intros = [
            "### Systematic Debugging Protocol\n\n"
            "Let's troubleshoot this issue systematically using Technea's 4-step debugging protocol:",
            "### Root-Cause Diagnosis & Fix Strategy\n\n"
            "Debugging is a detective process. Let's isolate the root cause and formulate a robust fix:",
        ]

        tips = [
            "*Debugging Note: Always check the earliest line in the traceback that belongs to your code, rather than third-party library internals.*",
            "*Debugging Note: Reproduce the error with a minimal isolated test case before changing production code.*",
        ]

        return (
            f"{self._choose(intros, rng=rng)}\n\n"
            "#### 1. Root Cause Analysis\n"
            "- Carefully inspect the exact line and error type indicated in the stack trace.\n"
            "- Verify variable state, variable types, and null/undefined values immediately before the failing line.\n"
            "- Check for common edge cases: unhandled async promises, mismatched types, or missing environment variables.\n\n"
            "#### 2. Isolation & Verification Steps\n"
            "- **Structured Logging**: Add logging immediately before the point of failure to inspect inputs.\n"
            "- **Reproduce in Isolation**: Create a minimal reproducible script with hardcoded inputs.\n"
            "- **Check Environment**: Ensure all required packages, database connections, and environment variables are active.\n\n"
            "#### 3. Defensive Code Best Practices\n"
            "```python\n"
            "# Example: Defensive data validation pattern\n"
            "def safe_process_input(payload: dict) -> dict:\n"
            '    if not isinstance(payload, dict):\n'
            '        raise ValueError("Expected dictionary payload")\n'
            '    value = payload.get("key")\n'
            "    if value is None:\n"
            '        return {"status": "missing_key", "data": None}\n'
            '    return {"status": "ok", "data": str(value).strip()}\n'
            "```\n\n"
            "#### 4. Need more specific help?\n"
            "Paste your **code snippet** and the **full error traceback** here, and I will dissect the exact line and provide the verified fix!\n\n"
            f"{self._choose(tips, rng=rng)}"
        )

    def _generate_conceptual_response(
        self,
        prompt: str,
        domain: str,
        level: str = "Beginner",
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        rng = random.Random(seed) if seed is not None else None
        p_clean = prompt.strip().rstrip("?")
        p_lower = prompt.strip().lower()
        clean_p = re.sub(r"[^\w\s]", "", p_lower).strip()

        # Only use context.get("active_topic") if the prompt is an explicit single-word ellipsis ("why?", "explain")
        is_single_word_ellipsis = clean_p in {"why", "explain", "how", "what", "elaborate", "clarify"} or p_lower in {"why?", "explain?", "how?", "what?"}
        if is_single_word_ellipsis and context and context.get("active_topic"):
            ctx_topic = str(context["active_topic"]).strip()
            temporal_words = {"date", "time", "today", "day", "clock", "timezone"}
            if not any(w in temporal_words for w in re.sub(r"[^\w\s]", "", ctx_topic.lower()).split()):
                topic = ctx_topic
            else:
                topic = p_clean
        else:
            # Always extract topic from the LATEST user prompt, NOT a sticky context.get("active_topic")
            extracted = re.sub(
                r"^(?:can you\s+)?(?:please\s+)?(?:explain|teach me|what is an?|what are|what is|how to learn|how can i learn|how do i learn|guide for|tell me about|deep dive on|deep dive into|break down)\s+",
                "",
                p_clean,
                flags=re.IGNORECASE,
            ).strip()
            topic = extracted if extracted else p_clean

        pref_lang = (context and context.get("preferred_language")) or "Python"

        # Specialized learning habits / study routine guidance
        if any(w in prompt.lower() for w in ["study", "routine", "consistently", "how to learn", "habit"]) and not any(lang in prompt.lower() for lang in ["python", "javascript", "react", "html", "css", "docker", "sql"]):
            return (
                f"### 🎯 Learning Strategy & Study Habits: {topic[:60]}\n\n"
                "To build deep technical competence without burnout, follow these three evidence-based engineering study principles:\n\n"
                "#### 1. Daily Deliberate Practice (45–60 min blocks)\n"
                "- Consistency beats marathon weekend sessions. Commit to 45–60 minutes of uninterrupted daily coding.\n"
                "- Prioritize writing code from scratch over passively reading documentation or watching videos.\n\n"
                "#### 2. The Feynman Technique & Active Recall\n"
                "- After learning a concept, explain it out loud or write a 3-bullet summary in your own words.\n"
                "- Build micro-projects that intentionally test edge cases and force error handling.\n\n"
                "#### 3. Milestone-Driven Progress\n"
                "- Track your progress on the Technea roadmap dashboard. Complete one lesson and one hands-on exercise per session."
            )

        # Focused, pedagogical explanation tailored to the requested concept
        return (
            f"### Mentor Insight on: {topic[:80]}\n\n"
            f"Here is the foundational breakdown to build an accurate mental model and production intuition for **{topic[:50]}**:\n\n"
            "#### 1. Core Intuition & Mental Model\n"
            f"- **What it solves**: **{topic[:40]}** provides a clean, maintainable abstraction to solve recurring architectural and algorithmic problems.\n"
            "- **Key Trade-off**: Always balance abstraction complexity with operational readability—prefer explicit, readable code over premature optimization.\n"
            f"- **Production Hygiene**: Enforce defensive boundaries, strict type safety, and clear contracts in **{pref_lang}**.\n\n"
            "#### 2. Practical Idiomatic Pattern\n"
            "```python\n"
            f"# Clean, idiomatic pattern for {topic[:30]}\n"
            "def execute_task(payload: dict) -> dict:\n"
            '    """Validate input data and process safely with clear error bounds."""\n'
            "    if not payload:\n"
            '        raise ValueError("Payload cannot be empty")\n'
            '    return {"status": "ok", "result": payload}\n'
            "```\n\n"
            "#### 3. Recommended Next Actions\n"
            "- Try implementing a test case verifying boundary inputs for this pattern.\n"
            "- Explore the relevant milestone in your Technea curriculum or ask me for a hands-on coding challenge!"
        )

    def _generate_casual_response(self, prompt: str, seed: Any = None) -> str:
        """Handle casual chit-chat, gratitude, and acknowledgments warmly without unsolicited resources."""
        p = prompt.lower()
        clean_p = re.sub(r"[^\w\s]", "", p).strip()
        if any(w in clean_p for w in ["thank", "thx", "appreciate"]):
            return "You're welcome! Let me know if you need any help while coding."
        elif any(w in clean_p for w in ["bye", "goodbye", "see you", "later"]):
            return (
                "Catch you later! Keep your coding streak going, and feel free to reach out whenever you're back in the editor."
            )
        else:
            return (
                "Glad to help! Let me know where you'd like to focus next—whether exploring a roadmap, choosing a project, or working through code."
            )

    def _generate_simple_question_response(self, prompt: str, seed: Any = None) -> str:
        """Provide concise, 2-3 sentence answers explaining technical concepts cleanly and directly."""
        p = prompt.strip().lower()
        clean_p = re.sub(r"[^\w\s]", "", p).strip()

        if any(w in clean_p for w in ["api", "apis"]):
            return (
                "An API (Application Programming Interface) is a standardized set of rules and protocols that allows different software applications to communicate and exchange data with each other. "
                "It defines the types of requests that can be made, how to make them, and the data formats expected in return. "
                "In web and cloud engineering, REST and GraphQL APIs enable client interfaces to fetch and update data reliably across distributed backend services."
            )
        elif "python" in clean_p:
            return (
                "Python is a high-level, interpreted programming language known for its clear, readable syntax and versatile ecosystem. "
                "It emphasizes developer productivity and code readability, making it ideal for beginners while powerful enough for complex enterprise systems. "
                "Python is widely used across backend web engineering, artificial intelligence, data analytics, and automation."
            )
        elif "react" in clean_p:
            return (
                "React is an open-source JavaScript library developed by Meta for building dynamic, component-based user interfaces. "
                "It utilizes a declarative programming model and an in-memory Virtual DOM to efficiently update and render the right components when application state changes. "
                "React powers modern single-page applications and interactive web experiences."
            )
        elif "docker" in clean_p:
            return (
                "Docker is an open-source platform that enables developers to build, package, and execute applications inside lightweight, isolated containers. "
                "Containers bundle the application code together with all its dependencies and system libraries, ensuring consistent behavior across development, staging, and production environments. "
                "It forms the cornerstone of modern containerization, microservice architectures, and CI/CD pipelines."
            )
        elif "variable" in clean_p:
            return (
                "A variable is a symbolic name bound to a specific memory location used to store and manipulate data in a program. "
                "It allows developers to reference, update, and pass dynamic values throughout application execution using meaningful identifiers. "
                "Variables are defined with specific data types—such as integers, strings, or booleans—that determine the operations that can be performed on them."
            )
        elif "sql" in clean_p:
            return (
                "SQL (Structured Query Language) is the standard programming language designed for managing and querying data in relational database management systems. "
                "It allows developers to create schemas, insert, update, and delete records, and perform complex queries using joins and aggregations. "
                "Databases like PostgreSQL, MySQL, and SQLite all use SQL as their primary interface."
            )
        elif "git" in clean_p:
            return (
                "Git is a distributed version control system that tracks modifications in source code files over time. "
                "It enables teams of developers to collaborate seamlessly through branching, merging, and cryptographic commit history without overwriting each other's work. "
                "Git is the industry standard for code versioning and collaborative software engineering."
            )
        elif "kubernetes" in clean_p or "k8s" in clean_p:
            return (
                "Kubernetes is an open-source orchestration system that automates the deployment, scaling, and management of containerized applications across compute clusters. "
                "It groups application containers into logical units called pods and provides automated failover, load balancing, and rolling zero-downtime updates. "
                "It is the industry standard for operating production microservices at cloud scale."
            )
        elif "html" in clean_p:
            return (
                "HTML (HyperText Markup Language) is the standard markup language used to structure content on the web. "
                "It uses semantic tags to define elements like headings, paragraphs, navigation menus, links, and forms. "
                "HTML establishes the foundational document hierarchy that CSS styles and JavaScript makes interactive."
            )
        elif "css" in clean_p:
            return (
                "CSS (Cascading Style Sheets) is a stylesheet language used to specify the visual presentation and layout of HTML documents. "
                "It controls colors, typography, responsive grid and flexbox layouts, and animations across varying screen dimensions. "
                "CSS separates content from styling, making modern web interfaces adaptable, accessible, and maintainable."
            )
        else:
            topic = re.sub(r"^(what\s+is\s+an?|what\s+is|what\s+are|define)\s+", "", clean_p).strip()
            topic_title = topic.title() if topic else "This concept"
            return (
                f"**{topic_title}** is a core concept in software engineering and computer science. "
                "It provides a structured way to solve specific programming challenges, organize application logic, or facilitate system communication. "
                "Mastering its fundamental principles is key to building maintainable and scalable software."
            )

    def _generate_react_hooks_response(self, seed: Any = None) -> str:
        """Provide Concept, Explanation, Working code example, and concise key takeaways for React hooks."""
        return (
            "### React Hooks: State and Lifecycle in Functional Components\n\n"
            "#### 1. Concept: State and Lifecycle in Functional Components\n"
            "React Hooks are specialized functions that allow functional components to manage local state and hook into React lifecycle events without writing class components. "
            "They simplify component hierarchy, eliminate complex `this` binding, and enable the reuse of stateful logic across components.\n\n"
            "#### 2. Core Explanation\n"
            "- **`useState`**: Declares a piece of reactive state inside a functional component. It returns a tuple with the current state value and a state updater function that triggers re-renders upon modification.\n"
            "- **`useEffect`**: Coordinates side effects such as data fetching, event subscriptions, timers, and DOM mutations. It runs after render and can optionally return a cleanup function to prevent memory leaks.\n"
            "- **Custom Hooks**: Reusable JavaScript functions starting with `use` that encapsulate stateful logic by combining built-in hooks, allowing clean separation of business logic from UI rendering.\n\n"
            "#### 3. Working Code Example\n"
            "```jsx\n"
            "import React, { useState, useEffect } from 'react';\n"
            "\n"
            "// Custom hook for managing window resize state\n"
            "function useWindowWidth() {\n"
            "  const [width, setWidth] = useState(window.innerWidth);\n"
            "\n"
            "  useEffect(() => {\n"
            "    const handleResize = () => setWidth(window.innerWidth);\n"
            "    window.addEventListener('resize', handleResize);\n"
            "    return () => window.removeEventListener('resize', handleResize);\n"
            "  }, []); // Empty array ensures listener is registered only on mount\n"
            "\n"
            "  return width;\n"
            "}\n"
            "\n"
            "export function UserProfileCard({ userId }) {\n"
            "  const [userData, setUserData] = useState(null);\n"
            "  const [loading, setLoading] = useState(true);\n"
            "  const width = useWindowWidth();\n"
            "\n"
            "  useEffect(() => {\n"
            "    let active = true;\n"
            "    setLoading(true);\n"
            "    fetch(`/api/users/${userId}`)\n"
            "      .then(res => res.json())\n"
            "      .then(data => {\n"
            "        if (active) {\n"
            "          setUserData(data);\n"
            "          setLoading(false);\n"
            "        }\n"
            "      });\n"
            "    return () => { active = false; };\n"
            "  }, [userId]);\n"
            "\n"
            "  if (loading) return <div>Loading profile...</div>;\n"
            "\n"
            "  return (\n"
            "    <div className='profile-card'>\n"
            "      <h3>{userData?.name}</h3>\n"
            "      <p>Role: {userData?.role}</p>\n"
            "      <small>Viewport: {width}px</small>\n"
            "    </div>\n"
            "  );\n"
            "}\n"
            "```\n\n"
            "#### 4. Concise Key Takeaways\n"
            "- **Rules of Hooks**: Only call hooks at the top level of React function components or custom hooks—never inside loops, conditions, or nested functions.\n"
            "- **Dependency Array Discipline**: Always declare all reactive variables used inside `useEffect` in its dependency array to prevent stale closures and unintended infinite re-renders.\n"
            "- **Logic Extraction**: Use custom hooks to decouple complex data fetching or event subscriptions from UI rendering."
        )

    def _generate_backend_architecture_response(self, seed: Any = None) -> str:
        """Provide deep technical architecture response (API Gateway, FastAPI service, PostgreSQL, Redis cache, Celery worker, async queue, security, deployment diagram)."""
        return (
            "### Production Backend Architecture Blueprint\n\n"
            "Here is a comprehensive, production-grade backend architecture designed for high throughput, data integrity, and horizontal scalability.\n\n"
            "#### 1. Core Architecture & Component Responsibilities\n\n"
            "- **API Gateway (Nginx / Envoy / AWS API Gateway)**:\n"
            "  - Serves as the single public entry point for web and mobile clients over HTTPS/WSS.\n"
            "  - Enforces SSL/TLS termination, centralized rate limiting, DDoS mitigation, and reverse proxy routing.\n\n"
            "- **FastAPI Service (Application & REST Core)**:\n"
            "  - High-performance asynchronous microservice running on Python 3.12+ and Uvicorn workers.\n"
            "  - Enforces strict data contracts via Pydantic v2 schemas and manages dependency-injected database sessions.\n\n"
            "- **PostgreSQL (Primary Relational Database)**:\n"
            "  - ACID-compliant relational persistence for user profiles, relational data, and financial transactions.\n"
            "  - Configured with connection pooling (PgBouncer/asyncpg) and declarative schema migrations via Alembic.\n\n"
            "- **Redis Cache (In-Memory Data Store)**:\n"
            "  - Sub-millisecond distributed cache for query results, user session tokens, and sliding-window rate limiters.\n\n"
            "- **Celery Worker & Async Queue**:\n"
            "  - Asynchronous background worker fleet powered by Celery with Redis or RabbitMQ as the message broker.\n"
            "  - Offloads long-running and I/O-heavy workloads: transactional email dispatch, webhook retries, and report generation.\n\n"
            "- **Security & Defense-in-Depth**:\n"
            "  - Stateless JWT authentication with short-lived access tokens and secure HttpOnly refresh cookies.\n"
            "  - Parameterized ORM queries to eliminate SQL injection, CORS policy validation, and least-privilege DB roles.\n\n"
            "#### 2. System Deployment Diagram\n\n"
            "```text\n"
            "┌────────────────────────────────┐\n"
            "│   Web & Mobile Clients         │\n"
            "└──────────────┬─────────────────┘\n"
            "               │ (HTTPS / WSS)\n"
            "               ▼\n"
            "┌────────────────────────────────┐\n"
            "│   API Gateway (Nginx / Envoy)  │ ── (SSL Termination, Rate Limiting)\n"
            "└──────────────┬─────────────────┘\n"
            "               │ (Private VPC Network)\n"
            "               ▼\n"
            "┌────────────────────────────────┐\n"
            "│   FastAPI Service Layer        │ ◄──────► ┌─────────────────────────┐\n"
            "└───────┬────────────────┬───────┘          │   Redis In-Memory Cache │\n"
            "        │                │                  └─────────────────────────┘\n"
            "        │ (Async SQL)    │ (Enqueue Tasks)\n"
            "        ▼                ▼\n"
            "┌───────────────┐ ┌──────────────────────────────────────────────────┐\n"
            "│  PostgreSQL   │ │  Celery Async Queue (Redis Broker)               │\n"
            "│  Database     │ │  └─► Background Worker Nodes (Email, Reports)   │\n"
            "└───────────────┘ └──────────────────────────────────────────────────┘\n"
            "```\n\n"
            "#### 3. Reliability & Scaling Best Practices\n"
            "- **Stateless Scaling**: Horizontally scale containerized FastAPI instances behind the API Gateway without relying on local server state.\n"
            "- **Async Task Isolation**: Configure dedicated Celery queues with dead-letter queue (DLQ) support to isolate failing tasks without blocking core workloads.\n"
            "- **Observability**: Instrument distributed tracing and export Prometheus metrics to track p99 latency, request throughput, and error rates."
        )

    def _generate_python_learning_roadmap(self, seed: Any = None) -> str:
        """Provide structured learning roadmap response (Foundations -> Data Structures -> Hands-on Projects -> Web/Data -> Production testing)."""
        return (
            "### Learning Roadmap: How to Master Python\n\n"
            "Here is the structured 5-phase engineering roadmap to progress from fundamental syntax to production-ready software development:\n\n"
            "#### 1. Foundations (Weeks 1–3)\n"
            "- **Core Syntax & Primitives**: Variables, dynamic typing, primitive data types (integers, floats, strings, booleans), and operators.\n"
            "- **Control Flow**: Conditionals (`if`/`elif`/`else`), loops (`for`/`while`), and iteration fundamentals.\n"
            "- **Modular Functions**: Defining functions, parameters, return statements, variable scope (`LEGB`), and exception handling with `try`/`except`.\n"
            "- **Milestone**: Build an interactive CLI personal expense tracker with robust input validation.\n\n"
            "#### 2. Data Structures & OOP (Weeks 4–6)\n"
            "- **Built-in Collections**: Lists, dictionaries, tuples, sets, list comprehensions, and generator expressions.\n"
            "- **Object-Oriented Programming**: Classes, instances, inheritance, dunder methods (`__init__`, `__str__`), and encapsulation.\n"
            "- **Pythonic Idioms**: Decorators, context managers (`with` statements), type hints, and PEP 8 guidelines.\n"
            "- **Milestone**: Build a modular, file-based task management engine using OOP and JSON persistence.\n\n"
            "#### 3. Hands-on Projects (Weeks 7–9)\n"
            "- **Applied Problem Solving**: Build functional multi-module command-line tools.\n"
            "- **HTTP & APIs**: Consuming REST APIs with `httpx` or `requests`, parsing JSON, and handling network timeouts gracefully.\n"
            "- **CLI Interfaces**: Building interactive terminal tools with `Typer` or `Click`.\n"
            "- **Milestone Deliverable**: Build an automated GitHub repository analyzer that inspects repositories and outputs summary metrics.\n\n"
            "#### 4. Web & Data Ecosystem (Weeks 10–13)\n"
            "- **Web Track Path**: Modern asynchronous web APIs with FastAPI, Pydantic data validation, and PostgreSQL with SQLAlchemy 2.0.\n"
            "- **Data Track Path**: Data wrangling and numerical analysis with NumPy, Pandas, and exploratory visualization tools.\n"
            "- **Milestone**: Ship an authenticated REST API microservice or automated exploratory data analysis pipeline.\n\n"
            "#### 5. Production & Testing (Weeks 14–16)\n"
            "- **Automated Testing**: Writing comprehensive unit and integration test suites using `pytest`, fixtures, and mocks.\n"
            "- **Packaging & Tooling**: Virtual environments (`uv` / `venv`), dependency locking, linters (`ruff`), and static type checking (`mypy`).\n"
            "- **Deployment & CI/CD**: Packaging with multi-stage `Dockerfile` and configuring GitHub Actions automated CI pipelines.\n"
            "- **Milestone**: Deploy a containerized Python service to production with automated tests running on every pull request."
        )

    def _generate_javascript_learning_roadmap(self, seed: Any = None) -> str:
        """Provide structured JavaScript learning roadmap response:
        (Foundations: Syntax, DOM, Events -> Modern JS: ES6+, Async/Await, Fetch -> Advanced: Closures, Prototypes, Modules -> Frameworks: React/Node).
        """
        return (
            "### Learning Roadmap: How to Master JavaScript\n\n"
            "Here is the comprehensive 4-phase engineering roadmap to progress from fundamental syntax to modern full-stack development:\n\n"
            "#### Phase 1: Foundations (Syntax, DOM, Events)\n"
            "- **Syntax & Language Primitives**: Variables (`const`, `let`), data types (strings, numbers, booleans, objects, arrays), operators, conditionals (`if`/`else`, `switch`), loops (`for`, `while`, `for...of`), and functions.\n"
            "- **DOM Manipulation**: Document Object Model hierarchy, selecting elements (`querySelector`, `querySelectorAll`), dynamic class and attribute manipulation, and inner content updates.\n"
            "- **Events & User Interaction**: Event listeners (`addEventListener`), event propagation (bubbling and capturing), event delegation, and form handling with validation.\n"
            "- **Milestone Project**: Build an interactive, dynamic Task Manager / To-Do application with local storage persistence and real-time DOM updates.\n\n"
            "#### Phase 2: Modern JS (ES6+, Async/Await, Fetch)\n"
            "- **Modern ES6+ Features**: Arrow functions, destructuring, template literals, default parameters, rest/spread operators (`...`), enhanced object literals, and optional chaining (`?.`).\n"
            "- **Asynchronous Architecture**: Promises (`.then()`, `.catch()`, `.finally()`), `Promise.all()`, and clean asynchronous flow using `async`/`await` with `try`/`catch`.\n"
            "- **HTTP & Fetch API**: Consuming RESTful APIs with `fetch()`, HTTP request methods (`GET`, `POST`, `PUT`, `DELETE`), headers, status codes, and parsing JSON payloads.\n"
            "- **Milestone Project**: Build an asynchronous Weather Dashboard or GitHub Developer Explorer fetching live external REST API data with robust loading and error states.\n\n"
            "#### Phase 3: Advanced (Closures, Prototypes, Modules)\n"
            "- **Closures & Scope**: Lexical environment, execution context, call stack, closure mechanics, data privacy, and factory functions.\n"
            "- **Prototypes & OOP**: Prototypal inheritance, prototype chain, `this` keyword binding (`call`, `apply`, `bind`), and ES6 `class` syntax.\n"
            "- **Modules & Architecture**: ES Modules (`import`/`export`), CommonJS, module bundler concepts (Vite, Rollup), and the JavaScript Event Loop (microtasks vs macrotasks).\n"
            "- **Milestone Project**: Build a lightweight, modular State Management library or custom Pub/Sub event bus from scratch without external dependencies.\n\n"
            "#### Phase 4: Frameworks (React/Node)\n"
            "- **Frontend Mastery with React**: Component hierarchy, JSX, reactive state (`useState`, `useReducer`), side effects (`useEffect`), Custom Hooks, and Context API.\n"
            "- **Backend with Node.js & Express**: Node.js runtime fundamentals, building RESTful web services with Express, middleware pipelines, and database connectivity.\n"
            "- **Tooling & Production Engineering**: Package management (`npm`/`pnpm`), modern build pipelines with Vite, static typing with TypeScript, and automated testing with Vitest/Jest.\n"
            "- **Milestone Capstone**: Build and deploy a production Full-Stack Web Application featuring a React client, Node.js/Express API backend, and authenticated database operations."
        )

    def _generate_closures_response(
        self,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Provide a clear, pedagogical breakdown of closures in JavaScript."""
        return (
            "### Demystifying Closures: Mental Model & Practical Implementation\n\n"
            "At its core, a **closure is a function that remembers and retains access to variables from its outer (lexical) scope, even after the outer function has finished executing.**\n\n"
            "#### 1. Intuition & The Lexical Scope Mental Model\n"
            "- In standard function execution, local variables are cleaned up when the function returns.\n"
            "- When an inner function references variables from an enclosing function, the JavaScript engine keeps those variables allocated in a special closure scope on the heap.\n"
            "- The inner function maintains a live reference to that scope, enabling **data encapsulation** and **private state**.\n\n"
            "#### 2. Practical JavaScript Code Example: Private Counter State\n"
            "```javascript\n"
            "function createCounter(initialValue = 0) {\n"
            "    // 'count' is private state encapsulated inside createCounter's lexical scope\n"
            "    let count = initialValue;\n"
            "\n"
            "    return {\n"
            "        increment() {\n"
            "            count += 1;\n"
            "            return count;\n"
            "        },\n"
            "        decrement() {\n"
            "            count -= 1;\n"
            "            return count;\n"
            "        },\n"
            "        getValue() {\n"
            "            return count;\n"
            "        }\n"
            "    };\n"
            "}\n"
            "\n"
            "// Usage Example\n"
            "const counter = createCounter(10);\n"
            "console.log(counter.increment()); // 11\n"
            "console.log(counter.increment()); // 12\n"
            "console.log(counter.getValue());  // 12\n"
            "// console.log(count); // ReferenceError: count is private and inaccessible from outside!\n"
            "```\n\n"
            "#### 3. Common Production Use Cases:\n"
            "1. **Data Privacy & Information Hiding**: Emulating private variables before JavaScript introduced native private class fields (`#privateField`).\n"
            "2. **Function Factories & Currying**: Creating specialized utility functions (e.g., `const multiplyByTwo = createMultiplier(2)`).\n"
            "3. **Event Listeners & Callbacks**: Preserving element or handler state inside asynchronous browser events and timers.\n\n"
            "*Senior Note: Beware of memory leaks—holding unused references inside closures prevents the garbage collector from reclaiming memory!*"
        )

    def _generate_playlist_recommendation_response(
        self,
        prompt: str,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Recommend authentic learning resources and playlists (Technea first, trusted public second)."""
        p = prompt.lower()
        topic = "python"
        if "react" in p or "frontend" in p:
            topic = "react"
        elif any(w in p for w in ["fastapi", "backend", "node", "api"]):
            topic = "backend"
        elif any(w in p for w in ["dsa", "algorithm", "data structure", "leetcode"]):
            topic = "dsa"
        elif any(w in p for w in ["docker", "devops", "kubernetes", "cloud"]):
            topic = "devops"
        elif domain in ["python", "web_development", "cloud_devops", "dsa", "ai_ml"]:
            topic = "python" if domain == "python" else ("react" if domain == "web_development" else ("devops" if domain == "cloud_devops" else "python"))

        wants_hindi = "hindi" in p or (context and "hindi" in str(context.get("preferred_language", "")).lower())
        pref_lang = "Hindi" if wants_hindi else (context.get("preferred_language") if context else "English")

        from app.services.ai.trusted_resources import get_trusted_resources_for_topic
        trusted = get_trusted_resources_for_topic(topic=topic, language=pref_lang)

        matched_courses = (context.get("matched_courses", []) if context else [])

        lines = [
            f"### Curated {topic.title()} Learning Playlists & Trusted Resources",
            f"\nHere are the highest-quality, authentic learning resources and video playlists to master **{topic.title()}**:\n",
        ]

        # Technea resources first
        if matched_courses:
            lines.append("#### 1. Technea Platform Interactive Courses")
            for c in matched_courses[:2]:
                inst = c.get("instructor") or "Technea Instructor"
                dur = c.get("duration") or "Self-paced"
                lines.append(f"- **{c['title']}** ({inst} | {dur})")
                if c.get("description"):
                    lines.append(f"  *{c['description'][:140]}*")
            lines.append("\n#### 2. Trusted Public Video Playlists & Official Docs")
        else:
            lines.append("#### 1. Trusted Public Video Playlists & Official Docs")

        for r in trusted[:6]:
            lines.append(f"- **{r['title']}** — *{r['provider']}* [{r['type']}]")
            lines.append(f"  - **Link/Channel**: `{r['url_or_channel']}`")
            lines.append(f"  - **Focus**: {r['description']}")

        lines.append(
            "\n#### 💡 Actionable Learning Strategy:\n"
            "- **Code Along**: Keep your IDE open and write every line of code by hand rather than passively watching.\n"
            "- **Read Official Docs**: Cross-reference video explanations with the authoritative documentation for deeper understanding.\n"
            "- **Build Mini-Projects**: Reinforce each milestone by building small, tangible applications immediately after completing tutorial sections."
        )

        return "\n".join(lines)

    def _generate_time_date_response(
        self,
        prompt: str,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Generate accurate, non-hallucinated response for current date, weekday, year, or time queries."""
        now = datetime.now().astimezone()
        weekday = (context and context.get("current_weekday")) or now.strftime("%A")
        date_str = (context and context.get("current_date")) or now.strftime("%B %d, %Y")
        year_str = (context and context.get("current_year")) or now.strftime("%Y")
        time_str = now.strftime("%I:%M %p").lstrip("0")
        tz_name = (context and context.get("current_timezone")) or now.tzname() or "UTC"

        p = prompt.strip().lower()
        clean_p = re.sub(r"[^\w\s]", "", p).strip()

        # Day of week queries
        if (
            clean_p in {"what day is today", "whats the day today", "what is the day today", "which day is today", "what day of the week", "what day is it", "what is today", "day today", "whats the day", "what is the day", "what's the day", "what day", "which day"}
            or any(pat in clean_p for pat in ["what day is today", "whats the day today", "what is the day today", "which day is today", "what day of the week", "what day is it", "day today", "whats the day", "what is the day", "what day", "which day"])
            or ("day" in clean_p and "today" in clean_p)
        ):
            return f"Today is {weekday}."

        # Time queries
        if (
            clean_p in {"time", "current time", "what time is it", "whats the time", "what is the time", "server time", "current server time", "time right now"}
            or any(pat in clean_p for pat in ["what time is it", "whats the time", "what is the time", "current time", "what time is it right now", "time right now", "server time", "what time"])
        ):
            return f"The current server time is {time_str} {tz_name}."

        # Date queries
        if (
            clean_p in {"date", "todays date", "today date", "what is todays date", "whats todays date", "current date", "what is the date", "whats the date", "what date is it", "what date is today", "what date", "date today"}
            or any(pat in clean_p for pat in ["what is todays date", "whats todays date", "today date", "current date", "what is the date", "whats the date", "what date is it", "what date is today", "what date", "date today"])
        ):
            return f"Today is {weekday}, {date_str}."

        # Year queries
        if clean_p in {"what year is this", "what year is it", "current year", "what year"} or any(pat in clean_p for pat in ["what year is this", "what year is it", "current year", "what year"]):
            return f"The current year is {year_str}."

        return f"Today is {weekday}, {date_str}, and the current server time is {time_str} {tz_name}."

    def _generate_code_review_response(self, seed: Any = None) -> str:
        """Generate senior developer code review guidance."""
        return (
            "### Senior Code Review Guidance\n\n"
            "I would be glad to review your code! Please share your code snippet or function below.\n\n"
            "**To provide the most thorough review, I will evaluate:**\n"
            "1. **Correctness & Edge Cases**: Logical flow, boundary handling, and null/empty checks.\n"
            "2. **Time & Space Complexity**: Big-O analysis and identifying unnecessary loops or allocations.\n"
            "3. **Clean Architecture & Readability**: Descriptive naming, single responsibility principle, and PEP 8 / idiomatic patterns.\n"
            "4. **Security & Defensive Design**: Input validation, safe error handling, and resource leak prevention.\n"
            "5. **Testability**: How to write clean unit tests with `pytest` or your framework.\n\n"
            "Paste your code snippet whenever you're ready, and feel free to mention what it does or any specific concerns!"
        )

    def _generate_resource_search_response(
        self,
        prompt: str,
        domain: str = "web_development",
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str:
        """Provide direct, curated learning resources, playlists, and documentation (Technea first, trusted public second)."""
        p = prompt.strip().lower()

        # Identify target topic
        topic = "python"
        if "react" in p or "frontend" in p:
            topic = "react"
        elif any(w in p for w in ["fastapi", "backend", "node", "api"]):
            topic = "backend"
        elif any(w in p for w in ["dsa", "algorithm", "data structure", "leetcode", "neetcode"]):
            topic = "dsa"
        elif any(w in p for w in ["docker", "devops", "kubernetes", "cloud"]):
            topic = "devops"
        elif "python" in p or domain == "python":
            topic = "python"
        else:
            topic = domain if domain in ["python", "react", "backend", "dsa", "devops"] else "python"

        wants_hindi = "hindi" in p or (context and "hindi" in str(context.get("preferred_language", "")).lower())
        pref_lang = "Hindi" if wants_hindi else (context.get("preferred_language") if context else "English")

        from app.services.ai.trusted_resources import get_trusted_resources_for_topic
        trusted = get_trusted_resources_for_topic(topic=topic, language=pref_lang)

        matched_courses = (context.get("matched_courses", []) if context else [])

        display_topic = "FastAPI & Backend" if "fastapi" in p else topic.title()

        lines = [
            f"### 📚 Recommended Learning Resources & Playlists: {display_topic}\n",
            f"Here are the highest-quality authentic learning resources and structured playlists to master **{display_topic}**:\n",
        ]

        # 1. Technea Resources First
        if matched_courses:
            lines.append("#### 1. Technea Platform Interactive Courses")
            for c in matched_courses[:2]:
                inst = c.get("instructor") or "Technea Instructor"
                dur = c.get("duration") or "Self-paced"
                lines.append(f"- **{c['title']}** ({inst} | {dur})")
                if c.get("description"):
                    lines.append(f"  *{c['description'][:140]}*")
            lines.append("\n#### 2. Trusted Public Video Playlists & Official Docs")
        else:
            lines.append("#### 1. Trusted Public Video Playlists & Official Docs")

        # 2. Trusted Public Resources Second
        for r in trusted:
            lines.append(f"- **{r['title']}** — *{r['provider']}* [{r['type']}]:")
            lines.append(f"  - **Link / Channel**: `{r['url_or_channel']}`")
            lines.append(f"  - **Focus**: {r['description']}")

        lines.append(
            "\n*Mentor Tip: Combine structured video tutorials with active coding—keep your IDE open, code along with every lesson, and build small projects immediately after.*"
        )
        return "\n".join(lines)

    def _generate_quiz_response(
        self,
        domain: str,
        level: str,
        context: dict[str, Any] | None = None,
        prompt: str = "",
        seed: int | None = None,
    ) -> str:
        """Synthesize scenario-based milestone quiz using QuizEngine."""
        milestone = None
        p = prompt.strip().lower()
        if "oop" in p or "object" in p or "pattern" in p or "solid" in p:
            milestone = "Object-Oriented Design Patterns"
        elif "sql" in p or "database" in p or "query" in p or "relational" in p:
            milestone = "SQL & Relational Database Mastery"
        elif "api" in p or "rest" in p or "fastapi" in p:
            milestone = "Full-Stack API Design"
        elif "docker" in p or "kubernetes" in p or "devops" in p or "cloud" in p:
            milestone = "Container Orchestration with Docker & Kubernetes"

        quiz = quiz_engine.generate_quiz(
            milestone=milestone,
            level=level,
            context=context,
            seed=seed,
        )
        return quiz.to_markdown()

    async def generate_chat_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        conversation_history: list[dict[str, Any]] | None = None,
        context: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> str:
        """Synthesize a high-quality mentor response adhering strictly to Technea AI personality."""
        ctx = context if context is not None else {}

        # 1. Multi-turn conversation memory analysis & ellipsis resolution
        memory_state = self.memory_engine.analyze(conversation_history, prompt, ctx)
        effective_prompt = memory_state.resolved_message or prompt
        p = effective_prompt.strip().lower()
        clean_p = re.sub(r"[^\w\s]", "", p).strip()

        intent = (
            memory_state.resolved_intent
            or ctx.get("classified_intent")
            or classify_intent(effective_prompt)
        )
        ctx["classified_intent"] = intent
        if "active_topic" in memory_state.context_updates and not ctx.get("active_topic"):
            ctx["active_topic"] = memory_state.context_updates["active_topic"]
        if memory_state.user_corrections:
            ctx.setdefault("user_corrections", {}).update(memory_state.user_corrections)
            if "preferred_language" in memory_state.user_corrections and not ctx.get("preferred_language"):
                ctx["preferred_language"] = memory_state.user_corrections["preferred_language"]
            if "level" in memory_state.user_corrections and not ctx.get("level"):
                ctx["level"] = memory_state.user_corrections["level"]
            if "framework" in memory_state.user_corrections and not ctx.get("framework"):
                ctx["framework"] = memory_state.user_corrections["framework"]

        domain = self._detect_domain(p, ctx)
        level = self._detect_level(p, ctx)
        seed = kwargs.get("seed")
        if seed is not None:
            ctx["seed"] = seed

        # Zero-Token Fast Path via Special Router
        if seed is not None and "seed" not in ctx:
            ctx["seed"] = seed
        if self.special_router.can_handle(intent, effective_prompt, ctx):
            fast_res = await self.special_router.route(intent, effective_prompt, ctx, seed=seed)
            if fast_res is not None:
                return fast_res

        # 1. Conversational directives (e.g. "hey dont say anything just say hey back", "just say hey back", "say hey")
        is_directive = (
            any(clean_p == d for d in ["say hey", "say hey back", "just say hey back", "just say hey", "say hi", "say hi back", "just say hi back", "just say hi", "say hello", "say hello back"])
            or ("dont say anything" in clean_p and any(w in clean_p for w in ["hey", "hi", "hello"]))
            or ("just say" in clean_p and any(w in clean_p for w in ["hey", "hi", "hello"]))
        )
        if is_directive:
            if "back" in clean_p:
                return "Hey back! 👋"
            return "Hey! 👋"

        # 2. Short greetings (e.g. "hey", "hi", "yo")
        is_short_hey = clean_p in {"hey", "hi", "yo", "hey there", "yo hey", "heyy", "heyyy", "hi there"}
        if is_short_hey:
            if user_name:
                return f"Hey {user_name}! 👋"
            return "Hey 👋"

        # 3. Time-of-day greetings
        if clean_p in {"good morning", "goodmorning"}:
            return "Good morning! 👋 Hope you have a great day."
        if clean_p in {"good afternoon"}:
            return "Good afternoon! 👋 Hope you have a great day."
        if clean_p in {"good evening"}:
            return "Good evening! 👋 Hope you have a great day."

        # 4. Gratitude
        is_thanks = (
            any(clean_p == t for t in ["thanks", "thank you", "thx", "thank you very much", "many thanks"])
            or clean_p.startswith("thanks")
            or clean_p.startswith("thank you")
        )
        if is_thanks:
            return "You're welcome! Let me know if you need any help while coding."

        # Intent classification
        intent = context.get("classified_intent") if context else None
        if not intent:
            intent = classify_intent(prompt)

        # Time & Date queries (Category: Time/Date questions)
        is_time_date = intent == INTENT_TIME_DATE or any(
            pat in clean_p
            for pat in [
                "what day is today",
                "whats the day today",
                "what day is it",
                "which day is today",
                "what day of the week",
                "what time is it",
                "whats the time",
                "current time",
                "what is todays date",
                "whats todays date",
                "current date",
                "what year is it",
                "what year is this",
            ]
        )
        if is_time_date:
            return self._generate_time_date_response(prompt, context=context, seed=seed)

        # Code review inquiries
        is_code_review = any(
            pat in clean_p
            for pat in [
                "review my code",
                "code review",
                "can you review my code",
                "review code",
                "audit my code",
                "check my code",
            ]
        )
        if is_code_review:
            return self._generate_code_review_response(seed=seed)

        # 5. Simple Questions handling (INTENT_SIMPLE_QUESTION)
        is_simple_q = intent == INTENT_SIMPLE_QUESTION or (
            re.match(r"^(what\s+is\s+an?|what\s+is|what\s+are|define)\s+[a-z0-9_\-\.\s]+$", clean_p)
            and not any(pat in p for pat in ["what is my next", "what is next", "what is today", "what is this week", "what is my roadmap", "what should i", "what to do", "what project", "what are the prerequisites", "what are my"])
        )
        if is_simple_q:
            return self._generate_simple_question_response(prompt, seed=seed)

        # 6. Specific technical queries
        has_react_hooks = ("react" in p and "hook" in p) or "react hooks" in p
        has_backend_arch = any(phrase in p for phrase in ["backend architecture", "build me a backend architecture", "software architecture", "system architecture", "microservice architecture"]) or intent == INTENT_CODING_ARCHITECTURE
        has_python_learning = ("how do i learn python" in p or "how to learn python" in p or "how can i learn python" in p or (("learn python" in p or "learning python" in p) and any(w in p for w in ["how", "start", "guide", "roadmap", "where"])))
        has_javascript_learning = (
            "how do i learn javascript" in p
            or "how to learn javascript" in p
            or "how can i learn javascript" in p
            or "how do i learn js" in p
            or "how to learn js" in p
            or "how can i learn js" in p
            or "learn javascript" in p
            or "learning javascript" in p
            or "learn js" in p
            or "learning js" in p
            or "javascript roadmap" in p
            or "js roadmap" in p
            or (("javascript" in p or "js" in p.split()) and any(w in p for w in ["how", "start", "guide", "roadmap", "where", "master", "curriculum", "study", "learn", "learning"]))
        )
        has_closures = any(phrase in p for phrase in ["closure", "closures", "explain closures", "what is a closure", "how do closures work"])
        has_sql_quiz = ("sql" in p or "database" in p or "query" in p) and ("quiz" in p or "test" in p or intent in {INTENT_QUIZ, INTENT_REVISION})
        has_go_roadmap = (re.search(r"\b(?:go|golang)\b", p) is not None) and any(w in p for w in ["roadmap", "curriculum", "learn", "how to", "guide"])
        has_rust_roadmap = "rust" in p and any(w in p for w in ["roadmap", "curriculum", "learn", "how to", "guide"])

        has_recursion = any(w in p for w in ["recursion", "recursive"])
        has_async = any(w in p for w in ["async", "asyncio", "await", "concurrency"])
        has_debugging = any(w in p for w in ["error", "bug", "traceback", "exception", "failed", "fix", "why is this", "broken", "debugging"])

        # Check for milestone deep dive inquiry
        has_milestone_deep_dive = any(phrase in p for phrase in [
            "what should i focus on for my next milestone",
            "what should i focus on in my next milestone",
            "what to focus on for my next milestone",
            "focus on for my next milestone",
            "milestone deep dive",
            "tell me about my next milestone",
            "what should i focus on next milestone",
        ])

        # Check for completed prerequisite (e.g. HTML/CSS)
        has_html_css_completed = ("html" in p and "css" in p) and any(w in p for w in ["completed", "finished", "done"])

        has_playlist_request = any(phrase in p for phrase in [
            "playlist", "playlists", "video tutorials", "video tutorial",
            "video series", "youtube series", "video course", "videos to learn",
            "youtube playlist", "courses to watch", "recommend playlist", "recommend a playlist",
        ])

        # Intent-driven dispatch
        if intent == INTENT_RESOURCE_SEARCH or has_playlist_request:
            res = self._generate_resource_search_response(prompt, domain=domain, context=context, seed=seed)
        elif has_sql_quiz:
            res = self._generate_quiz_response(domain="data", level=level, context=ctx, prompt=effective_prompt, seed=seed)
        elif intent == INTENT_QUIZ:
            res = self._generate_quiz_response(domain, level, context=context, prompt=prompt, seed=seed)
        elif has_closures:
            res = self._generate_closures_response(context=ctx, seed=seed)
        elif has_react_hooks:
            res = self._generate_react_hooks_response(seed=seed)
        elif has_backend_arch:
            res = self._generate_backend_architecture_response(seed=seed)
        elif has_python_learning:
            res = self._generate_python_learning_roadmap(seed=seed)
        elif has_javascript_learning:
            res = self._generate_javascript_learning_roadmap(seed=seed)
        elif has_go_roadmap:
            res = self._generate_roadmap_response(domain="go", level=level, topic="go", seed=seed)
        elif has_rust_roadmap:
            res = self._generate_roadmap_response(domain="rust", level=level, topic="rust", seed=seed)
        elif has_recursion or has_async:
            res = self._generate_coding_response(prompt, domain, level, seed=seed)
        elif has_debugging or str(intent) == "debugging":
            res = self._generate_debugging_response(prompt, seed=seed)
        elif has_milestone_deep_dive:
            res = self._generate_milestone_deep_dive_response(prompt, domain, level, context=context, seed=seed)
        elif has_html_css_completed or intent == INTENT_NEXT_STEP:
            res = self._generate_next_step_response(domain, level, prompt=prompt, context=context, seed=seed)
        elif intent == INTENT_GREETING or "hello" in clean_p:
            res = self._generate_greeting_response(user_name, level, seed=seed)
            return res  # Return short greeting directly without appending catalog block!
        elif intent == INTENT_CASUAL:
            res = self._generate_casual_response(prompt, seed=seed)
            return res  # Return casual response directly without appending catalog block!
        elif intent == INTENT_DAILY_GOAL:
            res = self._generate_daily_goal_response(domain, level, context=context, seed=seed)
        elif intent == INTENT_WEEKLY_PLAN:
            res = self._generate_weekly_plan_response(domain, level, context=context, seed=seed)
        elif intent == INTENT_REVISION:
            res = self._generate_revision_response(domain, level, context=context, seed=seed)
        elif intent == INTENT_INTERVIEW_PREP:
            res = self._generate_interview_prep_response(domain, level, context=context, seed=seed)
        elif intent in {INTENT_CODE_HELP, INTENT_CODING_HELP, INTENT_CODE_REVIEW}:
            res = self._generate_coding_response(prompt, domain, level, seed=seed)
        elif intent in {INTENT_PROJECT_SUGGESTION, INTENT_PROJECT_RECOMMENDATION}:
            res = self._generate_project_response(domain, level, context=ctx, seed=seed)
        elif intent in {INTENT_ROADMAP_REQUEST, INTENT_ROADMAP_PLANNING}:
            if "javascript" in p or "js" in p:
                res = self._generate_javascript_learning_roadmap(seed=seed)
            else:
                res = self._generate_roadmap_response(domain, level, topic=p, seed=seed)
        elif intent in {INTENT_CAREER_ADVICE, INTENT_CAREER_GUIDANCE}:
            res = self._generate_career_response(level, domain, seed=seed)
        elif intent == INTENT_LEARNING_ADVICE:
            if any(w in p for w in ["next", "start", "begin", "where do i", "what should i"]):
                res = self._generate_next_step_response(domain, level, prompt=prompt, context=ctx, seed=seed)
            elif "javascript" in p or "js" in p:
                res = self._generate_javascript_learning_roadmap(seed=seed)
            elif "python" in p:
                res = self._generate_python_learning_roadmap(seed=seed)
            else:
                res = self._generate_conceptual_response(prompt, domain, level, context=ctx, seed=seed)
        else:
            res = self._generate_conceptual_response(prompt, domain, level, context=ctx, seed=seed)

        # Detect repeated question in conversation history and avoid identical repeating
        if (
            conversation_history
            and intent not in {INTENT_TIME_DATE, INTENT_GREETING, INTENT_CASUAL, INTENT_SIMPLE_QUESTION}
            and not is_time_date
            and not is_code_review
        ):
            prior_user_msgs = [
                m.get("content", "").strip().lower()
                for m in conversation_history
                if isinstance(m, dict) and m.get("role") == "user"
            ]
            if prior_user_msgs:
                last_user_msg = prior_user_msgs[-1]
                if p == last_user_msg or (
                    any(w in p for w in ["what next", "what should i do next"])
                    and any(w in last_user_msg for w in ["what next", "what should i do next"])
                ):
                    res = (
                        "Building directly upon our previous action plan, let's advance your implementation:\n\n"
                        f"{res}"
                    )

        # Resource visibility rules: show catalog resources for structured learning intents
        allow_catalog_resources = (
            intent in {
                INTENT_ROADMAP_REQUEST,
                INTENT_ROADMAP_PLANNING,
                INTENT_NEXT_STEP,
                INTENT_PROJECT_SUGGESTION,
                INTENT_PROJECT_RECOMMENDATION,
                INTENT_LEARNING_ADVICE,
                INTENT_DAILY_GOAL,
                INTENT_WEEKLY_PLAN,
                INTENT_REVISION,
                INTENT_INTERVIEW_PREP,
                INTENT_CODING_ARCHITECTURE,
                INTENT_RESOURCE_SEARCH,
            }
            and intent not in {INTENT_CASUAL, INTENT_GREETING, INTENT_SIMPLE_QUESTION, INTENT_TIME_DATE, INTENT_QUIZ}
            and not (
                is_directive
                or is_short_hey
                or is_thanks
                or is_time_date
                or is_code_review
                or has_react_hooks
                or has_recursion
                or has_async
                or has_debugging
            )
        )
        if context and allow_catalog_resources:
            cat_block = self._build_catalog_references_block(context)
            if cat_block and cat_block not in res:
                res = f"{res}{cat_block}"

        return res

    def _build_catalog_references_block(self, context: dict[str, Any] | None) -> str:
        """Synthesize concrete references to real Technea catalog items and active roadmaps."""
        if not context:
            return ""

        paths = context.get("matched_paths", [])
        projects = context.get("matched_projects", [])
        skills = context.get("matched_skills", [])
        user_progress = context.get("user_progress", {}) or {}
        active_roadmaps = user_progress.get("active_roadmaps", []) if isinstance(user_progress, dict) else []

        lines: list[str] = []

        # If user has an active roadmap, surface it prominently
        if active_roadmaps:
            ar = active_roadmaps[0]
            lines.append(
                f"**Active Progress**: Continuing your path in **{ar['title']}** "
                f"(Milestone {ar.get('current_step', 1)}/{ar.get('total_steps', 1)}, Goal: *{ar.get('goal', '')}*)."
            )

        cat_items: list[str] = []
        if paths:
            lp = paths[0]
            step_info = f", {lp['step_count']} sequential milestones" if lp.get("step_count") else ""
            cat_items.append(
                f"**Technea Learning Path**: **{lp['title']}** "
                f"({lp.get('estimated_hours', 'Curated Roadmap')}{step_info})"
            )
        if projects:
            p = projects[0]
            stack = ", ".join(p.get("tech_stack", [])[:3]) if p.get("tech_stack") else "Modern Stack"
            cat_items.append(
                f"**Hands-on Project**: **{p['title']}** ({p.get('difficulty', 'Intermediate')}) "
                f"— Tech Stack: {stack}"
            )
        if skills:
            s = skills[0]
            cat_items.append(
                f"**Technea Skill Track**: **{s['name']}** ({s.get('category', 'Engineering')})"
            )

        if cat_items:
            lines.append("### Recommended Technea Resources:")
            lines.extend([f"- {item}" for item in cat_items])

        if lines:
            return "\n\n" + "\n".join(lines)
        return ""



class AIService:
    """Orchestrates AI interactions across providers with automatic resilience."""

    def __init__(
        self,
        primary_provider: BaseAIProvider | None = None,
        fallback_provider: BaseAIProvider | None = None,
        special_router_inst: SpecialRouter | None = None,
        memory_engine_inst: MemoryEngine | None = None,
    ) -> None:
        """Initialize AIService with primary, fallback, and zero-token special router.

        Defaults to GeminiProvider as primary and RuleBasedProvider as fallback.
        """
        self.fallback_provider: BaseAIProvider = fallback_provider or RuleBasedProvider()
        self.primary_provider: BaseAIProvider = primary_provider or GeminiProvider()
        self.special_router: SpecialRouter = special_router_inst or special_router
        self.memory_engine: MemoryEngine = memory_engine_inst or memory_engine
        self.last_provider_used: str = (
            self.primary_provider.provider_name
            if self.primary_provider.is_configured
            else self.fallback_provider.provider_name
        )

        logger.info(
            "AIService initialized. Primary: %s (configured=%s), Fallback: %s",
            self.primary_provider.provider_name,
            self.primary_provider.is_configured,
            self.fallback_provider.provider_name,
        )

    @property
    def is_gemini_active(self) -> bool:
        """Check whether the primary Gemini provider is configured."""
        return self.primary_provider.is_configured

    async def generate_response(
        self,
        prompt: str,
        conversation_history: list[dict[str, Any]] | None = None,
        context: dict[str, Any] | None = None,
        system_instruction: str | None = None,
        persona: str | None = "mentor",
        **kwargs: Any,
    ) -> str:
        """Generate an AI response, guaranteeing a valid, high-quality answer.

        First attempts to generate using the primary provider (Gemini).
        If the primary provider is unconfigured, or encounters any error
        (network, auth, rate limit, timeout), it seamlessly falls back to
        the RuleBasedProvider.

        Args:
            prompt: User message or question.
            conversation_history: Prior conversation turns.
            context: Session contextual data (user level, current track, etc.).
            system_instruction: Optional system instruction override.
            persona: Persona identifier ("mentor", "architect", "debugger").
            **kwargs: Generation configuration parameters.

        Returns:
            The generated response string.
        """
        if not prompt or not prompt.strip():
            return "Please provide a question or topic so I can assist you on your learning journey!"

        ctx = context if context is not None else {}

        # 1. Multi-turn conversation memory analysis & ellipsis resolution
        memory_state = self.memory_engine.analyze(conversation_history, prompt, ctx)
        effective_prompt = memory_state.resolved_message or prompt
        effective_intent = (
            memory_state.resolved_intent
            or ctx.get("classified_intent")
            or classify_intent(effective_prompt)
        )
        ctx["classified_intent"] = effective_intent
        if "active_topic" in memory_state.context_updates and not ctx.get("active_topic"):
            ctx["active_topic"] = memory_state.context_updates["active_topic"]
        if memory_state.user_corrections:
            ctx.setdefault("user_corrections", {}).update(memory_state.user_corrections)
            if "preferred_language" in memory_state.user_corrections and not ctx.get("preferred_language"):
                ctx["preferred_language"] = memory_state.user_corrections["preferred_language"]
            if "level" in memory_state.user_corrections and not ctx.get("level"):
                ctx["level"] = memory_state.user_corrections["level"]
            if "framework" in memory_state.user_corrections and not ctx.get("framework"):
                ctx["framework"] = memory_state.user_corrections["framework"]

        # 2. Zero-Token Fast Path via Special Router (<5ms response time, 0 LLM tokens)
        seed = kwargs.get("seed")
        if seed is not None and "seed" not in ctx:
            ctx["seed"] = seed
        if self.special_router.can_handle(effective_intent, effective_prompt, ctx):
            fast_response = await self.special_router.route(effective_intent, effective_prompt, ctx, seed=seed)
            if fast_response is not None:
                self.last_provider_used = "special_router"
                return fast_response

        # Rebuild Prompt Construction: Every request must build a NEW prompt (NO caching)
        learner_level = (ctx.get("level") or ctx.get("learner_level")) if ctx else None
        domain = (ctx.get("domain") or ctx.get("active_topic")) if ctx else None
        user_name = ctx.get("user_name") if ctx else None

        effective_system_prompt = build_system_prompt(
            learner_level=learner_level,
            domain=domain,
            context=ctx,
            persona=persona,
            user_name=user_name,
            custom_instruction=system_instruction if system_instruction else None,
        )

        # Build structured debug logging metadata
        last_assistant_msg = "None"
        if conversation_history:
            for item in reversed(conversation_history):
                if isinstance(item, dict):
                    raw_role = str(item.get("role", "")).lower()
                    if raw_role in ("assistant", "model", "system_reply"):
                        parts = item.get("parts")
                        if parts and isinstance(parts, list) and isinstance(parts[0], dict):
                            last_assistant_msg = str(parts[0].get("text", "")).strip() or "None"
                        else:
                            last_assistant_msg = str(item.get("content") or item.get("text") or "").strip() or "None"
                        break

        current_topic = (
            ctx.get("current_topic")
            or ctx.get("active_topic")
            or ctx.get("topic")
            or ctx.get("domain")
            or ctx.get("classified_intent")
        )
        if not current_topic:
            p_lower = (prompt or "").lower()
            if "javascript" in p_lower or "js" in p_lower.split():
                current_topic = "javascript"
            elif "python" in p_lower:
                current_topic = "python"
            elif "react" in p_lower:
                current_topic = "react"
            else:
                current_topic = "General"

        retrieved_resources_summary = ctx.get("retrieved_resources_summary")
        if not retrieved_resources_summary:
            paths = len(ctx.get("matched_paths") or [])
            projects = len(ctx.get("matched_projects") or [])
            skills = len(ctx.get("matched_skills") or [])
            courses = len(ctx.get("matched_courses") or [])
            total = paths + projects + skills + courses
            if total > 0:
                retrieved_resources_summary = f"{paths} paths, {projects} projects, {skills} skills, {courses} courses"
            elif ctx.get("catalog_context"):
                retrieved_resources_summary = "Catalog context available"
            else:
                retrieved_resources_summary = "None"

        # Structured debug block for visibility across both Gemini and fallback providers
        logger.info(
            "\n--------------------------------\n"
            "Latest User Message: %s\n"
            "Conversation Length: %d\n"
            "Last Assistant Message: %s\n"
            "Prompt Token Count: %d\n"
            "Current Topic: %s\n"
            "Retrieved Resources: %s\n"
            "--------------------------------",
            prompt,
            len(conversation_history or []),
            last_assistant_msg,
            len(prompt.split()),  # approximate or exact
            current_topic,
            retrieved_resources_summary,
        )

        # Attempt primary provider if configured
        if self.primary_provider.is_configured:
            try:
                logger.debug(
                    "Generating AI response using primary provider '%s'",
                    self.primary_provider.provider_name,
                )
                response = await self.primary_provider.generate_chat_response(
                    prompt=effective_prompt.strip(),
                    system_instruction=effective_system_prompt,
                    conversation_history=conversation_history,
                    context=ctx,
                    **kwargs,
                )
                if response and response.strip():
                    self.last_provider_used = self.primary_provider.provider_name
                    return response.strip()

                logger.warning(
                    "Primary provider '%s' returned empty text. Falling back.",
                    self.primary_provider.provider_name,
                )
            except Exception as exc:
                clean_error = sanitize_text(str(exc))
                logger.warning(
                    "Primary AI provider '%s' failed (%s). Gracefully falling back to '%s'.",
                    self.primary_provider.provider_name,
                    clean_error,
                    self.fallback_provider.provider_name,
                )
        else:
            logger.debug(
                "Primary provider '%s' is not configured. Using fallback '%s'.",
                self.primary_provider.provider_name,
                self.fallback_provider.provider_name,
            )

        # Execute fallback provider
        try:
            fallback_response = await self.fallback_provider.generate_chat_response(
                prompt=effective_prompt.strip(),
                system_instruction=effective_system_prompt,
                conversation_history=conversation_history,
                context=ctx,
                **kwargs,
            )
            self.last_provider_used = self.fallback_provider.provider_name
            return fallback_response
        except Exception as fallback_exc:
            clean_fallback_error = sanitize_text(str(fallback_exc))
            logger.error("Fallback provider execution failed: %s", clean_fallback_error)

            self.last_provider_used = "safe_fallback"
            # Absolute safety net: guaranteed friendly mentor reply
            return (
                "### Technea AI Mentor\n\n"
                "I am here to guide your learning path! While connecting to my full knowledge base, "
                "I encourage you to explore your current learning path and milestone roadmaps on the Technea dashboard. "
                "Feel free to ask another question or explore the community learning rooms."
            )

    async def generate_chat_response(
        self,
        prompt: str | None = None,
        system_instruction: str | None = None,
        conversation_history: list[Any] | None = None,
        context: dict[str, Any] | None = None,
        persona: str | None = "mentor",
        message: str | None = None,
        return_metadata: bool = False,
        **kwargs: Any,
    ) -> str | tuple[str, str]:
        """Generate AI chat response with automatic history normalization and provider fallback.

        Accepts either 'prompt' or 'message' for the user input text, and handles
        both dict-like and Pydantic ChatMessage conversation history entries.
        """
        text = prompt if prompt is not None else (message or "")

        # Normalize conversation history if it contains Pydantic models or dicts
        normalized_history: list[dict[str, Any]] | None = None
        if conversation_history:
            normalized_history = []
            for item in conversation_history:
                if hasattr(item, "model_dump"):
                    normalized_history.append(item.model_dump())
                elif hasattr(item, "dict"):
                    normalized_history.append(item.dict())
                elif isinstance(item, dict):
                    normalized_history.append(item)

        resp = await self.generate_response(
            prompt=text,
            conversation_history=normalized_history,
            context=context,
            system_instruction=system_instruction,
            persona=persona,
            **kwargs,
        )

        if return_metadata:
            return resp, self.last_provider_used
        return resp

    async def close(self) -> None:
        """Close resources for all active providers."""
        await self.primary_provider.close()
        await self.fallback_provider.close()

    def get_status(self) -> dict[str, Any]:
        """Return provider status metadata."""
        return {
            "primary_provider": self.primary_provider.provider_name,
            "primary_configured": self.primary_provider.is_configured,
            "gemini_model": getattr(self.primary_provider, "model", None),
            "fallback_provider": self.fallback_provider.provider_name,
            "timeout_seconds": getattr(self.primary_provider, "timeout", None),
        }


# Global singleton instance of AIService
ai_service = AIService()


def get_ai_service() -> AIService:
    """Dependency injection factory for FastAPI endpoints."""
    return ai_service
