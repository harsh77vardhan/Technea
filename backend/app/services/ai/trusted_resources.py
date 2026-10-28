"""Curated Trusted Public Resources Engine for Technea AI.

Provides authoritative, high-signal public learning resources (Official Documentation,
top YouTube creators, university courses, and community masterclasses) across major
developer tracks: Python, React/Frontend, Backend/APIs, DSA, and Cloud/DevOps.
"""

from typing import Any

# Master catalog of trusted public resources organized by track/domain
TRUSTED_RESOURCES: dict[str, list[dict[str, str]]] = {
    "python": [
        {
            "title": "Official Python Documentation",
            "provider": "Python Software Foundation",
            "url_or_channel": "https://docs.python.org/3/",
            "description": "The authoritative language reference, standard library documentation, and official tutorials for Python 3.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "Python for Beginners - 6-Hour Complete Course",
            "provider": "freeCodeCamp",
            "url_or_channel": "https://www.youtube.com/watch?v=rfscVS0vtbw",
            "description": "Comprehensive full beginner course covering core syntax, data structures, functions, file I/O, and hands-on exercises.",
            "type": "Video Course",
            "language": "English",
        },
        {
            "title": "Python YouTube Series (Foundations, OOP, Best Practices)",
            "provider": "Corey Schafer",
            "url_or_channel": "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyQKpuMVwpBQ3nPT",
            "description": "The gold-standard video series covering Python fundamentals, Object-Oriented Programming (OOP), decorators, generators, and clean architecture.",
            "type": "Playlist",
            "language": "English",
        },
        {
            "title": "Python Programming Tutorials",
            "provider": "Tech With Tim",
            "url_or_channel": "https://www.youtube.com/playlist?list=PLzMcBGfZo4-mP7qA9cagf68V06sko5otr",
            "description": "In-depth video tutorials covering beginner Python to intermediate/advanced OOP, algorithms, and practical projects.",
            "type": "Playlist",
            "language": "English",
        },
        {
            "title": "Python Playlist (Comprehensive Hindi Tutorial Series)",
            "provider": "CodeWithHarry",
            "url_or_channel": "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
            "description": "Complete 100-day Python masterclass in Hindi covering foundational programming to advanced OOP, modules, and practical mini-projects.",
            "type": "Playlist",
            "language": "Hindi",
        },
        {
            "title": "CS50P: Harvard's CS50 Introduction to Programming with Python",
            "provider": "Harvard University / David J. Malan",
            "url_or_channel": "https://cs50.harvard.edu/python/",
            "description": "Harvard's world-renowned university course on Python programming, functions, loops, exceptions, libraries, unit tests, and OOP.",
            "type": "Video Course",
            "language": "English",
        },
    ],
    "react": [
        {
            "title": "React Official Documentation",
            "provider": "React Core Team / Meta",
            "url_or_channel": "https://react.dev",
            "description": "The official interactive documentation with modern React concepts, hooks, component architecture, and best practices.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "React Full Course - Beginner to Advanced",
            "provider": "freeCodeCamp",
            "url_or_channel": "https://www.youtube.com/watch?v=bMknfKXIFA8",
            "description": "Complete modern React crash course covering components, props, useState, useEffect, context API, and real-world project builds.",
            "type": "Video Course",
            "language": "English",
        },
        {
            "title": "React Crash Course & Guided Projects",
            "provider": "Traversy Media",
            "url_or_channel": "https://www.youtube.com/c/TraversyMedia",
            "description": "Practical, step-by-step React tutorials building full-featured frontend web applications from scratch.",
            "type": "Playlist",
            "language": "English",
        },
        {
            "title": "Fireship React Guides & Modern Web Concepts",
            "provider": "Fireship",
            "url_or_channel": "https://www.youtube.com/c/Fireship",
            "description": "High-density, fast-paced guides on React hooks, performance optimization, state management, and modern frontend design.",
            "type": "Video Course",
            "language": "English",
        },
    ],
    "backend": [
        {
            "title": "FastAPI Official Documentation",
            "provider": "Sebastián Ramírez (tiangolo)",
            "url_or_channel": "https://fastapi.tiangolo.com",
            "description": "Interactive, production-ready documentation with interactive Swagger UI, Pydantic schemas, dependency injection, and async endpoints.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "Node.js Official Documentation",
            "provider": "OpenJS Foundation",
            "url_or_channel": "https://nodejs.org/en/docs",
            "description": "Complete official guide to Node.js asynchronous event-driven runtime, core modules, streams, and HTTP servers.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "Backend API Masterclass (FastAPI / Microservices)",
            "provider": "Amigoscode",
            "url_or_channel": "https://www.youtube.com/c/amigoscode",
            "description": "Production-grade backend software engineering guides covering REST APIs, database persistence, and Docker deployments.",
            "type": "Playlist",
            "language": "English",
        },
        {
            "title": "FastAPI & Python Backend API Masterclass",
            "provider": "freeCodeCamp",
            "url_or_channel": "https://www.youtube.com/watch?v=0sOvCWFmrtA",
            "description": "End-to-end backend engineering course covering relational databases (PostgreSQL/SQLAlchemy), JWT authentication, and deployment.",
            "type": "Video Course",
            "language": "English",
        },
    ],
    "dsa": [
        {
            "title": "NeetCode Roadmap & DSA Masterclass",
            "provider": "NeetCode",
            "url_or_channel": "https://neetcode.io",
            "description": "Curated problem patterns (NeetCode 150), clean video explanations, and visual breakdown of data structures and algorithms.",
            "type": "Playlist",
            "language": "English",
        },
        {
            "title": "CS50x: Introduction to Computer Science",
            "provider": "Harvard University / David J. Malan",
            "url_or_channel": "https://cs50.harvard.edu/x/",
            "description": "The gold standard university introduction to computer science, algorithmic thinking, data structures, memory, and computational problem solving.",
            "type": "Video Course",
            "language": "English",
        },
        {
            "title": "Data Structures and Algorithms in Python / JavaScript",
            "provider": "freeCodeCamp",
            "url_or_channel": "https://www.youtube.com/watch?v=pkYVOmU3MgA",
            "description": "Full course covering Big O notation, arrays, linked lists, trees, graphs, sorting, and dynamic programming.",
            "type": "Video Course",
            "language": "English",
        },
    ],
    "devops": [
        {
            "title": "Docker Official Documentation",
            "provider": "Docker Inc.",
            "url_or_channel": "https://docs.docker.com",
            "description": "The authoritative guide to containerization, Dockerfiles, Compose multi-container setups, and networking.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "Kubernetes Official Documentation",
            "provider": "Cloud Native Computing Foundation (CNCF)",
            "url_or_channel": "https://kubernetes.io/docs/",
            "description": "Comprehensive documentation for container orchestration, Pods, Deployments, Services, Ingress, and cluster architecture.",
            "type": "Official Docs",
            "language": "English",
        },
        {
            "title": "Docker & Kubernetes Complete Bootcamp",
            "provider": "TechWorld with Nana",
            "url_or_channel": "https://www.youtube.com/c/TechWorldwithNana",
            "description": "Renowned visual tutorials on Docker, Kubernetes, CI/CD pipelines, DevOps workflows, and infrastructure management.",
            "type": "Playlist",
            "language": "English",
        },
    ],
}

