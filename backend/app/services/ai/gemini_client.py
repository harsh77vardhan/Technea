"""Google Gemini API Provider for Technea AI services."""

import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings
from app.services.ai.base_provider import BaseAIProvider

logger = logging.getLogger("technea.ai.gemini")


class GeminiError(Exception):
    """Base exception for Gemini provider operations."""
    pass


class GeminiAuthError(GeminiError):
    """Raised when the Gemini API key is missing, invalid, or unauthorized."""
    pass


class GeminiRateLimitError(GeminiError):
    """Raised when Gemini API rate limit or quota has been reached."""
    pass


class GeminiTimeoutError(GeminiError):
    """Raised when a request to Gemini API exceeds the configured timeout."""
    pass


class GeminiNetworkError(GeminiError):
    """Raised when a network or connection error prevents reaching Gemini API."""
    pass


class GeminiAPIError(GeminiError):
    """Raised when Gemini API returns an error response or unexpected payload."""
    pass


def sanitize_text(text: str, api_key: str | None = None) -> str:
    """Strip or redact sensitive query parameters or keys from text and URLs.

    Args:
        text: Raw string, URL, or error message to sanitize.
        api_key: Optional API key string to explicitly redact if present.

    Returns:
        Sanitized string safe for logging or exception reporting.
    """
    if not text:
        return ""
    # Redact URL query parameters containing keys, e.g. ?key=AIzaSy... or &key=AIzaSy...
    sanitized = re.sub(
        r"([?&]key=)[^&\s'\"`]+",
        r"\1[REDACTED]",
        text,
        flags=re.IGNORECASE,
    )
    # Redact standalone key or api_key assignments in log or exception messages
    sanitized = re.sub(
        r"\b(api[_-]?key|key)\s*[:=]\s*[^&\s'\"`]+",
        r"\1=[REDACTED]",
        sanitized,
        flags=re.IGNORECASE,
    )
    # Redact explicit API key if passed and sufficiently unique
    if api_key and len(api_key.strip()) >= 6:
        sanitized = sanitized.replace(api_key.strip(), "[REDACTED_API_KEY]")
    return sanitized


class GeminiProvider(BaseAIProvider):
    """Google Gemini AI Provider implementing generateContent REST API."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: int | float | None = None,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        """Initialize the Gemini AI provider.

        Args:
            api_key: Google Gemini API key. Defaults to settings.GEMINI_API_KEY.
            model: Gemini model identifier. Defaults to settings.GEMINI_MODEL.
            timeout: Request timeout in seconds. Defaults to settings.AI_TIMEOUT_SECONDS.
            client: Optional pre-configured httpx.AsyncClient instance.
        """
        raw_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.api_key = raw_key.strip() if raw_key and raw_key.strip() else None
        self.model = (model or settings.GEMINI_MODEL or "gemini-1.5-flash").strip()
        self.timeout = float(timeout if timeout is not None else settings.AI_TIMEOUT_SECONDS or 30.0)
        self._external_client = client
        self._client: httpx.AsyncClient | None = client

        logger.debug(
            "GeminiProvider initialized (model=%s, timeout=%ss, key_configured=%s)",
            self.model,
            self.timeout,
            bool(self.api_key),
        )

    @property
    def provider_name(self) -> str:
        """Return provider identifier."""
        return "gemini"

    @property
    def is_configured(self) -> bool:
        """Check whether the Gemini API key is configured."""
        return bool(self.api_key and len(self.api_key) > 5)

    async def _get_client(self) -> httpx.AsyncClient:
        """Retrieve an active AsyncClient instance."""
        if self._external_client is not None:
            return self._external_client

        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout, connect=10.0),
                follow_redirects=True,
            )
        return self._client

    async def close(self) -> None:
        """Clean up HTTP client connections."""
        if self._external_client is None and self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "GeminiProvider":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    def _format_contents(
        self,
        prompt: str,
        conversation_history: list[dict[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        """Format history and prompt into Gemini contents schema.

        Ensures the very last entry in contents is always:
        {"role": "user", "parts": [{"text": prompt.strip()}]}
        If the last item in conversation_history was already a user message matching prompt,
        do not duplicate, but ensure the final turn is always role="user".
        """
        contents: list[dict[str, Any]] = []

        if conversation_history:
            for item in conversation_history:
                if not isinstance(item, dict):
                    continue

                raw_role = str(item.get("role", "user")).lower()
                role = "model" if raw_role in ("assistant", "model", "system_reply") else "user"

                # Check if parts already structured
                if "parts" in item and isinstance(item["parts"], list):
                    parts = item["parts"]
                elif "content" in item and item["content"] is not None:
                    parts = [{"text": str(item["content"])}]
                elif "text" in item and item["text"] is not None:
                    parts = [{"text": str(item["text"])}]
                else:
                    continue

                if parts:
                    contents.append({"role": role, "parts": parts})

        clean_prompt = (prompt or "").strip()

        # Check if the last item in contents is already a user message matching prompt
        is_duplicate = False
        if contents and contents[-1].get("role") == "user":
            last_parts = contents[-1].get("parts", [])
            if last_parts and isinstance(last_parts, list) and isinstance(last_parts[0], dict):
                last_text = str(last_parts[0].get("text", "")).strip()
                if last_text == clean_prompt:
                    is_duplicate = True

        if not is_duplicate:
            contents.append({
                "role": "user",
                "parts": [{"text": clean_prompt}],
            })

        # Strict invariant: the very last entry in contents is ALWAYS role="user"
        if not contents or contents[-1].get("role") != "user":
            contents.append({
                "role": "user",
                "parts": [{"text": clean_prompt}],
            })
        elif contents[-1].get("role") == "user":
            last_parts = contents[-1].get("parts", [])
            if not last_parts or not isinstance(last_parts, list) or not isinstance(last_parts[0], dict) or str(last_parts[0].get("text", "")).strip() != clean_prompt:
                contents[-1]["parts"] = [{"text": clean_prompt}]

        return contents

    async def generate_chat_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        conversation_history: list[dict[str, Any]] | None = None,
        context: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> str:
        """Generate response via Google Gemini REST API.

        Args:
            prompt: User question or message.
            system_instruction: Master system prompt or persona guidelines.
            conversation_history: List of preceding turns.
            context: Optional contextual parameters (e.g. learner domain, level).
            **kwargs: Generation hyperparameters (temperature, max_output_tokens, top_p).

        Returns:
            Extracted text content from the Gemini model candidate.

        Raises:
            GeminiAuthError: Missing or unauthorized API key.
            GeminiRateLimitError: Rate limit or quota exhausted (429).
            GeminiTimeoutError: API request timed out.
            GeminiNetworkError: Network connection error.
            GeminiAPIError: Other API failures or empty content.
        """
        if not self.is_configured:
            logger.warning("Gemini API key is not configured. Live generation cannot proceed.")
            raise GeminiAuthError("Gemini API key is not configured.")

        # Build contents payload
        contents = self._format_contents(prompt, conversation_history)
        if not contents:
            raise GeminiAPIError("Cannot generate response: no prompt or history content provided.")

        # Construct request body
        payload: dict[str, Any] = {
            "contents": contents,
        }

        # Format systemInstruction
        effective_system_instruction = system_instruction
        if context and not effective_system_instruction:
            # If context is given without explicit system instruction, serialize context
            ctx_summary = ", ".join(
                f"{k}: {v}" for k, v in context.items()
                if v and k not in ("catalog_context", "technea_catalog_context", "matched_skills", "matched_paths", "matched_projects", "matched_courses", "user_progress", "retrieved_resources_summary")
            )
            catalog_block = context.get("catalog_context") or context.get("technea_catalog_context")
            effective_system_instruction = f"Context: {ctx_summary}"
            if catalog_block:
                effective_system_instruction += f"\n\n{catalog_block}"
        elif context and effective_system_instruction:
            # Only append simple scalar items to avoid duplicating large catalog blocks
            ctx_summary = ", ".join(
                f"{k}: {v}" for k, v in context.items()
                if v and k not in ("catalog_context", "technea_catalog_context", "matched_skills", "matched_paths", "matched_projects", "matched_courses", "user_progress", "retrieved_resources_summary")
            )
            if ctx_summary and "Session Context:" not in effective_system_instruction:
                effective_system_instruction = f"{effective_system_instruction}\n\nSession Context: {ctx_summary}"

        if effective_system_instruction and effective_system_instruction.strip():
            payload["systemInstruction"] = {
                "parts": [{"text": effective_system_instruction.strip()}]
            }

        # Generation config parameters
        temperature = kwargs.get("temperature", 0.7)
        max_output_tokens = kwargs.get("max_output_tokens", 2048)
        top_p = kwargs.get("top_p", 0.95)

        payload["generationConfig"] = {
            "temperature": float(temperature),
            "maxOutputTokens": int(max_output_tokens),
            "topP": float(top_p),
        }

        # Extract structured debug metadata before calling Gemini
        last_assistant_msg = "None"
        if conversation_history:
            for item in reversed(conversation_history):
                if isinstance(item, dict):
                    raw_role = str(item.get("role", "")).lower()
                    if raw_role in ("assistant", "model", "system_reply"):
                        parts = item.get("parts")
                        if parts and isinstance(parts, list) and isinstance(parts[0], dict):
                            last_assistant_msg = str(parts[0].get("text", "")).strip() or "None"
                        else:
                            last_assistant_msg = str(item.get("content") or item.get("text") or "").strip() or "None"
                        break

        ctx = context or {}
        current_topic = (
            ctx.get("current_topic")
            or ctx.get("active_topic")
            or ctx.get("topic")
            or ctx.get("domain")
            or ctx.get("classified_intent")
        )
        if not current_topic:
            p_lower = (prompt or "").lower()
            if "javascript" in p_lower or "js" in p_lower.split():
                current_topic = "javascript"
            elif "python" in p_lower:
                current_topic = "python"
            elif "react" in p_lower:
                current_topic = "react"
            else:
                current_topic = "General"

        retrieved_resources_summary = ctx.get("retrieved_resources_summary")
        if not retrieved_resources_summary:
            paths = len(ctx.get("matched_paths") or [])
            projects = len(ctx.get("matched_projects") or [])
            skills = len(ctx.get("matched_skills") or [])
            courses = len(ctx.get("matched_courses") or [])
            total = paths + projects + skills + courses
            if total > 0:
                retrieved_resources_summary = f"{paths} paths, {projects} projects, {skills} skills, {courses} courses"
            elif ctx.get("catalog_context"):
                retrieved_resources_summary = "Catalog context available"
            else:
                retrieved_resources_summary = "None"

        # Required structured debug logging before calling Gemini
        logger.info(
            "\n--------------------------------\n"
            "Latest User Message: %s\n"
            "Conversation Length: %d\n"
            "Last Assistant Message: %s\n"
            "Prompt Token Count: %d\n"
            "Current Topic: %s\n"
            "Retrieved Resources: %s\n"
            "--------------------------------",
            prompt,
            len(conversation_history or []),
            last_assistant_msg,
            len(prompt.split()),  # approximate or exact
            current_topic,
            retrieved_resources_summary,
        )

        # Build REST endpoint URL
        endpoint_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        )
        params = {"key": self.api_key}
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Technea-Backend/1.0",
        }

        client = await self._get_client()

        try:
            logger.debug("Dispatching request to Gemini API endpoint: %s", endpoint_url)
            response = await client.post(
                endpoint_url,
                params=params,
                json=payload,
                headers=headers,
            )

        except httpx.TimeoutException as exc:
            logger.warning(
                "Gemini API request timed out after %s seconds for model '%s'",
                self.timeout,
                self.model,
            )
            raise GeminiTimeoutError(
                f"Gemini API request timed out after {self.timeout}s"
            ) from exc

        except httpx.RequestError as exc:
            sanitized_err = sanitize_text(str(exc), self.api_key)
            logger.error("Gemini API network connection failure: %s", sanitized_err)
            raise GeminiNetworkError(
                f"Network connection error while reaching Gemini API: {sanitized_err}"
            ) from exc

        except Exception as exc:
            sanitized_err = sanitize_text(str(exc), self.api_key)
            logger.error("Unexpected error during Gemini API dispatch: %s", sanitized_err)
            raise GeminiAPIError(f"Unexpected error calling Gemini API: {sanitized_err}") from exc

        # Process HTTP response status
        if response.status_code == 200:
            try:
                data = response.json()
            except Exception as json_err:
                logger.error("Failed to parse JSON response from Gemini API: %s", json_err)
                raise GeminiAPIError("Invalid JSON returned by Gemini API") from json_err

            candidates = data.get("candidates", [])
            if not candidates:
                prompt_feedback = data.get("promptFeedback", {})
                block_reason = prompt_feedback.get("blockReason")
                if block_reason:
                    logger.warning("Gemini generation blocked by safety filters: %s", block_reason)
                    raise GeminiAPIError(f"Content generation was blocked by safety filters ({block_reason}).")

                logger.warning("Gemini API returned 200 OK but candidates list is empty.")
                raise GeminiAPIError("Gemini API returned an empty response candidate list.")

            first_candidate = candidates[0]
            finish_reason = first_candidate.get("finishReason", "STOP")
            parts = first_candidate.get("content", {}).get("parts", [])

            generated_text = "".join(
                part.get("text", "") for part in parts if isinstance(part, dict) and "text" in part
            ).strip()

            if not generated_text:
                logger.warning("Gemini candidate text is empty (finishReason=%s)", finish_reason)
                raise GeminiAPIError(f"Gemini API returned empty text (finishReason: {finish_reason}).")

            logger.debug(
                "Gemini generation successful (model=%s, finishReason=%s, length=%d)",
                self.model,
                finish_reason,
                len(generated_text),
            )
            return generated_text

        # Error response status handling
        status = response.status_code
        sanitized_body = sanitize_text(response.text, self.api_key)

        # Attempt to parse Google error payload for detail
        error_message = f"Gemini API returned HTTP {status}"
        try:
            err_json = response.json()
            if "error" in err_json and isinstance(err_json["error"], dict):
                google_msg = err_json["error"].get("message")
                if google_msg:
                    error_message = f"Gemini API Error (HTTP {status}): {sanitize_text(google_msg, self.api_key)}"
        except Exception:
            pass

        if status in (401, 403):
            logger.error("Gemini API authentication failed (HTTP %d): invalid or unauthorized key", status)
            raise GeminiAuthError(f"Gemini authentication failed (HTTP {status})")

        if status == 429:
            logger.warning("Gemini API rate limit or quota exceeded (HTTP 429)")
            raise GeminiRateLimitError("Gemini API rate limit or quota exceeded (HTTP 429)")

        if status >= 500:
            logger.error("Gemini API upstream server error (HTTP %d): %s", status, error_message)
            raise GeminiAPIError(f"Gemini API upstream server error (HTTP {status})")

        logger.error("Gemini API request failed with status %d: %s", status, sanitized_body[:300])
        raise GeminiAPIError(error_message)
