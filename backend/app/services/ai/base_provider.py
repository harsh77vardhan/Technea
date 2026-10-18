"""Abstract base provider interface for Technea AI services."""

from abc import ABC, abstractmethod
from typing import Any


class BaseAIProvider(ABC):
    """Abstract base class defining the contract for AI text/chat providers."""

    @abstractmethod
    async def generate_chat_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        conversation_history: list[dict[str, Any]] | None = None,
        context: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> str:
        """Generate a chat response given prompt, history, and context.

        Args:
            prompt: The latest user prompt or message.
            system_instruction: Optional system instruction / persona prompt.
            conversation_history: Optional list of previous chat messages,
                e.g. [{"role": "user"|"model"|"assistant", "content": "..."}].
            context: Optional contextual dictionary (e.g. learner level, active track).
            **kwargs: Additional provider-specific parameters (e.g. temperature, max_output_tokens).

        Returns:
            The generated response string.
        """
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the unique identifier name of this provider."""
        pass

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if this provider has credentials/configuration required to operate."""
        pass

    async def close(self) -> None:
        """Cleanly close any background sessions or client resources."""
        pass
