import asyncio
import logging
from typing import AsyncGenerator, List, Dict
from openai import AsyncOpenAI
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger("app.services.ai")

class AIService:
    def __init__(self):
        self.openai_client = None
        self.openai_configured = False
        self.gemini_configured = False
        self.initialize_clients()

    def initialize_clients(self):
        # Initialize OpenAI client if key is set
        if settings.OPENAI_API_KEY:
            try:
                self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                self.openai_configured = True
                logger.info("OpenAI client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
        else:
            logger.warning("OPENAI_API_KEY not configured. OpenAI models will run in demo mode.")

        # Initialize Gemini if key is set
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_configured = True
                logger.info("Google Gemini API configured successfully.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini: {e}")
        else:
            logger.warning("GEMINI_API_KEY not configured. Gemini models will run in demo mode.")

    def get_available_models(self) -> List[Dict[str, str]]:
        """Return lists of models to display in frontend selector."""
        return [
            # OpenAI Models
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai", "tagline": "Fast & lightweight, ideal for everyday chats", "active": self.openai_configured},
            {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "tagline": "High intelligence, complex tasks", "active": self.openai_configured},
            # Gemini Models
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "gemini", "tagline": "Fast, high-performance model by Google", "active": self.gemini_configured},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "provider": "gemini", "tagline": "Google's reasoning powerhouse", "active": self.gemini_configured},
        ]

    async def stream_chat(
        self, 
        messages: List[Dict[str, str]], 
        model_name: str, 
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream chat completions from OpenAI, Gemini, or fall back to demo mode."""
        is_openai = model_name.startswith("gpt-")
        is_gemini = model_name.startswith("gemini-")

        # Fallback to Demo Mode if API keys aren't set
        if (is_openai and not self.openai_configured) or (is_gemini and not self.gemini_configured):
            async for chunk in self._stream_demo(model_name):
                yield chunk
            return

        # OpenAI Streaming
        if is_openai:
            try:
                # Format messages for OpenAI API
                formatted = [{"role": m["role"], "content": m["content"]} for m in messages]
                
                response = await self.openai_client.chat.completions.create(
                    model=model_name,
                    messages=formatted,
                    temperature=temperature,
                    stream=True
                )
                async for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
            except Exception as e:
                logger.error(f"OpenAI streaming error: {e}")
                yield f"\n\n*(Error communicating with OpenAI: {str(e)}). Switching to demo fallback...*\n\n"
                async for chunk in self._stream_demo(model_name):
                    yield chunk

        # Gemini Streaming
        elif is_gemini:
            try:
                # Map roles: Google Gemini expects 'user' or 'model'
                # Note: Gemini 1.5/2.5 SDK allows creating chat session or just generating content
                # For chat history, we map it into Contents structures
                gemini_contents = []
                for m in messages:
                    role = "user" if m["role"] == "user" else "model"
                    gemini_contents.append({
                        "role": role,
                        "parts": [m["content"]]
                    })
                
                # Temperature configuration
                config = genai.types.GenerationConfig(temperature=temperature)
                
                # In google-generativeai, we can load model and run generate_content_async
                model = genai.GenerativeModel(model_name=model_name, generation_config=config)
                response = await model.generate_content_async(gemini_contents, stream=True)
                
                async for chunk in response:
                    if chunk.text:
                        yield chunk.text
            except Exception as e:
                logger.error(f"Gemini streaming error: {e}")
                yield f"\n\n*(Error communicating with Gemini: {str(e)}). Switching to demo fallback...*\n\n"
                async for chunk in self._stream_demo(model_name):
                    yield chunk

        else:
            yield f"Error: Unsupported model '{model_name}'"

    async def _stream_demo(self, model_name: str) -> AsyncGenerator[str, None]:
        """A premium simulated stream showcasing markdown features and layout integration."""
        paragraphs = [
            f"### AI Nexus Chat Demo Mode\n\n",
            f"You selected **{model_name}**. Since its API Key is not set in `.env`, the system is running in **Demo Mode** to show off full UI capability.\n\n",
            "This application renders **Markdown** beautifully, including tables, lists, and inline styles:\n\n",
            "| Feature | Status | Technology |\n",
            "| :--- | :---: | :--- |\n",
            "| real-time streaming | \u2705 | Server-Sent Events (SSE) |\n",
            "| syntax highlighting | \u2705 | Highlight.js / Markdown |\n",
            "| multi-session save | \u2705 | MongoDB / Memory Fallback |\n",
            "| voice input capability | \u2705 | Speech Recognition |\n\n",
            "And here is a syntax-highlighted code blocks demo:\n\n",
            "```python\n# FastAPI server-sent streaming example\n@router.post('/chat/send')\ndef stream_response(prompt: MessageSend):\n    def event_generator():\n        yield 'data: Hello from AI Nexus Chat\\n\\n'\n    return StreamingResponse(\n        event_generator(), \n        media_type='text/event-stream'\n    )\n```\n\n",
            "Provide `OPENAI_API_KEY` or `GEMINI_API_KEY` in `backend/.env` to connect with live models."
        ]

        for sentence in paragraphs:
            # Output characters/words slowly to simulate a natural typing experience
            words = sentence.split(" ")
            for i, word in enumerate(words):
                space = " " if i < len(words) - 1 else ""
                yield word + space
                # Yield speeds: faster for spaces, slightly slower for punctuation
                await asyncio.sleep(0.015)
            await asyncio.sleep(0.05)

ai_service = AIService()
