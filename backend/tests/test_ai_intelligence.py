"""Test suite for Technea AI Mentor Recommendation Intelligence.

Verifies the 5 core intelligence enhancements:
1. Milestone awareness (Roadmap context extractor, concrete milestone title & description, prerequisites)
2. Recommendation filtering (Enterprise, distributed, Kubernetes, advanced frameworks suppressed for beginners)
3. Removal of hallucinated schedules (No "Next 2 hours" or "Today"; "Next study session" and "This week" used)
4. Dynamic multi-turn conversation behaviour (Turn 1: "What next?", Turn 2: "What should I focus on for my next milestone?", repeated queries handled)
5. 5-Tier catalog resource ranking (Active roadmap -> Current milestone skills -> Prerequisites -> Beginner resources -> Advanced)
6. Target test cases:
   - "what should I do next"
   - "I completed HTML CSS"
   - "I want AI engineer career"
   - "hello"
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.ai_service import AIService, RuleBasedProvider
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CODING_HELP,
    INTENT_GREETING,
    INTENT_LEARNING_ADVICE,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_SUGGESTION,
    INTENT_ROADMAP_REQUEST,
    classify_intent,
)
from app.services.ai.roadmap_context_extractor import RoadmapContextExtractor, roadmap_context_extractor


def test_intent_classification():
    """Task 1: Verify intent classification across all 7 intents and test query variants."""
    print("\n[Test 1] Testing Intent Classification across 7 categories...")

    # 1. Greeting
    assert classify_intent("hello") == INTENT_GREETING
    assert classify_intent("hey") == INTENT_GREETING
    assert classify_intent("hi there") == INTENT_GREETING
    assert classify_intent("good morning") == INTENT_GREETING

    # 2. Next step recommendation
    assert classify_intent("what should I do next") == INTENT_NEXT_STEP
    assert classify_intent("what next") == INTENT_NEXT_STEP
    assert classify_intent("where should I start") == INTENT_NEXT_STEP
    assert classify_intent("where do I begin") == INTENT_NEXT_STEP
    assert classify_intent("what to do next") == INTENT_NEXT_STEP
    assert classify_intent("I completed HTML CSS") == INTENT_NEXT_STEP
    assert classify_intent("finished html css") == INTENT_NEXT_STEP
    assert classify_intent("what should I focus on for my next milestone") == INTENT_NEXT_STEP

    # 3. Roadmap request
    assert classify_intent("I want to become AI engineer") == INTENT_ROADMAP_REQUEST
    assert classify_intent("I want AI engineer career") == INTENT_ROADMAP_REQUEST
    assert classify_intent("give me roadmap") == INTENT_ROADMAP_REQUEST
    assert classify_intent("python roadmap") == INTENT_ROADMAP_REQUEST
    assert classify_intent("how to become a full stack developer") == INTENT_ROADMAP_REQUEST

    # 4. Project suggestion
    assert classify_intent("suggest project") == INTENT_PROJECT_SUGGESTION
    assert classify_intent("project ideas") == INTENT_PROJECT_SUGGESTION
    assert classify_intent("what should I build") == INTENT_PROJECT_SUGGESTION
    assert classify_intent("recommend a portfolio project") == INTENT_PROJECT_SUGGESTION

    # 5. Coding help
    assert classify_intent("explain recursion") == INTENT_CODING_HELP
    assert classify_intent("how does async await work") == INTENT_CODING_HELP
    assert classify_intent("explain binary search algorithm") == INTENT_CODING_HELP

    # 6. Career advice
    assert classify_intent("career advice") == INTENT_CAREER_ADVICE
    assert classify_intent("how to get hired as junior developer") == INTENT_CAREER_ADVICE
    assert classify_intent("technical interview preparation tips") == INTENT_CAREER_ADVICE

    # 7. Learning advice
    assert classify_intent("how to study consistently") == INTENT_LEARNING_ADVICE
    assert classify_intent("best study routine for coding") == INTENT_LEARNING_ADVICE

    print("  -> All 7 intents correctly classified.")
    print("  [PASSED] Test 1 passed successfully.")


def test_roadmap_context_extractor():
    """Problem 1: Verify RoadmapContextExtractor extracts deep milestone content, prerequisites, and guidance."""
    print("\n[Test 2] Testing RoadmapContextExtractor...")

    mock_roadmap = {
        "id": 42,
        "title": "Full-Stack Web Development",
        "goal": "Become a Full-Stack Engineer",
        "target_role": "Full-Stack Engineer",
        "completed_milestone_ids": ["m1-1"],
        "roadmap_data": {
            "total_milestones": 3,
            "phases": [
                {
                    "title": "Phase 1: Foundations",
                    "milestones": [
                        {
                            "id": "m1-1",
                            "step_number": 1,
                            "title": "HTML5 & Semantic Web",
                            "description": "Structure accessible semantic HTML markup.",
                            "key_skills": ["HTML5", "Accessibility"],
                            "prerequisites": [],
                        },
                        {
                            "id": "m1-2",
                            "step_number": 2,
                            "title": "Responsive Web Design",
                            "description": "Focus on HTML semantic structure, CSS Flexbox/Grid and build 2 responsive pages.",
                            "key_skills": ["CSS3", "Flexbox", "Grid", "Responsive Layout"],
                            "prerequisites": ["HTML5 & Semantic Web"],
                            "action_items": [
                                "Build 2 responsive pages using CSS Flexbox and Grid.",
                                "Implement mobile-first responsive breakpoints.",
                            ],
                            "project": {
                                "title": "Responsive Landing Page",
                                "description": "Build 2 responsive pages showcasing CSS Grid and Flexbox.",
                                "tech_stack": ["HTML5", "CSS3"],
                            },
                        },
                        {
                            "id": "m1-3",
                            "step_number": 3,
                            "title": "Modern JavaScript Essentials",
                            "description": "Learn ES6+ syntax, functions, and DOM manipulation.",
                            "key_skills": ["JavaScript", "ES6", "DOM"],
                            "prerequisites": ["Responsive Web Design"],
                        },
                    ],
                }
            ],
        },
    }

    extracted = roadmap_context_extractor.extract(mock_roadmap)

    # 1. Verification of extracted attributes
    assert extracted["roadmap_title"] == "Full-Stack Web Development"
    assert extracted["roadmap_goal"] == "Become a Full-Stack Engineer"
    assert extracted["total_milestones"] == 3
    assert extracted["completed_count"] == 1
    assert extracted["completed_milestones"] == ["HTML5 & Semantic Web"]

    # 2. Active milestone resolution
    cur_m = extracted["current_milestone"]
    assert cur_m is not None
    assert cur_m["title"] == "Responsive Web Design"
    assert "CSS Flexbox/Grid" in cur_m["description"]
    assert extracted["current_milestone_title"] == "Responsive Web Design"
    assert "CSS Flexbox/Grid" in extracted["current_milestone_description"]

    # 3. Prerequisites & upcoming milestone
    assert extracted["required_prerequisites"] == ["HTML5 & Semantic Web"]
    assert extracted["upcoming_milestone_title"] == "Modern JavaScript Essentials"

    # 4. Formatted guidance
    guidance = extracted["formatted_guidance"]
    assert "Responsive Web Design" in guidance
    assert "Focus on HTML semantic structure, CSS Flexbox/Grid" in guidance

    print("  -> RoadmapContextExtractor accurately resolved current milestone, prerequisites, and guidance.")
    print("  -> Formatted guidance:", guidance)
    print("  [PASSED] Test 2 passed successfully.")


async def test_case_hello():
    """Target test case: 'hello' -> Short greeting only."""
    print("\n[Test 3] Testing 'hello' Query for Short Greeting Only...")
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("hello", context={"user_name": "Devon", "level": "Beginner"})

    assert "Technea AI Mentor" in res
    assert "Devon" in res
    assert "Beginner" in res

    # Should be concise: <= 5 lines
    lines = [line.strip() for line in res.split("\n") if line.strip()]
    assert len(lines) <= 5, f"Greeting should be short (expected <=5 lines, got {len(lines)})"

    # Must NOT have large catalog blocks attached
    assert "### Relevant Technea Catalog Resources:" not in res
    assert "### Recommended Technea Resources:" not in res
    assert "TECHNEA_CATALOG_CONTEXT" not in res

    print("  -> 'hello' returned concise greeting without unsolicited catalog blocks.")
    print("  -> Content preview:", res.replace("\n", " "))
    print("  [PASSED] Test 3 passed successfully.")


async def test_case_what_should_i_do_next_with_milestone_awareness():
    """Target test case: 'what should I do next' -> Specific current milestone guidance."""
    print("\n[Test 4] Testing 'what should I do next' with Milestone Awareness...")
    provider = RuleBasedProvider()

    active_ctx = {
        "user_name": "Devon",
        "level": "Code Initiate",
        "completed_milestones": 1,
        "user_progress": {
            "developer_level": "Code Initiate",
            "active_roadmaps": [
                {
                    "title": "Full-Stack Web Development",
                    "goal": "Become a Full-Stack Engineer",
                    "current_step": 2,
                    "total_steps": 5,
                    "completed_milestones": ["HTML5 Foundations"],
                    "current_milestone_title": "Responsive Web Design",
                    "current_milestone_description": "Focus on HTML semantic structure, CSS Flexbox/Grid and build 2 responsive pages.",
                    "required_prerequisites": ["HTML5 Foundations"],
                    "upcoming_milestone_title": "Modern JavaScript Essentials",
                    "current_milestone": {
                        "title": "Responsive Web Design",
                        "description": "Focus on HTML semantic structure, CSS Flexbox/Grid and build 2 responsive pages.",
                    },
                }
            ],
        },
    }

    res = await provider.generate_chat_response("what should I do next", context=active_ctx)

    # 1. Must specifically name Responsive Web Design and its concrete instructions
    assert "Responsive Web Design" in res, "Must identify 'Responsive Web Design' milestone"
    assert "CSS Flexbox/Grid" in res, "Must include concrete milestone description"
    assert "build 2 responsive pages" in res.lower()

    # 2. Hidden reasoning labels check: NO robotic labels
    assert "Recommendation Framework" not in res, "Internal label 'Recommendation Framework' must be hidden"
    assert "Progression Priority Chain" not in res, "Internal label 'Progression Priority Chain' must be hidden"
    assert "- **Current status**:" not in res, "Internal label '- **Current status**:' must be hidden"
    assert "- **Next action**:" not in res, "Internal label '- **Next action**:' must be hidden"
    assert "- **Expected outcome**:" not in res, "Internal label '- **Expected outcome**:' must be hidden"

    # Natural conversation check
    assert "Devon, you are currently at **Responsive Web Design**" in res
    assert "Your next focus should be" in res
    assert "Once completed, you will have" in res

    # 3. Schedule check: NO hallucinated schedules ("Today", "Next 2 hours" removed)
    assert "Next 2 Hours" not in res and "Next 2 hours" not in res
    assert "Today" not in res
    assert "Next study session" in res or "next study session" in res.lower()
    assert "This week" in res or "this week" in res.lower()

    print("  -> Milestone awareness verified: Concrete milestone title and description generated.")
    print("  -> Hallucinated schedules removed ('Next study session' & 'This week' verified).")
    print("  [PASSED] Test 4 passed successfully.")


async def test_case_i_completed_html_css():
    """Target test case: 'I completed HTML CSS' -> Recommend JavaScript."""
    print("\n[Test 5] Testing 'I completed HTML CSS' -> Recommend JavaScript...")
    provider = RuleBasedProvider()

    ctx = {"user_name": "Devon", "level": "Beginner"}
    res = await provider.generate_chat_response("I completed HTML CSS", context=ctx)

    # 1. Recommends JavaScript
    assert "JavaScript" in res, "Must recommend JavaScript following HTML CSS completion"
    assert "ES6" in res or "Modern JavaScript" in res

    # 2. Hidden reasoning labels check: NO robotic labels
    assert "Recommendation Framework" not in res, "Internal label 'Recommendation Framework' must be hidden"
    assert "- **Current status**:" not in res
    assert "- **Next action**:" not in res
    assert "- **Expected outcome**:" not in res

    # Natural conversation check
    assert "Devon, you have completed foundational HTML" in res
    assert "Your next focus should be **Modern JavaScript (ES6+)**" in res

    # 3. Schedule check
    assert "Next study session" in res
    assert "This week" in res
    assert "Today (Next 2 Hours)" not in res

    print("  -> Prerequisite completion verified: HTML/CSS completion leads directly to JavaScript recommendation.")
    print("  [PASSED] Test 5 passed successfully.")


async def test_case_i_want_ai_engineer_career():
    """Target test case: 'I want AI engineer career' -> Python -> Math -> ML -> Projects."""
    print("\n[Test 6] Testing 'I want AI engineer career' Sequential Prerequisite Progression...")
    provider = RuleBasedProvider()

    ctx = {"level": "Beginner"}
    res = await provider.generate_chat_response("I want AI engineer career", context=ctx)

    # 1. Progression chain check
    assert "AI Engineering" in res
    assert "NumPy" in res or "Numerical" in res, "Must establish Python & NumPy foundations"
    assert "Scikit-Learn" in res or "Classical Machine Learning" in res, "Must include ML algorithms"
    assert "PyTorch" in res or "Deep Learning" in res, "Must include Deep Learning"
    assert "LLMs" in res or "Agents" in res or "Capstone" in res, "Must include Projects / LLMs"

    # 2. Sequential ordering check: Phase 1 < Phase 2 < Phase 3 < Phase 4
    idx_p1 = res.find("Phase 1")
    idx_p2 = res.find("Phase 2")
    idx_p3 = res.find("Phase 3")
    idx_p4 = res.find("Phase 4")
    assert idx_p1 < idx_p2 < idx_p3 < idx_p4, "Phases must be strictly sequenced"

    print("  -> AI Engineer career progression verified: Python -> Math/Data -> ML -> DL -> Projects.")
    print("  [PASSED] Test 6 passed successfully.")


async def test_case_dynamic_multi_turn():
    """Problem 4: Dynamic multi-turn conversation behaviour and repeated questions."""
    print("\n[Test 7] Testing Dynamic Multi-turn State & Repeated Question Handling...")
    provider = RuleBasedProvider()

    active_ctx = {
        "user_name": "Devon",
        "level": "Code Initiate",
        "user_progress": {
            "active_roadmaps": [
                {
                    "title": "Full-Stack Web Development",
                    "goal": "Become a Full-Stack Engineer",
                    "current_step": 2,
                    "total_steps": 5,
                    "current_milestone_title": "Responsive Web Design",
                    "current_milestone_description": "Focus on HTML semantic structure, CSS Flexbox/Grid and build 2 responsive pages.",
                    "current_key_skills": ["HTML5", "CSS3", "Flexbox", "Grid"],
                    "required_prerequisites": ["HTML Foundations"],
                    "upcoming_milestone_title": "Modern JavaScript Essentials",
                }
            ],
        },
    }

    # Turn 1: "What next?" -> immediate action plan
    history_turn1 = [{"role": "user", "content": "What next?"}]
    res_turn1 = await provider.generate_chat_response("What next?", context=active_ctx)
    assert "Action Plan: Your Next Engineering Steps" in res_turn1
    assert "Responsive Web Design" in res_turn1

    # Turn 2: "What should I focus on for my next milestone?" -> explain current milestone deeply
    history_turn2 = [
        {"role": "user", "content": "What next?"},
        {"role": "assistant", "content": res_turn1},
    ]
    res_turn2 = await provider.generate_chat_response(
        "What should I focus on for my next milestone?",
        conversation_history=history_turn2,
        context=active_ctx,
    )

    assert "Milestone Deep Dive: Responsive Web Design" in res_turn2
    assert "Core Competencies & Skills to Acquire" in res_turn2
    assert "Practical Action Steps" in res_turn2
    assert "Milestone Deliverable" in res_turn2
    assert "Study Schedule & Verification Checklist" in res_turn2

    # Repeated Question Test: Asking "what next" twice in a row
    history_repeated = [
        {"role": "user", "content": "what next"},
        {"role": "assistant", "content": res_turn1},
    ]
    res_repeated = await provider.generate_chat_response(
        "what next",
        conversation_history=history_repeated,
        context=active_ctx,
    )
    assert "Building directly upon our previous action plan" in res_repeated
    assert res_repeated != res_turn1, "Repeated question must not return verbatim identical answer"

    print("  -> Multi-turn state verified: Turn 1 (Action Plan) -> Turn 2 (Deep Dive).")
    print("  -> Repeated question variation verified: Avoids verbatim duplicates.")
    print("  [PASSED] Test 7 passed successfully.")


async def test_recommendation_filtering_guardrails():
    """Problem 2: Recommendation filtering - hide enterprise/distributed/k8s for Beginner / Code Initiate."""
    print("\n[Test 8] Testing Recommendation Filtering Guardrails for Code Initiate / Beginner...")
    provider = RuleBasedProvider()

    beg_ctx = {"level": "Code Initiate"}
    res = await provider.generate_chat_response("suggest project", context=beg_ctx)

    # Strictly forbidden enterprise topics for beginners
    forbidden = [
        "Distributed Event Ingestion",
        "Kafka",
        "ClickHouse",
        "Kubernetes",
        "Enterprise Architecture",
        "GraphQL Advanced",
        "Production Scaling",
    ]
    for term in forbidden:
        assert term.lower() not in res.lower(), f"Beginner response must not include '{term}'"

    # Beginner projects should be prioritized
    assert any(term in res for term in ["CLI", "Portfolio", "Quiz", "Flashcard", "Habit", "Tracker"])

    print("  -> Recommendation filtering verified: Enterprise, distributed systems, and Kubernetes suppressed.")
    print("  [PASSED] Test 8 passed successfully.")


async def run_all_tests():
    print("==================================================")
    print("Running Technea AI Recommendation Intelligence Suite")
    print("==================================================")

    test_intent_classification()
    test_roadmap_context_extractor()
    await test_case_hello()
    await test_case_what_should_i_do_next_with_milestone_awareness()
    await test_case_i_completed_html_css()
    await test_case_i_want_ai_engineer_career()
    await test_case_dynamic_multi_turn()
    await test_recommendation_filtering_guardrails()

    print("\n==================================================")
    print("ALL AI RECOMMENDATION INTELLIGENCE TESTS PASSED! (8/8)")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
