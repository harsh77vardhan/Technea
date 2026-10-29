"""Comprehensive automated test suite for conversation context leakage and sequential topic switching.

Tasks covered:
1. Test 1: Exact reproduction test
   History:
     User: "what is today's date?"
     Assistant: "Today is Thursday."
   New prompt: "How can I learn JavaScript?"
   Verify:
     - Response provides JavaScript learning roadmap / curriculum.
     - Response does NOT contain "The Date Today", "Date Today", or "Mentor Insight on: The Date Today".
     - Response mentions JavaScript topics (ES6, DOM, asynchronous JS, etc.).

2. Test 2: Sequential 5-turn conversation test
   Turn 1: User: "Hi" -> Assistant response contains greeting, NOT date or coding roadmap.
   Turn 2: User: "Today's date?" -> Assistant response contains current date/day.
   Turn 3: User: "How can I learn JavaScript?" -> Assistant response contains JavaScript learning guidance/roadmap.
   Turn 4: User: "Explain closures." -> Assistant response explains closures in JavaScript, NOT date or general greeting.
   Turn 5: User: "Recommend Python playlist." -> Assistant response recommends Python resources/playlists, NOT JavaScript closures or date.
   Every answer MUST correspond strictly to the newest user message!

3. Test 3: 100 sequential conversation tests
   Run a loop of 100 sequential messages alternating through 10 distinct technical and conversational topics:
   ["what time is it?", "learn Python", "what is docker?", "explain react hooks", "quiz me on SQL",
    "give me a roadmap for go", "what day is today?", "recommend fastapi playlist", "explain recursion", "how to learn rust"]
   In every single turn:
     - The response MUST match the topic of the current turn.
     - The response MUST NOT contain key phrases or titles from the immediately preceding turn.
     - 0 context leakage, 0 repeated answers, 0 previous-topic contamination.
"""

from datetime import datetime
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.ai_service import RuleBasedProvider


# =====================================================================
# Fixtures
# =====================================================================
@pytest.fixture
def current_weekday() -> str:
    """Return current server weekday name."""
    return datetime.now().astimezone().strftime("%A")


@pytest.fixture
def current_date() -> str:
    """Return current formatted date (e.g. 'October 29, 2026')."""
    return datetime.now().astimezone().strftime("%B %d, %Y")


# =====================================================================
# Test 1: Exact Reproduction Test
# =====================================================================
@pytest.mark.asyncio
async def test_1_exact_reproduction_leakage(current_weekday: str):
    """Test 1: Exact reproduction test.

    History:
      User: "what is today's date?"
      Assistant: "Today is Thursday."
    New prompt: "How can I learn JavaScript?"

    Verify:
      - Response provides JavaScript learning roadmap / curriculum.
      - Response does NOT contain "The Date Today", "Date Today", or "Mentor Insight on: The Date Today".
      - Response mentions JavaScript topics (ES6, DOM, asynchronous JS, etc.).
    """
    provider = RuleBasedProvider()
    history = [
        {"role": "user", "content": "what is today's date?"},
        {"role": "assistant", "content": f"Today is {current_weekday}."},
    ]

    res = await provider.generate_chat_response(
        prompt="How can I learn JavaScript?",
        conversation_history=history,
    )

    # 1. Verify JavaScript learning roadmap / curriculum
    assert "JavaScript" in res or "javascript" in res.lower(), (
        f"Response did not mention JavaScript: {res[:200]}"
    )
    assert any(term in res.lower() for term in ["roadmap", "curriculum", "foundations", "weeks"]), (
        f"Response did not provide roadmap/curriculum structure: {res[:200]}"
    )

    # 2. Verify NO date contamination or leakage
    assert "The Date Today" not in res, "Found 'The Date Today' leak in response!"
    assert "Date Today" not in res, "Found 'Date Today' leak in response!"
    assert "Mentor Insight on: The Date Today" not in res, "Found 'Mentor Insight on: The Date Today' in response!"
    assert f"Today is {current_weekday}" not in res, "Found leaked day response from previous turn!"

    # 3. Verify core JavaScript topics are covered (ES6, DOM, asynchronous JS, etc.)
    res_lower = res.lower()
    assert "es6" in res_lower, "Response missing ES6 modern JavaScript topics"
    assert "dom" in res_lower, "Response missing DOM manipulation topics"
    assert any(term in res_lower for term in ["async", "asynchronous", "promises", "event loop"]), (
        "Response missing Asynchronous JavaScript topics"
    )


