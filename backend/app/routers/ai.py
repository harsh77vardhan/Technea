"""Technea AI Mentor conversation router.

Provides context-aware technical mentorship, pedagogical guidance,
interactive follow-ups, and ecosystem deep links for authenticated learners and guests.
"""

from datetime import datetime, timezone
import logging
import re
from typing import Any

from fastapi import APIRouter, status
from sqlalchemy import func, select

from app.api.deps import DatabaseDep, OptionalUserDep
from app.models.learning_path import LearningPath
from app.models.progress import UserLearningPath, UserRoadmapProgress
from app.schemas.ai import AIChatRequest, AIChatResponse, ChatMessage, RelatedAction
from app.services.ai import ai_service, context_retriever
from app.services.ai.prompts import (
    INTENT_CAREER_ADVICE,
    INTENT_CASUAL,
    INTENT_CODE_HELP,
    INTENT_CODING_HELP,
    INTENT_DAILY_GOAL,
    INTENT_GREETING,
    INTENT_INTERVIEW_PREP,
    INTENT_LEARNING_ADVICE,
    INTENT_NEXT_STEP,
    INTENT_PROJECT_SUGGESTION,
    INTENT_REVISION,
    INTENT_ROADMAP_PLANNING,
    INTENT_ROADMAP_REQUEST,
    INTENT_SIMPLE_QUESTION,
    INTENT_TIME_DATE,
    INTENT_WEEKLY_PLAN,
    INTENT_CODING_ARCHITECTURE,
    classify_intent,
)
from app.services.progress import progress_service


logger = logging.getLogger("technea.routers.ai")

router = APIRouter(tags=["AI Mentor"])


def _infer_domain(message: str, context: dict[str, Any] | None = None) -> str:
    """Infer technical domain from message keywords and session context."""
    if context and context.get("domain"):
        return str(context["domain"]).lower()

    t = message.lower()
    if any(w in t for w in ["cyber", "hack", "security", "pentest", "owasp", "network security", "infosec", "wireshark", "port", "firewall"]):
        return "cybersecurity"
    elif any(w in t for w in ["ai agent", "ai agents", "autonomous agent", "crewai", "langgraph", "autogen"]):
        return "ai_agents"
    elif any(w in t for w in ["llm", "rag", "langchain", "llamaindex", "prompt engineering", "transformer", "fine-tuning", "vllm"]):
        return "llm_engineering"
    elif any(w in t for w in ["data engineering", "data engineer", "etl", "spark", "airflow", "kafka", "pyspark", "data pipeline"]):
        return "data_engineering"
    elif any(w in t for w in ["mobile", "ios", "android", "swift", "swiftui", "kotlin", "react native", "flutter"]):
        return "mobile"
    elif any(w in t for w in ["rust", "cargo", "tokio"]):
        return "rust"
    elif any(w in t for w in ["go", "golang", "goroutine"]):
        return "go"
    elif any(w in t for w in ["ai", "machine learning", "ml", "deep learning", "neural", "pytorch", "gpt", "model", "embedding", "agent"]):
        return "ai_ml"
    elif any(w in t for w in ["cloud", "devops", "docker", "kubernetes", "k8s", "aws", "terraform", "ci/cd", "container", "gcp"]):
        return "cloud_devops"
    elif any(w in t for w in ["data", "sql", "analytics", "power bi", "pandas", "tableau", "warehouse", "polars"]):
        return "data"
    elif any(w in t for w in ["python", "fastapi", "django", "flask"]):
        return "python"
    elif any(w in t for w in ["web", "html", "css", "javascript", "react", "frontend", "full stack", "next.js", "node", "vue", "tailwind", "backend"]):
        return "web_development"
    return "general_tech"


