"""Pydantic schemas for Technea AI Mentor chat interactions."""

from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ChatMessage(BaseModel):
    """A single chat message in the conversation history."""

    role: str = Field(..., description="Message author role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text content")

    model_config = ConfigDict(from_attributes=True)


class AIChatRequest(BaseModel):
    """Request payload for AI mentor conversation."""

    message: str = Field(..., min_length=1, description="Learner prompt or question")
    conversation_history: list[ChatMessage] | None = Field(
        default=None,
        description="Prior conversation turns for multi-turn context",
    )
    context: dict[str, Any] | None = Field(
        default=None,
        description="Dynamic client learning context (active_roadmap, current_milestone, current_lesson, progress_percent)",
    )

    model_config = ConfigDict(from_attributes=True)


class RelatedAction(BaseModel):
    """An interactive call-to-action suggestion related to the mentor response."""

    action_type: str = Field(
        ...,
        description="Action type identifier: 'view_roadmap', 'explore_skill', 'view_project', 'external_link', etc.",
    )
    title: str = Field(..., description="Human-readable label for the action button")
    payload: dict[str, Any] | str | None = Field(
        default=None,
        description="Optional payload or link URL associated with the action",
    )

    model_config = ConfigDict(from_attributes=True)


class AIChatResponse(BaseModel):
    """Structured AI mentor response containing answer, follow-ups, and actions."""

    response: str = Field(..., description="Generated mentor pedagogical guidance")
    suggestions: list[str] = Field(
        default_factory=list,
        description="Follow-up prompt suggestions for the learner",
    )
    related_actions: list[RelatedAction] = Field(
        default_factory=list,
        description="Contextual deep-links or actions within Technea",
    )
    provider_used: str | None = Field(
        default=None,
        description="AI provider that fulfilled the request (e.g. 'gemini', 'rule_based')",
    )
    suggested_next_step: str | None = Field(
        default=None,
        description="Optional recommended next step for learner progression",
    )

    model_config = ConfigDict(from_attributes=True)
