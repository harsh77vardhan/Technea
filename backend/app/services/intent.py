"""AI Intent Foundation Service for Technea.

Interprets natural language learning goals, extracts user experience level and domain,
and constructs structured prerequisite progression roadmaps with curated paths and courses.
No paid APIs required.
"""

import re
from typing import Any
from collections.abc import Sequence

from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_path import LearningPath
from app.models.skill import Skill
from app.models.course import Course
from app.schemas.search import (
    DetectedIntent,
    ProgressionStep,
    IntentRecommendationResponse,
    LearningPathResponse,
    CourseResponse,
)

# Domain progression definitions with pedagogical milestones
INTENT_DOMAINS = {
    "web_development": {
        "domain_name": "Web Development",
        "keywords": [
            "website", "websites", "web app", "web development", "web dev",
            "frontend", "full stack", "html", "css", "javascript", "react", "build websites"
        ],
        "default_goal": "Build responsive modern web applications from scratch",
        "beginner_progression": [
            ("HTML5 & Semantic Web", "Semantic document anatomy, accessible forms, and SEO landmark structure", "2 Weeks"),
            ("Modern CSS & Responsive Design", "Flexbox alignment, Grid systems, clamp typography, and mobile-first layouts", "3 Weeks"),
            ("JavaScript", "Dynamic DOM manipulation, event handling, ES6+ logic, and async API calls", "4 Weeks"),
            ("React", "Component architecture, hooks state management, and modern reactive client apps", "4 Weeks"),
            ("Full Stack Development", "Complete production web applications, database persistence, and cloud deployment", "5 Weeks"),
        ],
        "intermediate_progression": [
            ("TypeScript", "Static type safety, interfaces, and scalable application architecture", "3 Weeks"),
            ("React", "Next-gen server components, custom hooks, and state management", "4 Weeks"),
            ("Next.js Full Stack", "App Router, Server Actions, edge rendering, and SEO architecture", "4 Weeks"),
            ("PostgreSQL Administration & Optimization", "Relational schema design, migrations, and query tuning", "4 Weeks"),
            ("Full Stack Development", "Production SaaS capstone platform with Stripe billing and auth", "5 Weeks"),
        ],
    },
    "ai_ml": {
        "domain_name": "AI & Machine Learning",
        "keywords": [
            "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
            "neural network", "llm", "generative ai", "chatgpt", "agents", "nlp"
        ],
        "default_goal": "Master machine learning algorithms, deep neural networks, and generative AI systems",
        "beginner_progression": [
            ("Python", "Core syntax, dynamic data structures, scripting, and modular programming", "4 Weeks"),
            ("Statistics", "Probability distributions, hypothesis testing, and exploratory analysis", "4 Weeks"),
            ("Machine Learning", "Supervised classification, regression, and Scikit-Learn pipelines", "6 Weeks"),
            ("Deep Learning", "Neural network architectures, PyTorch tensors, and backpropagation", "6 Weeks"),
            ("Generative AI", "Large language models, prompt orchestration, and generative capstone apps", "5 Weeks"),
        ],
        "intermediate_progression": [
            ("PyTorch Deep Learning", "Custom nn.Module training, Autograd, and GPU optimization", "5 Weeks"),
            ("Large Language Models", "Transformer architectures, tokenization, and PEFT / LoRA fine-tuning", "5 Weeks"),
            ("Vector Databases & RAG", "Embedding pipelines, hybrid search, and context augmentation", "4 Weeks"),
            ("AI Agents", "Autonomous ReAct loops, tool execution, and multi-agent coordination", "4 Weeks"),
            ("AI Engineering", "Production LLM applications with evaluation and streaming interfaces", "5 Weeks"),
        ],
    },
    "cybersecurity": {
        "domain_name": "Cybersecurity",
        "keywords": [
            "hacking", "hack", "cyber", "security", "cybersecurity", "infosec",
            "ethical hacking", "pentest", "network security", "exploit", "defense"
        ],
        "default_goal": "Defend networks, analyze vulnerabilities, and conduct ethical penetration testing",
        "beginner_progression": [
            ("Cyber Fundamentals", "Threat landscape, social engineering, CIA triad, and defense in depth", "3 Weeks"),
            ("Linux Administration", "Operating system permissions, terminal navigation, and process security", "4 Weeks"),
            ("Network Security", "TCP/IP 3-way handshakes, packet analysis with Wireshark, and firewalls", "4 Weeks"),
            ("Ethical Hacking", "Kali Linux tools, Nmap reconnaissance, scanning, and Metasploit basics", "6 Weeks"),
            ("Web Security & OWASP", "OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF) and remediation", "5 Weeks"),
        ],
        "intermediate_progression": [
            ("Linux Security & Hardening", "System hardening, SELinux, auditd, and kernel security tuning", "4 Weeks"),
            ("Penetration Testing", "Active Directory attack paths, BloodHound, and lateral movement", "6 Weeks"),
            ("Incident Response & SOC Analysis", "SIEM log correlation (Splunk), threat triage, and memory forensics", "5 Weeks"),
            ("Cloud Security & DevSecOps", "IAM least-privilege, automated pipeline security, and container scans", "5 Weeks"),
            ("Malware Analysis & Reverse Engineering", "Ghidra disassembly, behavioral analysis, and evasion dissection", "6 Weeks"),
        ],
    },
    "data": {
        "domain_name": "Data Science & Analytics",
        "keywords": [
            "data", "data science", "data analyst", "analytics", "sql", "power bi",
            "tableau", "business intelligence", "dashboards", "pandas", "data engineer"
        ],
        "default_goal": "Extract actionable business intelligence, query databases, and build predictive models",
        "beginner_progression": [
            ("SQL & Databases", "Relational querying, multi-table joins, aggregations, and subqueries", "4 Weeks"),
            ("Data Analytics", "Spreadsheet modeling, metric definitions, and dashboard storytelling", "4 Weeks"),
            ("Python", "Data wrangling, cleaning missing values, and automation scripting", "4 Weeks"),
            ("Business Intelligence & Power BI", "Star Schema data modeling, DAX measures, and executive reports", "4 Weeks"),
            ("Data Science", "Exploratory data analysis, statistical hypotheses, and predictive modeling", "6 Weeks"),
        ],
        "intermediate_progression": [
            ("Data Engineering", "Automated ETL pipelines, data lake Parquet storage, and Airflow DAGs", "6 Weeks"),
            ("Big Data & Distributed Computing", "PySpark distributed computation, cluster memory, and streaming", "6 Weeks"),
            ("PostgreSQL Administration & Optimization", "Window functions, query execution planning, and indexing", "5 Weeks"),
            ("Data Warehousing & Snowflake", "Dimensional modeling, Snowflake virtual warehouses, and DBT", "5 Weeks"),
            ("Data Science", "Production gradient boosted models (XGBoost) and SHAP interpretability", "6 Weeks"),
        ],
    },
    "cloud_devops": {
        "domain_name": "Cloud & DevOps",
        "keywords": [
            "cloud", "devops", "docker", "kubernetes", "aws", "azure", "ci/cd",
            "linux", "deploy", "server", "infrastructure", "sre"
        ],
        "default_goal": "Automate deployment pipelines, orchestrate containers, and architect scalable cloud infrastructure",
        "beginner_progression": [
            ("Linux Administration", "Command-line power, bash scripts, process signals, and SSH configuration", "4 Weeks"),
            ("Git & GitHub", "Distributed version control, branching strategies, and pull requests", "3 Weeks"),
            ("Cloud Computing", "Cloud service models (IaaS/PaaS/SaaS), virtual machines, and cloud storage", "4 Weeks"),
            ("Docker Containerization", "Dockerfiles, image layering, volume storage, and multi-container Compose", "4 Weeks"),
            ("CI/CD Pipelines & Automation", "Automated build, test, and container deployment with GitHub Actions", "4 Weeks"),
        ],
        "intermediate_progression": [
            ("AWS (Amazon Web Services)", "Solutions architecture, VPC networking, EC2 autoscaling, and IAM", "6 Weeks"),
            ("Kubernetes Orchestration", "Pods, Deployments, Services, Ingress controllers, and Helm charts", "6 Weeks"),
            ("Terraform & Infrastructure as Code", "Declarative cloud provisioning, remote state, and modules", "5 Weeks"),
            ("Observability, Prometheus & Grafana", "Metrics collection, PromQL queries, Grafana boards, and alerting", "4 Weeks"),
            ("Microservices Architecture", "Distributed design patterns, API gateways, and service meshes", "6 Weeks"),
        ],
    },
    "design": {
        "domain_name": "Design",
        "keywords": [
            "design", "ui", "ux", "figma", "product design", "graphic design",
            "designer", "interface", "wireframe", "prototype"
        ],
        "default_goal": "Design beautiful, accessible user interfaces, intuitive UX flows, and design systems",
        "beginner_progression": [
            ("UI Design", "Visual hierarchy, 8pt spacing grids, typography pairing, and color theory", "4 Weeks"),
            ("UX Design", "User personas, empathy maps, journey mapping, and heuristic evaluation", "4 Weeks"),
            ("Figma Design & Auto Layout", "Vector frames, Auto Layout constraints, components, and interactive variants", "4 Weeks"),
            ("Wireframing & Interactive Prototyping", "Rapid UX prototyping, smart animations, and interactive testing", "3 Weeks"),
            ("Product Design", "End-to-end design case studies, design systems, and developer handoff", "6 Weeks"),
        ],
        "intermediate_progression": [
            ("Design Systems & Tokens", "Atomic design tokens, cross-platform export, and component libraries", "5 Weeks"),
            ("User Research & Usability Testing", "Think-aloud testing protocols, SUS usability metrics, and heatmaps", "4 Weeks"),
            ("Mobile App UI/UX", "Touch-first navigation, thumb zones, Apple HIG, and Material Design 3", "5 Weeks"),
            ("Web Design & Visual Aesthetics", "High-converting landing pages, hero composition, and micro-interactions", "4 Weeks"),
            ("Product Design", "Data-informed product design, funnel optimization, and design leadership", "6 Weeks"),
        ],
    },
    "video_editing": {
        "domain_name": "Video Editing",
        "keywords": [
            "video", "video editing", "premiere pro", "davinci", "edit videos",
            "after effects", "youtube", "reels", "tiktok", "color grading", "motion graphics"
        ],
        "default_goal": "Edit cinematic and high-retention video content for YouTube, commercials, and social media",
        "beginner_progression": [
            ("Premiere Pro Video Editing", "Timeline tools, ripple trimming, B-roll layering, and YouTube exports", "4 Weeks"),
            ("Audio Post-Production & Sound Design", "Dialogue noise cleanup, EQ balancing, audio ducking, and SFX", "3 Weeks"),
            ("DaVinci Resolve & Color Grading", "Color wheels, exposure balancing, node setups, and cinematic looks", "4 Weeks"),
            ("Short-Form Video & Viral Editing", "Vertical 9:16 editing, kinetic subtitle animations, and fast jump cuts", "3 Weeks"),
            ("Content Creation & YouTube", "High-CTR packaging, curiosity hooks, retention editing, and storytelling", "5 Weeks"),
        ],
        "intermediate_progression": [
            ("DaVinci Resolve & Color Grading", "Professional Log footage balancing, color space transforms, and qualifiers", "5 Weeks"),
            ("After Effects Animation", "2D keyframing, graph editor curves, layer masking, and track mattes", "5 Weeks"),
            ("Motion Graphics & Visual Effects", "Kinetic typography, animated lower thirds, and MOGRT templates", "5 Weeks"),
            ("Visual Storytelling & Narrative Pacing", "Documentary pacing, match cuts, emotional arcs, and soundscapes", "5 Weeks"),
            ("Creative Direction & Video Workflow", "High-efficiency post-production pipelines, proxies, and team review", "4 Weeks"),
        ],
    },
    "business": {
        "domain_name": "Business & Startups",
        "keywords": [
            "business", "startup", "entrepreneurship", "freelancing", "marketing",
            "product management", "sales", "finance", "venture capital", "founder"
        ],
        "default_goal": "Launch and scale profitable business ventures, lead product strategy, and acquire customers",
        "beginner_progression": [
            ("Entrepreneurship & Lean Startups", "Business Model Canvas, customer discovery interviews, and MVP validation", "5 Weeks"),
            ("Product Management", "Product Requirement Documents (PRDs), user stories, and feature prioritization", "5 Weeks"),
            ("Modern Marketing & Customer Acquisition", "Copywriting, customer personas, email flows, and social channels", "4 Weeks"),
            ("Tech Freelancing & Client Consulting", "Service proposals, value-based pricing, contracts, and client acquisition", "4 Weeks"),
            ("Startup Strategy & Pitching", "Pitch deck creation, market sizing (TAM/SAM/SOM), and investor meetings", "4 Weeks"),
        ],
        "intermediate_progression": [
            ("Growth Marketing & Funnel Optimization", "Pirate Metrics (AARRR), A/B testing hypotheses, and Product-Led Growth", "5 Weeks"),
            ("Financial Modeling & Unit Economics", "3-statement models, CAC, LTV, net burn rate, and runway forecasting", "5 Weeks"),
            ("B2B Sales & High-Stakes Negotiation", "Consultative enterprise selling, MEDDIC qualification, and deal closing", "5 Weeks"),
            ("Business Analytics & Executive KPIs", "North Star metric tracking, executive dashboards, and OKR alignment", "5 Weeks"),
            ("Venture Capital & Fundraising", "Term sheet covenants, cap table dilution, and institutional Series A prep", "5 Weeks"),
        ],
    },
}


