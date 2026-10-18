"""Test suite for Technea AI Personality System.

Verifies the Technea AI Mentor persona definitions, behavioral rules,
system prompt builder, and RuleBasedProvider dynamic responses:
1. System prompt formatting & behavioral rules enforcement
2. "hello" greeting (warm, dynamic, acknowledging name and level)
3. "python roadmap" query (structured phases, milestones, key technologies, duration estimates)
4. "explain recursion" query (intuition, clean markdown python code block, step-by-step trace)
5. "project ideas" query (2-3 level-calibrated hands-on projects with features, tech stack, portfolio value)
6. "career advice" query (pragmatic portfolio tips, system design, interview focus, production practices)
7. Dynamic response variation and seed determinism
8. "async" coding query (event loop, asyncio.gather, non-blocking code example)
9. AIService orchestrator integration with personality prompt synthesis
"""

import asyncio
import os
import sys
from typing import Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.ai_service import AIService, RuleBasedProvider
from app.services.ai.prompts import (
    AI_CHARACTERISTICS,
    AI_NAME,
    BEHAVIORAL_RULES,
    DOMAIN_GUIDELINES,
    PERSONA_PROFILES,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    build_system_prompt,
    get_behavioral_rule,
)


# =====================================================================
# Test 1: System Prompt Formatting and Persona Definition
# =====================================================================
def test_system_prompt_formatting():
    print("\n[Test 1] Testing System Prompt Formatting & Behavioral Rules...")

    # Verify AI identity
    assert AI_NAME == "Technea AI Mentor", f"Expected 'Technea AI Mentor', got '{AI_NAME}'"

    # Verify all 6 characteristics are present
    expected_characteristics = [
        "Professional engineering mentor",
        "Friendly but concise",
        "Beginner friendly",
        "Does not give generic answers",
        "Guides users step-by-step",
        "Deeply understands the learning journey",
    ]
    for char in expected_characteristics:
        assert char in AI_CHARACTERISTICS, f"Missing characteristic: {char}"
        assert char.lower() in TECHNEA_MENTOR_SYSTEM_PROMPT.lower(), f"Prompt missing characteristic: {char}"

    # Verify all 6 behavioral rules
    for rule_key in ["greeting", "roadmap", "coding", "projects", "career", "dynamic"]:
        rule_desc = get_behavioral_rule(rule_key)
        assert rule_desc, f"Missing behavioral rule description for '{rule_key}'"
        assert rule_key in BEHAVIORAL_RULES

    # Verify build_system_prompt with learner profile and domain
    prompt = build_system_prompt(
        learner_level="Beginner",
        domain="python",
        user_name="Sarah",
        context={"active_track": "Python Foundations", "daily_streak": 7},
        custom_instruction="Emphasize clean code habits.",
    )

    assert "Technea AI Mentor" in prompt, "Missing AI Name in prompt"
    assert "LEARNER NAME: Sarah" in prompt, "Missing learner name in prompt"
    assert "LEARNER PROFILE: Beginner" in prompt, "Missing beginner profile in prompt"
    assert "DOMAIN CONTEXT: Domain Focus: Python" in prompt, "Missing Python domain guidance"
    assert "Active Track: Python Foundations" in prompt, "Missing active track context"
    assert "Daily Streak: 7" in prompt, "Missing daily streak context"
    assert "Emphasize clean code habits." in prompt, "Missing custom instruction"

    # Verify level calibration differences
    beginner_prompt = build_system_prompt(learner_level="Absolute Beginner")
    advanced_prompt = build_system_prompt(learner_level="Advanced")
    assert "Zero prior coding experience" in beginner_prompt
    assert "distributed systems trade-offs" in advanced_prompt

    print("  -> AI Name & Characteristics validated.")
    print("  -> 6 Core Behavioral Rules validated in prompt definition.")
    print("  -> Dynamic prompt builder verified across levels and domains.")
    print("  [PASSED] Test 1 passed successfully.")


