import asyncio
import logging
import json
import httpx
from typing import AsyncGenerator, List, Dict
from app.core.config import settings

logger = logging.getLogger("app.services.ai")

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
SITE_URL = "http://localhost:5173"
SITE_NAME = "AI Nexus Chat"

# OpenRouter model IDs mapping
OPENROUTER_MODEL_MAP = {
    "gpt-4o-mini":      "openai/gpt-4o-mini",
    "gpt-4o":           "openai/gpt-4o",
    "gemini-2.5-flash": "google/gemini-2.5-flash-preview-05-20",
    "gemini-1.5-pro":   "google/gemini-pro-1.5",
}


class AIService:
    def __init__(self):
        self.openrouter_api_key = None
        self.openai_configured = False
        self.gemini_configured = False
        self.initialize_clients()

    def initialize_clients(self):
        # Prefer OPENROUTER_API_KEY, fallback to OPENAI_API_KEY (which may also be an OpenRouter key)
        key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY

        if key:
            self.openrouter_api_key = key
            self.openai_configured = True
            self.gemini_configured = True
            logger.info("OpenRouter client initialized successfully (covers OpenAI + Gemini models).")
        else:
            logger.warning("No API key configured. All models will run in demo mode.")

    def get_available_models(self) -> List[Dict[str, str]]:
        """Return lists of models to display in frontend selector."""
        return [
            # OpenAI Models via OpenRouter
            {"id": "gpt-4o-mini",      "name": "GPT-4o Mini",      "provider": "openai",  "tagline": "Fast & lightweight, ideal for everyday chats",  "active": self.openai_configured},
            {"id": "gpt-4o",           "name": "GPT-4o",           "provider": "openai",  "tagline": "High intelligence, complex tasks",               "active": self.openai_configured},
            # Gemini Models via OpenRouter
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "gemini",  "tagline": "Fast, high-performance model by Google",          "active": self.gemini_configured},
            {"id": "gemini-1.5-pro",   "name": "Gemini 1.5 Pro",   "provider": "gemini",  "tagline": "Google's reasoning powerhouse",                   "active": self.gemini_configured},
        ]

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model_name: str,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream chat completions via OpenRouter unified API."""
        is_openai = model_name.startswith("gpt-")
        is_gemini = model_name.startswith("gemini-")

        # Fallback to Demo Mode if no API key
        if (is_openai and not self.openai_configured) or (is_gemini and not self.gemini_configured):
            async for chunk in self._stream_demo(model_name):
                yield chunk
            return

        # Map our model name to OpenRouter's model ID
        openrouter_model = OPENROUTER_MODEL_MAP.get(model_name, model_name)

        # Format messages for OpenAI-compatible API
        formatted_messages = [
            {"role": m["role"], "content": m["content"]}
            for m in messages
        ]

        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
        }

        payload = {
            "model": openrouter_model,
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[len("data: "):]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0]["delta"]
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter HTTP error: {e.response.status_code} - {e.response.text}")
            yield f"\n\n*(Error from OpenRouter: {e.response.status_code}. Check your API key and model access.)*\n\n"
            async for chunk in self._stream_demo(model_name):
                yield chunk
        except Exception as e:
            logger.error(f"OpenRouter streaming error: {e}")
            yield f"\n\n*(Connection error: {str(e)})*\n\n"
            async for chunk in self._stream_demo(model_name):
                yield chunk

    async def _stream_demo(self, model_name: str) -> AsyncGenerator[str, None]:
        """A premium simulated stream showcasing markdown features and layout integration."""
        paragraphs = [
            f"### AI Nexus Chat Demo Mode\n\n",
            f"You selected **{model_name}**. Since its API Key is not set in `.env`, the system is running in **Demo Mode** to show off full UI capability.\n\n",
            "This application renders **Markdown** beautifully, including tables, lists, and inline styles:\n\n",
            "| Feature | Status | Technology |\n",
            "| :--- | :---: | :--- |\n",
            "| real-time streaming | ✅ | Server-Sent Events (SSE) |\n",
            "| syntax highlighting | ✅ | Highlight.js / Markdown |\n",
            "| multi-session save | ✅ | MongoDB / Memory Fallback |\n",
            "| voice input capability | ✅ | Speech Recognition |\n\n",
            "And here is a syntax-highlighted code blocks demo:\n\n",
            "```python\n# FastAPI server-sent streaming example\n@router.post('/chat/send')\ndef stream_response(prompt: MessageSend):\n    def event_generator():\n        yield 'data: Hello from AI Nexus Chat\\n\\n'\n    return StreamingResponse(\n        event_generator(), \n        media_type='text/event-stream'\n    )\n```\n\n",
            "Provide `OPENAI_API_KEY` or `GEMINI_API_KEY` in `backend/.env` to connect with live models."
        ]

        for sentence in paragraphs:
            words = sentence.split(" ")
            for i, word in enumerate(words):
                space = " " if i < len(words) - 1 else ""
                yield word + space
                await asyncio.sleep(0.015)
            await asyncio.sleep(0.05)


ai_service = AIService()
