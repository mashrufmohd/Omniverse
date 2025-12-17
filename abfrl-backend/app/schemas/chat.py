from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ChatRequest(BaseModel):
    user_id: str
    message: str
    channel: str = "web" # web, telegram, kiosk
    session_id: Optional[str] = None

class ProductCard(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None

class CartSummaryResponse(BaseModel):
    items: List[Dict[str, Any]]
    subtotal: float
    shipping: float
    discount: float
    total: float
    discount_code: Optional[str] = None
    item_count: int

class ChatResponse(BaseModel):
    response: str
    products: List[ProductCard] = []
    cart_summary: Optional[CartSummaryResponse] = None
    actions: List[str] = []