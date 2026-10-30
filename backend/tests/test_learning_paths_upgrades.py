"""Comprehensive test suite verifying Learning Paths & Roadmap Steps schema, services, and API endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.db.session import async_session_maker, engine
from app.main import app
from app.models.learning_path import LearningPath
from app.models.roadmap_step import RoadmapStep
from app.schemas.learning_path import (
    LearningPathCreate,
    LearningPathPaginationResponse,
    LearningPathResponse,
    LearningPathUpdate,
)
from app.schemas.roadmap_step import RoadmapStepResponse
from app.services.learning_path import learning_path_service


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine connections are disposed cleanly per test."""
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_learning_path_and_step_schema_validation():
    """Verify Pydantic schemas serialize all new fields correctly."""
    lp_data = {
        "id": 999,
        "title": "Cloud Native Architecture",
        "slug": "cloud-native-architecture",
        "category": "Cloud & DevOps",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "is_featured": True,
        "popularity_rank": 3,
        "skills_covered": ["Kubernetes", "Docker", "Terraform", "GitOps"],
        "prerequisites": ["Linux Administration", "Networking Basics"],
        "career_outcomes": ["DevOps Architect", "Cloud Platform Engineer"],
        "technology_stack": ["Kubernetes", "Go", "Helm", "Prometheus"],
        "resources": [{"title": "Cloud Native Docs", "url": "https://cncf.io", "type": "docs"}],
        "tags": ["Cloud", "DevOps", "Kubernetes", "Platform"],
        "created_at": "2026-10-31T00:00:00Z",
        "roadmap_steps": [
            {
                "id": 1001,
                "learning_path_id": 999,
                "step_number": 1,
                "title": "Container Fundamentals",
                "description": "Master OCI container images, layers, and cgroups.",
                "topics": ["Docker", "Namespaces", "Cgroups", "BuildKit"],
                "duration": "1 week",
                "project_idea": "Build a minimal scratch container with custom runtime.",
                "resources": [{"title": "OCI Spec", "url": "https://opencontainers.org", "type": "spec"}],
                "created_at": "2026-10-31T00:00:00Z",
            }
        ],
    }

    schema = LearningPathResponse.model_validate(lp_data)
    assert schema.slug == "cloud-native-architecture"
    assert schema.is_featured is True
    assert schema.popularity_rank == 3
    assert "Kubernetes" in schema.skills_covered
    assert "Linux Administration" in schema.prerequisites
    assert "DevOps Architect" in schema.career_outcomes
    assert "Helm" in schema.technology_stack
    assert len(schema.resources) == 1
    assert len(schema.roadmap_steps) == 1

    step = schema.roadmap_steps[0]
    assert step.duration == "1 week"
    assert "Docker" in step.topics
    assert "minimal scratch container" in step.project_idea
    assert len(step.resources) == 1


@pytest.mark.asyncio
async def test_service_get_by_slug_or_id():
    """Verify service resolves by both string slug and numeric integer ID."""
    async with async_session_maker() as session:
        # Find any existing learning path
        res = await session.execute(select(LearningPath).limit(1))
        existing = res.scalars().first()
        assert existing is not None
        assert existing.slug is not None

        # 1. Resolve by numeric ID
        found_by_id = await learning_path_service.get_by_slug_or_id(session, existing.id)
        assert found_by_id is not None
        assert found_by_id.id == existing.id

        # 2. Resolve by string ID ("1")
        found_by_str_id = await learning_path_service.get_by_slug_or_id(session, str(existing.id))
        assert found_by_str_id is not None
        assert found_by_str_id.id == existing.id

        # 3. Resolve by string slug
        found_by_slug = await learning_path_service.get_by_slug_or_id(session, existing.slug)
        assert found_by_slug is not None
        assert found_by_slug.id == existing.id
        assert found_by_slug.slug == existing.slug

        # 4. Non-existent slug returns None
        not_found = await learning_path_service.get_by_slug_or_id(session, "completely-non-existent-roadmap-slug-xyz")
        assert not_found is None


@pytest.mark.asyncio
async def test_service_get_featured_and_recommended():
    """Verify service get_featured and get_recommended return roadmaps ordered properly."""
    async with async_session_maker() as session:
        featured = await learning_path_service.get_featured(session, limit=5)
        assert len(featured) > 0
        for path in featured:
            assert path.is_featured is True

        # Check ascending popularity_rank ordering
        ranks = [p.popularity_rank for p in featured if p.popularity_rank is not None]
        assert ranks == sorted(ranks)

        recommended = await learning_path_service.get_recommended(session, limit=5)
        assert len(recommended) > 0


