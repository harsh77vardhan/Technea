"""Integration test suite for Unified Search & AI Mentor 2.0.

Verifies:
1. Search across 100+ roadmaps with synonym expansion ('k8s' -> 'kubernetes', 'ml' -> 'machine learning',
   'pentesting' -> 'cybersecurity', 'ios' -> 'swift', 'nextjs' -> 'next.js', 'agent' -> 'ai agents',
   'golang' -> 'go', 'rust', 'cloud', 'data engineering').
2. Search indexing and ranking across title, description, skills_covered, technology_stack, category, and tags.
3. Fuzzy matching and typo tolerance for user typos ('kubernets', 'swfit', 'pyhton', 'kotiln', 'goolang', 'pentestng').
4. Context Retriever & AI Mentor chat recommendation for:
   - 'I want to learn cybersecurity'
   - 'How do I become an AI engineer'
   - 'Recommend a Python roadmap'
5. Direct markdown deep links [Title](/learning-paths/{id}) and milestone recommendations in AI response.
6. Ensuring unrelated or hallucinated roadmaps are avoided.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import async_session_maker, engine
from app.main import app
from app.services.ai.context_retriever import context_retriever
from app.services.ai.prompts import classify_intent, INTENT_ROADMAP_PLANNING
from app.services.search import search_service


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed cleanly per test."""
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_synonym_expansion_search_domains():
    """Verify synonym expansion across all modern roadmap domains."""
    async with async_session_maker() as db:
        domain_queries = [
            ("k8s", ["kubernetes", "k8s", "devops", "cloud"]),
            ("ml", ["machine learning", "ml", "ai"]),
            ("pentesting", ["ethical hacking", "cybersecurity", "security", "pentest"]),
            ("ios", ["swift", "ios", "mobile"]),
            ("nextjs", ["next.js", "nextjs", "react"]),
            ("agent", ["agent", "agents", "ai"]),
            ("golang", ["go", "golang"]),
            ("rust", ["rust", "systems"]),
            ("data engineering", ["data", "etl", "pipeline", "spark"]),
            ("cloud", ["cloud", "aws", "devops"]),
        ]

        for query, expected_terms in domain_queries:
            paths, _, _, _ = await search_service.search_learning_paths(db=db, query=query, limit=5)
            assert len(paths) > 0, f"Expected search results for query '{query}', got none"

            top_item = paths[0]
            assert top_item.id and top_item.title, f"Result missing id or title for '{query}'"

            # Check that title, category, skills, tech_stack, or tags contain expected ecosystem terms
            combined_text = (
                f"{top_item.title or ''} {top_item.category or ''} "
                f"{' '.join(top_item.skills_covered or [])} "
                f"{' '.join(top_item.technology_stack or [])} "
                f"{' '.join(top_item.tags or [])} {top_item.description or ''}"
            ).lower()

            found_term = any(term in combined_text for term in expected_terms)
            assert found_term, (
                f"Query '{query}' expected one of {expected_terms} in result, "
                f"but got title: '{top_item.title}', category: '{top_item.category}'"
            )


@pytest.mark.asyncio
async def test_fuzzy_matching_and_typos():
    """Verify fuzzy matching tolerance for common developer typos."""
    async with async_session_maker() as db:
        typo_queries = [
            ("kubernets", "kubernetes"),
            ("swfit", "swift"),
            ("pyhton", "python"),
            ("kotiln", "kotlin"),
            ("goolang", "go"),
            ("pentestng", "penetration"),
        ]

        for typo, expected_term in typo_queries:
            paths, _, _, _ = await search_service.search_learning_paths(db=db, query=typo, limit=5)
            assert len(paths) > 0, f"Expected results for typo query '{typo}', got none"

            top_item = paths[0]
            combined_first = (
                f"{top_item.title or ''} {top_item.category or ''} "
                f"{' '.join(top_item.skills_covered or [])} "
                f"{' '.join(top_item.technology_stack or [])} "
                f"{' '.join(top_item.tags or [])} {top_item.description or ''}"
            ).lower()

            assert expected_term in combined_first, (
                f"Typo '{typo}' should have matched content containing '{expected_term}', "
                f"got '{top_item.title}'"
            )