# =====================================================================
# Test 2: Sequential 5-Turn Conversation Test
# =====================================================================
@pytest.mark.asyncio
async def test_2_sequential_5_turn_conversation(current_weekday: str):
    """Test 2: Sequential 5-turn conversation test.

    Turn 1: User: "Hi" -> Assistant response contains greeting, NOT date or coding roadmap.
    Turn 2: User: "Today's date?" -> Assistant response contains current date/day.
    Turn 3: User: "How can I learn JavaScript?" -> Assistant response contains JavaScript learning guidance/roadmap.
    Turn 4: User: "Explain closures." -> Assistant response explains closures in JavaScript, NOT date or general greeting.
    Turn 5: User: "Recommend Python playlist." -> Assistant response recommends Python resources/playlists, NOT JavaScript closures or date.

    Every answer MUST correspond strictly to the newest user message!
    """
    provider = RuleBasedProvider()
    history: list[dict[str, str]] = []

    # -----------------------------------------------------------------
    # Turn 1: User: "Hi"
    # Verification: Contains greeting, NOT date or coding roadmap
    # -----------------------------------------------------------------
    t1_msg = "Hi"
    r1 = await provider.generate_chat_response(t1_msg, conversation_history=history)
    assert any(g in r1 for g in ["Hey", "Hi", "Hello", "welcome"]), (
        f"Turn 1 expected greeting, got: {r1}"
    )
    assert "Roadmap" not in r1, "Turn 1 leaked coding roadmap!"
    assert "Curriculum" not in r1, "Turn 1 leaked curriculum!"
    assert current_weekday not in r1, "Turn 1 leaked current day!"
    assert "server time" not in r1.lower(), "Turn 1 leaked server time!"
    history.append({"role": "user", "content": t1_msg})
    history.append({"role": "assistant", "content": r1})

    # -----------------------------------------------------------------
    # Turn 2: User: "Today's date?"
    # Verification: Contains current date/day
    # -----------------------------------------------------------------
    t2_msg = "Today's date?"
    r2 = await provider.generate_chat_response(t2_msg, conversation_history=history)
    assert current_weekday in r2 or datetime.now().astimezone().strftime("%B") in r2, (
        f"Turn 2 expected current date/day, got: {r2}"
    )
    assert "Roadmap" not in r2, "Turn 2 leaked roadmap!"
    assert "JavaScript" not in r2, "Turn 2 leaked JavaScript!"
    history.append({"role": "user", "content": t2_msg})
    history.append({"role": "assistant", "content": r2})

    # -----------------------------------------------------------------
    # Turn 3: User: "How can I learn JavaScript?"
    # Verification: Contains JavaScript learning guidance/roadmap
    # -----------------------------------------------------------------
    t3_msg = "How can I learn JavaScript?"
    r3 = await provider.generate_chat_response(t3_msg, conversation_history=history)
    assert "JavaScript" in r3 or "javascript" in r3.lower(), (
        f"Turn 3 expected JavaScript roadmap, got: {r3[:200]}"
    )
    assert any(term in r3.lower() for term in ["roadmap", "curriculum", "foundations", "weeks"]), (
        f"Turn 3 expected learning curriculum/roadmap structure, got: {r3[:200]}"
    )
    assert "The Date Today" not in r3, "Turn 3 contaminated with 'The Date Today'!"
    assert "Date Today" not in r3, "Turn 3 contaminated with 'Date Today'!"
    assert f"Today is {current_weekday}" not in r3, "Turn 3 contaminated with previous date response!"
    history.append({"role": "user", "content": t3_msg})
    history.append({"role": "assistant", "content": r3})

    # -----------------------------------------------------------------
    # Turn 4: User: "Explain closures."
    # Verification: Explains closures in JavaScript, NOT date or general greeting
    # -----------------------------------------------------------------
    t4_msg = "Explain closures."
    r4 = await provider.generate_chat_response(t4_msg, conversation_history=history)
    r4_lower = r4.lower()
    assert any(term in r4_lower for term in ["closure", "closures", "lexical scope", "outer function"]), (
        f"Turn 4 expected closure explanation, got: {r4[:200]}"
    )
    assert "javascript" in r4_lower, (
        f"Turn 4 expected JavaScript closure context, got: {r4[:200]}"
    )
    assert current_weekday not in r4, "Turn 4 contaminated with date!"
    assert "Hey 👋" not in r4, "Turn 4 contaminated with generic greeting!"
    assert "server time" not in r4_lower, "Turn 4 contaminated with server time!"
    history.append({"role": "user", "content": t4_msg})
    history.append({"role": "assistant", "content": r4})

    # -----------------------------------------------------------------
    # Turn 5: User: "Recommend Python playlist."
    # Verification: Recommends Python resources/playlists, NOT JavaScript closures or date
    # -----------------------------------------------------------------
    t5_msg = "Recommend Python playlist."
    r5 = await provider.generate_chat_response(t5_msg, conversation_history=history)
    r5_lower = r5.lower()
    assert "python" in r5_lower, (
        f"Turn 5 expected Python playlist, got: {r5[:200]}"
    )
    assert any(term in r5_lower for term in ["playlist", "playlists", "course", "video", "tutorial", "resources"]), (
        f"Turn 5 expected playlist recommendation, got: {r5[:200]}"
    )
    assert "closure" not in r5_lower, "Turn 5 contaminated with JavaScript closures from Turn 4!"
    assert current_weekday not in r5, "Turn 5 contaminated with date!"
    assert "Hey 👋" not in r5, "Turn 5 contaminated with generic greeting!"
    history.append({"role": "user", "content": t5_msg})
    history.append({"role": "assistant", "content": r5})

    assert len(history) == 10, "Conversation history must contain 5 user and 5 assistant turns."