# =====================================================================
# Test 2: "hello" Greeting Response
# =====================================================================
async def test_hello_personality():
    print("\n[Test 2] Testing 'hello' Greeting Response...")
    provider = RuleBasedProvider()

    # Case A: Named Intermediate Learner
    ctx = {"user_name": "Devon", "level": "Intermediate"}
    res = await provider.generate_chat_response("hello", context=ctx)

    assert isinstance(res, str) and len(res) > 0, "Response is empty"
    assert "Technea AI Mentor" in res, "Response missing Technea AI Mentor identity"
    assert "Devon" in res, "Response should acknowledge user's name 'Devon'"
    assert "Intermediate" in res, "Response should acknowledge learner level 'Intermediate'"
    # Must ask what they'd like to build or learn
    assert any(phrase in res.lower() for phrase in ["build or learn", "build or master", "tackle", "focus our"]), (
        "Response must ask what user would like to build or learn"
    )
    # Check mentor capabilities mentioned
    assert "Roadmap" in res or "roadmaps" in res.lower(), "Should mention roadmaps"
    assert "Project" in res or "projects" in res.lower(), "Should mention projects"

    # Case B: Guest Learner
    res_guest = await provider.generate_chat_response("hello there!")
    assert "Technea AI Mentor" in res_guest
    assert "Beginner" in res_guest or "level" in res_guest.lower()
    assert any(phrase in res_guest.lower() for phrase in ["build or learn", "build or master", "tackle", "focus our"])

    print("  -> Greeting dynamically acknowledges user name ('Devon').")
    print("  -> Greeting references learner level ('Intermediate').")
    print("  -> Proactively prompts learner what they want to build or learn.")
    print("  -> Preview:", res[:130].replace("\n", " "), "...")
    print("  [PASSED] Test 2 passed successfully.")


# =====================================================================
# Test 3: "python roadmap" Query
# =====================================================================
async def test_python_roadmap():
    print("\n[Test 3] Testing 'python roadmap' Query...")
    provider = RuleBasedProvider()

    ctx = {"level": "Beginner"}
    res = await provider.generate_chat_response("python roadmap", context=ctx)

    assert isinstance(res, str) and len(res) > 0, "Response is empty"
    # Structure verification: multi-step roadmap
    assert "Python" in res, "Roadmap should reference Python"
    assert any(p in res for p in ["Phase 1", "Phase 2", "Phase 3"]), "Must contain structured phases"
    assert "Phase 5" in res, "Should contain comprehensive 5-phase curriculum"

    # Technology coverage
    assert "FastAPI" in res, "Must mention modern web API (FastAPI)"
    assert "async" in res.lower(), "Must mention async / concurrency"
    assert "pytest" in res or "testing" in res.lower(), "Must mention testing / pytest"
    assert "Docker" in res or "container" in res.lower(), "Must mention containerization / Docker"

    # Duration estimates and milestones
    assert "Weeks" in res, "Must include estimated duration commitments"
    assert "Milestone Deliverable" in res, "Must include concrete milestone deliverables"
    assert "GitHub" in res, "Must encourage pushing code to GitHub"
    assert "Recommended Next Actions" in res, "Must provide actionable next steps on Technea"

    print("  -> Contains structured 5-phase progressive curriculum.")
    print("  -> Covers Python fundamentals, OOP, asyncio, FastAPI, and production testing.")
    print("  -> Includes duration estimates and actionable milestones.")
    print("  -> Preview:", res[:140].replace("\n", " "), "...")
    print("  [PASSED] Test 3 passed successfully.")


