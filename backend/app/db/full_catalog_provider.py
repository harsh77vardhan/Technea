"""Full catalog provider for Technea.

Combines the 115 skills from skills_registry.json with rich roadmap steps,
capstone projects, and 5 curated courses with 4 lessons each.
Preserves existing courses for the original 24 learning paths.
"""

import json
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent

# Load 115 skills
with open(BASE_DIR / "skills_registry.json", "r", encoding="utf-8") as f:
    RAW_SKILLS = json.load(f)

# Load existing 24 paths and their courses
try:
    import sys
    sys.path.insert(0, str(BASE_DIR.parent.parent))
    from app.db.generate_catalog import DOMAINS as EXISTING_DOMAINS
    EXISTING_PATH_COURSES = {
        item["path"]["title"]: item["courses"] for item in EXISTING_DOMAINS
    }
except Exception as e:
    print("Warning: could not import generate_catalog:", e)
    EXISTING_PATH_COURSES = {}

# Rich educator pool
EDUCATOR_POOL = [
    ("Mike Dane", "YouTube / freeCodeCamp", "rfscVS0vtbw", "https://www.youtube.com/playlist?list=PLWKjhJtqVAbkmRvnFmOd4KhDdlK1oIq23"),
    ("Mosh Hamedani", "YouTube / Programming with Mosh", "_uQrJ0TkZlc", None),
    ("Brad Traversy", "YouTube / Traversy Media", "hdI2bqOjy3c", None),
    ("Bro Code", "YouTube / Bro Code", "XKHEz6rJS3t", None),
    ("Tim Ruscica", "YouTube / Tech With Tim", "mDKM-JtUhhc", None),
    ("David J. Malan", "YouTube / CS50", "nLRL_NcnK-4", "https://www.youtube.com/playlist?list=PLhQjrBD2T3817j24-GogXmWAmOlgL5CXO"),
    ("Andrew Ng", "YouTube / DeepLearning.AI", "jGwO_UgTS7I", "https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI"),
    ("Jeff Delaney", "YouTube / Fireship", "2eWuYf-aZE4", None),
    ("Andrej Karpathy", "YouTube / Andrej Karpathy", "zjkBMFhNj_g", None),
    ("Nana Janashia", "YouTube / TechWorld with Nana", "rw4b1pL3wK4", None),
    ("Alex Freberg", "YouTube / Alex The Analyst", "PSNXoAs28ts", None),
    ("Chuck Keith", "YouTube / NetworkChuck", "3Kq1MIfTWCE", None),
    ("Kevin Powell", "YouTube / Kevin Powell", "1PnVor36_40", None),
    ("Shaun Pelling", "YouTube / The Net Ninja", "iWOYAxlnaww", "https://www.youtube.com/playlist?list=PL4cUxeGkcC9haFPT7J25Q9GRB_ZkFrQAc"),
    ("Erik Demaine", "YouTube / MIT OpenCourseWare", "ZA-tUyM_y7s", "https://www.youtube.com/playlist?list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb"),
    ("NeetCode", "YouTube / NeetCode", "0IAPZzGSbME", None),
    ("Abdul Bari", "YouTube / Abdul Bari", "2Z58nWEXPEw", "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O"),
    ("Grant Sanderson", "YouTube / 3Blue1Brown", "aircAruvnKk", "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"),
    ("Sanjeev Thiyagarajan", "YouTube / freeCodeCamp", "0sOvCWFmrtA", None),
    ("Nelson Djalo", "YouTube / Amigoscode", "A74TOX803D0", None),
    ("Caleb Curry", "YouTube / freeCodeCamp", "vLnPwxZdW4Y", None),
    ("The Cherno", "YouTube / The Cherno", "18c3MTX0PK0", "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G6b"),
    ("CodeWithHarry", "YouTube / CodeWithHarry", "ntLJmHOJ0ME", None),
    ("Navin Reddy", "YouTube / Telusko", "BGTx91t8q50", None),
    ("Josh Starmer", "YouTube / StatQuest", "Gv9_4yMHFhI", "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF"),
    ("Alexander Amini", "YouTube / MIT OpenCourseWare", "7sCG883kVz8", "https://www.youtube.com/playlist?list=PLtBw6njkvDA-YrT05nQoxUq8g5Vp5K-qN"),
    ("Daniel Bourke", "YouTube / freeCodeCamp", "GIsg-ZUy0MY", None),
    ("Paige Bailey", "YouTube / TensorFlow", "tPYj3fFNHjk", None),
    ("Christopher Manning", "YouTube / Stanford Online", "rmVRLeJRkl4", "https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"),
    ("Murtaza Hassan", "YouTube / Murtaza's Workshop", "WgPbbWmnXJ8", None),
    ("Nicholas Renotte", "YouTube / Nicholas Renotte", "yqkISICHH-U", None),
    ("Krish Naik", "YouTube / Krish Naik", "fOvTtapxa9c", "https://www.youtube.com/playlist?list=PLZoTAELRMXVMdJ5SQbCEKDn48qtGgI6Xe"),
    ("Beau Carnes", "YouTube / freeCodeCamp", "nu_pCVPKzTk", None),
    ("Bob Ziroll", "YouTube / freeCodeCamp", "bMknfKXIFA8", None),
    ("Ken Jee", "YouTube / Ken Jee", "MpF9HENQjDo", "https://www.youtube.com/playlist?list=PLeo1K3hjS3uu7clOTtw8zs74PMrYZlKeL"),
    ("Luke Barousse", "YouTube / Luke Barousse", "wUSDVGivd-8", None),
    ("Kevin Stratvert", "YouTube / Kevin Stratvert", "AGrl-H87pRU", None),
    ("David Bombal", "YouTube / David Bombal", "WnN6dbosJJA", None),
    ("John Hammond", "YouTube / John Hammond", "inWWhr5tnEA", None),
    ("Simplilearn Team", "YouTube / Simplilearn", "nzZkKoREEGo", None),
    ("Andrew Brown", "YouTube / freeCodeCamp", "SOTamWNgDKc", None),
    ("Gwen Faraday", "YouTube / freeCodeCamp", "RGOj5yH7evk", None),
    ("Hussein Nasser", "YouTube / Hussein Nasser", "4q7c-8wH_4g", "https://www.youtube.com/playlist?list=PLQnljOFTspQXjD3Wpn2SCPOnhvdL23Sso"),
]

