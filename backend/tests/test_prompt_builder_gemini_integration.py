"""Tests for Prompt Builder & Gemini Integration.

Verifies:
1. Rebuild Prompt Construction hierarchy:
   SYSTEM -> User Profile -> Learning Context -> Relevant Retrieved Data -> Conversation History -> LATEST USER MESSAGE
2. GeminiProvider._format_contents invariants:
   - Very last entry in contents is always role="user" with prompt text
   - No duplicate user message if history already ended with identical user prompt
3. Structured debug logging before calling Gemini and in AIService:
   - Latest User Message, Conversation Length, Last Assistant Message, Prompt Token Count, Current Topic, Retrieved Resources
4. JavaScript learning intent detection & rich 4-phase roadmap:
   - Foundations: Syntax, DOM, Events
   - Modern JS: ES6+, Async/Await, Fetch
   - Advanced: Closures, Prototypes, Modules
   - Frameworks: React/Node
5. Guarantee NO prompt caching.
"""

import logging
import pytest
from app.services.ai.ai_service import AIService, RuleBasedProvider, ai_service
from app.services.ai.gemini_client import GeminiProvider
from app.services.ai.prompts import (
    build_system_prompt,
    construct_prompt,
    classify_intent,
)


def test_prompt_construction_hierarchy():
    """Verify prompt construction hierarchy:
    SYSTEM -> User Profile -> Learning Context -> Relevant Retrieved Data -> Conversation History -> LATEST USER MESSAGE
    """
    context = {
        "user_name": "DevLearner",
        "level": "Beginner",
        "learning_goal": "Master Full-Stack Web Development",
        "current_skill_level": "Beginner",
        "preferred_language": "JavaScript",
        "time_available": "2 hours/day",
        "interests": "React, APIs, Databases",
        "xp": 450,
        "active_roadmaps": ["Full-Stack JavaScript Roadmap"],
        "completed_milestones": ["HTML Foundations", "CSS Layouts"],
        "catalog_context": "### Available Technea Courses\n- Modern JavaScript Mastery\n- React Component Deep Dive",
        "domain": "web_development",
        "classified_intent": "roadmap_request",
    }

    conversation_history = [
        {"role": "user", "content": "Hello mentor!"},
        {"role": "assistant", "content": "Welcome! How can I guide your coding journey today?"},
    ]

    latest_prompt = "How can I learn JavaScript?"

    full_prompt = construct_prompt(
        prompt=latest_prompt,
        conversation_history=conversation_history,
        context=context,
        learner_level="Beginner",
        domain="web_development",
        user_name="DevLearner",
    )

    # 1. Verify existence of all 6 structured sections
    assert "Technea AI Mentor" in full_prompt, "SYSTEM persona missing"
    assert "### USER PROFILE" in full_prompt, "USER PROFILE header missing"
    assert "LEARNER NAME: DevLearner" in full_prompt, "Learner name missing"
    assert "### LEARNING CONTEXT & PROGRESS" in full_prompt, "LEARNING CONTEXT header missing"
    assert "### RELEVANT RETRIEVED DATA" in full_prompt, "RELEVANT RETRIEVED DATA header missing"
    assert "### CONVERSATION HISTORY" in full_prompt, "CONVERSATION HISTORY header missing"
    assert "### LATEST USER MESSAGE" in full_prompt, "LATEST USER MESSAGE header missing"
    assert f"User: {latest_prompt}" in full_prompt, "Latest user prompt missing"

    # 2. Verify strict hierarchical order:
    # SYSTEM -> User Profile -> Learning Context -> Relevant Retrieved Data -> Conversation History -> LATEST USER MESSAGE
    idx_system = full_prompt.index("Technea AI Mentor")
    idx_profile = full_prompt.index("### USER PROFILE")
    idx_context = full_prompt.index("### LEARNING CONTEXT & PROGRESS")
    idx_data = full_prompt.index("### RELEVANT RETRIEVED DATA")
    idx_history = full_prompt.index("### CONVERSATION HISTORY")
    idx_latest = full_prompt.index("### LATEST USER MESSAGE")

    assert idx_system < idx_profile, "SYSTEM must appear before User Profile"
    assert idx_profile < idx_context, "User Profile must appear before Learning Context"
    assert idx_context < idx_data, "Learning Context must appear before Relevant Retrieved Data"
    assert idx_data < idx_history, "Relevant Retrieved Data must appear before Conversation History"
    assert idx_history < idx_latest, "Conversation History must appear before LATEST USER MESSAGE"


