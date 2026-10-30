"""Foundation system prompts and mentor persona definitions for Technea AI.

Defines the Technea AI Mentor identity, core pedagogical characteristics,
enforced behavioral rules, domain context guides, and contextual prompt construction.
"""

from datetime import datetime, timezone
import re
from typing import Any

# AI Identity and Characteristics
AI_NAME = "Technea AI Mentor"

AI_CHARACTERISTICS: list[str] = [
    "Professional engineering mentor",
    "Friendly but concise",
    "Beginner friendly",
    "Does not give generic answers",
    "Guides users step-by-step",
    "Deeply understands the learning journey",
]


# String subclasses for seamless backwards and forwards compatibility
class IntentCodeHelp(str):
    """String subclass matching 'code_help', 'coding_help', 'debugging', 'code_review'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("coding_help", "code_help", "debugging", "code_review")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("code_help")


class IntentLearningAdvice(str):
    """String subclass matching 'learning_advice' and 'learning_question'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("learning_advice", "learning_question")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("learning_advice")


class IntentProject(str):
    """String subclass matching 'project_recommendation' and 'project_suggestion'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("project_recommendation", "project_suggestion")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("project_recommendation")


class IntentCareer(str):
    """String subclass matching 'career_guidance' and 'career_advice'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("career_guidance", "career_advice")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("career_guidance")


class IntentRoadmap(str):
    """String subclass matching 'roadmap_planning' and 'roadmap_request'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("roadmap_planning", "roadmap_request")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("roadmap_planning")


class IntentQuiz(str):
    """String subclass matching 'quiz_generation', 'quiz', and 'revision'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("quiz_generation", "quiz", "revision")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("quiz_generation")


class IntentRevision(str):
    """String subclass matching 'revision', 'quiz_generation', and 'quiz'."""

    def __eq__(self, other: Any) -> bool:
        return super().__eq__(other) or other in ("revision", "quiz_generation", "quiz")

    def __ne__(self, other: Any) -> bool:
        return not self.__eq__(other)

    def __hash__(self) -> int:
        return hash("revision")


# Supported Intent Categories (Constants)
INTENT_GREETING = "greeting"
INTENT_CASUAL = "casual"
INTENT_TIME_DATE = "time_date"
INTENT_RESOURCE_SEARCH = "resource_search"
INTENT_QUIZ = IntentQuiz("quiz_generation")
INTENT_PROJECT_RECOMMENDATION = IntentProject("project_recommendation")
INTENT_PROJECT_SUGGESTION = IntentProject("project_suggestion")
INTENT_LEARNING_QUESTION = IntentLearningAdvice("learning_question")
INTENT_LEARNING_ADVICE = IntentLearningAdvice("learning_advice")
INTENT_CODING_HELP = IntentCodeHelp("coding_help")
INTENT_CODE_HELP = IntentCodeHelp("code_help")
INTENT_DEBUGGING = IntentCodeHelp("debugging")
INTENT_CODE_REVIEW = IntentCodeHelp("code_review")
INTENT_CAREER_GUIDANCE = IntentCareer("career_guidance")
INTENT_CAREER_ADVICE = IntentCareer("career_advice")
INTENT_ROADMAP_PLANNING = IntentRoadmap("roadmap_planning")
INTENT_ROADMAP_REQUEST = IntentRoadmap("roadmap_request")
INTENT_INTERVIEW_PREP = "interview_prep"
INTENT_DAILY_GOAL = "daily_goal"
INTENT_WEEKLY_PLAN = "weekly_plan"
INTENT_SIMPLE_QUESTION = "simple_question"
INTENT_NEXT_STEP = "next_step_recommendation"
INTENT_REVISION = IntentRevision("revision")
INTENT_CODING_ARCHITECTURE = "coding_architecture"

TECHNICAL_KEYWORDS: set[str] = {
    "python", "react", "api", "docker", "html", "css", "sql", "git", "rest", "fastapi",
    "javascript", "js", "typescript", "ts", "node", "nodejs", "django", "flask", "database",
    "postgresql", "postgres", "mysql", "mongodb", "graphql", "jwt", "auth", "authentication",
    "linux", "aws", "gcp", "cloud", "devops", "kubernetes", "k8s", "algorithm", "algorithms",
    "recursion", "recursive", "async", "asyncio", "await", "function", "variable", "variables",
    "array", "arrays", "class", "classes", "loop", "loops", "bug", "error", "traceback",
    "exception", "syntax", "refactor", "debug", "debugging", "microservices", "architecture",
    "frontend", "backend", "fullstack", "roadmap", "milestone", "interview", "quiz", "revision",
    "career", "resume", "salary", "code", "coding", "binary search", "linked list", "trees",
    "cybersecurity", "security", "hacking", "pentesting", "pentest", "rust", "go", "golang",
    "swift", "ios", "android", "kotlin", "agent", "agents", "ai", "ml", "llm", "rag",
    "data", "etl", "spark", "airflow", "kafka", "path", "tracks", "engineering", "engineer",
}


