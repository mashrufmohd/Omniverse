from pydantic import BaseModel
from typing import List, Optional, Any

class ChatRequest(BaseModel):
    user_id: str
    message: str
    channel: str = "web" # web, telegram, kiosk

class ProductCard(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None

class ChatResponse(BaseModel):
    response_text: str
    suggested_products: List[ProductCard] = []
    actions: List[str] = []