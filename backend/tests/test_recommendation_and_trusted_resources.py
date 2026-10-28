"""Comprehensive test suite for Recommendation Engine and Trusted Public Resources Engine.

Verifies:
1. Trusted resources engine for all major developer tracks (Python, React, Backend, DSA, DevOps)
   and language preferences (Hindi prioritization for CodeWithHarry).
2. Strict Relevance Principle in RecommendationEngine:
   - When user's milestone is "Object-Oriented Design Patterns", NEVER recommend Blender,
     Business Analytics, or Cloud Security.
   - Technea resources first, trusted public resources second.
3. ContextRetriever empty keyword fallback anchors to active milestone and filters unrelated domains.
4. AI chat response for "python playlist" returns curated resources instead of generating a multi-week roadmap.
"""

import pytest
from app.services.ai.context_retriever import context_retriever
from app.services.ai.recommendation_engine import RecommendationEngine, recommendation_engine
from app.services.ai.trusted_resources import (
    TRUSTED_RESOURCES,
    get_trusted_resources_for_topic,
)
from app.services.ai.ai_service import RuleBasedProvider


def test_trusted_resources_python():
    """Verify curated Python trusted resources include all required authoritative providers."""
    resources = get_trusted_resources_for_topic("python")
    titles = [r["title"] for r in resources]
    providers = [r["provider"] for r in resources]

    # Verify all required resources
    assert any("Official Python Documentation" in t for t in titles)
    assert any("freeCodeCamp" in p for p in providers)
    assert any("Corey Schafer" in p for p in providers)
    assert any("Tech With Tim" in p for p in providers)
    assert any("CodeWithHarry" in p for p in providers)
    assert any("CS50P" in t or "David J. Malan" in p for t, p in zip(titles, providers))

    # Verify structured schema
    for r in resources:
        assert "title" in r and len(r["title"]) > 0
        assert "provider" in r and len(r["provider"]) > 0
        assert "url_or_channel" in r and len(r["url_or_channel"]) > 0
        assert "description" in r and len(r["description"]) > 0
        assert r["type"] in {"Playlist", "Official Docs", "Video Course"}


def test_trusted_resources_hindi_prioritization():
    """Verify CodeWithHarry is prioritized when Hindi is requested."""
    hindi_resources = get_trusted_resources_for_topic("python", language="Hindi")
    assert len(hindi_resources) > 0
    # CodeWithHarry should be top-ranked
    first = hindi_resources[0]
    assert first["provider"] == "CodeWithHarry"
    assert "Hindi" in first["description"] or "Hindi" in first["title"]


def test_trusted_resources_react_frontend():
    """Verify curated React / Frontend resources."""
    resources = get_trusted_resources_for_topic("react")
    titles = [r["title"] for r in resources]
    providers = [r["provider"] for r in resources]

    assert any("React Official Documentation" in t for t in titles)
    assert any("freeCodeCamp" in p for p in providers)
    assert any("Traversy Media" in p for p in providers)
    assert any("Fireship" in p for p in providers)


def test_trusted_resources_backend_apis():
    """Verify curated Backend & APIs (FastAPI / Node) resources."""
    resources = get_trusted_resources_for_topic("backend")
    titles = [r["title"] for r in resources]
    providers = [r["provider"] for r in resources]

    assert any("FastAPI" in t for t in titles)
    assert any("Node.js" in t for t in titles)
    assert any("Amigoscode" in p for p in providers)
    assert any("freeCodeCamp" in p for p in providers)


def test_trusted_resources_dsa():
    """Verify curated Data Structures & Algorithms resources."""
    resources = get_trusted_resources_for_topic("dsa")
    titles = [r["title"] for r in resources]
    providers = [r["provider"] for r in resources]

    assert any("NeetCode" in t or "NeetCode" in p for t, p in zip(titles, providers))
    assert any("CS50x" in t for t in titles)


def test_trusted_resources_devops():
    """Verify curated Cloud & DevOps resources."""
    resources = get_trusted_resources_for_topic("devops")
    titles = [r["title"] for r in resources]
    providers = [r["provider"] for r in resources]

    assert any("Docker" in t for t in titles)
    assert any("Kubernetes" in t for t in titles)
    assert any("TechWorld with Nana" in p for p in providers)