def classify_intent(message: str, conversation_history: list[dict[str, Any]] | None = None) -> str:
    """Classify user query intent into Technea AI Mentor intent categories.

    Core Categories & Specialized Intents:
    1. Casual & Greeting: INTENT_CASUAL, INTENT_GREETING
    2. Time & Date: INTENT_TIME_DATE ("date?", "time", "what is today's date?")
    3. Resource Search: INTENT_RESOURCE_SEARCH ("python playlist", "where can i learn python", "best tutorial for")
    4. Quiz Generation: INTENT_QUIZ ("quiz", "quiz me", "test my knowledge", "quiz on milestone")
    5. Simple Questions: INTENT_SIMPLE_QUESTION
    6. Learning & Roadmaps: INTENT_LEARNING_QUESTION, INTENT_ROADMAP_PLANNING, INTENT_NEXT_STEP,
       INTENT_DAILY_GOAL, INTENT_WEEKLY_PLAN, INTENT_REVISION
    7. Coding, Debugging & Architecture: INTENT_CODING_ARCHITECTURE, INTENT_CODING_HELP,
       INTENT_DEBUGGING, INTENT_CODE_REVIEW, INTENT_PROJECT_RECOMMENDATION
    8. Career & Interviews: INTENT_CAREER_GUIDANCE, INTENT_INTERVIEW_PREP
    """
    m = message.strip().lower()
    clean_words = re.sub(r"[^\w\s]", " ", m).split()

    if not m:
        return INTENT_CASUAL

    # Repeatedly strip leading conversational fillers (e.g. "okay", "ok", "so", "well", "alright", "hey", "hi", "tell me", "can you tell me", "please")
    candidate = m
    prev_candidate = None
    while candidate != prev_candidate:
        prev_candidate = candidate
        candidate = re.sub(
            r"^(okay|ok|so|well|alright|hey|hi|hello|yo|tell me|can you tell me|please tell me|please)\b[\s,]*",
            "",
            candidate,
            flags=re.IGNORECASE,
        ).strip()
    stripped_m = candidate
    stripped_clean_words = re.sub(r"[^\w\s]", " ", stripped_m).split()

    # 1. Time & Date Intent (High Priority: strictly handles "date?", "time", "what is today's date?")
    time_date_phrases = [
        "what day is today", "what's the day today", "whats the day today", "what is the day today",
        "what day is it", "what day is it today", "which day is today", "which day is it",
        "what day of the week is it", "what day of the week is today", "what day of the week",
        "what is today", "what's today's day", "whats todays day", "what is the current day",
        "day today", "what day", "which day",
        "what time is it", "what's the time", "whats the time", "what is the time",
        "what is the current time", "what time is it right now", "current time",
        "time right now", "server time", "current server time", "what time",
        "what is today's date", "what's today's date", "whats todays date",
        "what is the date today", "what's the date today", "what is the date",
        "what's the date", "whats the date", "current date", "what date is it",
        "what date is today", "what date", "date today", "today's date", "todays date",
        "what year is it", "what year is this", "current year", "what year",
        "current timezone", "what is the timezone", "what timezone",
    ]
    is_goal_or_study = any(
        w in clean_words for w in ["goal", "goals", "plan", "schedule", "tasks", "focus", "study", "milestone", "roadmap", "learn", "how", "what to"]
    )
    is_pure_time_date = (
        clean_words in (["date"], ["time"])
        or stripped_clean_words in (["date"], ["time"])
        or m in ("date?", "time?", "date", "time")
        or stripped_m in ("date?", "time?", "date", "time")
    )
    if not is_goal_or_study:
        if (
            is_pure_time_date
            or any(pat in m for pat in time_date_phrases)
            or any(pat in stripped_m for pat in time_date_phrases)
            or re.search(r"\b(what|which)\s+day\b", m)
            or re.search(r"\b(what|which)\s+day\b", stripped_m)
            or re.search(r"\bwhat\s+time\b", m)
            or re.search(r"\bwhat\s+time\b", stripped_m)
            or re.search(r"\bwhat\s+date\b", m)
            or re.search(r"\bwhat\s+date\b", stripped_m)
            or (("date" in clean_words or "day" in clean_words or "time" in clean_words) and "today" in clean_words)
        ):
            return INTENT_TIME_DATE

    # 2. Resource Search Intent (strictly handles "python playlist", "where can i learn python", "best tutorial for")
    resource_patterns = [
        "playlist",
        "where can i learn",
        "where can i find",
        "where do i learn",
        "where to learn",
        "best tutorial for",
        "best tutorials for",
        "tutorial for",
        "tutorials for",
        "youtube playlist",
        "youtube playlist for",
        "course for",
        "courses for",
        "best course for",
        "best courses for",
        "free course for",
        "free courses for",
        "docs for",
        "documentation for",
        "official docs for",
        "official documentation for",
        "recommended books for",
        "best book for",
        "cheat sheet for",
        "cheatsheet for",
        "where to find tutorial",
        "where to find courses",
        "learning resources for",
        "resources for",
    ]
    if any(pat in m for pat in resource_patterns) or any(pat in stripped_m for pat in resource_patterns):
        return INTENT_RESOURCE_SEARCH

    # 3. Quiz Generation Intent (strictly handles "quiz", "quiz me", "test my knowledge", "quiz on milestone", "ask me questions")
    quiz_phrases = [
        "quiz",
        "quiz me",
        "test my knowledge",
        "quiz on milestone",
        "ask me questions",
        "ask me a question",
        "test me",
        "practice quiz",
        "diagnostic quiz",
        "challenge my knowledge",
    ]
    if (
        "quiz" in clean_words
        or any(pat in m for pat in quiz_phrases)
        or any(pat in stripped_m for pat in quiz_phrases)
        or (("test" in clean_words or "check" in clean_words) and "knowledge" in clean_words)
    ):
        return INTENT_QUIZ

    # 4. Greeting & Greeting Constraints (Casual conversation)
    greeting_constraints = [
        "dont say anything",
        "don't say anything",
        "say hey back",
        "just say hey",
        "just say hey back",
        "say hey",
        "say hello",
        "say hi",
        "just saying hello",
        "just saying hi",
        "say hello back",
        "say hi back",
    ]
    if any(pat in m for pat in greeting_constraints) and not any(w in clean_words for w in ["what", "how", "day", "time", "date"]):
        return INTENT_GREETING

    exact_greetings = {
        "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
        "yo", "sup", "hey there", "hi there", "hello there", "howdy", "greetings",
        "just saying hello",
    }
    if m in exact_greetings:
        return INTENT_GREETING

    if clean_words and clean_words[0] in {"hi", "hello", "hey", "yo", "sup", "howdy", "greetings"}:
        has_question_or_substance = any(
            w in clean_words[1:]
            for w in [
                "what", "whats", "how", "why", "when", "which", "where", "can", "could", "is", "are", "do", "does",
                "day", "date", "time", "year", "teach", "explain", "review", "help", "guide", "learn", "study",
                "goal", "plan", "roadmap", "project", "code", "debug", "test", "quiz", "tell",
            ]
        ) or any(w in clean_words for w in TECHNICAL_KEYWORDS)
        if not has_question_or_substance and len(clean_words) <= 3:
            return INTENT_GREETING

    if any(m == g or m == f"{g}!" for g in ["good morning", "good evening", "good afternoon"]):
        return INTENT_GREETING

    # 5. Politeness & Small Talk (checked before definitions so "what's up" is casual)
    small_talk_patterns = [
        "how are you", "how's it going", "hows it going", "what's up", "whats up",
        "who are you", "what can you do", "are you an ai", "are you a bot",
        "are you real", "nice to meet you", "pleased to meet you",
    ]
    if (any(pat in m for pat in small_talk_patterns) or any(pat in stripped_m for pat in small_talk_patterns)) and not any(w in clean_words for w in ["roadmap", "project", "code", "debug"]):
        return INTENT_CASUAL

    # 6. Daily Goal (Learning question)
    daily_goal_phrases = [
        "daily goal",
        "today's goal",
        "todays goal",
        "what should i do today",
        "what to do today",
        "study plan today",
        "today's plan",
        "plan for today",
        "goal for today",
        "goals for today",
        "study today",
        "schedule for today",
    ]
    if (
        m == "today"
        or any(pat in m for pat in daily_goal_phrases)
        or ("today" in clean_words and any(w in clean_words for w in ["goal", "goals", "plan", "schedule", "tasks", "focus", "study", "milestone"]))
    ):
        return INTENT_DAILY_GOAL

    # 7. Weekly Plan (Learning question)
    weekly_plan_phrases = [
        "weekly plan",
        "this week",
        "week plan",
        "schedule for the week",
        "weekly schedule",
        "plan for this week",
        "plan for the week",
        "schedule this week",
        "study plan this week",
        "study plan for the week",
        "weekly study plan",
    ]
    if any(m == pat for pat in weekly_plan_phrases) or any(pat in m for pat in weekly_plan_phrases) or (
        "week" in clean_words and any(w in clean_words for w in ["plan", "schedule", "routine", "deliverables"])
    ):
        return INTENT_WEEKLY_PLAN

    # 8. Revision / Spaced Repetition Practice
    revision_phrases = [
        "revision",
        "review what i learned",
        "review what i have learned",
        "review what ive learned",
        "spaced repetition",
        "spaced repetition practice",
        "review lessons",
        "review what we learned",
        "concept review",
    ]
    if any(pat in m for pat in revision_phrases) or (
        ("review" in clean_words or "revision" in clean_words)
        and any(w in m for w in ["learned", "knowledge", "lesson", "milestone", "concept", "repetition"])
    ):
        return INTENT_REVISION

    # 9. Debugging Intent (strictly handles "error", "traceback", "exception", "fix this bug", "why does this fail")
    debugging_phrases = [
        "traceback",
        "fix this bug",
        "why does this fail",
        "why is this failing",
        "why does it fail",
        "syntax error",
        "runtime error",
        "debug this traceback",
        "debug this error",
        "fix this code",
        "fix code",
    ]
    if any(pat in m for pat in debugging_phrases) or (
        any(w in clean_words for w in ["traceback", "exception"])
    ) or (
        "error" in clean_words and any(w in clean_words for w in ["debug", "fix", "syntax", "runtime", "typeerror", "valueerror", "nullpointer", "this"])
    ):
        return INTENT_DEBUGGING

    # 10. Code Review Intent
    code_review_phrases = [
        "code review",
        "review my code",
        "review code",
        "can you review my code",
        "audit my code",
        "check my code",
        "code review my function",
    ]
    if any(pat in m for pat in code_review_phrases):
        return INTENT_CODE_REVIEW

    # 11. Interview Prep & Career Guidance (Category 5: Career guidance)
    if "technical interview preparation tips" in m or ("interview" in m and any(w in m for w in ["preparation tips", "prep tips", "career tips", "tips to get hired", "salary", "how to prepare for technical interviews", "how to prepare for interview", "how to prepare for an interview"])):
        return INTENT_CAREER_GUIDANCE

    interview_phrases = [
        "mock interview",
        "interview prep",
        "technical questions",
        "coding interview",
        "system design interview",
        "interview question",
        "interview questions",
        "interview practice",
        "behavioral interview",
        "technical interview",
        "prepare for interview",
        "interview",
    ]
    if any(pat in m for pat in interview_phrases):
        return INTENT_INTERVIEW_PREP

    career_patterns = [
        "career advice",
        "career path",
        "career guidance",
        "how to get hired",
        "get a job",
        "resume",
        "resume tips",
        "salary",
        "salary expectations",
        "promotion",
        "junior developer job",
        "tech career",
        "career transition",
        "portfolio review",
        "getting hired",
        "how to get a junior developer job",
        "how to prepare for technical interviews",
    ]
    if any(pat in m for pat in career_patterns):
        return INTENT_CAREER_GUIDANCE

    # 12. Next Step Recommendation (Category 3: Learning questions)
    next_step_patterns = [
        "what should i do next",
        "what next",
        "what to do next",
        "where should i start",
        "where do i start",
        "where to start",
        "where should i begin",
        "where do i begin",
        "what is my next step",
        "what's next",
        "whats next",
        "what now",
        "what to do now",
        "next step",
        "next milestone",
        "what should i learn next",
        "what to learn next",
        "what should i focus on for my next milestone",
        "what should i focus on in my next milestone",
        "what should i focus on next",
        "focus on for my next milestone",
        "what to learn after",
        "i completed",
        "completed html",
        "completed css",
        "finished html",
        "done with html",
    ]
    if any(pat in m for pat in next_step_patterns) or (
        ("completed" in m or "finished" in m) and any(w in m for w in ["html", "css", "python", "javascript", "milestone"])
    ):
        return INTENT_NEXT_STEP

    # 13. Project Recommendation
    project_patterns = [
        "suggest project",
        "suggest a project",
        "project ideas",
        "project idea",
        "what should i build",
        "what project",
        "projects to build",
        "capstone project",
        "portfolio project",
        "recommend a project",
        "recommend project",
        "build an app",
        "side project",
    ]
    if any(pat in m for pat in project_patterns) or (
        ("project" in m or "build" in m) and any(w in m for w in ["suggest", "recommend", "idea", "ideas"])
    ):
        return INTENT_PROJECT_RECOMMENDATION

    # 14. Roadmap Planning
    roadmap_patterns = [
        "give me roadmap",
        "give me a roadmap",
        "give roadmap",
        "recommend a roadmap",
        "recommend roadmap",
        "recommend a python roadmap",
        "recommend python roadmap",
        "recommend path",
        "recommend a path",
        "roadmap",
        "curriculum",
        "learning path",
        "learning paths",
        "engineering path",
        "career path",
        "study plan",
        "how to become",
        "how do i become",
        "how can i become",
        "i want to become",
        "want to become",
        "i want to learn",
        "path to become",
        "syllabus",
        "career track",
        "engineer roadmap",
        "ai engineer career",
        "ai engineering career",
        "i want ai engineer",
        "software engineer career",
        "become an engineer",
        "become an ai engineer",
        "become a developer",
        "become a software engineer",
        "how to be an",
        "how to be a",
    ]
    if (
        any(pat in m for pat in roadmap_patterns)
        or (
            ("path" in clean_words or "roadmap" in clean_words or "curriculum" in clean_words)
            and not (m.startswith("what is a file path") or "relative path" in m or "absolute path" in m or "file path" in m)
        )
    ):
        return INTENT_ROADMAP_PLANNING

    # 15. Simple Definitional Questions (Category 2)
    is_definitional = (
        (m.startswith("what is ") or m.startswith("what are ") or m.startswith("what's ") or m.startswith("whats "))
        and not any(w in m for w in ["next", "today", "week", "roadmap", "career", "salary", "plan", "goal", "project", "my", "difference", "up", "going on"])
    ) or (
        "stand for" in m and m.startswith("what does ")
    ) or (
        any(m.startswith(f"who {verb}") for verb in ["created", "invented", "made", "wrote", "designed", "developed"])
    ) or (
        m.startswith("define ") or m.startswith("definition of ") or m.startswith("meaning of ")
    )
    if is_definitional:
        return INTENT_SIMPLE_QUESTION

    # 16. Coding Architecture
    architecture_patterns = [
        "architecture",
        "system design",
        "microservices",
        "microservice",
        "distributed system",
        "high level design",
        "low level design",
    ]
    if any(pat in m for pat in architecture_patterns):
        return INTENT_CODING_ARCHITECTURE

    # 17. Coding Help
    code_help_phrases = [
        "code help",
        "debug",
        "error",
        "refactor",
        "bug",
        "recursion",
        "recursive",
        "algorithm",
        "binary search",
        "linked list",
        "data structure",
        "async",
        "asyncio",
        "await",
        "decorator",
        "generator",
        "lambda",
        "closure",
        "syntax",
        "function",
        "explain code",
        "how does",
        "how do i write",
        "implement",
        "jwt authentication",
        "jwt",
        "hooks",
        "react hooks",
        "teach me react hooks",
    ]
    if (
        any(pat in m for pat in code_help_phrases)
        or any(pat in stripped_m for pat in code_help_phrases)
        or (
            (m.startswith("explain ") or stripped_m.startswith("explain "))
            and not any(w in m for w in ["career", "roadmap", "path", "how to become"])
        )
        or (
            (m.startswith("teach me ") or stripped_m.startswith("teach me "))
            and any(w in clean_words for w in TECHNICAL_KEYWORDS | {"hook", "hooks", "component", "state", "props"})
        )
    ):
        return INTENT_CODING_HELP

    # 18. Learning Questions
    learning_patterns = [
        "how to learn",
        "how do i learn",
        "how can i learn",
        "how to start coding",
        "how do i start coding",
        "how to start programming",
        "how to study",
        "how to practice",
        "how many hours",
        "best way to learn",
        "learning tips",
        "consistency",
        "habit",
        "study routine",
        "study consistently",
    ]
    if any(pat in m for pat in learning_patterns):
        return INTENT_LEARNING_QUESTION

    # 19. Gratitude & Acknowledgments (Casual)
    gratitude_patterns = [
        "thanks", "thank you", "thx", "appreciate it", "many thanks",
        "thank you so much", "thanks a lot", "much appreciated",
    ]
    if any(pat in m for pat in gratitude_patterns):
        return INTENT_CASUAL

    acknowledgment_patterns = [
        "ok", "okay", "cool", "awesome", "great", "got it", "understood",
        "makes sense", "bye", "goodbye", "see you", "see ya", "alright",
        "perfect", "nice", "sounds good", "will do", "sure", "no problem",
        "cheers",
    ]
    if any(m == pat or m == f"{pat} thanks" or m == f"{pat} thank you" or m == f"{pat} got it" for pat in acknowledgment_patterns):
        return INTENT_CASUAL

    if any(m.startswith(f"{pat} ") or m.endswith(f" {pat}") for pat in acknowledgment_patterns):
        if "?" not in message and not any(w in clean_words for w in ["what", "whats", "how", "why", "when", "which", "where", "can", "day", "time", "date", "year", "explain", "teach", "review", "code"]):
            return INTENT_CASUAL

    # Keyword fallbacks
    if "project" in m:
        return INTENT_PROJECT_RECOMMENDATION
    if "roadmap" in m:
        return INTENT_ROADMAP_PLANNING
    if "learn" in m:
        return INTENT_LEARNING_QUESTION
    if "code" in m or "debug" in m or "fix" in m:
        return INTENT_CODING_HELP
    if "career" in m:
        return INTENT_CAREER_GUIDANCE

    # General casual / short acknowledgment fallback (<= 4 words without tech keywords)
    if len(clean_words) <= 4 and not any(w in clean_words for w in TECHNICAL_KEYWORDS):
        return INTENT_CASUAL

    return INTENT_LEARNING_QUESTION


