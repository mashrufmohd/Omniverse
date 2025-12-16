from typing import Optional
from beanie import Document, Indexed
from pydantic import Field

class User(Document):
    email: Indexed(str, unique=True)
    phone_number: Indexed(str, unique=True)
    full_name: str
    loyalty_points: int = 0
    telegram_chat_id: Optional[str] = None

    class Settings:
        name = "users"
