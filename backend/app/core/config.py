import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Ensure .env is loaded
load_dotenv()

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    MONGODB_URL: str = ""
    JWT_SECRET: str = "default_local_jwt_secret_key_67b8a74e92a10"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