# =====================================================================
# Test 3: 100 Sequential Conversation Tests
# =====================================================================
@pytest.mark.asyncio
async def test_3_100_sequential_conversation_turns(current_weekday: str):
    """Test 3: 100 sequential conversation tests.

    Run a loop of 100 sequential messages alternating through 10 distinct technical and conversational topics:
    [
      "what time is it?",
      "learn Python",
      "what is docker?",
      "explain react hooks",
      "quiz me on SQL",
      "give me a roadmap for go",
      "what day is today?",
      "recommend fastapi playlist",
      "explain recursion",
      "how to learn rust"
    ]

    In every single turn:
      - The response MUST match the topic of the current turn.
      - The response MUST NOT contain key phrases or titles from the immediately preceding turn.
      - 0 context leakage, 0 repeated answers, 0 previous-topic contamination.
    """
    provider = RuleBasedProvider()

    topics = [
        "what time is it?",
        "learn Python",
        "what is docker?",
        "explain react hooks",
        "quiz me on SQL",
        "give me a roadmap for go",
        "what day is today?",
        "recommend fastapi playlist",
        "explain recursion",
        "how to learn rust",
    ]

    # Topic matchers for each of the 10 topics
    topic_matchers = {
        0: lambda r: any(w in r.lower() for w in ["server time", "am", "pm", "utc", "ist", "gmt"]),
        1: lambda r: "python" in r.lower() and any(w in r.lower() for w in ["roadmap", "foundations", "syntax", "oop"]),
        2: lambda r: "docker" in r.lower() and any(w in r.lower() for w in ["container", "containers", "image", "platform"]),
        3: lambda r: "react" in r.lower() and any(w in r.lower() for w in ["hook", "usestate", "useeffect"]),
        4: lambda r: "sql" in r.lower() and any(w in r.lower() for w in ["quiz", "join", "query", "aggregat", "database"]),
        5: lambda r: any(w in r.lower() for w in ["go", "golang"]) and any(w in r.lower() for w in ["roadmap", "goroutine", "channel", "syntax", "phase"]),
        6: lambda r: f"today is {current_weekday.lower()}" in r.lower(),
        7: lambda r: "fastapi" in r.lower() and any(w in r.lower() for w in ["playlist", "resource", "backend", "documentation"]),
        8: lambda r: "recursion" in r.lower() and any(w in r.lower() for w in ["base case", "recursive", "call stack"]),
        9: lambda r: "rust" in r.lower() and any(w in r.lower() for w in ["roadmap", "cargo", "ownership", "borrowing", "systems"]),
    }

    # Distinctive keywords/phrases from the prior turn that MUST NOT leak into the next turn
    forbidden_from_prior = {
        0: ["server time", "current server time"],
        1: ["python programming", "how to master python", "pythonic idioms"],
        2: ["docker is an open-source platform", "isolated, lightweight environments called containers"],
        3: ["react hooks", "usestate", "useeffect", "functional components"],
        4: ["milestone quiz: sql", "relational database mastery", "acid properties"],
        5: ["go (golang) engineering", "goroutines", "buffered/buffered channels"],
        6: [f"today is {current_weekday.lower()}."],
        7: ["fastapi & backend", "fastapi official documentation", "sebastián ramírez"],
        8: ["demystifying recursion", "base case", "matryoshka", "recursive step"],
        9: ["rust systems programming", "ownership, borrowing & lifetimes"],
    }

    history: list[dict[str, str]] = []

    for turn in range(100):
        t_idx = turn % 10
        prompt = topics[t_idx]
        prev_idx = (turn - 1) % 10 if turn > 0 else None

        res = await provider.generate_chat_response(prompt, conversation_history=history)

        # 1. Match current turn topic
        assert topic_matchers[t_idx](res), (
            f"Turn {turn} (prompt='{prompt}') failed topic match!\n"
            f"Response preview:\n{res[:300]}"
        )

        # 2. Must not contain key phrases from previous turn (0 context leakage)
        if prev_idx is not None:
            forbidden = forbidden_from_prior[prev_idx]
            for phrase in forbidden:
                assert phrase not in res.lower(), (
                    f"Turn {turn} (prompt='{prompt}') LEAKED content from previous turn "
                    f"Turn {turn-1} (prompt='{topics[prev_idx]}')!\n"
                    f"Contaminant found: '{phrase}'\n"
                    f"Response preview:\n{res[:300]}"
                )

        # 3. Must not contain repetitive prefix (0 repeated answers)
        assert "Building directly upon our previous action plan" not in res, (
            f"Turn {turn} contained repetitive prefix 'Building directly upon our previous action plan'!"
        )

        # Accumulate conversation history across sequential turns
        history.append({"role": "user", "content": prompt})
        history.append({"role": "assistant", "content": res})

    assert len(history) == 200, "Must have exactly 100 user and 100 assistant turns recorded."
