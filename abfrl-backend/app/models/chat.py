"""
SQLAlchemy models for chat sessions and messages.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base import Base


class ChatSession(Base):
    """
    Chat session model.
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    channel = Column(String)  # e.g., web, telegram
    session_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Message(Base):
    """
    Message model.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    role = Column(String)  # user, agent
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession")