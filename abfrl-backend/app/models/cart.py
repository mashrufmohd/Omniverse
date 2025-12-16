from typing import Optional, List
from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.product import Product

class CartItem(BaseModel):
    product_id: str  # Store as string ID
    quantity: int = 1
    size: Optional[str] = None
    # We can optionally store product snapshot here if needed

class Cart(Document):
    user_id: Indexed(str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    applied_discount_code: Optional[str] = None
    items: List[CartItem] = []

    class Settings:
        name = "carts"

class DiscountCode(Document):
    code: Indexed(str, unique=True)
    discount_percent: float
    min_purchase: float = 0
    active: bool = True
    valid_until: Optional[datetime] = None

    class Settings:
        name = "discount_codes"

class PaymentMethod(Document):
    user_id: Indexed(str)
    method_type: str  # credit_card, upi, wallet
    card_number: Optional[str] = None  # Last 4 digits
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    is_saved: bool = False

    class Settings:
        name = "payment_methods"

