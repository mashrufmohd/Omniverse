from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, Field

class Message(BaseModel):
    role: str  # user, agent
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(Document):
    user_id: Indexed(str)
    channel: str  # e.g., web, telegram
    session_id: Indexed(str, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[Message] = []

    class Settings:
        name = "chat_sessions"