def _build_suggestions(
    message: str,
    domain: str,
    is_guest: bool,
    intent: str | None = None,
) -> list[str]:
    """Generate 3-4 natural follow-up prompt suggestions based on intent and domain."""
    p = message.lower()

    if any(w in p for w in ["error", "bug", "traceback", "exception", "failed", "fix", "why is this"]):
        return [
            "Why is my async function returning a pending Promise/Coroutine?",
            "How do I trace memory leaks in this service?",
            "What unit tests should I write to prevent this regression?",
            "How do I set up structured error logging in production?",
        ]

    # Intent-calibrated suggestions
    if intent == INTENT_DAILY_GOAL:
        return [
            "Break my active milestone into today's 45-minute deep-work blocks",
            "What is the single most critical code exercise I should complete today?",
            "Can you give me a 5-minute diagnostic quiz to finish today's session?",
            "What common mistake should I avoid while working on today's tasks?",
        ]
    elif intent == INTENT_WEEKLY_PLAN:
        return [
            "Give me a tactical Monday-to-Sunday study plan for this milestone",
            "What hands-on deliverable should I complete by the end of this week?",
            "How many hours should I dedicate to coding vs reading this week?",
            "What concepts must I master this week before advancing to the next step?",
        ]
    elif intent == INTENT_REVISION:
        return [
            "Quiz me on the core concepts from my recent completed lessons",
            "Can we do a spaced repetition check on my active milestone?",
            "Test my knowledge with 3 real-world technical scenario questions",
            "Give me a quick code challenge to review what I've learned",
        ]
    elif intent == INTENT_INTERVIEW_PREP:
        return [
            "Give me a mock technical interview question tailored to my target role",
            "What system design trade-offs are most asked for this milestone?",
            "How should I explain my active project architecture to a hiring manager?",
            "Can we practice an algorithmic coding problem step-by-step?",
        ]
    elif intent in {INTENT_CODE_HELP, INTENT_CODING_HELP}:
        return [
            "Can you review this code for performance and edge cases?",
            "What unit tests should I write to prevent regressions?",
            "How can I refactor this to follow idiomatic production patterns?",
            "Explain the time and space complexity of this approach",
        ]
    elif intent == INTENT_NEXT_STEP:
        return [
            "What are the prerequisites for this next milestone?",
            "Can you provide a code example for this milestone?",
            "Recommend a practice project for my next step",
            "How long should this milestone take?",
        ]
    elif intent == INTENT_ROADMAP_REQUEST:
        return [
            "What should I focus on first in this roadmap?",
            "What are the strict prerequisites before starting this track?",
            "Can you suggest a portfolio project for Milestone 1?",
            "How do I test my code as I complete each phase?",
        ]
    elif intent == INTENT_PROJECT_SUGGESTION:
        return [
            "Can you break down the architecture of Project 1 step-by-step?",
            "What unit tests should I write for this project?",
            "What is the best way to document this project on GitHub?",
            "What should I do next after completing this project?",
        ]
    elif intent == INTENT_CASUAL:
        return [
            "What should I learn next?",
            "Can you give me a roadmap?",
            "Recommend a project to build",
        ]
    elif intent == INTENT_GREETING:
        return [
            "What should I do next on my learning path?",
            "Can you give me a structured roadmap?",
            "Recommend a hands-on project for my level",
            "Explain recursion with a practical example",
        ]
    elif intent == INTENT_SIMPLE_QUESTION:
        return [
            "Can you show a code example?",
            "How is this used in production?",
            "What should I learn next?",
        ]
    elif intent == INTENT_TIME_DATE:
        return [
            "What should I focus on today?",
            "Show me my weekly plan",
            "Teach me React hooks",
        ]
    elif intent == INTENT_CODING_ARCHITECTURE:
        return [
            "What database indexing strategy should I use?",
            "How do I handle connection pooling at scale?",
            "What monitoring metrics are most critical?",
            "How should I structure the CI/CD pipeline?",
        ]

    domain_suggestions = {
        "web_development": [
            "What hands-on projects can I build to practice modern React?",
            "Can you explain the difference between Server and Client Components?",
            "How should I structure a production-grade full-stack API?",
            "What are modern best practices for state management?",
        ],
        "ai_ml": [
            "How do I build a RAG pipeline from scratch with vector databases?",
            "What mathematical foundations are truly essential for Deep Learning?",
            "Can you recommend a standout AI Agent project for my portfolio?",
            "How do I fine-tune and evaluate open-weight LLMs locally?",
        ],
        "cybersecurity": [
            "What are the most common OWASP Top 10 vulnerabilities and fixes?",
            "How do I set up a safe, isolated home lab for ethical hacking?",
            "What computer networking concepts are vital for security analysts?",
            "Can you explain how public key cryptography and TLS handshakes work?",
        ],
        "cloud_devops": [
            "How do I optimize Docker container image size and build layers?",
            "What is the difference between Docker Compose and Kubernetes orchestration?",
            "How do I set up an automated CI/CD pipeline with GitHub Actions?",
            "What are the most essential Infrastructure as Code patterns in Terraform?",
        ],
        "data": [
            "When should I use SQL window functions over standard GROUP BY?",
            "How do I clean and prepare messy datasets efficiently with Pandas?",
            "What is the key architectural difference between ETL and ELT pipelines?",
            "How do I optimize slow analytical queries on large database tables?",
        ],
    }

    if domain in domain_suggestions:
        return domain_suggestions[domain]

    # General / new learner suggestions
    if is_guest:
        return [
            "Can you recommend a structured roadmap for an absolute beginner?",
            "What technical skill is most in-demand for junior developers?",
            "How do I build an impressive GitHub developer portfolio?",
            "How many hours a week should I spend coding to make consistent progress?",
        ]

    return [
        "What milestone should I focus on next in my learning path?",
        "Recommend a capstone project matching my current skill level",
        "Am I ready to start applying for developer internships or junior roles?",
        "How can I test and benchmark my code for production reliability?",
    ]