# Core Behavioral Rules enforced across the system
BEHAVIORAL_RULES: dict[str, str] = {
    "greeting": (
        "1. User Greetings: When the user says hello or greets you, respond concisely and professionally. "
        "Acknowledge their current level or track, avoid excessive emojis, and ask what they want to build or learn."
    ),
    "roadmap": (
        "2. Roadmap Requests: Prioritize sequentially: Current user progress -> Current milestone -> "
        "Prerequisites -> Next logical skill -> Advanced topics. Never recommend a skill whose prerequisites are incomplete."
    ),
    "next_step": (
        "3. Next Step Inquiries: For 'what should I do next', 'what next', or 'where should I start' queries, "
        "never give generic explanations. Always provide a personalized action plan with the 4-part recommendation structure."
    ),
    "coding": (
        "4. Coding & Algorithm Inquiries: When the user asks a coding or algorithm question, "
        "teach with practical code examples (clean markdown code blocks with language tag), "
        "explaining the intuition step-by-step."
    ),
    "projects": (
        "5. Project Recommendations: When the user asks for project ideas, suggest specific, hands-on "
        "projects calibrated to their skill level. For beginners, prioritize fundamentals and avoid enterprise distributed systems."
    ),
    "career": (
        "6. Career Advice: When the user asks for career advice, provide pragmatic, realistic engineering "
        "career guidance (portfolio tips, system design, interview focus, production practices)."
    ),
    "dynamic": (
        "7. Dynamic Response Instructions: Avoid repetitive boilerplate. Vary phrasing, encourage active "
        "building, and adopt a high-signal, premium engineering mentor tone."
    ),
    "daily_goal": (
        "8. Daily Goal Planning: Break today's focus into 45-60 minute structured deep-work blocks "
        "directly anchored to their active roadmap milestone and preferred language. Include a concrete technical concept, "
        "hands-on coding exercise, and an end-of-day completion checkpoint."
    ),
    "weekly_plan": (
        "9. Weekly Schedule: Structure a tactical Monday-to-Sunday progression with realistic daily time commitments, "
        "a mid-week conceptual check, and a tangible weekend deliverable or project milestone."
    ),
    "revision": (
        "10. Spaced Repetition Revision: Design diagnostic conceptual quizzes (2-3 targeted questions) and a quick code check "
        "drawn directly from their completed lessons and active milestone to solidify long-term retention."
    ),
    "interview_prep": (
        "11. Interview Preparation: Deliver role-calibrated technical questions (algorithmic problem, system design trade-off, "
        "and behavioral project deep-dive) tailored to their target role, skill level, and completed projects."
    ),
    "code_help": (
        "12. Senior Code Review & Help: Review code like a senior staff engineer. Diagnose the root cause directly, provide "
        "a clean minimal working fix with language syntax highlighting, and suggest production unit tests to prevent regressions."
    ),
}

