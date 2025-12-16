from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float  # Store price at time of purchase

class Order(Document):
    user_id: Indexed(str)
    total: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItem] = []
    
    # Shipping details
    shipping_name: Optional[str] = None
    shipping_email: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None

    class Settings:
        name = "orders"