class IntentService:
    """Natural language query intent analyzer and curriculum path synthesizer."""

    @staticmethod
    def extract_experience_level(query: str) -> str:
        """Infer learner's starting background level from linguistic cues."""
        q = query.lower()

        # Absolute Beginner indicators
        if any(p in q for p in [
            "never coded", "never programmed", "no coding", "zero coding", "no experience",
            "absolute beginner", "from scratch", "from zero", "complete beginner", "brand new"
        ]):
            return "Absolute Beginner"

        # Beginner indicators
        if any(p in q for p in [
            "beginner", "start", "starting", "basics", "learn to code", "learn programming",
            "intro", "fundamentals", "newbie", "first time"
        ]):
            return "Beginner"

        # Advanced indicators
        if any(p in q for p in [
            "advanced", "production", "enterprise", "architect", "deep dive", "scale",
            "expert", "high throughput", "performance tuning", "masterclass"
        ]):
            return "Advanced"

        # Intermediate indicators
        if any(p in q for p in [
            "know", "experienced", "transition", "switch", "improve", "already", "intermediate", "next level"
        ]):
            return "Intermediate"

        return "Beginner"

    @staticmethod
    def extract_domain(query: str) -> tuple[str, dict[str, Any]]:
        """Identify technical domain and return matching domain configuration."""
        q = query.lower()
        best_domain_key = "web_development"
        max_matches = 0

        for key, config in INTENT_DOMAINS.items():
            matches = sum(1 for kw in config["keywords"] if kw in q)
            if matches > max_matches:
                max_matches = matches
                best_domain_key = key

        # Fallback to programming fundamentals if generic code query
        if max_matches == 0 and any(w in q for w in ["code", "programming", "software", "developer"]):
            return "web_development", INTENT_DOMAINS["web_development"]

        return best_domain_key, INTENT_DOMAINS[best_domain_key]

    @staticmethod
    def extract_goal_summary(query: str, domain_config: dict[str, Any]) -> str:
        """Formulate concise goal text reflecting user's query and target domain."""
        q = query.lower()
        if "website" in q or "websites" in q:
            return "Web Development (Building modern websites from the ground up)"
        elif "ai" in q or "artificial intelligence" in q:
            return "AI & Machine Learning (Building intelligent models & AI applications)"
        elif "hack" in q or "security" in q or "cyber" in q:
            return "Cybersecurity & Ethical Hacking (Securing networks & penetration testing)"
        elif "data" in q or "analyst" in q:
            return "Data Analytics & Data Science (Extracting insights & dashboarding)"
        elif "cloud" in q or "devops" in q:
            return "Cloud & DevOps (Deploying scalable cloud systems & containers)"
        elif "design" in q or "figma" in q:
            return "UI/UX & Product Design (Crafting interactive digital products)"
        elif "video" in q or "edit" in q:
            return "Video Editing & Content Creation (Editing professional engaging videos)"
        elif "startup" in q or "business" in q or "freelanc" in q:
            return "Business & Entrepreneurship (Launching ventures & consulting)"
        return domain_config["default_goal"]

    async def analyze_and_recommend(
        self,
        db: AsyncSession,
        query: str,
    ) -> IntentRecommendationResponse:
        """Parse natural language query and construct tailored learning roadmap."""
        level = self.extract_experience_level(query)
        domain_key, domain_config = self.extract_domain(query)
        goal_summary = self.extract_goal_summary(query, domain_config)

        # Select beginner or intermediate progression sequence
        if level in ["Absolute Beginner", "Beginner"]:
            raw_prog = domain_config["beginner_progression"]
        else:
            raw_prog = domain_config.get("intermediate_progression", domain_config["beginner_progression"])

        progression_steps: list[ProgressionStep] = []
        target_skill_names = []

        for idx, (skill_name, action, duration) in enumerate(raw_prog, start=1):
            progression_steps.append(
                ProgressionStep(
                    step=idx,
                    skill_name=skill_name,
                    action=action,
                    estimated_duration=duration,
                )
            )
            target_skill_names.append(skill_name)

        # Retrieve matching database learning paths for the recommended skills
        matched_paths = []
        for s_name in target_skill_names:
            stmt = (
                select(LearningPath)
                .options(selectinload(LearningPath.roadmap_steps))
                .join(Skill, LearningPath.skill_id == Skill.id)
                .where(
                    or_(
                        Skill.name.ilike(f"%{s_name}%"),
                        LearningPath.title.ilike(f"%{s_name}%"),
                    )
                )
                .limit(2)
            )
            res = await db.execute(stmt)
            paths = res.scalars().all()
            for p in paths:
                if p.id not in [x.id for x in matched_paths]:
                    matched_paths.append(p)

        # If too few, add paths by domain category
        if len(matched_paths) < 4:
            stmt_cat = (
                select(LearningPath)
                .options(selectinload(LearningPath.roadmap_steps))
                .where(LearningPath.category.ilike(f"%{domain_config['domain_name']}%"))
                .limit(4)
            )
            res_cat = await db.execute(stmt_cat)
            for p in res_cat.scalars().all():
                if p.id not in [x.id for x in matched_paths]:
                    matched_paths.append(p)

        # Retrieve top recommended courses for this track
        path_ids = [p.id for p in matched_paths[:4]]
        matched_courses = []
        if path_ids:
            stmt_courses = (
                select(Course)
                .options(selectinload(Course.lessons))
                .where(Course.learning_path_id.in_(path_ids))
                .limit(6)
            )
            res_courses = await db.execute(stmt_courses)
            matched_courses = list(res_courses.scalars().all())

        intent = DetectedIntent(
            experience_level=level,
            domain=domain_config["domain_name"],
            goal=goal_summary,
            summary=(
                f"Learner identified as {level} aspiring to master {domain_config['domain_name']}. "
                f"Synthesized a {len(progression_steps)}-step sequential roadmap from foundational principles to applied capstones."
            ),
        )

        return IntentRecommendationResponse(
            query=query,
            intent=intent,
            recommended_progression=progression_steps,
            recommended_learning_paths=[
                LearningPathResponse.model_validate(p) for p in matched_paths[:6]
            ],
            recommended_courses=[
                CourseResponse.model_validate(c) for c in matched_courses
            ],
        )


intent_service = IntentService()