def test_strict_relevance_principle_oop_milestone():
    """Verify that when user's milestone is Object-Oriented Design Patterns:
    - NEVER recommend Blender, Business Analytics, or Cloud Security.
    - Strictly recommend current milestone, active roadmap, upcoming milestone, and matched Python project.
    - Technea resources first, trusted public resources second.
    """
    engine = RecommendationEngine()
    context = {
        "user_progress": {
            "preferred_language": "Python",
            "active_roadmaps": [{
                "id": 101,
                "title": "Python Engineering Roadmap",
                "current_step": 2,
                "total_steps": 8,
                "current_milestone_title": "Object-Oriented Design Patterns",
                "upcoming_milestone_title": "Asynchronous Python & Concurrency",
                "current_key_skills": ["Python", "OOP", "Design Patterns"],
                "current_milestone": {
                    "title": "Object-Oriented Design Patterns",
                    "project": {
                        "title": "Design Patterns Library CLI",
                        "difficulty": "Intermediate",
                        "tech_stack": ["Python", "OOP"],
                    },
                    "lessons": [
                        {
                            "title": "OOP Design Patterns Deep Dive",
                            "instructor": "Technea Master",
                            "platform": "Technea Platform",
                        }
                    ],
                },
            }],
        },
        "matched_projects": [
            {"title": "Blender 3D Modeling Fundamentals", "difficulty": "Beginner", "tech_stack": ["Blender"]},
            {"title": "Business Analytics Dashboard", "difficulty": "Beginner", "tech_stack": ["Excel"]},
            {"title": "Python Expense Tracker CLI", "difficulty": "Beginner", "tech_stack": ["Python"]},
            {"title": "Cloud Security Audit Script", "difficulty": "Intermediate", "tech_stack": ["Cloud Security"]},
        ],
        "matched_courses": [
            {"title": "Advanced Python Architecture Patterns", "platform": "Technea Platform"},
            {"title": "Blender 3D Sculpting", "platform": "Technea Platform"},
        ],
    }

    recs = engine.get_recommendations(context=context)

    action_titles = [a["title"] for a in recs["related_actions"]]
    project_titles = [p["title"] for p in recs["recommended_projects"]]
    resource_titles = [r["title"] for r in recs["recommended_resources"]]

    # 1. Unrelated domains MUST NOT appear
    for prohibited in ["Blender", "Business Analytics", "Cloud Security", "3D Modeling", "Sculpting"]:
        assert not any(prohibited in t for t in action_titles), f"Prohibited '{prohibited}' found in actions: {action_titles}"
        assert not any(prohibited in t for t in project_titles), f"Prohibited '{prohibited}' found in projects: {project_titles}"
        assert not any(prohibited in t for t in resource_titles), f"Prohibited '{prohibited}' found in resources: {resource_titles}"

    # 2. Strict Roadmap & Milestone Anchoring
    assert any("Object-Oriented Design Patterns" in t for t in action_titles)
    assert any("Python Engineering Roadmap" in t for t in action_titles)
    assert any("Asynchronous Python & Concurrency" in t for t in action_titles)

    # 3. Project Relevance
    assert any("Design Patterns Library CLI" in t for t in project_titles)
    assert any("Python Expense Tracker CLI" in t for t in project_titles)

    # 4. Technea First, Trusted Public Second
    sources = [r.get("source") for r in recs["recommended_resources"]]
    # Technea resources must precede trusted public resources
    first_public_idx = next((i for i, s in enumerate(sources) if s == "trusted_public"), None)
    last_technea_idx = max((i for i, s in enumerate(sources) if s == "technea"), default=-1)

    if first_public_idx is not None and last_technea_idx != -1:
        assert last_technea_idx < first_public_idx, "Technea resources must precede trusted public resources!"

    assert any("OOP Design Patterns Deep Dive" in t for t in resource_titles)
    assert any("Official Python Documentation" in t for t in resource_titles)


def test_anchor_keyword_extraction_fallback():
    """Verify that when query keywords are empty, ContextRetriever anchors to active milestone."""
    user_prog = {
        "preferred_language": "Python",
        "active_roadmaps": [{
            "title": "Backend Engineering",
            "current_milestone_title": "FastAPI Web Services",
            "current_key_skills": ["FastAPI", "SQLAlchemy", "Asyncio"],
        }],
    }

    anchors = context_retriever._extract_anchor_keywords(
        keywords=[],
        user_progress=user_prog,
    )

    assert "fastapi" in anchors
    assert "sqlalchemy" in anchors
    assert "asyncio" in anchors


@pytest.mark.asyncio
async def test_python_playlist_query_response():
    """Verify that asking for a Python playlist returns curated resources instead of generating a 12-week roadmap."""
    provider = RuleBasedProvider()

    resp = await provider.generate_chat_response("Can you recommend a python playlist to learn?")

    # Should NOT generate a multi-week roadmap
    assert "Weeks 1–3" not in resp
    assert "Weeks 4–6" not in resp
    assert "Weeks 7–9" not in resp

    # Should recommend trusted resources
    assert "Official Python Documentation" in resp or "docs.python.org" in resp
    assert "Corey Schafer" in resp
    assert "freeCodeCamp" in resp
    assert "Tech With Tim" in resp
    assert "CS50P" in resp or "David J. Malan" in resp
    assert "CodeWithHarry" in resp