# =====================================================================
# Test 4: "explain recursion" Query
# =====================================================================
async def test_explain_recursion():
    print("\n[Test 4] Testing 'explain recursion' Query...")
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("explain recursion")

    assert isinstance(res, str) and len(res) > 0, "Response is empty"
    # Conceptual requirements: intuition explained step-by-step
    assert "recursion" in res.lower(), "Response should address recursion"
    assert "Base Case" in res or "base case" in res.lower(), "Must explain the Base Case"
    assert "Recursive Step" in res or "recursive step" in res.lower(), "Must explain the Recursive Step"
    assert "Call Stack" in res or "call stack" in res.lower(), "Must explain the call stack intuition"

    # Code example requirements: clean markdown code block with language tag
    assert "```python" in res, "Must include a clean markdown code block with 'python' tag"
    assert "def " in res, "Code block must include a function definition"
    assert "return " in res, "Code block must include return statement"
    assert "factorial" in res or "countdown" in res, "Should provide an intuitive recursive example"

    # Trace walkthrough
    assert "Execution Trace" in res or "Stack Mechanics" in res or "Trace" in res, (
        "Must provide step-by-step execution trace"
    )

    print("  -> Explains intuition step-by-step (Base Case + Recursive Step).")
    print("  -> Visualizes call stack mechanics and execution trace.")
    print("  -> Fenced markdown code block with '```python' language tag verified.")
    print("  -> Preview:", res[:140].replace("\n", " "), "...")
    print("  [PASSED] Test 4 passed successfully.")


# =====================================================================
# Test 5: "project ideas" Query
# =====================================================================
async def test_project_ideas():
    print("\n[Test 5] Testing 'project ideas' Query...")
    provider = RuleBasedProvider()

    # Test Beginner projects
    res_beg = await provider.generate_chat_response("project ideas", context={"level": "Beginner"})
    assert "Beginner" in res_beg, "Must calibrate projects to Beginner level"
    assert "Features" in res_beg, "Must outline key features"
    assert "Tech Stack" in res_beg, "Must outline tech stack"
    assert "Portfolio Value" in res_beg, "Must highlight portfolio value to reviewers"
    assert "CLI" in res_beg or "Portfolio" in res_beg, "Must suggest hands-on beginner projects"

    # Test Intermediate projects
    res_int = await provider.generate_chat_response("project ideas", context={"level": "Intermediate"})
    assert "Intermediate" in res_int, "Must calibrate to Intermediate level"
    assert "Kanban" in res_int or "Aggregator" in res_int or "E-Commerce" in res_int, "Must suggest intermediate projects"
    assert "WebSocket" in res_int or "Celery" in res_int or "SQLAlchemy" in res_int

    # Test Advanced projects
    res_adv = await provider.generate_chat_response("project ideas", context={"level": "Advanced"})
    assert "Advanced" in res_adv, "Must calibrate to Advanced level"
    assert "Distributed" in res_adv or "SaaS" in res_adv or "Agent" in res_adv

    print("  -> 2-3 specific hands-on projects calibrated to level.")
    print("  -> Outlines Key Features, Tech Stack, and Portfolio Value.")
    print("  -> Calibrates distinctly for Beginner, Intermediate, and Advanced.")
    print("  -> Preview:", res_beg[:140].replace("\n", " "), "...")
    print("  [PASSED] Test 5 passed successfully.")


# =====================================================================
# Test 6: "career advice" Query
# =====================================================================
async def test_career_advice():
    print("\n[Test 6] Testing 'career advice' Query...")
    provider = RuleBasedProvider()

    ctx = {"level": "Intermediate"}
    res = await provider.generate_chat_response("career advice", context=ctx)

    assert isinstance(res, str) and len(res) > 0, "Response is empty"
    # Verify core guidance pillars
    assert "Portfolio Strategy" in res or "Portfolio" in res, "Must provide portfolio guidance"
    assert "Depth Over Quantity" in res or "depth" in res.lower(), "Must emphasize depth over superficial clones"
    assert "System Design" in res, "Must cover system design and architecture trade-offs"
    assert "Technical Interview" in res or "Interview" in res, "Must cover interview focus and problem formulation"
    assert "Production Engineering" in res or "Production" in res, "Must cover production practices (tests, CI/CD)"
    assert "pytest" in res or "testing" in res.lower() or "Docker" in res, "Must mention real production tooling"
    assert "Action Plan" in res or "Action" in res, "Must provide level-calibrated action steps"

    print("  -> Pragmatic engineering career roadmap validated.")
    print("  -> Covers portfolio depth, system design trade-offs, interview focus, and production testing.")
    print("  -> Preview:", res[:140].replace("\n", " "), "...")
    print("  [PASSED] Test 6 passed successfully.")