@pytest.mark.asyncio
async def test_service_get_paginated_and_filters():
    """Verify service get_paginated calculates total, offsets, and filters properly."""
    async with async_session_maker() as session:
        # 1. Page 1 with page_size=5
        items_p1, total = await learning_path_service.get_paginated(session, page=1, page_size=5)
        assert len(items_p1) == 5
        assert total >= 200

        # 2. Page 2 with page_size=5
        items_p2, total2 = await learning_path_service.get_paginated(session, page=2, page_size=5)
        assert len(items_p2) == 5
        assert total == total2
        assert items_p1[0].id != items_p2[0].id

        # 3. Filter by category
        items_cat, total_cat = await learning_path_service.get_paginated(
            session, page=1, page_size=10, category="Programming"
        )
        assert total_cat > 0
        for item in items_cat:
            assert "programming" in item.category.lower()

        # 4. Filter by difficulty / level
        items_diff, total_diff = await learning_path_service.get_paginated(
            session, page=1, page_size=10, difficulty="Beginner"
        )
        assert total_diff > 0

        # 5. Filter by is_featured
        items_feat, total_feat = await learning_path_service.get_paginated(
            session, page=1, page_size=10, is_featured=True
        )
        assert total_feat > 0
        for item in items_feat:
            assert item.is_featured is True

        # 6. Filter by search query q
        items_q, total_q = await learning_path_service.get_paginated(
            session, page=1, page_size=10, q="python"
        )
        assert total_q > 0


@pytest.mark.asyncio
async def test_api_get_learning_paths_pagination():
    """Verify GET /api/v1/learning-paths returns paginated response with metadata."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Default request
        res = await client.get("/api/v1/learning-paths?page=1&page_size=10")
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data

        assert data["page"] == 1
        assert data["page_size"] == 10
        assert len(data["items"]) == 10
        assert data["total"] >= 200
        assert data["total_pages"] >= 20

        # Verify item contains new schema fields
        first_item = data["items"][0]
        assert "slug" in first_item
        assert "skills_covered" in first_item
        assert "prerequisites" in first_item
        assert "career_outcomes" in first_item
        assert "technology_stack" in first_item
        assert "resources" in first_item
        assert "tags" in first_item
        assert "is_featured" in first_item
        assert "popularity_rank" in first_item

        # 2. Filter by category
        res_cat = await client.get("/api/v1/learning-paths?category=Programming&page_size=5")
        assert res_cat.status_code == 200
        data_cat = res_cat.json()
        assert data_cat["total"] > 0
        for item in data_cat["items"]:
            assert "programming" in item["category"].lower()

        # 3. Filter by difficulty
        res_diff = await client.get("/api/v1/learning-paths?difficulty=Beginner&page_size=5")
        assert res_diff.status_code == 200
        data_diff = res_diff.json()
        assert data_diff["total"] > 0

        # 4. Filter by is_featured
        res_feat = await client.get("/api/v1/learning-paths?is_featured=true")
        assert res_feat.status_code == 200
        data_feat = res_feat.json()
        assert data_feat["total"] > 0
        for item in data_feat["items"]:
            assert item["is_featured"] is True

        # 5. Search query q
        res_q = await client.get("/api/v1/learning-paths?q=python")
        assert res_q.status_code == 200
        data_q = res_q.json()
        assert data_q["total"] > 0


@pytest.mark.asyncio
async def test_api_get_featured_and_recommended():
    """Verify GET /api/v1/learning-paths/featured and recommended endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Featured
        res_feat = await client.get("/api/v1/learning-paths/featured?limit=5")
        assert res_feat.status_code == 200
        featured_list = res_feat.json()
        assert isinstance(featured_list, list)
        assert len(featured_list) > 0
        for item in featured_list:
            assert item["is_featured"] is True

        # Recommended
        res_rec = await client.get("/api/v1/learning-paths/recommended?limit=5")
        assert res_rec.status_code == 200
        recommended_list = res_rec.json()
        assert isinstance(recommended_list, list)
        assert len(recommended_list) > 0


@pytest.mark.asyncio
async def test_api_get_learning_path_by_slug_or_id():
    """Verify GET /api/v1/learning-paths/{slug_or_id} resolves string slug and numeric id."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Resolve python-fundamentals by slug
        res_slug = await client.get("/api/v1/learning-paths/python-fundamentals")
        assert res_slug.status_code == 200
        data_slug = res_slug.json()
        assert data_slug["slug"] == "python-fundamentals"
        assert "roadmap_steps" in data_slug
        assert len(data_slug["roadmap_steps"]) > 0

        step = data_slug["roadmap_steps"][0]
        assert "topics" in step
        assert "duration" in step
        assert "project_idea" in step
        assert "resources" in step

        # 2. Resolve by numeric ID
        lp_id = data_slug["id"]
        res_id = await client.get(f"/api/v1/learning-paths/{lp_id}")
        assert res_id.status_code == 200
        data_id = res_id.json()
        assert data_id["id"] == lp_id
        assert data_id["slug"] == data_slug["slug"]

        # 3. Non-existent path returns 404
        res_404 = await client.get("/api/v1/learning-paths/non-existent-slug-xyz-12345")
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_api_roadmaps_catalog_backward_compatibility():
    """Verify backward compatibility of GET /api/v1/roadmaps/catalog and /catalog/{slug_or_id}."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # GET /api/v1/roadmaps/catalog returns list
        res = await client.get("/api/v1/roadmaps/catalog?limit=10")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "slug" in data[0]

        # GET /api/v1/roadmaps/catalog/python-fundamentals
        res_entry = await client.get("/api/v1/roadmaps/catalog/python-fundamentals")
        assert res_entry.status_code == 200
        data_entry = res_entry.json()
        assert data_entry["slug"] == "python-fundamentals"