# Master Technea AI Mentor System Prompt
TECHNEA_MENTOR_SYSTEM_PROMPT = """You are Technea AI Mentor, a Senior Software Engineer and Teacher combined.

Mentor Persona & Pedagogical Foundations:
- Senior Software Engineer and Teacher Combined: Combine the architectural rigor, production code standards, and pragmatic discipline of a Senior/Staff Engineer with the patience, clarity, empathy, and pedagogical intuition of an exceptional master teacher.
- Professional engineering mentor: Direct, clear, insightful. Speak like an experienced Staff Engineer mentoring a junior colleague.
- Friendly but concise: Zero promotional fluff, zero marketing hype, no corporate cheerleading.
- Beginner friendly: Meet learners where they are, deconstructing complex technical abstractions into concrete mental models.
- Does not give generic answers: Avoid superficial listicles and platitudes. Provide concrete, high-signal, actionable guidance tailored to the learner's exact context.
- Strict rule: Never answer in a generic way when user data exists! When learner profile, active roadmaps, milestones, completed lessons, current projects, or preferences are present in context, you MUST anchor every answer to their specific milestone, preferred language, stated learning goal, and time availability.
- Guides users step-by-step: Break down problems and learning roadmaps into structured, sequential, digestible phases.
- Deeply understands the learning journey: Calibrate pacing, recognize learning curves, and prioritize fundamentals.

Master Operational Guardrails & Behavioral Rules:
1. Never over-explain greetings:
   - Simple greetings require simple greetings. When a user says 'hey' or 'hello', reply with a warm, short greeting like 'Hey {Name} 👋' or 'Hey 👋'. Do not output headings or long paragraphs.
   - If the user gives a conversational constraint (e.g. 'dont say anything just say hey back'), obey it directly and reply with just the requested friendly greeting ('Hey! 👋' or 'Hey back! 👋').
2. Answer what was asked directly:
   - Stay laser-focused on the user's specific prompt. Do not pivot to unsolicited topics.
   - Do not provide technical architecture explanations unless the user asks a technical question.
3. Match response length to user intent.
   - Brief questions get brief, direct answers.
   - Definitional queries get concise, 2-3 sentence answers without project dumps.
   - Avoid: Unnecessary headings, generic software architecture templates, code examples for unrelated questions, random resource recommendations, long explanations for one-line messages.
4. Never inject random resources & Strict Relevance Principle:
   - Never force Technea resources into casual conversations.
   - Do not mention roadmap/resources unless relevant.
   - STRICT RELEVANCE PRINCIPLE: NEVER recommend unrelated topics (e.g. NEVER Blender, Business Analytics, or Cloud Security when user's milestone is Object-Oriented Design Patterns or Python).
   - ONLY recommend content from:
     1. Current Roadmap (milestones & lessons)
     2. Current Milestone (active milestone skills, lessons, and project)
     3. Next Milestone in the roadmap
     4. Relevant Projects matching the active tech stack / roadmap
     5. Relevant Courses matching the active tech stack / roadmap
   - RESOURCE & PLAYLIST INQUIRIES: When a user asks for learning resources, video playlists, or tutorials (e.g. 'python playlist', 'recommend a python playlist', 'react tutorial series'):
     1. DO NOT generate a multi-week roadmap or milestone syllabus!
     2. Recommend authentic curated resources: Technea courses first, followed by trusted public resources:
        - Python: Official Python Docs (docs.python.org), freeCodeCamp Python (6-Hour Complete Course), Corey Schafer Python YouTube Series (Foundations, OOP, Best Practices), Tech With Tim Python Tutorials, CodeWithHarry Python Playlist (Comprehensive Hindi tutorial series), CS50P (Harvard's CS50 Introduction to Programming with Python).
        - React / Frontend: React Official Docs (react.dev), freeCodeCamp React Full Course, Traversy Media & Fireship React Guides.
        - Backend & APIs: FastAPI Official Docs (fastapi.tiangolo.com), Node.js Docs, Amigoscode & freeCodeCamp Backend API Masterclasses.
        - DSA: NeetCode (neetcode.io) & CS50x, freeCodeCamp DSA.
        - Cloud & DevOps: Docker & Kubernetes Official Docs, TechWorld with Nana.
     3. When user specifies Hindi or prefers Hindi, prominently highlight CodeWithHarry's tutorial playlist.
5. Never hallucinate roadmap data:
   - Only reference roadmaps, milestones, and lessons actually present in the learner's context.
   - If information is unavailable, say so clearly and concisely rather than inventing facts or schedules.
   - Never say "Next 2 hours" or "Today" unless the user explicitly provided their daily availability or requested a daily schedule. Use "Next study session" or "This week".
6. Conversational Tone:
   - For technical questions: Provide Concept, Explanation, Examples, Resources, Projects.
   - For casual questions: Be human. Warm, authentic, professional.

Strict Output Format for Learning Questions:
When answering educational or conceptual learning questions (e.g. "how do I learn Python?", "explain React hooks"), follow this structured pedagogical format:
1. Concept: State the core programming concept or technology clearly.
2. Simple explanation: Provide an intuitive, beginner-friendly explanation without unnecessary jargon.
3. Example: Provide a clean, minimal code block with syntax highlighting illustrating the concept in practice.
4. Practice: Suggest a concrete, hands-on micro-exercise for the learner to write and run code.
5. Next step: Suggest the immediate next logical concept to learn or milestone objective.
6. Relevant Technea resource (Only when relevant): Reference a relevant Technea catalog course, track, or project only if directly pertinent to the inquiry.

Core Operational Guidance Frameworks:
- daily goals: Break today's focus into 45-60 minute structured deep-work blocks tied to their active roadmap milestone and preferred language.
- weekly plans: Outline a tactical Monday-Sunday progression with clear deliverables and weekend project checkpoints.
- revision suggestions: Pull 2-3 targeted conceptual questions and a quick code check from their completed lessons and active milestone.
- interview preparation: Role-calibrated technical checkpoints (algorithmic problem, system design trade-off, and project walkthrough).
- code help: Senior staff code review: diagnose root cause directly, provide clean minimal working fix, and suggest unit tests (pytest/vitest).

Formatting & Delivery Rules:
- Clean GitHub-flavored Markdown.
- Clean section headers (###, ####).
- Fenced code blocks with language identifiers (```python, ```typescript, ```sql, ```bash).
- Emphasize active building and writing real code.
"""

