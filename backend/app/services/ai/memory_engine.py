"""Conversation Memory Engine for Technea AI Mentor 2.0.

Maintains conversation state and memory across turns:
1. Tracks prior user intent, assistant topic, and code context.
2. Identifies pending assistant offers or unresolved questions (e.g. "quiz or project").
3. Detects and extracts user corrections across turns (e.g. "I'm learning Python", "using FastAPI not Django").
4. Resolves single-word follow-ups and ellipsis (e.g. "why?", "explain", "quiz me", "date?").
"""

from dataclasses import dataclass, field
import logging
import re
from typing import Any

from app.services.ai.prompts import (
    INTENT_CODE_HELP,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_SUGGESTION,
    INTENT_REVISION,
    INTENT_ROADMAP_REQUEST,
    INTENT_TIME_DATE,
    classify_intent,
)

logger = logging.getLogger("technea.ai.memory_engine")


@dataclass
class ConversationMemoryState:
    """Structured representation of conversation state across multi-turn interactions."""

    previous_user_message: str | None = None
    previous_assistant_message: str | None = None
    previous_intent: str | None = None
    previous_topic: str | None = None
    previous_code_snippet: str | None = None
    pending_prompt: str | None = None
    user_corrections: dict[str, str] = field(default_factory=dict)
    resolved_message: str = ""
    resolved_intent: str | None = None
    active_topic: str | None = None
    context_updates: dict[str, Any] = field(default_factory=dict)