# Standard 7 roadmap milestones templates tailored by domain
DOMAIN_STEP_TEMPLATES = {
    "Programming": [
        ("Core Syntax, Primitive Types & Expressions", "Understand data types, variable scopes, arithmetic operations, and expression evaluation."),
        ("Conditionals, Branching & Logical Flow", "Control code execution using branching statements, pattern matching, and truthy evaluations."),
        ("Loops, Iteration & Collections", "Harness while and for loops, iterate over sequences, and manipulate lists, dicts, or arrays."),
        ("Modular Functions & Closures", "Write pure reusable functions, parameter handling, return signatures, and lexical scope closures."),
        ("Object-Oriented & Structural Architecture", "Design classes, objects, interfaces, inheritance hierarchy, and memory encapsulation."),
        ("Error Handling, Testing & Debugging", "Implement try-catch exception models, write automated unit tests, and trace stack exceptions."),
        ("Packaging, Tooling & Capstone Integration", "Configure build tools, manage external dependencies, and build a production-ready application."),
    ],
    "AI & ML": [
        ("Mathematical Foundations & Linear Algebra", "Vectors, matrices, dot products, eigenvalues, partial derivatives, and gradient vectors."),
        ("Data Wrangling & Statistical Preprocessing", "Feature scaling, missing value imputation, one-hot encoding, and train-validation-test splitting."),
        ("Supervised Learning & Baseline Models", "Cost functions, gradient descent optimization, decision trees, and logistic regression."),
        ("Model Evaluation & Cross-Validation Metrics", "Confusion matrices, precision, recall, F1 score, ROC-AUC, and cross-validation."),
        ("Deep Learning Architectures & Neural Layers", "Feedforward networks, backpropagation, activation functions, and layer regularization."),
        ("Fine-Tuning, Pretrained Foundations & Adapters", "Adapting state-of-the-art vision and language foundation models for domain-specific tasks."),
        ("Production Deployment & Pipeline Monitoring", "Exporting weights with ONNX/TorchScript, containerization with Docker, and serving via FastAPI."),
    ],
    "Web Development": [
        ("Semantic Document Architecture & Structure", "Semantic layout elements, accessible forms, ARIA landmark attributes, and SEO foundations."),
        ("Modern Layout Systems (Flexbox & Grid)", "Fluid layouts, CSS Grid matrices, clamp-based typography, and responsive media queries."),
        ("Reactive Client Logic & Asynchronous APIs", "Execution contexts, promises, async/await, DOM updates, and client API communication."),
        ("Component Hierarchy & State Management", "Component composition, reactive state, effect lifecycles, and atomic unidirectional flow."),
        ("Backend Services, Routing & Middleware", "Stateless HTTP routing, middleware validation, authentication guards, and status codes."),
        ("Data Persistence, Modeling & Transactions", "Schema design, migrations, relational queries, ORM integration, and connection pools."),
        ("Production Deployment, Security & Monitoring", "JWT tokens, password hashing, HTTPS/CORS security, CI/CD, and edge cloud hosting."),
    ],
    "Data": [
        ("Relational Modeling & Query Foundations", "SELECT statements, aggregations, multi-table joins, subqueries, and window functions."),
        ("Data Cleaning, Imputation & Wrangling", "Handling missing values, outlier detection, string formatting, and date transformations."),
        ("Exploratory Data Analysis (EDA) & Statistics", "Mean, median, variance, correlations, distribution profiling, and hypothesis tests."),
        ("Visual Analytics & Business Dashboarding", "Visual design with Seaborn/Plotly, dashboard design, and stakeholder storytelling."),
        ("Statistical Inference & Predictive Modeling", "Hypothesis testing, p-values, confidence intervals, and regression inference."),
        ("Automated Data Pipelines & Orchestration", "Scheduled workflows, data extract-transform-load scripts, and data lake storage."),
        ("Executive Reporting & Metric Strategy", "Synthesizing analytical findings into actionable business recommendations and KPIs."),
    ],
    "Cybersecurity": [
        ("Threat Modeling & Security Foundations", "CIA triad, threat vectors, attack surfaces, security policies, and defense in depth."),
        ("Network Security, Packet Analysis & Firewalls", "TCP/IP handshakes, packet capture with Wireshark, DNS security, and stateful firewalls."),
        ("System Hardening & Access Control", "Least privilege permissions, SSH keys, password policies, and operating system audit daemons."),
        ("Vulnerability Assessment & Scanning", "Active and passive reconnaissance, port enumeration, Nmap scanning, and vulnerability triage."),
        ("Exploitation Techniques & Privilege Escalation", "Common vulnerability exploitation, payload delivery, web vulnerabilities, and local privesc."),
        ("Detection, SIEM Logging & Incident Response", "Log correlation, indicators of compromise (IoCs), intrusion detection, and containment playbooks."),
        ("Security Governance, Compliance & Audits", "Industry standards (NIST, ISO 27001), compliance frameworks, and executive security reports."),
    ],
    "Cloud & DevOps": [
        ("Operating Systems & Shell Automation", "Linux hierarchies, permissions, process management, and shell automation scripts."),
        ("Networking Protocols & Cloud Connectivity", "TCP/IP routing, DNS, VPC subnets, security groups, and cloud gateways."),
        ("Containerization Foundations with Docker", "Container isolation, Dockerfile optimization, multi-stage builds, and Docker Compose."),
        ("Infrastructure as Code (IaC) & Cloud Provisioning", "Declarative cloud provisioning with Terraform, state management, and reusable modules."),
        ("Container Orchestration with Kubernetes", "Pods, ReplicaSets, Services, Deployments, Ingress controllers, and Helm charts."),
        ("Continuous Integration & Continuous Delivery (CI/CD)", "Automated test pipelines, GitHub Actions workflows, artifact registries, and deploys."),
        ("Observability, Monitoring, Logging & SRE", "Metrics scraping with Prometheus, Grafana dashboards, log streams, and SLO alerting."),
    ],
    "Design": [
        ("Visual Foundations, Color Theory & Spacing", "Visual hierarchy, 8pt spacing grids, modern typography pairings, and accessible contrast."),
        ("User Experience Architecture & Research", "User personas, empathy maps, user journey diagrams, and information architecture."),
        ("Wireframing & Structural Layouts", "Low-fidelity wireframing, layout sketching, component placement, and flow testing."),
        ("Component Systems & Reusable Patterns", "Mastering design tools (Figma), Auto Layout, reusable component variants, and tokens."),
        ("Interactive Prototyping & Micro-Interactions", "High-fidelity clickable prototypes, smart animations, transition timing, and micro-interactions."),
        ("Usability Testing & Iterative Validation", "Conducting think-aloud usability sessions, collecting feedback, and refining interface frictions."),
        ("Design Systems & Developer Handoff", "Atomic design tokens, component specifications, style guides, and engineering handoff assets."),
    ],
    "Video Editing": [
        ("Media Ingestion, Workspace & Timeline Setup", "Project organization, bin structures, ingest settings, proxy media, and sequence setup."),
        ("Assembly, Rough Cuts & Rhythm Trimming", "Three-point editing, ripple and rolling trims, J-cuts, L-cuts, and narrative pacing."),
        ("B-Roll Layering, Framing & Visual Hooks", "Layering secondary footage, pattern interrupts, visual zoom punches, and opening retention hooks."),
        ("Audio Leveling, Voice Cleanup & Sound Design", "Dialogue noise reduction, EQ balancing, compression, audio ducking, and sound effects layering."),
        ("Color Correction & Creative Grading", "Primary exposure balancing, white balance matching, secondary qualifiers, and LUT looks."),
        ("Motion Graphics, Titles & Kinetic Text", "Animated lower thirds, kinetic typography, graphic overlays, and track mattes."),
        ("Final Audio Mastering, Quality Control & Export", "LUFS loudness normalization, visual quality checks, platform bitrate exports, and archiving."),
    ],
    "Business": [
        ("Market Opportunity & Customer Discovery", "Problem validation, customer discovery interviews, market sizing (TAM/SAM/SOM), and hypothesis testing."),
        ("Value Proposition & Business Model Design", "Designing the Business Model Canvas, pricing strategies, unit economics, and competitive moats."),
        ("Product Scoping & Minimum Viable Product (MVP)", "Defining MVP features, user stories, rapid validation prototypes, and customer feedback loops."),
        ("Customer Acquisition & Go-To-Market (GTM)", "Identifying distribution channels, organic content marketing, paid acquisition, and launch funnels."),
        ("Financial Modeling & Unit Economics", "Forecasting revenue, COGS, operating expenses, customer acquisition cost (CAC), and lifetime value (LTV)."),
        ("Sales, Partnerships & High-Stakes Negotiation", "Consultative sales discovery calls, pipeline CRM management, proposal drafting, and deal closing."),
        ("Scaling Operations, Governance & OKRs", "Company operating cadence, hiring strategies, OKR alignment, and sustainable growth metrics."),
    ],
}


