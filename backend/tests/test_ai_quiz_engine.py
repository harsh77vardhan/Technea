"""Test suite for Milestone Quiz Engine, Intent Classification, and Prompt Engineering Upgrades.

Verifies:
1. Intent Constants:
   - INTENT_GREETING, INTENT_CASUAL, INTENT_TIME_DATE, INTENT_RESOURCE_SEARCH,
   - INTENT_QUIZ, INTENT_PROJECT_RECOMMENDATION, INTENT_LEARNING_QUESTION,
   - INTENT_CODING_HELP, INTENT_DEBUGGING, INTENT_CODE_REVIEW,
   - INTENT_CAREER_GUIDANCE, INTENT_ROADMAP_PLANNING, INTENT_INTERVIEW_PREP,
   - INTENT_DAILY_GOAL, INTENT_WEEKLY_PLAN, INTENT_SIMPLE_QUESTION.
2. classify_intent upgraded behavior:
   - "date?", "time", "what is today's date?" -> strictly INTENT_TIME_DATE.
   - "python playlist", "where can i learn python" -> strictly INTENT_RESOURCE_SEARCH.
   - "quiz", "quiz me", "test my knowledge", "quiz on milestone", "ask me questions" -> strictly INTENT_QUIZ.
   - "error", "traceback", "exception", "fix this bug", "why does this fail" -> strictly INTENT_DEBUGGING.
3. TECHNEA_MENTOR_SYSTEM_PROMPT persona & strict learning output format.
4. QuizEngine generation:
   - Calibrated strictly to current milestone (OOP -> Encapsulation, Polymorphism, Factory, Strategy, SOLID).
   - Calibrated to user levels: Beginner, Intermediate, Advanced.
   - Generates 3-4 scenario-based questions with options A, B, C, D, concise explanations, and tips.
5. Python playlist query does not over-explain architecture.
"""

import pytest

from app.services.ai.ai_service import RuleBasedProvider
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CAREER_GUIDANCE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODE_REVIEW,
    INTENT_CODING_ARCHITECTURE,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_DEBUGGING,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_LEARNING_QUESTION,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_RECOMMENDATION,
    INTENT_PROJECT_SUGGESTION,
    INTENT_QUIZ,
    INTENT_RESOURCE_SEARCH,
    INTENT_REVISION,
    INTENT_ROADMAP_PLANNING,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    INTENT_WEEKLY_PLAN,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    classify_intent,
)
from app.services.ai.quiz_engine import Quiz, QuizEngine, QuizQuestion, quiz_engine


def test_all_intent_constants_defined():
    """Verify all 16 required intent constants are defined and backwards compatible."""
    assert INTENT_GREETING == "greeting"
    assert INTENT_CASUAL == "casual"
    assert INTENT_TIME_DATE == "time_date"
    assert INTENT_RESOURCE_SEARCH == "resource_search"
    assert INTENT_QUIZ == "quiz_generation"
    assert INTENT_PROJECT_RECOMMENDATION == "project_recommendation"
    assert INTENT_LEARNING_QUESTION == "learning_question"
    assert INTENT_CODING_HELP == "coding_help"
    assert INTENT_DEBUGGING == "debugging"
    assert INTENT_CODE_REVIEW == "code_review"
    assert INTENT_CAREER_GUIDANCE == "career_guidance"
    assert INTENT_ROADMAP_PLANNING == "roadmap_planning"
    assert INTENT_INTERVIEW_PREP == "interview_prep"
    assert INTENT_DAILY_GOAL == "daily_goal"
    assert INTENT_WEEKLY_PLAN == "weekly_plan"
    assert INTENT_SIMPLE_QUESTION == "simple_question"

    # Backwards compatibility checks
    assert INTENT_QUIZ == INTENT_REVISION
    assert INTENT_REVISION == "revision"
    assert INTENT_DEBUGGING in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert INTENT_CODE_REVIEW in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert INTENT_PROJECT_RECOMMENDATION == INTENT_PROJECT_SUGGESTION
    assert INTENT_CAREER_GUIDANCE == INTENT_CAREER_ADVICE
    assert INTENT_ROADMAP_PLANNING == INTENT_ROADMAP_REQUEST
    assert INTENT_LEARNING_QUESTION == INTENT_LEARNING_ADVICE


def test_classify_intent_time_date_fixes():
    """Verify 'date?', 'time', 'what is today's date?' map strictly to INTENT_TIME_DATE."""
    time_date_inputs = [
        "date?",
        "date",
        "time",
        "time?",
        "what is today's date?",
        "what is today's date",
        "what's today's date?",
        "what's today's date",
        "whats todays date?",
        "today's date",
        "current date",
        "what date is it",
        "what time is it",
        "current time",
        "what day is today",
    ]
    for inp in time_date_inputs:
        assert classify_intent(inp) == INTENT_TIME_DATE, f"Failed for {inp!r}"


def test_classify_intent_resource_search_fixes():
    """Verify 'python playlist', 'where can i learn python', etc. map strictly to INTENT_RESOURCE_SEARCH."""
    resource_inputs = [
        "python playlist",
        "where can i learn python",
        "where to learn python",
        "best tutorial for python",
        "youtube playlist for fastapi",
        "course for react",
        "docs for docker",
        "official documentation for postgresql",
        "where can i find courses for data science",
    ]
    for inp in resource_inputs:
        assert classify_intent(inp) == INTENT_RESOURCE_SEARCH, f"Failed for {inp!r}"