# Domain keyword mappings for robust topic classification
TRACK_KEYWORDS: dict[str, list[str]] = {
    "python": [
        "python",
        "oop",
        "object-oriented",
        "object oriented",
        "design patterns",
        "django",
        "flask",
        "pytest",
        "pandas",
        "numpy",
    ],
    "react": [
        "react",
        "frontend",
        "front end",
        "next.js",
        "nextjs",
        "javascript",
        "typescript",
        "ui",
        "hooks",
        "tailwind",
        "css",
        "html",
    ],
    "backend": [
        "backend",
        "back end",
        "fastapi",
        "node",
        "nodejs",
        "express",
        "api",
        "apis",
        "rest",
        "restful",
        "graphql",
        "microservices",
        "sql",
        "postgres",
        "postgresql",
    ],
    "dsa": [
        "dsa",
        "data structures",
        "algorithms",
        "algorithm",
        "leetcode",
        "neetcode",
        "cs50",
        "sorting",
        "trees",
        "graphs",
        "binary search",
        "dynamic programming",
    ],
    "devops": [
        "devops",
        "cloud",
        "docker",
        "kubernetes",
        "k8s",
        "container",
        "containers",
        "ci/cd",
        "linux",
        "aws",
        "terraform",
        "infrastructure",
    ],
}


def _match_track(topic: str) -> str:
    """Infer the primary developer track from a topic or query string."""
    t = topic.lower()

    # Direct track key check
    if t in TRUSTED_RESOURCES:
        return t

    # Check track keywords with scoring
    scores: dict[str, int] = {k: 0 for k in TRUSTED_RESOURCES}
    for track, keywords in TRACK_KEYWORDS.items():
        for kw in keywords:
            if kw in t:
                # Give higher weight to exact word match
                scores[track] += 2 if f" {kw} " in f" {t} " else 1

    best_track = max(scores, key=lambda k: scores[k])
    if scores[best_track] > 0:
        return best_track

    # Default to python if cannot determine
    return "python"


def get_trusted_resources_for_topic(
    topic: str,
    language: str | None = None,
) -> list[dict[str, str]]:
    """Retrieve curated trusted public learning resources for a topic or developer track.

    Args:
        topic: The technical domain, language, or concept (e.g. 'python', 'react', 'fastapi', 'devops', 'dsa').
        language: Optional language preference (e.g. 'Hindi', 'English'). If specified or if the
                  query references Hindi, Hindi resources are prioritized or highlighted.

    Returns:
        List of structured resource dictionaries with:
        - title: Name of the resource or playlist
        - provider: Platform or instructor name
        - url_or_channel: Direct URL or channel identifier
        - description: High-level overview of curriculum content
        - type: 'Playlist', 'Official Docs', or 'Video Course'
    """
    track = _match_track(topic)
    raw_resources = TRUSTED_RESOURCES.get(track, TRUSTED_RESOURCES["python"])

    # Determine language preference
    wants_hindi = False
    if language and "hindi" in language.lower():
        wants_hindi = True
    elif "hindi" in topic.lower():
        wants_hindi = True

    results: list[dict[str, str]] = []

    # Sort/prioritize according to language preference
    sorted_resources = list(raw_resources)
    if wants_hindi:
        sorted_resources.sort(key=lambda r: 0 if r.get("language") == "Hindi" else 1)
    else:
        # English first, Hindi supplementary
        sorted_resources.sort(key=lambda r: 0 if r.get("language") == "English" else 1)

    for r in sorted_resources:
        results.append({
            "title": r["title"],
            "provider": r["provider"],
            "url_or_channel": r["url_or_channel"],
            "description": r["description"],
            "type": r["type"],
        })

    return results