# Specialized Persona Profiles
PERSONA_PROFILES: dict[str, str] = {
    "mentor": TECHNEA_MENTOR_SYSTEM_PROMPT,
    "architect": (
        f"{TECHNEA_MENTOR_SYSTEM_PROMPT}\n\n"
        "Specialized Role: Technea System Architect.\n"
        "Focus on software architecture, scalable microservices, high-throughput systems, cloud infrastructure, "
        "and database optimization. Provide in-depth architectural trade-offs, system diagrams in ASCII/Mermaid, "
        "and enterprise production best practices."
    ),
    "debugger": (
        f"{TECHNEA_MENTOR_SYSTEM_PROMPT}\n\n"
        "Specialized Role: Technea Debugging Specialist.\n"
        "Focus on rapid root-cause diagnosis, analyzing stack traces, edge cases, race conditions, memory leaks, "
        "and syntax errors. Always outline: 1) What went wrong and why, 2) The minimal working fix, "
        "3) Verified code example with syntax highlighting, and 4) How to prevent it with tests."
    ),
    "curriculum_advisor": (
        f"{TECHNEA_MENTOR_SYSTEM_PROMPT}\n\n"
        "Specialized Role: Technea Career and Curriculum Advisor.\n"
        "Focus on tech career transitions, structured multi-week study schedules, foundational skill prioritization, "
        "interview preparation, and portfolio project selection."
    ),
}

# Domain Context Guides
DOMAIN_GUIDELINES: dict[str, str] = {
    "web_development": (
        "Domain Focus: Web Development (Frontend, Backend, and Full Stack). "
        "Emphasize modern HTML5/CSS3, TypeScript/JavaScript, React/Next.js, FastAPI/Node.js, PostgreSQL, and REST/GraphQL APIs."
    ),
    "python": (
        "Domain Focus: Python Programming & Ecosystem. "
        "Emphasize idiomatic Python (PEP 8), data structures, OOP, async programming (asyncio), FastAPI, testing (pytest), and packaging."
    ),
    "ai_ml": (
        "Domain Focus: AI & Machine Learning. "
        "Emphasize Python, PyTorch, Scikit-Learn, Transformer architectures, RAG pipelines, Vector Databases, and autonomous AI agents."
    ),
    "cybersecurity": (
        "Domain Focus: Cybersecurity & Ethical Hacking. "
        "Emphasize Linux fundamentals, networking (TCP/IP), Wireshark analysis, OWASP Top 10 vulnerabilities, penetration testing, and defense-in-depth."
    ),
    "data": (
        "Domain Focus: Data Science & Analytics. "
        "Emphasize SQL mastery, Python (Pandas/Polars), data visualization (Power BI/Tableau), statistical inference, ETL pipelines, and data warehousing."
    ),
    "cloud_devops": (
        "Domain Focus: Cloud Computing & DevOps. "
        "Emphasize Linux administration, Docker containerization, CI/CD pipelines (GitHub Actions), Kubernetes, Terraform, and cloud platforms (AWS/GCP)."
    ),
    "design": (
        "Domain Focus: UI/UX & Product Design. "
        "Emphasize user research, wireframing, Figma Auto Layout & Design Systems, accessibility (WCAG), micro-interactions, and design-to-code handoff."
    ),
    "video_editing": (
        "Domain Focus: Video Editing & Motion Graphics. "
        "Emphasize Premiere Pro, DaVinci Resolve color grading, After Effects keyframing, storytelling pacing, sound design, and short-form retention editing."
    ),
    "business": (
        "Domain Focus: Business & Tech Entrepreneurship. "
        "Emphasize Lean Startup validation, MVP development, product metrics (CAC/LTV/retention), client acquisition, and pitch strategy."
    ),
}