class MemoryEngine:
    """Manages conversational memory, user corrections, and ellipsis resolution."""

    @staticmethod
    def normalize_history(conversation_history: list[Any] | None) -> list[dict[str, str]]:
        """Normalize history items (dicts or Pydantic models) into standard role/content dicts."""
        if not conversation_history:
            return []

        normalized: list[dict[str, str]] = []
        for item in conversation_history:
            if isinstance(item, dict):
                role = str(item.get("role", "")).lower()
                content = str(item.get("content", "")).strip()
                normalized.append({"role": role, "content": content})
            elif hasattr(item, "model_dump"):
                d = item.model_dump()
                role = str(d.get("role", "")).lower()
                content = str(d.get("content", "")).strip()
                normalized.append({"role": role, "content": content})
            elif hasattr(item, "dict"):
                d = item.dict()
                role = str(d.get("role", "")).lower()
                content = str(d.get("content", "")).strip()
                normalized.append({"role": role, "content": content})
            elif hasattr(item, "role") and hasattr(item, "content"):
                normalized.append({
                    "role": str(getattr(item, "role", "")).lower(),
                    "content": str(getattr(item, "content", "")).strip(),
                })
        return normalized

    @classmethod
    def extract_code_snippet(cls, text: str | None) -> str | None:
        """Extract the most prominent code snippet from a message, if any."""
        if not text:
            return None
        matches = re.findall(r"```(?:[a-zA-Z0-9_\-#+]*\n)?([\s\S]*?)```", text)
        if matches:
            # Pick the longest code block
            return max(matches, key=len).strip()
        return None

    TEMPORAL_PHRASES = {
        "today", "date", "the date today", "the date", "today date", "todays date",
        "server time", "server date", "current date", "current time", "time",
        "the time", "day", "the day", "what is the date today", "what day is today",
        "what is today's date", "what's today's date", "whats todays date",
        "what time is it", "current year", "year", "what year", "what is the date",
        "what date", "server timezone", "timezone", "what is the day today",
        "current day", "day today", "time right now", "current server time",
        "what day", "which day", "what day is it", "what's the day",
    }

    @classmethod
    def is_temporal_topic(cls, text: str | None) -> bool:
        """Check whether a text represents a date, time, or temporal inquiry that should never be a topic."""
        if not text:
            return False
        clean = re.sub(r"[^\w\s]", "", str(text)).strip().lower()
        if not clean:
            return False
        if clean in cls.TEMPORAL_PHRASES:
            return True
        words = clean.split()
        temporal_words = {"date", "time", "today", "day", "timezone", "weekday", "year", "clock"}
        if any(w in temporal_words for w in words):
            filler_words = {"the", "is", "what", "whats", "current", "server", "of", "in", "it", "this", "todays", "today"}
            if all(w in temporal_words or w in filler_words for w in words):
                return True
        return False

    @classmethod
    def extract_topic_from_message(cls, message: str) -> str | None:
        """Extract a topic directly from the user's current message if self-contained."""
        if not message:
            return None
        m = message.strip()
        if cls.is_temporal_topic(m) or classify_intent(m) == INTENT_TIME_DATE:
            return None

        # Check for explicit topic inquiry patterns
        pat = r"(?:how\s+(?:can\s+i|do\s+i|to)\s+learn|teach\s+me|explain|what\s+is\s+an?|what\s+are|what\s+is|guide\s+for|tell\s+me\s+about|deep\s+dive\s+on)\s+([a-zA-Z0-9_\-#+\.\s]+)"
        match = re.search(pat, m, re.IGNORECASE)
        if match:
            cand = match.group(1).strip().rstrip("?").rstrip(".").strip()
            if not cls.is_temporal_topic(cand) and cand.lower() not in {"an api", "next", "what next", "code", "that", "this"}:
                return cand.title() if len(cand) <= 30 else cand

        # Check for roadmap pattern: "python roadmap", "react roadmap"
        road_m = re.search(r"([a-zA-Z0-9_\-#+\.]+)\s+roadmap", m, re.IGNORECASE)
        if road_m:
            cand = road_m.group(1).strip()
            if not cls.is_temporal_topic(cand):
                return cand.title()

        # Check for prominent known tech keywords in message
        KNOWN_TOPICS = {
            "javascript": "JavaScript", "python": "Python", "typescript": "TypeScript",
            "react": "React", "fastapi": "FastAPI", "django": "Django", "flask": "Flask",
            "node": "Node.js", "nodejs": "Node.js", "vue": "Vue", "angular": "Angular",
            "docker": "Docker", "kubernetes": "Kubernetes", "sql": "SQL", "postgresql": "PostgreSQL",
            "postgres": "PostgreSQL", "mongodb": "MongoDB", "redis": "Redis", "git": "Git",
            "linux": "Linux", "html": "HTML", "css": "CSS", "tailwind": "Tailwind CSS",
            "rust": "Rust", "golang": "Go", "go": "Go", "java": "Java", "c++": "C++",
            "recursion": "Recursion", "object-oriented design patterns": "Object-Oriented Design Patterns",
            "design patterns": "Design Patterns", "oop": "Object-Oriented Programming",
            "asyncio": "Asyncio", "concurrency": "Concurrency", "rest api": "REST APIs",
        }
        m_lower = m.lower()
        for key in sorted(KNOWN_TOPICS.keys(), key=len, reverse=True):
            if re.search(r"\b" + re.escape(key) + r"\b", m_lower):
                return KNOWN_TOPICS[key]

        return None

    @classmethod
    def is_explicit_ellipsis(cls, message: str, pending_prompt: str | None = None) -> bool:
        """Determine if a message is an explicit anaphoric follow-up or ellipsis."""
        if not message:
            return False
        m = message.strip()
        clean = re.sub(r"[^\w\s]", "", m).strip().lower()

        # 1. Answering pending assistant offers
        if pending_prompt == "quiz_or_project":
            if clean in {
                "quiz", "a quiz", "quiz please", "take a quiz", "quiz me",
                "project", "a project", "project please", "build a project", "build project",
                "roadmap", "a roadmap", "roadmap please",
            }:
                return True

        # 2. Date / time short inquiries
        if clean in {"date", "time", "todays date", "today date"} or m.lower() in {"date?", "time?", "today's date?"}:
            return True

        # 3. Quiz / test requests
        if clean in {
            "quiz me", "test me", "practice quiz", "quiz", "give me a quiz",
            "test my knowledge", "quiz on that", "give me a quiz on that",
            "quiz that", "test me on that",
        }:
            return True

        # 4. Anaphoric / explanation inquiries
        why_explain = {
            "why", "why is that", "why is this", "why does this happen", "why does it happen",
            "how", "how so", "explain", "explain please", "explain this", "explain that",
            "can you explain", "can you explain that", "can you explain this",
            "what does that mean", "tell me more", "tell me more about that", "tell me more on that",
            "more details", "elaborate", "clarify", "deep dive", "deep dive into that",
        }
        if clean in why_explain or m.lower() in {"why?", "how so?", "explain?", "elaborate?"}:
            return True

        # 5. Next step ellipsis
        if clean in {"what next", "whats next", "next step", "what now", "where to start", "where do i start"}:
            return True

        return False

    @classmethod
    def extract_assistant_topic(cls, assistant_text: str | None, user_text: str | None = None) -> str | None:
        """Extract core subject or topic from previous assistant turn or user query."""
        if assistant_text:
            # Check for structured markdown headers
            patterns = [
                r"###\s+🧠\s*Spaced Repetition Revision:\s*([^\n]+)",
                r"###\s+Mentor Insight on:\s*([^\n]+)",
                r"###\s+Architecture & Implementation:\s*([^\n]+)",
                r"###\s+Engineering Breakdown:\s*([^\n]+)",
                r"###\s+Deep Dive:\s*([^\n]+)",
                r"###\s+([a-zA-Z0-9_\-\s]+)\s+Roadmap",
                r"###\s+([a-zA-Z0-9_\-\s]+):\s*(?:Intuition|Mechanics|Mental Model)",
                r"####\s+1\.\s*Core Concept & Architectural Mental Model\s*[\n\r]+(?:When approaching\s+\*\*([^\*]+)\*\*)?",
            ]
            for pat in patterns:
                m = re.search(pat, assistant_text, re.IGNORECASE)
                if m:
                    for g in m.groups():
                        if g and g.strip():
                            clean_t = g.strip()
                            clean_t = re.sub(r"^(about|on|the)\s+", "", clean_t, flags=re.IGNORECASE).strip()
                            if not cls.is_temporal_topic(clean_t):
                                return clean_t

            # Check for first H3 header
            h3_match = re.search(r"###\s+([^\n]+)", assistant_text)
            if h3_match:
                header = h3_match.group(1).strip()
                # Ignore generic identity header or action plan headers
                h_lower = header.lower()
                ignored_headers = [
                    "technea ai mentor", "action plan", "next engineering steps", "what next",
                    "next step", "today", "the day", "server time", "server date",
                    "recommended next actions on technea", "learning strategy & study habits",
                ]
                if not any(ign in h_lower for ign in ignored_headers) and not cls.is_temporal_topic(header):
                    # Strip subtitles
                    if ":" in header:
                        header = header.split(":")[0].strip()
                    if not cls.is_temporal_topic(header):
                        return header

        if user_text:
            u = user_text.strip()
            u_lower = u.lower()
            if cls.is_temporal_topic(u) or classify_intent(u) == INTENT_TIME_DATE:
                return None
            if u_lower in {"what next", "what next?", "next step", "what to do next", "where to start"}:
                return None

            # "teach me React hooks" -> "React hooks"
            teach_m = re.search(r"(?:teach me|explain|what is|what are|how to learn|how can i learn|how do i learn|guide for)\s+([a-zA-Z0-9_\-#+\s]+)", u, re.IGNORECASE)
            if teach_m:
                t = teach_m.group(1).strip().rstrip("?").rstrip(".")
                if not cls.is_temporal_topic(t) and t.lower() not in {"an api", "next", "what next", "today", "the date", "the time"}:
                    return t.title()

            # "python roadmap" -> "Python"
            road_m = re.search(r"([a-zA-Z0-9_\-#+]+)\s+roadmap", u, re.IGNORECASE)
            if road_m:
                t = road_m.group(1).strip()
                if not cls.is_temporal_topic(t):
                    return t.title()

        return None

    @classmethod
    def detect_pending_offer(cls, assistant_text: str | None) -> str | None:
        """Detect if the previous assistant message offered a specific choice to the user."""
        if not assistant_text:
            return None

        t = assistant_text.lower()
        if (
            "quiz or a project" in t
            or "quiz or project" in t
            or "quiz, a project" in t
            or "project or a quiz" in t
            or "project or quiz" in t
            or ("quiz" in t and "project" in t and "would you" in t)
        ):
            return "quiz_or_project"

        if "roadmap, plan hands-on projects, or tackle a coding milestone" in t:
            return "mentor_welcome_offer"

        return None

    @classmethod
    def extract_user_corrections(cls, history: list[dict[str, str]]) -> dict[str, str]:
        """Extract explicit user corrections across conversation turns."""
        corrections: dict[str, str] = {}

        for turn in history:
            if turn.get("role") != "user":
                continue
            msg = turn.get("content", "")

            # Languages
            KNOWN_LANGUAGES = {"python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", "golang": "Go", "go": "Go", "rust": "Rust", "java": "Java", "c++": "C++", "c#": "C#", "swift": "Swift", "kotlin": "Kotlin", "ruby": "Ruby", "php": "PHP"}
            KNOWN_FRAMEWORKS = {
                "fastapi": "FastAPI", "django": "Django", "flask": "Flask", "react": "React",
                "next.js": "Next.js", "nextjs": "Next.js", "vue": "Vue", "angular": "Angular",
                "express": "Express", "node": "Node", "nodejs": "Node.js", "spring": "Spring",
                "laravel": "Laravel", "tailwind": "Tailwind"
            }

            # "I'm learning Python" / "I am learning/using/coding in Python"
            m_lang = re.search(r"\bi(?:'m| am)?\s*(?:learning|using|use|coding in|building with)\s+([a-zA-Z0-9_#+]+)", msg, re.IGNORECASE)
            if m_lang:
                extracted = m_lang.group(1).strip().lower()
                if extracted in KNOWN_LANGUAGES:
                    corrections["preferred_language"] = KNOWN_LANGUAGES[extracted]
                elif extracted in KNOWN_FRAMEWORKS:
                    corrections["framework"] = KNOWN_FRAMEWORKS[extracted]

            # "not JavaScript" / "not Django"
            m_not = re.search(r"\bnot\s+([a-zA-Z0-9_#+]+)", msg, re.IGNORECASE)
            if m_not:
                avoid = m_not.group(1).strip().lower()
                corrections["avoid_framework"] = KNOWN_FRAMEWORKS.get(avoid, KNOWN_LANGUAGES.get(avoid, avoid.title()))

            # "using FastAPI not Django" / "use FastAPI not Django"
            m_fw = re.search(r"\b(?:using|use)\s+([a-zA-Z0-9_#+]+)\s+not\s+([a-zA-Z0-9_#+]+)", msg, re.IGNORECASE)
            if m_fw:
                fw1 = m_fw.group(1).strip().lower()
                fw2 = m_fw.group(2).strip().lower()
                corrections["framework"] = KNOWN_FRAMEWORKS.get(fw1, m_fw.group(1).strip())
                corrections["avoid_framework"] = KNOWN_FRAMEWORKS.get(fw2, m_fw.group(2).strip())

            # "using Python and FastAPI"
            m_both = re.search(r"\b(?:using|use)\s+([a-zA-Z0-9_#+]+)\s+and\s+([a-zA-Z0-9_#+]+)", msg, re.IGNORECASE)
            if m_both:
                w1, w2 = m_both.group(1).strip().lower(), m_both.group(2).strip().lower()
                if w1 in KNOWN_LANGUAGES:
                    corrections["preferred_language"] = KNOWN_LANGUAGES[w1]
                if w2 in KNOWN_FRAMEWORKS:
                    corrections["framework"] = KNOWN_FRAMEWORKS[w2]

            # "actually I'm using FastAPI" / "actually I use React"
            m_act = re.search(r"\bactually\s+(?:i'm|i am|i use|i'm using)\s+([a-zA-Z0-9_#+]+)", msg, re.IGNORECASE)
            if m_act:
                corrections["framework"] = m_act.group(1).strip()

            # "I'm a beginner" / "I am intermediate" / "I am advanced"
            m_lvl = re.search(r"\bi(?:'m| am)\s+(?:a |an )?(beginner|intermediate|advanced)\b", msg, re.IGNORECASE)
            if m_lvl:
                corrections["level"] = m_lvl.group(1).strip().title()

        return corrections

    def analyze(
        self,
        conversation_history: list[Any] | None,
        current_message: str,
        context: dict[str, Any] | None = None,
    ) -> ConversationMemoryState:
        """Analyze conversation history and current turn to extract full memory state."""
        normalized = self.normalize_history(conversation_history)
        current_msg = current_message.strip()

        # Find previous user and assistant turns
        prev_user: str | None = None
        prev_assistant: str | None = None
        for item in reversed(normalized):
            if item["role"] == "assistant" and prev_assistant is None:
                prev_assistant = item["content"]
            elif item["role"] == "user" and prev_user is None:
                prev_user = item["content"]
            if prev_assistant is not None and prev_user is not None:
                break

        # Extract features from history
        prev_code = self.extract_code_snippet(prev_assistant)
        prev_topic = self.extract_assistant_topic(prev_assistant, prev_user)
        pending_offer = self.detect_pending_offer(prev_assistant)
        user_corrections = self.extract_user_corrections(normalized)

        # Context-derived topic fallback ONLY if candidate is not temporal
        if not prev_topic and context:
            candidate = context.get("current_milestone_title") or context.get("topic")
            if candidate and not self.is_temporal_topic(str(candidate)):
                prev_topic = str(candidate)

        is_ellipsis = self.is_explicit_ellipsis(current_msg, pending_offer)

        state = ConversationMemoryState(
            previous_user_message=prev_user,
            previous_assistant_message=prev_assistant,
            previous_intent=classify_intent(prev_user) if prev_user else None,
            previous_topic=prev_topic,
            previous_code_snippet=prev_code,
            pending_prompt=pending_offer,
            user_corrections=user_corrections,
            resolved_message=current_msg,
            resolved_intent=None,
            active_topic=prev_topic if is_ellipsis else None,
        )

        # Resolve ellipsis or pending prompts
        resolved_msg, resolved_intent, active_topic = self.resolve_ellipsis(
            current_msg,
            normalized,
            state,
        )

        state.resolved_message = resolved_msg
        state.resolved_intent = resolved_intent

        if is_ellipsis:
            state.active_topic = active_topic or prev_topic
        else:
            state.active_topic = active_topic

        # Populate context updates
        updates: dict[str, Any] = {}
        # Only inject active_topic into context updates if it was an explicit ellipsis resolution
        if is_ellipsis and state.active_topic and not self.is_temporal_topic(state.active_topic):
            updates["active_topic"] = state.active_topic

        if user_corrections:
            updates["user_corrections"] = user_corrections
            if "preferred_language" in user_corrections:
                updates["preferred_language"] = user_corrections["preferred_language"]
            if "level" in user_corrections:
                updates["level"] = user_corrections["level"]
            if "framework" in user_corrections:
                updates["framework"] = user_corrections["framework"]
        state.context_updates = updates

        return state

    def resolve_ellipsis(
        self,
        message: str,
        history: list[dict[str, str]],
        memory: ConversationMemoryState,
    ) -> tuple[str, str | None, str | None]:
        """Resolve short / single-word follow-ups based on conversation memory."""
        m = message.strip()
        clean = re.sub(r"[^\w\s]", "", m).strip().lower()

        if not m:
            return message, None, None

        # -------------------------------------------------------------
        # 1. Date / Time single-word inquiry ("date?", "date", "time")
        # -------------------------------------------------------------
        if clean == "date" or m.lower() in {"date?", "date"}:
            return "What is today's date?", INTENT_TIME_DATE, None
        if clean == "time" or m.lower() in {"time?", "time"}:
            return "What time is it?", INTENT_TIME_DATE, None
        if clean in {"todays date", "today date"} or m.lower() in {"today's date", "today's date?"}:
            return "What is today's date?", INTENT_TIME_DATE, None

        # -------------------------------------------------------------
        # 2. Answering Pending Assistant Prompts (e.g. "quiz or project")
        # -------------------------------------------------------------
        if memory.pending_prompt == "quiz_or_project":
            topic = memory.previous_topic or "recent lessons"
            if clean in {"quiz", "a quiz", "quiz please", "take a quiz", "quiz me"}:
                return f"Quiz me on {topic}", INTENT_REVISION, topic
            if clean in {"project", "a project", "project please", "build a project", "build project"}:
                return f"Suggest a project on {topic}", INTENT_PROJECT_SUGGESTION, topic
            if clean in {"roadmap", "a roadmap", "roadmap please"}:
                return f"Give me a roadmap for {topic}", INTENT_ROADMAP_REQUEST, topic

        # -------------------------------------------------------------
        # 3. Quiz Me / Test Me Ellipsis ("quiz me", "test me")
        # -------------------------------------------------------------
        if clean in {"quiz me", "test me", "practice quiz", "quiz", "give me a quiz", "test my knowledge", "quiz on that", "give me a quiz on that", "quiz that", "test me on that"}:
            if memory.previous_topic and not self.is_temporal_topic(memory.previous_topic):
                return f"Quiz me on {memory.previous_topic}", INTENT_REVISION, memory.previous_topic
            return message, INTENT_REVISION, None

        # -------------------------------------------------------------
        # 4. Code / Concept "Why?" / "Explain" Ellipsis
        # -------------------------------------------------------------
        is_why_or_explain = clean in {
            "why",
            "why is that",
            "why is this",
            "why does this happen",
            "why does it happen",
            "how",
            "how so",
            "explain",
            "explain please",
            "explain this",
            "explain that",
            "can you explain",
            "can you explain that",
            "can you explain this",
            "what does that mean",
            "tell me more",
            "tell me more about that",
            "tell me more on that",
            "more details",
            "elaborate",
            "clarify",
            "deep dive",
            "deep dive into that",
        } or m.lower() in {"why?", "how so?", "explain?", "elaborate?"}

        if is_why_or_explain:
            if memory.previous_code_snippet:
                resolved = (
                    f"Explain why this code works:\n```\n{memory.previous_code_snippet}\n```"
                )
                prev_t = memory.previous_topic if not self.is_temporal_topic(memory.previous_topic) else None
                return resolved, INTENT_CODE_HELP, prev_t or "Code Review"
            if memory.previous_topic and not self.is_temporal_topic(memory.previous_topic):
                resolved = f"Can you explain {memory.previous_topic} in detail?"
                return resolved, INTENT_CODE_HELP, memory.previous_topic
            return message, INTENT_CODE_HELP, None

        # -------------------------------------------------------------
        # 5. Next Step Ellipsis ("what next?", "next step", "what now")
        # -------------------------------------------------------------
        if clean in {"what next", "whats next", "next step", "what now", "where to start", "where do i start"}:
            prev_t = memory.previous_topic if not self.is_temporal_topic(memory.previous_topic) else None
            return message, INTENT_NEXT_STEP, prev_t

        # Default: Return unmodified query with topic extracted from current message if available
        current_topic = self.extract_topic_from_message(message)
        return message, None, current_topic


# Global singleton instance
memory_engine = MemoryEngine()