def _build_related_actions(
    domain: str,
    active_roadmaps: list[str],
    is_guest: bool,
) -> list[RelatedAction]:
    """Generate contextual actions and deep links for Technea ecosystem features."""
    actions: list[RelatedAction] = []

    # If learner has active roadmaps, surface the first one
    if active_roadmaps:
        actions.append(
            RelatedAction(
                action_type="view_roadmap",
                title=f"Continue Active Track: {active_roadmaps[0]}",
                payload={"roadmap_title": active_roadmaps[0], "status": "active"},
            )
        )

    # Contextual domain actions
    if domain == "web_development":
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="Full-Stack Web Development Roadmap",
                    payload={"domain": "web_development", "slug": "full-stack-web-development"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Master React & Component Architecture",
                payload={"skill": "react", "category": "frontend"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Build a Collaborative Task Kanban Board",
                payload={"project_id": "kanban-board", "difficulty": "intermediate"},
            )
        )
    elif domain == "ai_ml":
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="AI & Machine Learning Roadmap",
                    payload={"domain": "ai_ml", "slug": "ai-machine-learning"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Master PyTorch & Deep Learning Fundamentals",
                payload={"skill": "pytorch", "category": "ai"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Build an Autonomous Knowledge & RAG Agent",
                payload={"project_id": "ai-agent", "difficulty": "advanced"},
            )
        )
    elif domain == "cybersecurity":
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="Cybersecurity Foundations Roadmap",
                    payload={"domain": "cybersecurity", "slug": "cybersecurity-foundations"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Network Packet Inspection with Wireshark",
                payload={"skill": "wireshark", "category": "security"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Build a Security Audit & Vulnerability Scanner",
                payload={"project_id": "vuln-scanner", "difficulty": "intermediate"},
            )
        )
    elif domain == "cloud_devops":
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="Cloud & DevOps Engineering Roadmap",
                    payload={"domain": "cloud_devops", "slug": "cloud-devops-engineering"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Master Containerization with Docker",
                payload={"skill": "docker", "category": "devops"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Deploy Microservices on Kubernetes",
                payload={"project_id": "k8s-deploy", "difficulty": "advanced"},
            )
        )
    elif domain == "data":
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="Data Science & Analytics Roadmap",
                    payload={"domain": "data", "slug": "data-science-analytics"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Master Advanced SQL & Query Optimization",
                payload={"skill": "sql", "category": "data"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Build an End-to-End Analytics Pipeline",
                payload={"project_id": "analytics-pipeline", "difficulty": "intermediate"},
            )
        )
    else:
        if not active_roadmaps:
            actions.append(
                RelatedAction(
                    action_type="view_roadmap",
                    title="Browse Interactive Career Roadmaps",
                    payload={"view": "roadmaps_catalog"},
                )
            )
        actions.append(
            RelatedAction(
                action_type="explore_skill",
                title="Explore Skill Tree & Competencies",
                payload={"view": "skills_catalog"},
            )
        )
        actions.append(
            RelatedAction(
                action_type="view_project",
                title="Explore Capstone Project Portfolio",
                payload={"view": "projects_catalog"},
            )
        )

    return actions