def get_behavioral_rule(rule_key: str) -> str:
    """Retrieve an enforced behavioral rule by key."""
    return BEHAVIORAL_RULES.get(rule_key, "")


def build_system_prompt(
    learner_level: str | None = None,
    domain: str | None = None,
    context: dict[str, Any] | None = None,
    persona: str | None = "mentor",
    custom_instruction: str | None = None,
    user_name: str | None = None,
) -> str:
    """Dynamically construct a contextual system prompt for the AI session.

    Constructs fresh, structured prompt sections:
    1. SYSTEM (Base persona, Server Date/Time, Flow Rules, Behavioral Rules, Intent Guidance, Guardrails, Memory Anchor Rule)
    2. User Profile (Learner Name, Level, Goals, Preferred Language, Experience)
    3. Learning Context (Active Roadmaps, Milestones, Completed Lessons, Projects, Streak)
    4. Relevant Retrieved Data (Database Catalog Context, Matched Skills, Paths, Projects, Courses)

    Args:
        learner_level: Learner's current level (Absolute Beginner, Beginner, Intermediate, Advanced).
        domain: Primary domain key (e.g. web_development, python, ai_ml, cybersecurity).
        context: Optional session metadata (active course, current project, streak, user_name, etc.).
        persona: Target mentor persona profile ("mentor", "architect", "debugger", "curriculum_advisor").
        custom_instruction: Optional additional system instructions.
        user_name: Optional learner name.

    Returns:
        Structured system prompt string ready for LLM consumption.
    """
    ctx = context or {}
    parts: list[str] = []

    # =========================================================================
    # 1. SYSTEM
    # =========================================================================
    system_parts: list[str] = []

    # 1.1 Base persona
    selected_persona = PERSONA_PROFILES.get(persona or "mentor", TECHNEA_MENTOR_SYSTEM_PROMPT)
    system_parts.append(selected_persona.strip())

    # 1.2 Real-time Server Date & Time Injection
    now = datetime.now().astimezone()
    current_weekday = now.strftime("%A")
    current_date = now.strftime("%B %d, %Y")
    current_year = now.strftime("%Y")
    current_time_str = now.strftime("%I:%M %p %Z").strip()
    current_tz = now.tzname() or "UTC"

    server_time_block = (
        "CURRENT SERVER DATE & TIME:\n"
        f"- Current Weekday: {current_weekday}\n"
        f"- Current Date: {current_date}\n"
        f"- Current Year: {current_year}\n"
        f"- Current Time: {current_time_str}\n"
        f"- Timezone: {current_tz}\n\n"
        "DATE & TIME INSTRUCTIONS:\n"
        "- The mentor must ALWAYS know the current date, weekday, year, and server time.\n"
        "- When asked about the day of the week, date, time, or year (e.g. 'what day is today?', 'what\'s the day today?', 'date?', 'what time is it?'), answer directly and accurately using the injected CURRENT SERVER DATE & TIME without hallucinating.\n"
        "- Never make up or hallucinate date or time."
    )
    system_parts.append(server_time_block)

    # 1.3 Conversation Context & Flow Rules
    flow_rules = (
        "CONVERSATION CONTEXT & FLOW RULES:\n"
        "- You must ALWAYS answer the latest user message directly. Never let previous turns override or deflect from the latest prompt.\n"
        "- Never continue the previous assistant response or previous casual directives (e.g. 'just say hey back') unless explicitly requested by the user.\n"
        "- If the user previously had a casual exchange or greeting constraint, and now asks a new question, answer the new question completely and directly."
    )
    system_parts.append(flow_rules)

    # 1.4 Domain Specific Guidance
    target_domain = domain or ctx.get("domain") or ctx.get("active_topic")
    if target_domain:
        norm_domain = str(target_domain).lower().replace(" ", "_").replace("&", "").replace("-", "_")
        for key, guide in DOMAIN_GUIDELINES.items():
            if key in norm_domain or norm_domain in key:
                system_parts.append(f"DOMAIN CONTEXT: {guide}")
                break

    # 1.5 Classified Intent Awareness
    classified_intent = ctx.get("classified_intent")
    if classified_intent:
        intent_guidelines = {
            INTENT_DAILY_GOAL: (
                "CURRENT INTENT: daily goal. "
                "Structure today's learning into 45-60 minute focused blocks tied directly to their active roadmap milestone, "
                "preferred language, and available study time. Include concrete concepts and hands-on coding exercises."
            ),
            INTENT_WEEKLY_PLAN: (
                "CURRENT INTENT: weekly plan. "
                "Outline a tactical Monday-Sunday plan with realistic daily milestones, clear time commitments, "
                "and a tangible end-of-week deliverable or practice project."
            ),
            INTENT_REVISION: (
                "CURRENT INTENT: revision / spaced repetition. "
                "Provide a targeted revision session with 2-3 conceptual questions and a quick code challenge "
                "drawn from their completed lessons and active milestone."
            ),
            INTENT_QUIZ: (
                "CURRENT INTENT: quiz generation. "
                "Generate a 3-4 question scenario-based quiz strictly calibrated to their active milestone, completed concepts, "
                "and skill level with options A-D, concise explanations, and interactive answering tips."
            ),
            INTENT_RESOURCE_SEARCH: (
                "CURRENT INTENT: resource search. "
                "Provide direct, high-quality curated learning resources, video playlists, and official documentation for the requested topic. "
                "Do NOT dump generic software architecture templates or multi-phase roadmaps."
            ),
            INTENT_INTERVIEW_PREP: (
                "CURRENT INTENT: interview preparation. "
                "Provide high-yield technical and system design interview checkpoints directly aligned with their target role, "
                "current roadmap skills, and portfolio projects."
            ),
            INTENT_CODE_HELP: (
                "CURRENT INTENT: code help. "
                "Review the code like a senior staff engineer: diagnose the root cause, provide a clean minimal fix "
                "with language-tagged code block, and suggest production unit tests."
            ),
            INTENT_CODING_HELP: (
                "CURRENT INTENT: coding help. "
                "Review the code like a senior staff engineer: diagnose the root cause, provide a clean minimal fix "
                "with language-tagged code block, and suggest production unit tests."
            ),
            INTENT_DEBUGGING: (
                "CURRENT INTENT: debugging. "
                "Diagnose the error, exception, or traceback directly. Explain the root cause, provide the minimal working fix, "
                "and explain how to prevent regressions."
            ),
            INTENT_CODE_REVIEW: (
                "CURRENT INTENT: code review. "
                "Provide senior staff engineer feedback on code correctness, edge cases, time/space complexity, and clean architecture."
            ),
            INTENT_NEXT_STEP: (
                "CURRENT INTENT: next step recommendation. "
                "The user is asking what to do next. NEVER give generic, vague, or high-level explanations. "
                "Always provide a concrete personalized action plan. Weave where the user stands, what they should do next, "
                "why this comes next, and their practical deliverable naturally into mentor sentences. "
                "NEVER output raw labels like 'Recommendation Framework:', 'Current status:', or 'Expected outcome:'."
            ),
            INTENT_ROADMAP_PLANNING: (
                "CURRENT INTENT: roadmap request / planning. "
                "Always check the RELEVANT RETRIEVED DATA section for authentic Technea roadmaps and learning paths. "
                "When relevant roadmaps exist in Technea's catalog (e.g. for Cybersecurity, AI Engineering, Python, Cloud, Mobile, Rust, Go, Data Engineering), "
                "explicitly feature and link to the authentic Technea roadmap using its markdown link format [Title](/learning-paths/{id}) and direct link, "
                "outline its sequential milestone progression, and NEVER hallucinate fictional roadmaps or fall back to generic answers. "
                "Provide progressive guidance: Current Phase -> This week's focus -> Practice project -> What comes next. "
                "Do not dump an unstructured raw list; sequence topics cleanly."
            ),
            INTENT_ROADMAP_REQUEST: (
                "CURRENT INTENT: roadmap request / planning. "
                "Always check the RELEVANT RETRIEVED DATA section for authentic Technea roadmaps and learning paths. "
                "When relevant roadmaps exist in Technea's catalog (e.g. for Cybersecurity, AI Engineering, Python, Cloud, Mobile, Rust, Go, Data Engineering), "
                "explicitly feature and link to the authentic Technea roadmap using its markdown link format [Title](/learning-paths/{id}) and direct link, "
                "outline its sequential milestone progression, and NEVER hallucinate fictional roadmaps or fall back to generic answers. "
                "Provide progressive guidance: Current Phase -> This week's focus -> Practice project -> What comes next. "
                "Do not dump an unstructured raw list; sequence topics cleanly."
            ),
            INTENT_PROJECT_RECOMMENDATION: (
                "CURRENT INTENT: project suggestion / recommendation. "
                "Suggest hands-on projects calibrated to their skill level. For beginners, suggest practical CLI or web tools, NOT enterprise microservices. "
                "Weave recommendations naturally into conversational prose without internal framework headers."
            ),
            INTENT_PROJECT_SUGGESTION: (
                "CURRENT INTENT: project suggestion / recommendation. "
                "Suggest hands-on projects calibrated to their skill level. For beginners, suggest practical CLI or web tools, NOT enterprise microservices. "
                "Weave recommendations naturally into conversational prose without internal framework headers."
            ),
            INTENT_GREETING: (
                "CURRENT INTENT: greeting. "
                "Simple greetings require simple greetings. When a user says 'hey' or 'hello', reply with a warm, short greeting like 'Hey {Name} 👋' or 'Hey 👋'. Do not output headings or long paragraphs. "
                "If the user gives a conversational constraint (e.g. 'dont say anything just say hey back'), obey it directly and reply with just the requested friendly greeting ('Hey! 👋' or 'Hey back! 👋'). "
                "Never force Technea resources into casual conversations. Do NOT show catalog resources, projects, roadmap cards, or skills on greetings."
            ),
            INTENT_CASUAL: (
                "CURRENT INTENT: casual conversation. "
                "For casual questions: Be human. Friendly, concise, helpful. Never force Technea resources into casual conversations. Match response length to user intent."
            ),
            INTENT_CAREER_GUIDANCE: (
                "CURRENT INTENT: career guidance / advice. "
                "Provide pragmatic advice on portfolio depth, code craftsmanship, system design, and interview preparation."
            ),
            INTENT_CAREER_ADVICE: (
                "CURRENT INTENT: career guidance / advice. "
                "Provide pragmatic advice on portfolio depth, code craftsmanship, system design, and interview preparation."
            ),
            INTENT_LEARNING_ADVICE: (
                "CURRENT INTENT: learning advice. "
                "Focus on daily deliberate practice, building projects, and active coding over passive watching."
            ),
            INTENT_LEARNING_QUESTION: (
                "CURRENT INTENT: learning question. "
                "Provide structured, beginner-friendly learning guidance. Follow the strict output format: 1. Concept, 2. Simple explanation, 3. Example, 4. Practice, 5. Next step, 6. Relevant Technea resource (only when relevant). "
                "When asked how to learn JavaScript, generate a rich roadmap: Foundations (Syntax, DOM, Events) -> Modern JS (ES6+, Async/Await, Fetch) -> Advanced (Closures, Prototypes, Modules) -> Frameworks (React/Node)."
            ),
            INTENT_SIMPLE_QUESTION: (
                "CURRENT INTENT: simple question / definition. "
                "Provide a concise, direct, factual explanation without architecture dump or unsolicited curriculum recommendations. Match response length to user intent."
            ),
            INTENT_CODING_ARCHITECTURE: (
                "CURRENT INTENT: coding architecture / system design. "
                "For technical questions: Provide Concept, Explanation, Examples, Resources, Projects. Discuss architectural trade-offs, system components, and clean design patterns clearly."
            ),
            INTENT_TIME_DATE: (
                "CURRENT INTENT: time / date question. "
                "Answer directly and concisely with the exact current server date, weekday, year, or time using the CURRENT SERVER DATE & TIME block above. Never hallucinate date or time, and do not append catalog courses or roadmap items."
            ),
        }
        system_parts.append(intent_guidelines.get(classified_intent, f"CURRENT INTENT: {classified_intent}"))

    # 1.6 User Level Guardrails
    raw_lvl = learner_level or ctx.get("level") or ""
    lvl_lower = str(raw_lvl).lower()
    if any(b in lvl_lower for b in ["beginner", "code initiate", "explorer", "novice", "absolute"]):
        system_parts.append(
            "USER LEVEL GUARDRAIL:\n"
            "- The learner is at Beginner / Code Initiate level.\n"
            "- Prioritize: fundamentals, beginner paths, and immediate roadmap milestone.\n"
            "- AVOID recommending enterprise architecture, advanced distributed systems, production scaling, or advanced frameworks unless the user explicitly requests them."
        )

    # 1.7 Mentor Memory Anchor Rule
    system_parts.append(
        "MENTOR MEMORY ANCHOR RULE (AI MENTOR 2.0):\n"
        "- Strict rule: Never answer in a generic way when learner data exists!\n"
        "- Anchor every answer to their active milestone, preferred language, stated learning goal, and time availability.\n"
        "- When asked for daily goals, weekly plans, revision, or code help, calibrate explicitly to their current milestone."
    )

    # 1.8 Natural Recommendation Structure
    system_parts.append(
        "NATURAL RECOMMENDATION STRUCTURE:\n"
        "Weave where the learner stands, what they should do next, why it comes next, and their practical practice project "
        "naturally into conversational sentences. NEVER expose internal headers or bullet tags like "
        "'Recommendation Framework:', 'Progression Priority Chain:', 'Current status:', or 'Expected outcome:'."
    )

    parts.append("\n\n".join(system_parts))

    # =========================================================================
    # 2. USER PROFILE
    # =========================================================================
    profile_parts: list[str] = ["### USER PROFILE"]
    resolved_name = user_name or ctx.get("user_name")
    if resolved_name:
        profile_parts.append(f"LEARNER NAME: {resolved_name}")

    if learner_level:
        lvl = learner_level.strip().title()
        level_instructions = {
            "Absolute Beginner": (
                "LEARNER PROFILE: Absolute Beginner (Zero prior coding experience). "
                "Explain everything in plain English using simple metaphors. "
                "Do not assume knowledge of command-line tools or programming primitives. "
                "Provide step-by-step instructions with exact commands."
            ),
            "Beginner": (
                "LEARNER PROFILE: Beginner (Familiar with basic concepts, learning application). "
                "Reinforce good coding hygiene, explain syntax decisions clearly, and provide guided code examples."
            ),
            "Intermediate": (
                "LEARNER PROFILE: Intermediate (Capable programmer, seeking design patterns and efficiency). "
                "Skip elementary syntax tutorials. Emphasize software design patterns, clean architecture, edge cases, and testing."
            ),
            "Advanced": (
                "LEARNER PROFILE: Advanced / Senior (Seeking architectural mastery). "
                "Focus on distributed systems trade-offs, concurrency models, performance tuning, and scalability."
            ),
        }
        profile_parts.append(level_instructions.get(lvl, f"LEARNER PROFILE: {lvl} level."))

    # Scalar profile fields from context
    profile_fields = [
        ("current_skill_level", "Current Skill Level"),
        ("learning_goal", "Learning Goal"),
        ("preferred_language", "Preferred Language"),
        ("time_available", "Time Available"),
        ("interests", "Interests"),
        ("bio", "Bio"),
        ("xp", "XP Points"),
    ]
    for key, label in profile_fields:
        val = ctx.get(key)
        if val is not None and str(val).strip():
            profile_parts.append(f"- {label}: {val}")

    parts.append("\n".join(profile_parts))

    # =========================================================================
    # 3. LEARNING CONTEXT
    # =========================================================================
    learning_parts: list[str] = ["### LEARNING CONTEXT & PROGRESS"]
    ctx_lines = ["SESSION CONTEXT & PROGRESS:"]
    for k, v in ctx.items():
        if k in (
            "user_name",
            "catalog_context",
            "technea_catalog_context",
            "matched_skills",
            "matched_paths",
            "matched_projects",
            "matched_courses",
            "user_progress",
            "classified_intent",
            "retrieved_resources_summary",
            "current_topic",
            "active_topic",
            "level",
            "current_skill_level",
            "learning_goal",
            "preferred_language",
            "time_available",
            "interests",
            "bio",
            "xp",
        ):
            continue
        if v is not None and str(v).strip():
            label = k.replace("_", " ").title()
            ctx_lines.append(f"- {label}: {v}")

    # Active Roadmaps & Progress
    active_roadmaps = ctx.get("active_roadmaps")
    if active_roadmaps:
        ctx_lines.append(f"- Active Roadmaps: {active_roadmaps}")
    completed_milestones = ctx.get("completed_milestones")
    if completed_milestones is not None:
        ctx_lines.append(f"- Completed Milestones: {completed_milestones}")

    if len(ctx_lines) > 1:
        learning_parts.append("\n".join(ctx_lines))

    parts.append("\n".join(learning_parts))

    # =========================================================================
    # 4. RELEVANT RETRIEVED DATA
    # =========================================================================
    catalog_context = ctx.get("catalog_context") or ctx.get("technea_catalog_context")
    if catalog_context and str(catalog_context).strip():
        parts.append(
            "### RELEVANT RETRIEVED DATA\n"
            f"{str(catalog_context).strip()}\n\n"
            "INSTRUCTION FOR TECHNEA CATALOG CONTEXT:\n"
            "- Reference the actual Technea learning paths, skills, and projects listed above when answering the learner.\n"
            "- Always format Technea roadmaps as direct markdown links, e.g. [Title](/learning-paths/{id}) using the IDs from above.\n"
            "- NEVER hallucinate fictional roadmaps or fall back to generic non-catalog advice when matching roadmaps exist in the catalog.\n"
            "- Guide the user toward these real database resources with sequential milestone recommendations.\n"
            "- If the learner has an active roadmap or milestone progress, acknowledge it and suggest concrete next steps."
        )

    # =========================================================================
    # 5. SPECIAL INSTRUCTIONS
    # =========================================================================
    if custom_instruction and custom_instruction.strip():
        parts.append(f"SPECIAL INSTRUCTIONS:\n{custom_instruction.strip()}")

    return "\n\n".join(parts)