def test_classify_intent_quiz_fixes():
    """Verify 'quiz', 'quiz me', 'test my knowledge' map strictly to INTENT_QUIZ."""
    quiz_inputs = [
        "quiz",
        "quiz me",
        "test my knowledge",
        "quiz on milestone",
        "ask me questions",
        "quiz me on python",
        "practice quiz",
        "quiz on current milestone",
    ]
    for inp in quiz_inputs:
        res = classify_intent(inp)
        assert res == INTENT_QUIZ, f"Failed for {inp!r}"
        assert res == "quiz_generation", f"Failed string value for {inp!r}"


def test_classify_intent_debugging_fixes():
    """Verify error/traceback/bug inputs map strictly to INTENT_DEBUGGING."""
    debug_inputs = [
        "error",
        "traceback",
        "exception",
        "fix this bug",
        "why does this fail",
        "why is this failing",
        "debug this error",
        "debug this traceback",
        "syntax error in python",
    ]
    for inp in debug_inputs:
        res = classify_intent(inp)
        assert res == INTENT_DEBUGGING, f"Failed for {inp!r}"
        assert res in (INTENT_CODE_HELP, INTENT_CODING_HELP)


def test_system_prompt_rewritten_rules():
    """Verify TECHNEA_MENTOR_SYSTEM_PROMPT adheres to the required persona and strict output format."""
    p = TECHNEA_MENTOR_SYSTEM_PROMPT

    # Persona
    assert "Senior Software Engineer and Teacher Combined" in p
    # Rules
    assert "Never over-explain greetings" in p or "never over-explain greetings" in p.lower()
    assert "Answer what was asked directly" in p or "answer what was asked directly" in p.lower()
    assert "Match response length to user intent." in p
    assert "Never inject random resources" in p or "never inject random resources" in p.lower()
    assert "Never hallucinate roadmap data" in p or "never hallucinate roadmap data" in p.lower()
    assert "If information is unavailable, say so" in p or "if information is unavailable, say so" in p.lower()

    # Strict Output Format for learning questions
    assert "Strict Output Format for Learning Questions:" in p
    assert "1. Concept" in p
    assert "2. Simple explanation" in p
    assert "3. Example" in p
    assert "4. Practice" in p
    assert "5. Next step" in p
    assert "6. Relevant Technea resource" in p


def test_quiz_engine_oop_milestone():
    """Verify QuizEngine generates scenario questions strictly anchored to OOP milestone."""
    quiz = QuizEngine.generate_quiz(
        milestone="Object-Oriented Design Patterns",
        level="Intermediate",
        seed=42,
    )

    assert isinstance(quiz, Quiz)
    assert quiz.milestone == "Object-Oriented Design Patterns"
    assert quiz.difficulty == "Intermediate"
    assert 3 <= len(quiz.questions) <= 4

    # Verify key concepts covered
    concepts = [q.concept for q in quiz.questions]
    assert any("Strategy" in c or "SOLID" in c or "Liskov" in c or "Open/Closed" in c for c in concepts)

    # Verify question structure
    for q in quiz.questions:
        assert isinstance(q, QuizQuestion)
        assert len(q.scenario) > 20, "Scenario should be detailed"
        assert set(q.options.keys()) == {"A", "B", "C", "D"}
        assert q.correct_option in {"A", "B", "C", "D"}
        assert len(q.explanation) > 15
        assert "💡" in q.answering_tip

    # Verify markdown rendering
    md = quiz.to_markdown()
    assert "### 📝 Milestone Quiz: Object-Oriented Design Patterns" in md
    assert "Option" in md or "View Answer Key" in md
    assert "💡" in md


def test_quiz_engine_level_calibration():
    """Verify QuizEngine calibrates question difficulty across Beginner, Intermediate, and Advanced."""
    q_beg = QuizEngine.generate_quiz(milestone="Object-Oriented Design Patterns", level="Beginner", seed=10)
    q_adv = QuizEngine.generate_quiz(milestone="Object-Oriented Design Patterns", level="Advanced", seed=10)

    assert q_beg.difficulty == "Beginner"
    assert q_adv.difficulty == "Advanced"

    beg_concepts = [q.concept for q in q_beg.questions]
    adv_concepts = [q.concept for q in q_adv.questions]

    # Beginner covers fundamentals (Encapsulation, Polymorphism, SRP, Factory)
    assert any("Encapsulation" in c or "Polymorphism" in c or "Single Responsibility" in c for c in beg_concepts)
    # Advanced covers architecture (Abstract Factory, Observer, Decorator)
    assert any("Abstract Factory" in c or "Observer" in c or "Decorator" in c for c in adv_concepts)


@pytest.mark.asyncio
async def test_python_playlist_no_architecture_overexplain():
    """Verify 'python playlist' returns curated resources without dumping enterprise architecture."""
    provider = RuleBasedProvider()

    res = await provider.generate_chat_response("python playlist")

    # Must contain curated playlists and tutorials
    assert "Recommended Learning Resources & Playlists: Python" in res or "Python" in res
    assert "Corey Schafer" in res or "FreeCodeCamp" in res or "Official Python Tutorial" in res

    # Must NOT over-explain architecture
    assert "Separation of Concerns" not in res
    assert "Idempotency & Predictability" not in res
    assert "Defensive Engineering" not in res
    assert "API Gateway" not in res
