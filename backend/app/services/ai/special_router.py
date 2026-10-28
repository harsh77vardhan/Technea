"""Special Router for Technea AI Mentor (Zero-Token Fast Path).

Provides instant, zero-LLM-token resolution for greetings, casual gratitude,
and server date/time queries. Guarantees sub-5ms response latency and prevents
hallucinations for temporal and conversational queries.
"""

from datetime import datetime
import logging
import random
import re
from typing import Any

from app.services.ai.prompts import (
    INTENT_CASUAL,
    INTENT_GREETING,
    INTENT_TIME_DATE,
)

logger = logging.getLogger("technea.ai.special_router")


class SpecialRouter:
    """Zero-LLM-token fast path router for deterministic conversational intents."""

    # Directives (e.g. "say hey back")
    DIRECTIVE_PATTERNS = {
        "say hey",
        "say hey back",
        "just say hey",
        "just say hey back",
        "say hi",
        "say hi back",
        "just say hi",
        "just say hi back",
        "say hello",
        "say hello back",
        "just say hello",
        "just say hello back",
    }

    # Short greetings
    SHORT_GREETINGS = {
        "hey",
        "hi",
        "yo",
        "sup",
        "heyy",
        "heyyy",
        "hey there",
        "hi there",
        "howdy",
    }

    # Full greetings
    FULL_GREETINGS = {
        "hello",
        "hello there",
        "greetings",
    }

    # Time-of-day greetings
    TIME_GREETINGS = {
        "good morning",
        "goodmorning",
        "good afternoon",
        "good evening",
    }

    # Gratitude
    GRATITUDE_PATTERNS = {
        "thanks",
        "thank you",
        "thx",
        "thank you very much",
        "thanks a lot",
        "thank you so much",
        "many thanks",
        "much appreciated",
        "appreciate it",
    }

    # Acknowledgments
    ACKNOWLEDGMENT_PATTERNS = {
        "cool",
        "got it",
        "nice",
        "awesome",
        "great",
        "understood",
        "makes sense",
        "sounds good",
        "perfect",
        "alright",
        "ok",
        "okay",
        "cheers",
        "sure",
        "no problem",
        "will do",
    }

    # Farewells
    FAREWELL_PATTERNS = {
        "bye",
        "goodbye",
        "see you",
        "see ya",
        "catch you later",
        "later",
    }

    # Time / Date explicit triggers
    DATE_EXACT_TRIGGERS = {
        "date",
        "date?",
        "today's date",
        "today's date?",
        "todays date",
        "todays date?",
        "today date",
        "what is today's date",
        "what is today's date?",
        "what's today's date",
        "what's today's date?",
        "whats todays date",
        "whats todays date?",
        "current date",
        "what is the date",
        "what is the date?",
        "what's the date",
        "what's the date?",
        "whats the date",
        "whats the date?",
        "what date is it",
        "what date is it?",
        "what date is today",
        "what date is today?",
        "what date",
        "date today",
    }

    TIME_EXACT_TRIGGERS = {
        "time",
        "time?",
        "what time is it",
        "what time is it?",
        "what's the time",
        "what's the time?",
        "whats the time",
        "whats the time?",
        "what is the time",
        "what is the time?",
        "current time",
        "current time?",
        "what time",
        "server time",
        "current server time",
        "time right now",
        "what time is it right now",
    }

    DAY_EXACT_TRIGGERS = {
        "what day is today",
        "what day is today?",
        "what's the day",
        "what's the day?",
        "whats the day",
        "whats the day?",
        "what is the day",
        "what is the day?",
        "what's the day today",
        "what's the day today?",
        "whats the day today",
        "what is the day today",
        "which day is today",
        "which day is today?",
        "what day is it",
        "what day is it today",
        "which day is it",
        "what day of the week",
        "what day of the week is it",
        "what day of the week is today",
        "day today",
        "what day",
        "which day",
    }

    YEAR_EXACT_TRIGGERS = {
        "what year is this",
        "what year is this?",
        "what year is it",
        "what year is it?",
        "current year",
        "what year",
    }

    TIMEZONE_EXACT_TRIGGERS = {
        "what is the timezone",
        "what is the timezone?",
        "what's the timezone",
        "current timezone",
        "what timezone",
    }

    @staticmethod
    def _clean_text(message: str) -> tuple[str, list[str]]:
        """Normalize message text and return cleaned string and words list."""
        m = message.strip().lower()
        clean = re.sub(r"[^\w\s]", "", m).strip()
        words = clean.split()
        return clean, words

    @classmethod
    def is_time_date_query(cls, message: str) -> bool:
        """Check if message is an inquiry about server date, day, time, year, or timezone."""
        m = message.strip().lower()
        clean, words = cls._clean_text(message)

        if not m:
            return False

        # Strip conversational prefixes: "okay", "ok", "so", "tell me", "please", etc.
        candidate = clean
        prev = None
        while candidate != prev:
            prev = candidate
            candidate = re.sub(
                r"^(okay|ok|so|well|alright|hey|hi|hello|yo|tell me|can you tell me|please tell me|please)\b\s*",
                "",
                candidate,
            ).strip()
        stripped_clean = candidate
        stripped_words = stripped_clean.split()

        # Check exact trigger sets
        if m in cls.DATE_EXACT_TRIGGERS or clean in cls.DATE_EXACT_TRIGGERS or stripped_clean in cls.DATE_EXACT_TRIGGERS:
            return True
        if m in cls.TIME_EXACT_TRIGGERS or clean in cls.TIME_EXACT_TRIGGERS or stripped_clean in cls.TIME_EXACT_TRIGGERS:
            return True
        if m in cls.DAY_EXACT_TRIGGERS or clean in cls.DAY_EXACT_TRIGGERS or stripped_clean in cls.DAY_EXACT_TRIGGERS:
            return True
        if m in cls.YEAR_EXACT_TRIGGERS or clean in cls.YEAR_EXACT_TRIGGERS or stripped_clean in cls.YEAR_EXACT_TRIGGERS:
            return True
        if m in cls.TIMEZONE_EXACT_TRIGGERS or clean in cls.TIMEZONE_EXACT_TRIGGERS or stripped_clean in cls.TIMEZONE_EXACT_TRIGGERS:
            return True

        # Check single-word and short patterns
        if stripped_words == ["date"] or stripped_words == ["time"] or stripped_words == ["current", "time"]:
            return True
        if stripped_words in [["today", "s", "date"], ["todays", "date"], ["today", "date"]]:
            return True
        if stripped_words in [["what", "s", "the", "day"], ["whats", "the", "day"], ["what", "is", "the", "day"]]:
            return True
        if stripped_words in [["what", "day", "is", "today"], ["what", "time", "is", "it"]]:
            return True

        # Check regex / substring patterns
        if (
            re.search(r"\b(what|which)\s+day\b", stripped_clean)
            or re.search(r"\bwhat\s+time\b", stripped_clean)
            or re.search(r"\bwhat\s+date\b", stripped_clean)
            or (("date" in words or "day" in words or "time" in words) and "today" in words and "goal" not in words and "plan" not in words)
        ):
            return True

        return False

    @classmethod
    def is_greeting_query(cls, message: str) -> bool:
        """Check if message is a greeting or conversational directive without technical substance."""
        clean, words = cls._clean_text(message)

        if not clean:
            return False

        # Directives
        if (
            clean in cls.DIRECTIVE_PATTERNS
            or ("dont say anything" in clean and any(w in words for w in ["hey", "hi", "hello"]))
            or ("just say" in clean and any(w in words for w in ["hey", "hi", "hello"]))
            or ("say hey" in clean or "say hi" in clean or "say hello" in clean)
        ):
            return True

        # Direct short greetings
        if clean in cls.SHORT_GREETINGS:
            return True

        # Full greetings
        if clean in cls.FULL_GREETINGS:
            return True

        # Time-of-day greetings
        if clean in cls.TIME_GREETINGS or clean.startswith("good morning") or clean.startswith("good afternoon") or clean.startswith("good evening"):
            return True

        # Leading greeting word with 1-3 total non-question words
        if words and words[0] in {"hi", "hello", "hey", "yo", "sup", "howdy", "greetings"}:
            if len(words) <= 3:
                has_substance = any(
                    w in words[1:]
                    for w in [
                        "what", "whats", "how", "why", "when", "which", "where", "can", "could", "is", "are",
                        "day", "date", "time", "year", "teach", "explain", "review", "help", "guide", "learn",
                        "roadmap", "project", "code", "debug", "test", "quiz",
                    ]
                )
                if not has_substance:
                    return True

        return False

    @classmethod
    def is_gratitude_or_casual_query(cls, message: str) -> bool:
        """Check if message is casual gratitude, polite acknowledgment, or farewell."""
        clean, words = cls._clean_text(message)

        if not clean:
            return False

        # Exact gratitude
        if clean in cls.GRATITUDE_PATTERNS or clean.startswith("thanks") or clean.startswith("thank you"):
            return True

        # Exact acknowledgments
        if clean in cls.ACKNOWLEDGMENT_PATTERNS:
            return True

        # Compound acknowledgments (e.g. "ok thanks", "cool got it")
        for ack in cls.ACKNOWLEDGMENT_PATTERNS:
            if clean in {f"{ack} thanks", f"{ack} thank you", f"{ack} got it", f"ok {ack}"}:
                return True

        # Farewells
        if clean in cls.FAREWELL_PATTERNS or any(clean.startswith(f) for f in cls.FAREWELL_PATTERNS):
            return True

        return False

    def can_handle(
        self,
        intent: str | None,
        message: str,
        context: dict[str, Any] | None = None,
    ) -> bool:
        """Determine whether the message qualifies for zero-LLM-token fast path execution."""
        if not message or not message.strip():
            return False

        # 1. Server Time / Date fast path
        if intent == INTENT_TIME_DATE or self.is_time_date_query(message):
            return True

        # 2. Greeting fast path
        if intent == INTENT_GREETING or self.is_greeting_query(message):
            return True

        # 3. Gratitude & Casual fast path
        if intent == INTENT_CASUAL and self.is_gratitude_or_casual_query(message):
            return True

        if self.is_gratitude_or_casual_query(message):
            return True

        return False

    async def route(
        self,
        intent: str | None,
        message: str,
        context: dict[str, Any] | None = None,
        seed: Any = None,
    ) -> str | None:
        """Execute deterministic zero-token resolution. Returns response text or None."""
        if not self.can_handle(intent, message, context):
            return None

        clean, words = self._clean_text(message)
        ctx = context or {}
        user_name = ctx.get("user_name")
        learner_level = (ctx.get("level") or ctx.get("learner_level") or "Beginner").strip().title()

        # -------------------------------------------------------------
        # Route 1: Time & Date Resolution (100% Non-Hallucinatory)
        # -------------------------------------------------------------
        if intent == INTENT_TIME_DATE or self.is_time_date_query(message):
            now = datetime.now().astimezone()
            weekday = ctx.get("current_weekday") or now.strftime("%A")
            date_str = ctx.get("current_date") or now.strftime("%B %d, %Y")
            year_str = ctx.get("current_year") or now.strftime("%Y")
            time_str = ctx.get("current_time") or now.strftime("%I:%M %p").lstrip("0")
            # Ensure time_str has timezone if missing
            tz_name = ctx.get("current_timezone") or now.tzname() or "UTC"

            # Check stripped content
            candidate = clean
            prev = None
            while candidate != prev:
                prev = candidate
                candidate = re.sub(
                    r"^(okay|ok|so|well|alright|hey|hi|hello|yo|tell me|can you tell me|please tell me|please)\b\s*",
                    "",
                    candidate,
                ).strip()
            stripped_clean = candidate
            stripped_words = stripped_clean.split()

            # 1. Day of week query ("what day is today?", "what's the day", "which day is today")
            is_day_query = (
                message.strip().lower() in self.DAY_EXACT_TRIGGERS
                or clean in self.DAY_EXACT_TRIGGERS
                or stripped_clean in self.DAY_EXACT_TRIGGERS
                or stripped_words in [["what", "s", "the", "day"], ["whats", "the", "day"], ["what", "is", "the", "day"]]
                or (
                    any(pat in stripped_clean for pat in ["what day is today", "whats the day today", "what is the day today", "which day is today", "what day of the week", "what day is it", "day today", "whats the day", "what is the day", "what day", "which day"])
                    or ("day" in stripped_words and "today" in stripped_words)
                )
            )
            if is_day_query:
                return f"Today is {weekday}."

            # 2. Time query ("time", "time?", "what time is it?", "current time", "server time")
            is_time_query = (
                message.strip().lower() in self.TIME_EXACT_TRIGGERS
                or clean in self.TIME_EXACT_TRIGGERS
                or stripped_clean in self.TIME_EXACT_TRIGGERS
                or stripped_words == ["time"]
                or stripped_words == ["current", "time"]
                or any(pat in stripped_clean for pat in ["what time is it", "whats the time", "what is the time", "current time", "time right now", "server time", "what time"])
            )
            if is_time_query:
                formatted_time = now.strftime("%I:%M %p").lstrip("0")
                return f"The current server time is {formatted_time} {tz_name}."

            # 3. Date query ("date?", "date", "today's date", "what is today's date?", "current date")
            is_date_query = (
                message.strip().lower() in self.DATE_EXACT_TRIGGERS
                or clean in self.DATE_EXACT_TRIGGERS
                or stripped_clean in self.DATE_EXACT_TRIGGERS
                or stripped_words == ["date"]
                or stripped_words in [["today", "s", "date"], ["todays", "date"], ["today", "date"]]
                or any(pat in stripped_clean for pat in ["what is todays date", "whats todays date", "today date", "current date", "what is the date", "whats the date", "what date is it", "what date is today", "what date", "date today"])
            )
            if is_date_query:
                return f"Today is {weekday}, {date_str}."

            # 4. Year query
            if (
                message.strip().lower() in self.YEAR_EXACT_TRIGGERS
                or clean in self.YEAR_EXACT_TRIGGERS
                or stripped_clean in self.YEAR_EXACT_TRIGGERS
                or any(pat in stripped_clean for pat in ["what year is this", "what year is it", "current year", "what year"])
            ):
                return f"The current year is {year_str}."

            # 5. Timezone query
            if (
                message.strip().lower() in self.TIMEZONE_EXACT_TRIGGERS
                or clean in self.TIMEZONE_EXACT_TRIGGERS
                or stripped_clean in self.TIMEZONE_EXACT_TRIGGERS
                or any(pat in stripped_clean for pat in ["what is the timezone", "current timezone", "what timezone"])
            ):
                return f"The current server timezone is {tz_name}."

            # General / Combined
            formatted_time = now.strftime("%I:%M %p").lstrip("0")
            return f"Today is {weekday}, {date_str}, and the current server time is {formatted_time} {tz_name}."

        # -------------------------------------------------------------
        # Route 2: Greetings Fast Path
        # -------------------------------------------------------------
        if intent == INTENT_GREETING or self.is_greeting_query(message):
            # A. Directives (e.g. "hey, just say hey back")
            if (
                clean in self.DIRECTIVE_PATTERNS
                or "dont say anything" in clean
                or ("just say" in clean and any(w in words for w in ["hey", "hi", "hello"]))
                or ("say hey" in clean or "say hi" in clean or "say hello" in clean)
            ):
                if "back" in clean:
                    return "Hey back! 👋"
                return "Hey! 👋"

            # B. Short greetings ("hey", "hi", "yo", "sup", "hey there")
            if clean in self.SHORT_GREETINGS or (words and words[0] in self.SHORT_GREETINGS and len(words) <= 2):
                if user_name:
                    return f"Hey {user_name}! 👋"
                return "Hey 👋"

            # C. Time-of-day greetings
            if clean in {"good morning", "goodmorning"} or clean.startswith("good morning"):
                if user_name:
                    return f"Good morning, {user_name}! 👋 Hope you have a great day."
                return "Good morning! 👋 Hope you have a great day."
            if clean.startswith("good afternoon"):
                if user_name:
                    return f"Good afternoon, {user_name}! 👋 Hope you have a great day."
                return "Good afternoon! 👋 Hope you have a great day."
            if clean.startswith("good evening"):
                if user_name:
                    return f"Good evening, {user_name}! 👋 Hope you have a great day."
                return "Good evening! 👋 Hope you have a great day."

            # D. Full Persona Greetings ("hello", "hello there", "greetings")
            name_str = f", **{user_name}**" if user_name else ""
            greetings = [
                f"Hey{name_str}, welcome back! Good to see you continuing your coding journey at the **{learner_level}** level.",
                f"Hello{name_str}! Great to connect. Ready to help you tackle your next coding goals at the **{learner_level}** stage.",
                f"Hi{name_str}, welcome! Good to see you here continuing at the **{learner_level}** level.",
                f"Hey{name_str}! Hope your coding is going well today as you build your **{learner_level}** skills.",
            ]
            closings = [
                "What would you like to build or learn today? (You can explore a tailored **Roadmap**, plan hands-on **Projects**, or tackle a coding milestone.)",
                "Where should we focus our attention today? (You can request a tailored **Roadmap**, plan **Projects**, or tackle what you want to build or learn.)",
                "What technical challenge should we tackle today? (Explore structured **Roadmaps**, plan **Projects**, or build or master an algorithm.)",
                "What would you like to build or master in our session? (You can explore **Roadmaps**, plan **Projects**, or tackle your next step.)",
            ]
            resolved_seed = seed if seed is not None else ctx.get("seed")
            rng = random.Random(resolved_seed) if resolved_seed is not None else None
            if resolved_seed is None and hasattr(self, "_last_greeting") and self._last_greeting:
                avail = [g for g in greetings if g != self._last_greeting]
                selected_greeting = random.choice(avail) if avail else random.choice(greetings)
            else:
                selected_greeting = rng.choice(greetings) if rng else random.choice(greetings)

            if resolved_seed is None and hasattr(self, "_last_closing") and self._last_closing:
                avail_c = [c for c in closings if c != self._last_closing]
                selected_closing = random.choice(avail_c) if avail_c else random.choice(closings)
            else:
                selected_closing = rng.choice(closings) if rng else random.choice(closings)

            if resolved_seed is None:
                self._last_greeting = selected_greeting
                self._last_closing = selected_closing

            return (
                "### Technea AI Mentor\n\n"
                f"{selected_greeting}\n\n"
                f"{selected_closing}"
            )

        # -------------------------------------------------------------
        # Route 3: Gratitude & Casual Fast Path
        # -------------------------------------------------------------
        if self.is_gratitude_or_casual_query(message) or intent == INTENT_CASUAL:
            # Gratitude
            if clean in self.GRATITUDE_PATTERNS or clean.startswith("thanks") or clean.startswith("thank you"):
                return "You're welcome! Let me know if you need any help while coding."

            # Farewells
            if clean in self.FAREWELL_PATTERNS or any(clean.startswith(f) for f in self.FAREWELL_PATTERNS):
                return "Catch you later! Keep your coding streak going, and feel free to reach out whenever you're back in the editor."

            # Acknowledgments / casual chit-chat
            return "Glad that was helpful! Let me know where you'd like to focus next—whether exploring a roadmap, choosing a project, or working through code."

        return None


# Global singleton instance
special_router = SpecialRouter()