def get_roadmap_steps_for_path(category: str, path_title: str) -> list[dict[str, Any]]:
    """Generate 7 sequential milestone steps tailored to the path."""
    for key, steps in DOMAIN_STEP_TEMPLATES.items():
        if key in category:
            base_steps = steps
            break
    else:
        base_steps = DOMAIN_STEP_TEMPLATES["Programming"]

    results = []
    for step_num, (title, desc) in enumerate(base_steps, start=1):
        # Slightly personalize with path title context
        p_title = f"{title}"
        p_desc = f"{desc} Applied to {path_title}."
        results.append({
            "step_number": step_num,
            "title": p_title,
            "description": p_desc,
        })
    return results


def get_capstone_projects_for_path(path_title: str, level: str, category: str) -> list[dict[str, Any]]:
    """Generate 3 realistic capstone projects for the learning path."""
    slug = path_title.lower().replace(" ", "-").replace("&", "and").replace("/", "-")
    return [
        {
            "id": f"proj-{slug}-1",
            "milestone": "Project 01 • Core Logic",
            "title": f"{path_title} Core Application",
            "description": f"Construct an interactive terminal/client system implementing core logic, data models, and error validation for {path_title}.",
            "difficulty": "Beginner Friendly" if "Beginner" in level else "Intermediate",
            "buildTime": "4-5 Hours",
            "skills": [path_title, "Modular Architecture", "Unit Testing"],
            "deliverables": [
                f"Well-structured project layout with clean separation of concerns for {path_title}",
                "Automated test suite verifying positive and edge cases",
                "Complete documentation and usage walkthrough in README.md",
            ],
        },
        {
            "id": f"proj-{slug}-2",
            "milestone": "Project 02 • Integration & APIs",
            "title": f"Production {path_title} Service",
            "description": f"Architect an integrated end-to-end service for {path_title} with persistent data storage, external integrations, and logging.",
            "difficulty": "Intermediate",
            "buildTime": "6-8 Hours",
            "skills": [path_title, "API Integration", "Data Persistence", "Security"],
            "deliverables": [
                "Full integration with upstream data sources and schemas",
                "Configurable environment variables and logging middleware",
                "Structured error trapping and user feedback handling",
            ],
        },
        {
            "id": f"proj-{slug}-3",
            "milestone": "Project 03 • Capstone Architecture",
            "title": f"Enterprise {path_title} Platform",
            "description": f"Deploy a production-grade, highly reliable platform showcasing advanced patterns, performance tuning, and automated deployment.",
            "difficulty": "Advanced Capstone",
            "buildTime": "10-14 Hours",
            "skills": [path_title, "System Architecture", "Performance Tuning", "CI/CD"],
            "deliverables": [
                "Complete production deployment with automated CI/CD checks",
                "Observability metrics, structured audit logs, and performance profiling",
                "Comprehensive architecture overview with technical diagrams",
            ],
        },
    ]


def get_courses_for_path(path_title: str, skill_name: str, level: str, category: str, path_idx: int) -> list[dict[str, Any]]:
    """Generate 5 curated courses for the learning path with 4 lessons each."""
    # Check if this path has existing courses in generate_catalog
    if path_title in EXISTING_PATH_COURSES:
        raw_courses = EXISTING_PATH_COURSES[path_title]
        result = []
        for c_idx, c_tuple in enumerate(raw_courses, start=1):
            title, instructor, platform, duration, yt_id, pl_url = c_tuple
            diff = "Beginner" if c_idx <= 2 else ("Intermediate" if c_idx <= 4 else "Advanced")
            tags = [skill_name.lower(), "course", diff.lower()]
            lessons = get_lessons_for_course(title, yt_id)
            result.append({
                "title": title,
                "description": f"Master {path_title} with {instructor} on {platform}. Hands-on video training designed for modern learners.",
                "platform": platform,
                "instructor": instructor,
                "duration": duration,
                "difficulty": diff,
                "tags": tags,
                "youtube_video_id": yt_id,
                "youtube_url": f"https://www.youtube.com/watch?v={yt_id}",
                "thumbnail_url": f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
                "playlist_url": pl_url,
                "lesson_order": c_idx,
                "lessons": lessons,
            })
        return result

    # Otherwise synthesize 5 rich courses using educators from EDUCATOR_POOL
    course_templates = [
        (f"{path_title} - Full Course for Beginners", "4h 15m", "Beginner"),
        (f"{path_title} Crash Course & Practical Walkthrough", "2h 30m", "Beginner"),
        (f"Modern {path_title} in 2026: Complete Guide", "6h 00m", "Intermediate"),
        (f"{path_title} Deep Dive & Architecture Patterns", "3h 45m", "Intermediate"),
        (f"Advanced {path_title} Masterclass: Production Systems", "5h 20m", "Advanced"),
    ]

    result = []
    for c_idx, (c_title, c_dur, c_diff) in enumerate(course_templates, start=1):
        # Pick educator based on modulo
        pool_idx = (path_idx * 5 + c_idx) % len(EDUCATOR_POOL)
        inst_name, platform, yt_id, pl_url = EDUCATOR_POOL[pool_idx]

        tags = [skill_name.lower(), c_diff.lower(), "tutorial", "video"]
        lessons = get_lessons_for_course(c_title, yt_id)

        result.append({
            "title": c_title,
            "description": f"Master {path_title} with {inst_name} on {platform}. Comprehensive step-by-step video training.",
            "platform": platform,
            "instructor": inst_name,
            "duration": c_dur,
            "difficulty": c_diff,
            "tags": tags,
            "youtube_video_id": yt_id,
            "youtube_url": f"https://www.youtube.com/watch?v={yt_id}",
            "thumbnail_url": f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
            "playlist_url": pl_url,
            "lesson_order": c_idx,
            "lessons": lessons,
        })
    return result


