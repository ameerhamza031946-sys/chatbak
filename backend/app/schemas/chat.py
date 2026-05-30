from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"
    model: Optional[str] = None
    temperature: Optional[float] = None

class MessageSend(BaseModel):
    content: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None  # If null, backend creates a new conversation
    model: Optional[str] = None            # Dynamic switching of models
    temperature: Optional[float] = None

class ConversationRename(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    timestamp: datetime
    model: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    pinned: bool = False
    created_at: datetime
    updated_at: datetime
    model: Optional[str] = None
    temperature: Optional[float] = None

    class Config:
        from_attributes = True

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []
