from typing import Optional
from beanie import Document, Indexed
from pydantic import Field
from datetime import datetime

class User(Document):
    firebase_uid: Optional[Indexed(str, unique=True)] = None
    email: Indexed(str, unique=True)
    phone_number: Optional[Indexed(str, unique=True)] = None
    full_name: str
    name: Optional[str] = None  # Alias for full_name
    loyalty_points: int = 0
    telegram_chat_id: Optional[str] = None
    role: str = "user"  # 'user', 'admin', or 'shopkeeper'
    
    # Shopkeeper-specific fields
    shop_name: Optional[str] = None
    shop_description: Optional[str] = None
    shop_address: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "users"