@router.post(
    "/chat",
    response_model=AIChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Interactive chat with Technea AI Technical Mentor",
    description="Context-aware AI conversation supporting both authenticated learners and guests.",
)
async def chat_with_ai(
    payload: AIChatRequest,
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> AIChatResponse:
    """Chat with the Technea AI Mentor.

    Incorporates relational database catalog context (real learning paths, skills,
    and capstone projects), learner profile state (level, XP points, streak,
    and active roadmaps), and generates actionable deep links and follow-up prompts.
    """
    # 1. Retrieve real database catalog context & learner progress
    user_id = current_user.id if current_user is not None else None
    retrieved = await context_retriever.retrieve_context(
        db=db,
        query=payload.message,
        user_id=user_id,
    )

    active_roadmaps: list[str] = []
    completed_milestones: int = 0

    if current_user is not None:
        user_name = current_user.full_name or current_user.username or "Developer"
        level = getattr(current_user, "developer_level", None)
        xp = getattr(current_user, "xp_points", None)

        user_prog = retrieved.get("user_progress") or {}
        for r in user_prog.get("active_roadmaps", []):
            if r.get("title") and r["title"] not in active_roadmaps:
                active_roadmaps.append(r["title"])
        for p in user_prog.get("enrolled_paths", []):
            if p.get("title") and p["title"] not in active_roadmaps:
                active_roadmaps.append(p["title"])

        if level is None:
            level = user_prog.get("developer_level") or "Junior Developer"
        if xp is None:
            xp = user_prog.get("xp_points", 0)

        # Fallback query if active_roadmaps still empty
        if not active_roadmaps:
            try:
                stmt_paths = (
                    select(LearningPath.title)
                    .join(UserLearningPath, UserLearningPath.learning_path_id == LearningPath.id)
                    .where(
                        UserLearningPath.user_id == current_user.id,
                        UserLearningPath.status == "active",
                    )
                )
                res_paths = await db.execute(stmt_paths)
                active_roadmaps = [str(t) for t in res_paths.scalars().all() if t]
            except Exception as exc:
                logger.debug("Database lookup for user roadmaps: %s", exc)

        try:
            stmt_milestones = (
                select(func.count(UserRoadmapProgress.id))
                .where(
                    UserRoadmapProgress.user_id == current_user.id,
                    UserRoadmapProgress.is_completed == True,
                )
            )
            res_milestones = await db.execute(stmt_milestones)
            completed_milestones = res_milestones.scalar() or 0
        except Exception as exc:
            logger.debug("Database lookup for user milestones: %s", exc)

        context: dict[str, Any] = {
            "user_name": user_name,
            "level": level,
            "xp": xp,
            "active_roadmaps": active_roadmaps,
            "completed_milestones": completed_milestones,
            "is_guest": False,
            "learning_goal": user_prog.get("learning_goal", "Software Engineering Mastery"),
            "current_skill_level": user_prog.get("current_skill_level") or level,
            "interests": user_prog.get("interests", "Full Stack Development, Web APIs"),
            "preferred_language": user_prog.get("preferred_language") or "Python",
            "time_available": user_prog.get("time_available") or "1-2 hours/day",
            "completed_lessons_count": user_prog.get("completed_lessons_count", 0),
            "recent_completed_lessons": user_prog.get("recent_completed_lessons", []),
            "user_projects": user_prog.get("user_projects", []),
            "recent_activity": user_prog.get("recent_activity", {}),
            "catalog_context": retrieved.get("catalog_context"),
            "technea_catalog_context": retrieved.get("catalog_context"),
            "matched_skills": retrieved.get("skills", []),
            "matched_paths": retrieved.get("learning_paths", []),
            "matched_projects": retrieved.get("projects", []),
            "matched_courses": retrieved.get("courses", []),
            "user_progress": user_prog,
        }
        is_guest = False
    else:
        user_name = "Guest Developer"
        level = "Explorer"
        context = {
            "user_name": user_name,
            "level": level,
            "xp": 0,
            "active_roadmaps": [],
            "completed_milestones": 0,
            "is_guest": True,
            "learning_goal": "Explore Technea Learning Paths",
            "current_skill_level": "Beginner",
            "interests": "Web Development, Python",
            "preferred_language": "Python",
            "time_available": "Self-paced",
            "completed_lessons_count": 0,
            "recent_completed_lessons": [],
            "user_projects": [],
            "recent_activity": {
                "streak": 0,
                "total_study_minutes": 0,
                "completed_goals_count": 0,
            },
            "catalog_context": retrieved.get("catalog_context"),
            "technea_catalog_context": retrieved.get("catalog_context"),
            "matched_skills": retrieved.get("skills", []),
            "matched_paths": retrieved.get("learning_paths", []),
            "matched_projects": retrieved.get("projects", []),
            "matched_courses": retrieved.get("courses", []),
            "user_progress": None,
        }
        is_guest = True

    # Infer domain context and classify user intent
    intent = classify_intent(payload.message)
    domain = _infer_domain(payload.message, context)
    now_server = datetime.now().astimezone()
    context["classified_intent"] = intent
    context["domain"] = domain
    context["current_topic"] = domain
    context["current_date"] = now_server.strftime("%B %d, %Y")
    context["current_weekday"] = now_server.strftime("%A")
    context["current_year"] = now_server.strftime("%Y")
    context["current_time"] = now_server.strftime("%I:%M %p %Z").strip()
    context["current_timezone"] = now_server.tzname() or "UTC"

    # Summarize retrieved resources for structured debug visibility
    paths_count = len(retrieved.get("learning_paths", []))
    skills_count = len(retrieved.get("skills", []))
    projects_count = len(retrieved.get("projects", []))
    courses_count = len(retrieved.get("courses", []))
    if paths_count or skills_count or projects_count or courses_count:
        context["retrieved_resources_summary"] = (
            f"{paths_count} paths, {projects_count} projects, {skills_count} skills, {courses_count} courses"
        )
    elif retrieved.get("catalog_context"):
        context["retrieved_resources_summary"] = "Catalog context available"
    else:
        context["retrieved_resources_summary"] = "None"

    # Merge client-provided dynamic learning context if passed (active roadmap, milestone, lesson, etc.)
    if payload.context and isinstance(payload.context, dict):
        for k, v in payload.context.items():
            if v is not None:
                context[k] = v
        if "active_roadmap" in payload.context:
            context["active_roadmap_title"] = str(payload.context["active_roadmap"])
        if "current_milestone" in payload.context:
            context["current_milestone_title"] = str(payload.context["current_milestone"])
        if "current_lesson" in payload.context:
            context["current_lesson_title"] = str(payload.context["current_lesson"])

    # Call AI service orchestrator
    generated_text, provider_used = await ai_service.generate_chat_response(
        prompt=payload.message,
        conversation_history=payload.conversation_history,
        context=context,
        return_metadata=True,
    )

    # Resource visibility rules:
    # Only show resources when: user asks roadmap, what next, project, learning advice, daily goal, weekly plan, revision, interview prep, or code/architecture.
    # Strictly False for INTENT_CASUAL, INTENT_GREETING, INTENT_SIMPLE_QUESTION, INTENT_TIME_DATE.
    allow_resources = (
        (
            intent in {
                INTENT_ROADMAP_REQUEST,
                INTENT_ROADMAP_PLANNING,
                INTENT_NEXT_STEP,
                INTENT_PROJECT_SUGGESTION,
                INTENT_LEARNING_ADVICE,
                INTENT_DAILY_GOAL,
                INTENT_WEEKLY_PLAN,
                INTENT_REVISION,
                INTENT_INTERVIEW_PREP,
                INTENT_CODE_HELP,
                INTENT_CODING_HELP,
                INTENT_CODING_ARCHITECTURE,
            }
            or any(w in payload.message.lower() for w in ["playlist", "playlists", "tutorial", "tutorials", "resource", "resources", "course", "courses"])
        )
        and intent not in {
            INTENT_CASUAL,
            INTENT_GREETING,
            INTENT_SIMPLE_QUESTION,
            INTENT_TIME_DATE,
        }
    )

    if allow_resources:
        db_actions: list[RelatedAction] = []
        for a in retrieved.get("related_actions", []):
            if isinstance(a, dict) and "action_type" in a and "title" in a:
                db_actions.append(
                    RelatedAction(
                        action_type=a["action_type"],
                        title=a["title"],
                        payload=a.get("payload", {}),
                    )
                )
        related_actions = db_actions if db_actions else _build_related_actions(domain, active_roadmaps, is_guest=is_guest)
    else:
        related_actions = []

    # Calculate suggested_next_step (Strictly None for casual/greeting/simple/time questions)
    suggested_next_step: str | None = None
    if intent not in {INTENT_CASUAL, INTENT_GREETING, INTENT_SIMPLE_QUESTION, INTENT_TIME_DATE}:
        user_prog = retrieved.get("user_progress") or {}
        if user_prog:
            suggested_next_step = (
                user_prog.get("current_milestone_title")
                or user_prog.get("upcoming_milestone")
            )
        elif active_roadmaps:
            suggested_next_step = f"Continue {active_roadmaps[0]}"

    suggestions = retrieved.get("suggestions", [])
    if not suggestions or len(suggestions) < 3 or intent in {
        INTENT_GREETING,
        INTENT_CASUAL,
        INTENT_TIME_DATE,
        INTENT_DAILY_GOAL,
        INTENT_WEEKLY_PLAN,
        INTENT_REVISION,
        INTENT_INTERVIEW_PREP,
        INTENT_CODE_HELP,
        INTENT_SIMPLE_QUESTION,
        INTENT_CODING_ARCHITECTURE,
    }:
        suggestions = _build_suggestions(payload.message, domain, is_guest=is_guest, intent=intent)

    return AIChatResponse(
        response=generated_text,
        suggestions=suggestions,
        related_actions=related_actions,
        provider_used=provider_used,
        suggested_next_step=suggested_next_step,
    )


@router.get(
    "/mentor/context",
    response_model=dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get current user active mentor memory summary and live sync state",
    description="Returns the learner profile, active roadmap milestone, completed lessons, current projects, and daily learning activity for real-time frontend dashboard syncing.",
)
async def get_mentor_context(
    db: DatabaseDep,
    current_user: OptionalUserDep,
) -> dict[str, Any]:
    """Retrieve active AI Mentor 2.0 memory state for dashboard sync badge."""
    if current_user is None:
        return {
            "authenticated": False,
            "sync_status": "guest",
            "user_name": "Guest Developer",
            "developer_level": "Explorer",
            "current_skill_level": "Explorer",
            "xp_points": 0,
            "streak": 0,
            "learning_goal": "Explore Technea Learning Paths",
            "interests": "Web Development, Python",
            "bio": "",
            "preferred_language": "Python",
            "time_available": "Self-paced",
            "active_roadmap": None,
            "active_roadmaps": [],
            "completed_milestones": [],
            "completed_lessons_count": 0,
            "recent_completed_lessons": [],
            "user_projects": [],
            "recent_activity": {
                "streak": 0,
                "total_study_minutes": 0,
                "completed_goals_count": 0,
            },
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }

    user_prog = await context_retriever.get_user_progress(db=db, user_id=current_user.id)
    active_rm = user_prog.get("active_roadmaps", [None])[0] if user_prog.get("active_roadmaps") else None

    return {
        "authenticated": True,
        "sync_status": "synced",
        "user_id": str(current_user.id),
        "user_name": user_prog.get("user_name", "Developer"),
        "full_name": user_prog.get("full_name", ""),
        "username": user_prog.get("username", ""),
        "developer_level": user_prog.get("developer_level", "Junior Developer"),
        "current_skill_level": user_prog.get("current_skill_level") or user_prog.get("developer_level", "Beginner"),
        "xp_points": user_prog.get("xp_points", 0),
        "streak": user_prog.get("streak", 0),
        "learning_goal": user_prog.get("learning_goal"),
        "interests": user_prog.get("interests"),
        "bio": user_prog.get("bio"),
        "preferred_language": user_prog.get("preferred_language", "Python"),
        "time_available": user_prog.get("time_available", "1 hour/day"),
        "active_roadmap": active_rm,
        "active_roadmaps": user_prog.get("active_roadmaps", []),
        "completed_milestones": user_prog.get("completed_milestones", []),
        "current_milestone_title": user_prog.get("current_milestone_title"),
        "current_milestone_description": user_prog.get("current_milestone_description"),
        "upcoming_milestone": user_prog.get("upcoming_milestone"),
        "completed_lessons_count": user_prog.get("completed_lessons_count", 0),
        "recent_completed_lessons": user_prog.get("recent_completed_lessons", []),
        "user_projects": user_prog.get("user_projects", []),
        "recent_activity": user_prog.get("recent_activity", {}),
        "formatted_guidance": user_prog.get("formatted_guidance"),
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }

