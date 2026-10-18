"""Seed data for Projects and Learning Rooms."""

import asyncio
from app.db.session import async_session_maker
from app.models.community import LearningRoom
from app.models.project import Project
from sqlalchemy import select

INITIAL_PROJECTS = [
    {
        "title": "Expense Tracker CLI",
        "description": "Build a command-line expense tracker that records income/expenses, parses persistent JSON/CSV data files, calculates categorical spending summaries, and exports monthly budget reports.",
        "difficulty": "Beginner",
        "estimated_time": "3-5 days",
        "required_skills": ["Functions", "File handling", "Data structures", "CLI Arguments"],
        "technologies": ["Python", "CLI", "JSON", "Argparse"],
        "related_paths": ["Python Fundamentals", "Backend Development"],
        "milestones": [
            "Initialize CLI argument parser with add, list, and summary subcommands",
            "Implement disk persistence layer for structured JSON expense records",
            "Compute monthly aggregates and category breakdown analytics",
            "Add interactive error handling for corrupted inputs or negative values",
        ],
    },
    {
        "title": "Markdown to HTML Static Site Generator",
        "description": "Construct a high-performance documentation and blog static site compiler from scratch using regex parsers and modular templating engines.",
        "difficulty": "Beginner",
        "estimated_time": "4-6 days",
        "required_skills": ["Regex", "File I/O", "String Parsing", "Algorithms"],
        "technologies": ["Python", "HTML5", "CSS3", "Jinja2"],
        "related_paths": ["Python Fundamentals", "Web Development Foundations"],
        "milestones": [
            "Parse Markdown headers, code blocks, bullet points, and inline links using regular expressions",
            "Generate semantic HTML5 output with accessible metadata and navigation",
            "Implement file system watcher to re-compile on file edits",
        ],
    },
    {
        "title": "Interactive Kanban Project Board",
        "description": "Architect a responsive Kanban task management board featuring drag-and-drop column sorting, priority filtering, localStorage state hydration, and optimistic UI transitions.",
        "difficulty": "Intermediate",
        "estimated_time": "1-2 weeks",
        "required_skills": ["React", "Custom Hooks", "State Management", "DOM Events"],
        "technologies": ["React", "TypeScript", "Tailwind CSS", "Vite"],
        "related_paths": ["React Component Architecture", "Frontend Development"],
        "milestones": [
            "Create responsive column layout supporting Backlog, In Progress, Review, and Done",
            "Implement drag-and-drop state reordering with accessible keyboard controls",
            "Persist boards and custom priority tags to browser storage with schema validation",
            "Add animated modal for task detail editing, subtasks, and deadline countdowns",
        ],
    },
    {
        "title": "Full Stack Engineering Blog Platform",
        "description": "Develop a multi-author technical publication platform with Markdown authoring, JWT authentication, role-based draft/publish lifecycles, and relational database schema design.",
        "difficulty": "Intermediate",
        "estimated_time": "2 weeks",
        "required_skills": ["Django", "FastAPI", "PostgreSQL", "JWT Auth", "REST APIs"],
        "technologies": ["FastAPI", "React", "PostgreSQL", "SQLAlchemy", "Tailwind CSS"],
        "related_paths": ["Full Stack Web Development", "Backend Development"],
        "milestones": [
            "Design normalized relational schema for users, articles, tags, and reading history",
            "Implement secure JWT access & refresh token authentication flows",
            "Build reactive article editor with live Markdown preview and syntax highlighting",
            "Expose paginated REST API endpoints with full-text search indexing",
        ],
    },
    {
        "title": "Production URL Shortener Microservice",
        "description": "Engineer a distributed, high-throughput URL shortening service featuring Base62 hash encoding, Redis caching, click analytics geolocation logging, and custom alias support.",
        "difficulty": "Intermediate",
        "estimated_time": "1-2 weeks",
        "required_skills": ["FastAPI", "Redis", "PostgreSQL", "System Design", "Caching"],
        "technologies": ["Python", "FastAPI", "Redis", "PostgreSQL", "Docker"],
        "related_paths": ["Backend Development", "System Design & Scalability"],
        "milestones": [
            "Implement Base62 bi-directional ID hashing algorithm for collision-free short codes",
            "Configure Redis read-through cache reducing database query latency to sub-5ms",
            "Log IP, user agent, and timestamp metrics asynchronously on each redirect",
            "Package application into multi-stage Docker container with health checks",
        ],
    },
    {
        "title": "Real-Time Team Collaboration Chat",
        "description": "Construct a real-time team messaging workspace supporting multi-channel rooms, live presence indicators, typing status, and message history streaming over WebSockets.",
        "difficulty": "Intermediate",
        "estimated_time": "2 weeks",
        "required_skills": ["WebSockets", "Asyncio", "Redis PubSub", "React"],
        "technologies": ["FastAPI", "WebSockets", "Redis", "React", "Tailwind CSS"],
        "related_paths": ["Full Stack Web Development", "Advanced Systems"],
        "milestones": [
            "Implement bi-directional WebSocket connection manager with heartbeat ping/pong",
            "Scale message broadcasting across server instances utilizing Redis Pub/Sub",
            "Track active member presence and ephemeral typing broadcast events",
            "Build responsive client interface with message search and timestamp grouping",
        ],
    },
    {
        "title": "AI Document RAG Search Assistant",
        "description": "Build an intelligent Retrieval-Augmented Generation (RAG) assistant that indexes engineering PDFs, generates vector embeddings, and answers queries with exact source citations.",
        "difficulty": "Advanced",
        "estimated_time": "2-3 weeks",
        "required_skills": ["Vector Search", "Embeddings", "LLM Integration", "Python", "Chunking"],
        "technologies": ["Python", "LangChain / LlamaIndex", "ChromaDB / Qdrant", "OpenAI / Anthropic", "FastAPI"],
        "related_paths": ["AI / Machine Learning", "Applied AI"],
        "milestones": [
            "Chunk technical documentation into overlapping semantic text passages",
            "Generate dense vector embeddings and index in vector database",
            "Implement hybrid keyword + cosine similarity retriever with reranking",
            "Synthesize context-grounded prompt answering user queries with verbatim citations",
        ],
    },
    {
        "title": "Dockerized CI/CD Automated Pipeline",
        "description": "Architect a production-grade continuous integration and continuous deployment pipeline utilizing GitHub Actions, Docker multi-stage builds, automated linting/testing, and cloud staging deployment.",
        "difficulty": "Intermediate",
        "estimated_time": "1 week",
        "required_skills": ["Docker", "CI/CD", "GitHub Actions", "NGINX", "Linux"],
        "technologies": ["Docker", "GitHub Actions", "NGINX", "Linux", "Bash"],
        "related_paths": ["DevOps & Cloud", "System Design & Scalability"],
        "milestones": [
            "Write optimized multi-stage Dockerfiles for frontend SPA and backend API",
            "Configure GitHub Actions workflow executing unit tests, linters, and image builds on pull requests",
            "Set up NGINX reverse proxy with TLS certificate termination and gzip compression",
            "Automate zero-downtime container redeployment upon merge to main branch",
        ],
    },
    {
        "title": "Customer Churn Predictive Classifier",
        "description": "Train and evaluate an end-to-end machine learning classification pipeline predicting customer churn using scikit-learn, hyperparameter tuning, ROC/AUC analysis, and Model API serving.",
        "difficulty": "Intermediate",
        "estimated_time": "1-2 weeks",
        "required_skills": ["Machine Learning", "Scikit-Learn", "Feature Engineering", "Pandas"],
        "technologies": ["Python", "Pandas", "Scikit-learn", "FastAPI", "Matplotlib"],
        "related_paths": ["AI / Machine Learning", "Data Science"],
        "milestones": [
            "Perform exploratory data analysis and handle skewed missing numerical features",
            "Encode categorical variables and scale numerical inputs using Pipeline pipelines",
            "Train Random Forest & XGBoost classifiers with cross-validation grid search",
            "Wrap serialized model artifact in FastAPI inference endpoint with pydantic validation",
        ],
    },
    {
        "title": "JWT Auth & Role-Based Access Control Server",
        "description": "Implement an enterprise-ready authentication microservice featuring Argon2 password hashing, secure HTTP-only cookie tokens, RBAC permissions, and brute-force rate limiting.",
        "difficulty": "Advanced",
        "estimated_time": "1-2 weeks",
        "required_skills": ["Cybersecurity", "JWT", "OAuth2", "Cryptography", "Rate Limiting"],
        "technologies": ["Python", "FastAPI", "PostgreSQL", "Redis", "Argon2"],
        "related_paths": ["Cybersecurity", "Backend Development"],
        "milestones": [
            "Implement Argon2id password hashing with cryptographic salt and pepper",
            "Issue short-lived access tokens and rotated refresh tokens stored in Redis blacklist",
            "Enforce role-based permission dependencies (Admin, Editor, Member)",
            "Apply sliding-window rate limiting on login attempts to mitigate credential stuffing",
        ],
    },
    {
        "title": "RESTful Microservices Order Processing System",
        "description": "Architect an event-driven e-commerce microservices architecture with inventory reservations, order validation, idempotent payments, and transactional outbox patterns.",
        "difficulty": "Advanced",
        "estimated_time": "2-3 weeks",
        "required_skills": ["Microservices", "Event-Driven", "PostgreSQL", "Message Queues", "FastAPI"],
        "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker", "RabbitMQ"],
        "related_paths": ["Full Stack Web Development", "System Design & Scalability"],
        "milestones": [
            "Design decoupled order and inventory database schemas with optimistic concurrency locks",
            "Implement transactional outbox pattern to prevent dual-write race conditions",
            "Handle idempotent retry logic for simulated credit card transactions",
            "Containerize microservices with docker-compose service mesh",
        ],
    },
    {
        "title": "Interactive Crypto & Stock Price Visualizer",
        "description": "Build a reactive financial charting application that connects to real-time market streams, calculates technical indicators (EMA, RSI), and supports historical date zooming.",
        "difficulty": "Intermediate",
        "estimated_time": "1-2 weeks",
        "required_skills": ["JavaScript", "WebSockets", "Data Visualization", "React"],
        "technologies": ["React", "TypeScript", "Chart.js", "WebSockets", "Tailwind CSS"],
        "related_paths": ["Frontend Development", "React Component Architecture"],
        "milestones": [
            "Establish live WebSocket market subscription for ticker price updates",
            "Implement algorithmic EMA and RSI indicators over rolling 14-period candles",
            "Render smooth 60fps canvas price charts with touch and hover tooltips",
            "Cache historical candlestick time-series in indexedDB for offline analysis",
        ],
    },
    {
        "title": "Automated Web Scraping & Alert Pipeline",
        "description": "Develop a headless scraper extracting price changes, news headlines, and availability alerts with anti-bot throttling, proxy rotation, and Telegram/Discord webhook notifications.",
        "difficulty": "Beginner",
        "estimated_time": "3-5 days",
        "required_skills": ["Python", "Web Scraping", "Asyncio", "APIs"],
        "technologies": ["Python", "BeautifulSoup", "Playwright", "Requests"],
        "related_paths": ["Python Fundamentals", "Backend Development"],
        "milestones": [
            "Scrape target product DOM tables with CSS selector fallbacks",
            "Implement user-agent rotation and exponential backoff jitter",
            "Persist scraped price histories to SQLite database",
            "Trigger real-time webhook notification when target price threshold is breached",
        ],
    },
    {
        "title": "Network Vulnerability & Port Scanner",
        "description": "Construct an asynchronous multithreaded TCP port scanner and service banner grabber with CIDR subnet scanning and vulnerability signature heuristics.",
        "difficulty": "Intermediate",
        "estimated_time": "1-2 weeks",
        "required_skills": ["Networking", "Sockets", "Concurrency", "Cybersecurity"],
        "technologies": ["Python", "Sockets", "Asyncio", "Linux"],
        "related_paths": ["Cybersecurity", "Computer Science"],
        "milestones": [
            "Build asynchronous TCP SYN/Connect scanner with configurable concurrency limits",
            "Perform service banner grabbing on open common ports (HTTP, SSH, SMTP)",
            "Parse CIDR notation IP ranges into discrete scan targets",
            "Generate structured JSON vulnerability audit reports",
        ],
    },
    {
        "title": "AI Code Review & Documentation Bot",
        "description": "Build an intelligent developer tool that inspects GitHub pull requests, identifies memory leaks, computes cyclomatic complexity, and posts inline refactoring suggestions.",
        "difficulty": "Advanced",
        "estimated_time": "2 weeks",
        "required_skills": ["LLM Integration", "AST Parsing", "GitHub API", "Python"],
        "technologies": ["Python", "FastAPI", "GitHub Webhooks", "OpenAI / Claude API"],
        "related_paths": ["AI / Machine Learning", "DevOps & Cloud"],
        "milestones": [
            "Listen to GitHub webhook events for opened and synchronized pull requests",
            "Parse git unified diffs and extract modified AST syntax nodes",
            "Prompt LLM with syntax context to identify security flaws and architectural smells",
            "Post structured inline comments with diff suggestions back to GitHub PR",
        ],
    },
]

INITIAL_ROOMS = [
    {
        "name": "Python Beginners",
        "slug": "python-beginners",
        "description": "Hands-on collaborative space for learners tackling Python syntax, loops, functions, file handling, and CLI projects.",
        "category": "Backend & Programming",
        "active_learners_count": 142,
        "icon": "terminal",
    },
    {
        "name": "React & Frontend Architects",
        "slug": "react-frontend-architects",
        "description": "Deep dives into React functional components, hooks lifecycles, state streaming, Vite, and component design systems.",
        "category": "Frontend Engineering",
        "active_learners_count": 218,
        "icon": "layout",
    },
    {
        "name": "AI & Machine Learning Guild",
        "slug": "ai-ml-guild",
        "description": "Discussing neural architectures, RAG pipelines, model fine-tuning, embeddings, and real-world ML deployment.",
        "category": "Applied AI & Data",
        "active_learners_count": 185,
        "icon": "cpu",
    },
    {
        "name": "DevOps & Cloud Infrastructure",
        "slug": "devops-cloud",
        "description": "Containerization with Docker, Kubernetes cluster orchestration, GitHub Actions CI/CD pipelines, and cloud reliability.",
        "category": "Cloud & Systems",
        "active_learners_count": 96,
        "icon": "server",
    },
    {
        "name": "Data Structures & Algorithms",
        "slug": "dsa-club",
        "description": "Daily problem solving, Big-O complexity analysis, trees, graphs, dynamic programming, and technical interview drills.",
        "category": "Computer Science",
        "active_learners_count": 264,
        "icon": "binary",
    },
    {
        "name": "Full Stack Builders",
        "slug": "full-stack-builders",
        "description": "Connecting reactive frontend clients with robust backend APIs, relational databases, and shipping production MVPs.",
        "category": "Production Web",
        "active_learners_count": 310,
        "icon": "layers",
    },
]


async def seed_data():
    async with async_session_maker() as session:
        # Check existing projects
        p_res = await session.execute(select(Project))
        existing_projects = {p.title for p in p_res.scalars().all()}

        added_projects = 0
        for p_data in INITIAL_PROJECTS:
            if p_data["title"] not in existing_projects:
                proj = Project(**p_data)
                session.add(proj)
                added_projects += 1

        # Check existing rooms
        r_res = await session.execute(select(LearningRoom))
        existing_rooms = {r.slug for r in r_res.scalars().all()}

        added_rooms = 0
        for r_data in INITIAL_ROOMS:
            if r_data["slug"] not in existing_rooms:
                room = LearningRoom(**r_data)
                session.add(room)
                added_rooms += 1

        await session.commit()
        print(f"Seed complete! Added {added_projects} projects and {added_rooms} learning rooms.")


if __name__ == "__main__":
    asyncio.run(seed_data())
