"""Test suite for Technea AI Mentor 5 Core Intent Categories & System Prompt Guardrails.

Verifies:
1. Category 1: Casual conversation (INTENT_CASUAL, INTENT_GREETING)
2. Category 2: Simple questions (INTENT_SIMPLE_QUESTION)
3. Category 3: Learning questions (INTENT_LEARNING_QUESTION, INTENT_ROADMAP_REQUEST, INTENT_NEXT_STEP, INTENT_DAILY_GOAL, INTENT_WEEKLY_PLAN, INTENT_REVISION)
4. Category 4: Coding/architecture questions (INTENT_CODING_ARCHITECTURE, INTENT_CODE_HELP, INTENT_PROJECT_SUGGESTION)
5. Category 5: Career guidance (INTENT_CAREER_ADVICE, INTENT_INTERVIEW_PREP)
6. TECHNEA_MENTOR_SYSTEM_PROMPT intent-calibrated instructions and constraints.
"""

import pytest
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODING_ARCHITECTURE,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_LEARNING_QUESTION,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_SUGGESTION,
    INTENT_REVISION,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_WEEKLY_PLAN,
    TECHNEA_MENTOR_SYSTEM_PROMPT,
    classify_intent,
)


def test_string_constants_compatibility():
    """Verify all required string constants are defined and backwards-compatible."""
    assert INTENT_SIMPLE_QUESTION == "simple_question"
    assert INTENT_CODING_ARCHITECTURE == "coding_architecture"
    assert INTENT_LEARNING_QUESTION == "learning_question"
    assert INTENT_LEARNING_ADVICE == "learning_advice"
    assert INTENT_LEARNING_QUESTION == INTENT_LEARNING_ADVICE
    assert INTENT_CODE_HELP == "code_help"
    assert INTENT_CODING_HELP == "coding_help"
    assert INTENT_CODE_HELP == INTENT_CODING_HELP
    assert INTENT_GREETING == "greeting"
    assert INTENT_CASUAL == "casual"
    assert INTENT_DAILY_GOAL == "daily_goal"
    assert INTENT_WEEKLY_PLAN == "weekly_plan"
    assert INTENT_REVISION == "revision"
    assert INTENT_INTERVIEW_PREP == "interview_prep"
    assert INTENT_ROADMAP_REQUEST == "roadmap_request"
    assert INTENT_NEXT_STEP == "next_step_recommendation"
    assert INTENT_PROJECT_SUGGESTION == "project_suggestion"
    assert INTENT_CAREER_ADVICE == "career_advice"


def test_category_1_casual_conversation():
    """Category 1: Casual conversation (INTENT_CASUAL, INTENT_GREETING)."""
    # Greetings
    greetings = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good evening",
        "good afternoon",
        "yo",
        "sup",
        "hey there",
        "just saying hello",
        "say hey",
        "say hello",
        "say hey back",
        "dont say anything just say hey back",
        "hey dont say anything just say hey back",
        "just say hey",
    ]
    for msg in greetings:
        assert classify_intent(msg) == INTENT_GREETING, f"Expected greeting for {msg!r}"

    # Gratitude
    gratitude = [
        "thanks",
        "thank you",
        "thx",
        "appreciate it",
        "many thanks",
    ]
    for msg in gratitude:
        assert classify_intent(msg) == INTENT_CASUAL, f"Expected casual for {msg!r}"

    # Politeness & small talk
    small_talk = [
        "how are you",
        "how's it going",
        "what's up",
        "who are you",
        "what can you do",
        "are you an ai",
        "nice to meet you",
    ]
    for msg in small_talk:
        assert classify_intent(msg) == INTENT_CASUAL, f"Expected casual for {msg!r}"

    # Acknowledgments
    acknowledgments = [
        "ok",
        "cool",
        "awesome",
        "great",
        "got it",
        "understood",
        "bye",
        "goodbye",
        "see you",
    ]
    for msg in acknowledgments:
        assert classify_intent(msg) == INTENT_CASUAL, f"Expected casual for {msg!r}"

    # Short non-technical conversational inputs (<= 4 words with no programming keywords)
    assert classify_intent("sounds good") == INTENT_CASUAL
    assert classify_intent("tell me a joke") == INTENT_CASUAL
    assert classify_intent("i am tired") == INTENT_CASUAL


