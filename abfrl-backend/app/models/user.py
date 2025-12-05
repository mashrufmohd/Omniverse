from typing import Optional
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    phone_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    # Omni-channel identifiers
    telegram_chat_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)