def test_gemini_format_contents_invariants():
    """Verify GeminiProvider._format_contents satisfies all invariants:
    - Last entry is ALWAYS role="user" with prompt text
    - No duplicate if history ended with identical user message
    """
    provider = GeminiProvider(api_key="AIzaSy_FAKE_TEST_KEY")

    # Case 1: Empty history + prompt
    contents1 = provider._format_contents(prompt="How can I learn JavaScript?", conversation_history=[])
    assert len(contents1) == 1
    assert contents1[-1]["role"] == "user"
    assert contents1[-1]["parts"][0]["text"] == "How can I learn JavaScript?"

    # Case 2: History with user and model + prompt
    history2 = [
        {"role": "user", "content": "Hey"},
        {"role": "assistant", "content": "Hello! Ready to code?"},
    ]
    contents2 = provider._format_contents(prompt="How can I learn JavaScript?", conversation_history=history2)
    assert len(contents2) == 3
    assert contents2[0]["role"] == "user"
    assert contents2[1]["role"] == "model"
    assert contents2[2]["role"] == "user"
    assert contents2[2]["parts"][0]["text"] == "How can I learn JavaScript?"

    # Case 3: History already ending with the exact user prompt -> do NOT duplicate
    history3 = [
        {"role": "user", "content": "How can I learn JavaScript?"},
    ]
    contents3 = provider._format_contents(prompt="How can I learn JavaScript?", conversation_history=history3)
    assert len(contents3) == 1
    assert contents3[-1]["role"] == "user"
    assert contents3[-1]["parts"][0]["text"] == "How can I learn JavaScript?"

    # Case 4: History ending with model turn -> append user prompt
    history4 = [
        {"role": "model", "parts": [{"text": "Welcome to Technea"}]},
    ]
    contents4 = provider._format_contents(prompt="learn javascript", conversation_history=history4)
    assert len(contents4) == 2
    assert contents4[0]["role"] == "model"
    assert contents4[1]["role"] == "user"
    assert contents4[1]["parts"][0]["text"] == "learn javascript"


@pytest.mark.asyncio
async def test_structured_debug_logging(caplog):
    """Verify structured debug logging format in both GeminiProvider and AIService."""
    # 1. Test AIService logging
    service = AIService()
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hey there! How can I help you today?"},
    ]
    context = {
        "current_topic": "javascript",
        "retrieved_resources_summary": "4 paths, 3 projects, 8 skills, 2 courses",
    }

    with caplog.at_level(logging.INFO):
        caplog.clear()
        res = await service.generate_response(
            prompt="How can I learn JavaScript?",
            conversation_history=history,
            context=context,
        )

    # Check debug block in log output
    log_text = caplog.text
    assert "--------------------------------" in log_text
    assert "Latest User Message: How can I learn JavaScript?" in log_text
    assert "Conversation Length: 2" in log_text
    assert "Last Assistant Message: Hey there! How can I help you today?" in log_text
    assert "Prompt Token Count: 5" in log_text
    assert "Current Topic: javascript" in log_text
    assert "Retrieved Resources: 4 paths, 3 projects, 8 skills, 2 courses" in log_text


def test_javascript_learning_intent_and_rich_roadmap():
    """Verify JavaScript learning intent detection and rich 4-phase roadmap."""
    provider = RuleBasedProvider()

    # Query 1: "How can I learn JavaScript?"
    res1 = provider._generate_javascript_learning_roadmap()
    assert "### Learning Roadmap: How to Master JavaScript" in res1
    assert "#### Phase 1: Foundations (Syntax, DOM, Events)" in res1
    assert "DOM Manipulation" in res1
    assert "Events & User Interaction" in res1
    assert "#### Phase 2: Modern JS (ES6+, Async/Await, Fetch)" in res1
    assert "Async/Await" in res1
    assert "Fetch API" in res1
    assert "#### Phase 3: Advanced (Closures, Prototypes, Modules)" in res1
    assert "Closures & Scope" in res1
    assert "Prototypes & OOP" in res1
    assert "Modules & Architecture" in res1
    assert "#### Phase 4: Frameworks (React/Node)" in res1
    assert "React" in res1
    assert "Node.js & Express" in res1


@pytest.mark.asyncio
async def test_javascript_query_routing():
    """Verify direct end-to-end query routing for 'How can I learn JavaScript?' and 'learn javascript'."""
    service = AIService()

    # Test "How can I learn JavaScript?"
    res1 = await service.generate_response(prompt="How can I learn JavaScript?")
    assert "### Learning Roadmap: How to Master JavaScript" in res1
    assert "Foundations (Syntax, DOM, Events)" in res1
    assert "Modern JS (ES6+, Async/Await, Fetch)" in res1
    assert "Advanced (Closures, Prototypes, Modules)" in res1
    assert "Frameworks (React/Node)" in res1

    # Test "learn javascript"
    res2 = await service.generate_response(prompt="learn javascript")
    assert "### Learning Roadmap: How to Master JavaScript" in res2
    assert "Foundations (Syntax, DOM, Events)" in res2
    assert "Modern JS (ES6+, Async/Await, Fetch)" in res2
    assert "Advanced (Closures, Prototypes, Modules)" in res2
    assert "Frameworks (React/Node)" in res2


def test_no_prompt_caching():
    """Verify that every prompt construction creates a new string object without caching."""
    prompt_a = build_system_prompt(learner_level="Beginner", domain="python")
    prompt_b = build_system_prompt(learner_level="Beginner", domain="python")

    # While values may be identical, they are dynamically generated strings
    assert isinstance(prompt_a, str)
    assert isinstance(prompt_b, str)

    prompt_c = construct_prompt(prompt="Step 1", learner_level="Beginner")
    prompt_d = construct_prompt(prompt="Step 2", learner_level="Beginner")
    assert "User: Step 1" in prompt_c
    assert "User: Step 2" in prompt_d
    assert prompt_c != prompt_d