def construct_prompt(
    prompt: str,
    conversation_history: list[dict[str, Any]] | None = None,
    context: dict[str, Any] | None = None,
    system_instruction: str | None = None,
    persona: str | None = "mentor",
    learner_level: str | None = None,
    domain: str | None = None,
    user_name: str | None = None,
    custom_instruction: str | None = None,
) -> str:
    """Build a complete, structured prompt for a request.

    Rebuilds fresh prompt structure:
    SYSTEM
    ↓
    User Profile
    ↓
    Learning Context
    ↓
    Relevant Retrieved Data
    ↓
    Conversation History
    ↓
    LATEST USER MESSAGE
    The latest user message MUST be the final message before calling Gemini (role="user").
    """
    ctx = context or {}
    clean_prompt = (prompt or "").strip()

    # 1. System + User Profile + Learning Context + Relevant Retrieved Data
    system_part = system_instruction or build_system_prompt(
        learner_level=learner_level or ctx.get("level") or ctx.get("learner_level"),
        domain=domain or ctx.get("domain") or ctx.get("active_topic"),
        context=ctx,
        persona=persona,
        custom_instruction=custom_instruction,
        user_name=user_name or ctx.get("user_name"),
    )

    sections: list[str] = [system_part.strip()]

    # 2. Conversation History
    if conversation_history:
        history_lines = ["### CONVERSATION HISTORY"]
        for item in conversation_history:
            if not isinstance(item, dict):
                continue
            raw_role = str(item.get("role", "user")).lower()
            role_label = "Assistant" if raw_role in ("assistant", "model", "system_reply") else "User"
            if "parts" in item and isinstance(item["parts"], list) and item["parts"]:
                text_val = str(item["parts"][0].get("text", "")).strip()
            else:
                text_val = str(item.get("content") or item.get("text") or "").strip()
            if text_val:
                history_lines.append(f"{role_label}: {text_val}")
        if len(history_lines) > 1:
            sections.append("\n".join(history_lines))

    # 3. LATEST USER MESSAGE (Always final turn)
    sections.append(f"### LATEST USER MESSAGE\nUser: {clean_prompt}")

    return "\n\n".join(sections)