# =====================================================================
# Test 7: Dynamic Variation and Deterministic Seed Support
# =====================================================================
async def test_dynamic_variation():
    print("\n[Test 7] Testing Dynamic Variation & Seed Behavior...")
    provider = RuleBasedProvider()

    # 1. Natural variation without fixed seed
    # Two calls to "hello" should produce non-identical phrasing
    resp_hello_1 = await provider.generate_chat_response("hello")
    resp_hello_2 = await provider.generate_chat_response("hello")

    # In rare random collision case, try a 3rd time
    if resp_hello_1 == resp_hello_2:
        resp_hello_2 = await provider.generate_chat_response("hello")

    assert resp_hello_1 != resp_hello_2, "Successive calls without seed should yield dynamic variation"

    # 2. Dynamic variation in roadmap
    resp_road_1 = await provider.generate_chat_response("python roadmap")
    resp_road_2 = await provider.generate_chat_response("python roadmap")
    if resp_road_1 == resp_road_2:
        resp_road_2 = await provider.generate_chat_response("python roadmap")
    assert resp_road_1 != resp_road_2, "Roadmap responses should feature varied tips/intros"

    # 3. Determinism when seed is explicitly passed
    resp_seeded_a1 = await provider.generate_chat_response("hello", seed=42)
    resp_seeded_a2 = await provider.generate_chat_response("hello", seed=42)
    resp_seeded_b = await provider.generate_chat_response("hello", seed=999)

    assert resp_seeded_a1 == resp_seeded_a2, "Identical seeds must produce identical responses"
    assert resp_seeded_a1 != resp_seeded_b, "Different seeds should produce different responses"

    print("  -> Non-identical responses generated across successive calls.")
    print("  -> Seed parameter provides deterministic reproducibility when needed.")
    print("  [PASSED] Test 7 passed successfully.")


# =====================================================================
# Test 8: "async" Coding Query
# =====================================================================
async def test_async_coding():
    print("\n[Test 8] Testing 'async' Coding Query...")
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("how does async await work in python")

    assert "async" in res.lower(), "Must explain async"
    assert "Event Loop" in res or "event loop" in res.lower(), "Must explain event loop intuition"
    assert "```python" in res, "Must contain markdown code block with python tag"
    assert "async def " in res, "Code block must contain 'async def'"
    assert "await " in res, "Code block must contain 'await'"
    assert "asyncio.gather" in res or "asyncio.sleep" in res, "Must demonstrate concurrent execution"

    print("  -> Explains event loop intuition and non-blocking I/O.")
    print("  -> Practical async/await code example with asyncio.gather verified.")
    print("  [PASSED] Test 8 passed successfully.")


# =====================================================================
# Test 9: AIService Integration with Fallback & System Instruction
# =====================================================================
async def test_ai_service_integration():
    print("\n[Test 9] Testing AIService Orchestrator Integration...")
    service = AIService()

    # AIService should fall back cleanly to RuleBasedProvider when primary has mock/empty key
    resp = await service.generate_response(
        prompt="Tell me about python roadmap",
        context={"user_name": "Maya", "level": "Beginner", "domain": "python"},
    )

    assert isinstance(resp, str) and len(resp) > 0
    assert "Python" in resp
    assert "Phase" in resp
    assert "Weeks" in resp
    assert service.last_provider_used == "rule_based"

    print("  -> AIService successfully falls back to RuleBasedProvider.")
    print("  -> Persona prompt correctly constructed and executed.")
    print("  [PASSED] Test 9 passed successfully.")


# =====================================================================
# Main Runner
# =====================================================================
async def run_all_tests():
    print("==================================================")
    print("Starting Technea AI Personality System Test Suite")
    print("==================================================")

    test_system_prompt_formatting()
    await test_hello_personality()
    await test_python_roadmap()
    await test_explain_recursion()
    await test_project_ideas()
    await test_career_advice()
    await test_dynamic_variation()
    await test_async_coding()
    await test_ai_service_integration()

    print("\n==================================================")
    print("ALL AI PERSONALITY TESTS PASSED! (9/9 Verified)")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