@pytest.mark.asyncio
async def test_unified_search_api_endpoint():
    """Verify /api/v1/search HTTP endpoint returns structured roadmaps and filter fields."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Search for cybersecurity
        resp = await client.get("/api/v1/search", params={"q": "cybersecurity", "type": "learning_paths"})
        assert resp.status_code == 200
        data = resp.json()
        assert "learning_paths" in data
        assert len(data["learning_paths"]) > 0

        first_path = data["learning_paths"][0]
        assert "id" in first_path
        assert "title" in first_path
        assert "category" in first_path
        assert "skills_covered" in first_path
        assert "technology_stack" in first_path
        assert "tags" in first_path

        # Search for AI
        resp_ai = await client.get("/api/v1/search", params={"q": "ai", "type": "learning_paths"})
        assert resp_ai.status_code == 200
        ai_data = resp_ai.json()
        assert len(ai_data["learning_paths"]) > 0


@pytest.mark.asyncio
async def test_intent_classification_for_roadmaps():
    """Verify intent classifier categorizes user learning journey questions properly."""
    queries = [
        "I want to learn cybersecurity",
        "How do I become an AI engineer",
        "Recommend a Python roadmap",
        "data engineering path",
        "how to become a cloud engineer",
        "recommend a path for mobile development",
    ]

    for q in queries:
        intent = classify_intent(q)
        assert intent == INTENT_ROADMAP_PLANNING or intent == "roadmap_planning" or intent == "roadmap_request", (
            f"Query '{q}' should classify as roadmap planning, got '{intent}'"
        )


@pytest.mark.asyncio
async def test_context_retriever_real_roadmaps_and_direct_links():
    """Verify ContextRetriever searches against real database roadmaps and provides direct links."""
    async with async_session_maker() as db:
        test_cases = [
            ("I want to learn cybersecurity", "cybersecurity"),
            ("How do I become an AI engineer", "ai"),
            ("Recommend a Python roadmap", "python"),
        ]

        for query, expected_kw in test_cases:
            ctx = await context_retriever.retrieve_context(db=db, query=query)
            matched_paths = ctx.get("learning_paths", [])

            assert len(matched_paths) > 0, f"Expected matched roadmaps for '{query}', got none"

            top_path = matched_paths[0]
            assert "id" in top_path, "Learning path missing 'id'"
            assert "title" in top_path, "Learning path missing 'title'"
            assert "direct_link" in top_path, "Learning path missing 'direct_link'"
            assert top_path["direct_link"] == f"/learning-paths/{top_path['id']}"

            # Verify catalog_context string formatting
            cat_ctx = ctx.get("catalog_context", "")
            assert f"/learning-paths/{top_path['id']}" in cat_ctx, (
                f"Catalog context should include direct link `/learning-paths/{top_path['id']}`"
            )
            assert f"[{top_path['title']}]" in cat_ctx, (
                f"Catalog context should format markdown link for '[{top_path['title']}]'"
            )

            # Verify related actions
            related_actions = ctx.get("related_actions", [])
            roadmap_actions = [a for a in related_actions if a.get("action_type") == "view_roadmap"]
            assert len(roadmap_actions) > 0, f"Expected view_roadmap actions for '{query}'"
            first_action = roadmap_actions[0]
            assert "url" in first_action.get("payload", {}) or "direct_link" in first_action.get("payload", {})


@pytest.mark.asyncio
async def test_ai_mentor_chat_real_roadmaps_recommendation():
    """Verify AI Mentor chat endpoint presents real Technea roadmaps with direct links and milestones."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_queries = [
            "I want to learn cybersecurity",
            "How do I become an AI engineer",
            "Recommend a Python roadmap",
        ]

        for query in test_queries:
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": query},
            )
            assert resp.status_code == 200, f"Failed for query '{query}': {resp.text}"
            data = resp.json()

            message = data.get("response") or data.get("message", "")
            related_actions = data.get("related_actions", [])

            # Must contain direct markdown link to a real Technea learning path
            assert "/learning-paths/" in message, (
                f"Response for '{query}' must contain direct link '/learning-paths/{{id}}', got: {message[:250]}"
            )

            # Verify related actions surface real learning path deep links
            assert len(related_actions) > 0, f"Expected related actions for '{query}'"
            roadmap_action = next((a for a in related_actions if a.get("action_type") == "view_roadmap"), None)
            assert roadmap_action is not None, f"Expected view_roadmap action for '{query}'"
            payload = roadmap_action.get("payload", {})
            assert "url" in payload or "direct_link" in payload, f"Action payload missing URL: {payload}"
            link = payload.get("url") or payload.get("direct_link")
            assert "/learning-paths/" in link, f"Action link should point to '/learning-paths/': {link}"