def get_lessons_for_course(course_title: str, yt_id: str) -> list[dict[str, Any]]:
    """Generate 4 structured lessons for a course."""
    lesson_specs = [
        ("Module 1: Introduction & Environment Setup", f"Overview of {course_title}, tool installation, configuration, and foundational principles.", "25 mins"),
        ("Module 2: Core Concepts & Syntax Walkthrough", f"Deep dive into the architecture, primary syntax patterns, and essential features of {course_title}.", "45 mins"),
        ("Module 3: Hands-on Implementation & Practice", f"Step-by-step practical implementation, debugging techniques, and real-world application building.", "35 mins"),
        ("Module 4: Advanced Patterns & Capstone Project", f"Production best practices, performance optimization, and comprehensive project walkthrough.", "40 mins"),
    ]
    lessons = []
    for l_idx, (l_title, l_desc, l_dur) in enumerate(lesson_specs, start=1):
        lessons.append({
            "lesson_order": l_idx,
            "title": l_title,
            "description": l_desc,
            "duration": l_dur,
            "youtube_video_id": yt_id,
            "youtube_url": f"https://www.youtube.com/watch?v={yt_id}",
            "thumbnail_url": f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg",
        })
    return lessons


def build_full_catalog() -> list[dict[str, Any]]:
    """Compile the entire 115 skills, 230 learning paths, and 1,150 courses catalog."""
    catalog = []
    total_paths = 0

    for s_idx, skill_raw in enumerate(RAW_SKILLS, start=1):
        skill_name = skill_raw["name"]
        category = skill_raw["category"]
        desc = skill_raw["description"]
        tags = skill_raw.get("tags", [])
        keywords = skill_raw.get("keywords", [])
        aliases = skill_raw.get("aliases", [])
        prerequisites = skill_raw.get("prerequisites", [])
        recommended_next = skill_raw.get("recommended_next", [])

        # Build Path 1
        p1_title = skill_raw["p1_title"]
        p1_level = skill_raw["p1_level"]
        p1_duration = skill_raw["p1_duration"]
        p1_desc = skill_raw["p1_desc"]
        p1_search = skill_raw.get("p1_search", [])
        p1_concepts = skill_raw.get("p1_concepts", [])

        total_paths += 1
        path1 = {
            "title": p1_title,
            "category": category,
            "level": p1_level,
            "difficulty": p1_level,
            "duration": p1_duration,
            "description": p1_desc,
            "search_terms": p1_search,
            "related_concepts": p1_concepts,
            "roadmap_steps": get_roadmap_steps_for_path(category, p1_title),
            "projects": get_capstone_projects_for_path(p1_title, p1_level, category),
            "courses": get_courses_for_path(p1_title, skill_name, p1_level, category, total_paths),
        }

        # Build Path 2
        p2_title = skill_raw["p2_title"]
        p2_level = skill_raw["p2_level"]
        p2_duration = skill_raw["p2_duration"]
        p2_desc = skill_raw["p2_desc"]
        p2_search = skill_raw.get("p2_search", [])
        p2_concepts = skill_raw.get("p2_concepts", [])

        total_paths += 1
        path2 = {
            "title": p2_title,
            "category": category,
            "level": p2_level,
            "difficulty": p2_level,
            "duration": p2_duration,
            "description": p2_desc,
            "search_terms": p2_search,
            "related_concepts": p2_concepts,
            "roadmap_steps": get_roadmap_steps_for_path(category, p2_title),
            "projects": get_capstone_projects_for_path(p2_title, p2_level, category),
            "courses": get_courses_for_path(p2_title, skill_name, p2_level, category, total_paths),
        }

        skill_entry = {
            "name": skill_name,
            "category": category,
            "description": desc,
            "tags": tags,
            "keywords": keywords,
            "aliases": aliases,
            "prerequisites": prerequisites,
            "recommended_next": recommended_next,
            "learning_paths": [path1, path2],
        }
        catalog.append(skill_entry)

    return catalog


if __name__ == "__main__":
    catalog = build_full_catalog()
    total_skills = len(catalog)
    total_paths = sum(len(s["learning_paths"]) for s in catalog)
    total_courses = sum(len(p["courses"]) for s in catalog for p in s["learning_paths"])
    total_steps = sum(len(p["roadmap_steps"]) for s in catalog for p in s["learning_paths"])
    total_lessons = sum(len(c["lessons"]) for s in catalog for p in s["learning_paths"] for c in p["courses"])

    print("Catalog generation statistics:")
    print(f"  Skills:         {total_skills}")
    print(f"  Learning Paths: {total_paths}")
    print(f"  Courses:        {total_courses}")
    print(f"  Roadmap Steps:  {total_steps}")
    print(f"  Lessons:        {total_lessons}")

    out_file = BASE_DIR / "full_catalog.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    print(f"Saved full catalog to {out_file} ({out_file.stat().st_size / (1024*1024):.2f} MB)")