def test_category_2_simple_questions():
    """Category 2: Simple questions (INTENT_SIMPLE_QUESTION)."""
    simple_questions = [
        "what is python",
        "what is react",
        "what is an api",
        "what is docker",
        "what does html stand for",
        "who created linux",
        "what is a variable",
        "what is git",
        "what is sql",
        "what is rest",
        "what is fastapi",
    ]
    for q in simple_questions:
        assert classify_intent(q) == INTENT_SIMPLE_QUESTION, f"Expected simple_question for {q!r}"


def test_category_3_learning_questions():
    """Category 3: Learning questions (INTENT_LEARNING_QUESTION, INTENT_ROADMAP_REQUEST, etc.)."""
    assert classify_intent("how do I learn Python?") == INTENT_LEARNING_QUESTION
    assert classify_intent("how to learn web development") == INTENT_LEARNING_QUESTION
    assert classify_intent("how to start coding") == INTENT_LEARNING_QUESTION
    assert classify_intent("where should I start") == INTENT_NEXT_STEP
    assert classify_intent("what should I focus on next") == INTENT_NEXT_STEP
    assert classify_intent("give me a roadmap") == INTENT_ROADMAP_REQUEST
    assert classify_intent("study plan") == INTENT_ROADMAP_REQUEST
    assert classify_intent("what to learn after html css") == INTENT_NEXT_STEP


def test_category_4_coding_architecture_questions():
    """Category 4: Coding/architecture questions (INTENT_CODING_ARCHITECTURE, INTENT_CODE_HELP, INTENT_PROJECT_SUGGESTION)."""
    assert classify_intent("explain React hooks") in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert classify_intent("build me a backend architecture") == INTENT_CODING_ARCHITECTURE
    assert classify_intent("how to implement JWT authentication") in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert classify_intent("explain recursion with an example") in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert classify_intent("debug this error") in (INTENT_CODE_HELP, INTENT_CODING_HELP)
    assert classify_intent("system design for microservices") == INTENT_CODING_ARCHITECTURE
    assert classify_intent("how does async work in Python") in (INTENT_CODE_HELP, INTENT_CODING_HELP)


def test_category_5_career_guidance():
    """Category 5: Career guidance (INTENT_CAREER_ADVICE, INTENT_INTERVIEW_PREP)."""
    assert classify_intent("how to get a junior developer job") == INTENT_CAREER_ADVICE
    assert classify_intent("how to prepare for technical interviews") == INTENT_CAREER_ADVICE
    assert classify_intent("career path") == INTENT_CAREER_ADVICE
    assert classify_intent("salary expectations for frontend developer") == INTENT_CAREER_ADVICE
    assert classify_intent("resume tips") == INTENT_CAREER_ADVICE


def test_system_prompt_instructions():
    """Verify TECHNEA_MENTOR_SYSTEM_PROMPT contains the exact required instructions."""
    p = TECHNEA_MENTOR_SYSTEM_PROMPT

    required_phrases = [
        "Do not provide technical architecture explanations unless the user asks a technical question.",
        "Match response length to user intent.",
        "Simple greetings require simple greetings. When a user says 'hey' or 'hello', reply with a warm, short greeting like 'Hey {Name} 👋' or 'Hey 👋'. Do not output headings or long paragraphs.",
        "If the user gives a conversational constraint (e.g. 'dont say anything just say hey back'), obey it directly and reply with just the requested friendly greeting ('Hey! 👋' or 'Hey back! 👋').",
        "Never force Technea resources into casual conversations.",
        "Do not mention roadmap/resources unless relevant.",
        "Avoid: Unnecessary headings, generic software architecture templates, code examples for unrelated questions, random resource recommendations, long explanations for one-line messages.",
        "For technical questions: Provide Concept, Explanation, Examples, Resources, Projects.",
        "For casual questions: Be human.",
    ]

    for phrase in required_phrases:
        assert phrase in p, f"Missing required instruction in system prompt:\n{phrase}"
