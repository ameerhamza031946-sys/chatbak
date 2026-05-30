from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class User(BaseModel):
    id: str
    name: str
    email: str
    password: str
    avatar: Optional[str] = None
    created_at: datetime

    model_config = {
        "populate_by_name": True
    }

class Conversation(BaseModel):
    id: str
    user_id: str
    title: str
    pinned: bool = False
    created_at: datetime
    updated_at: datetime
    # Custom config for this conversation
    model: Optional[str] = None
    temperature: Optional[float] = None

    model_config = {
        "populate_by_name": True
    }

class Message(BaseModel):
    id: str
    conversation_id: str
    role: str  # 'user' or 'assistant' or 'system'
    content: str
    timestamp: datetime
    model: Optional[str] = None  # model that generated it (if assistant)

    model_config = {
        "populate_by_name": True
    }
