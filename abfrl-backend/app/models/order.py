from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float  # Store price at time of purchase
    size: Optional[str] = None

class Order(Document):
    user_id: Indexed(str)
    total_amount: float
    subtotal: float
    shipping_cost: float = 0.0
    discount_amount: float = 0.0
    discount_code: Optional[str] = None
    status: str = "pending"  # pending, confirmed, processing, shipped, delivered, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItem] = []
    
    # Payment details
    payment_method: str = "upi"  # upi, card, netbanking, wallet
    payment_status: str = "pending"  # pending, success, failed
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    
    # Shipping details
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_address_line1: str
    shipping_address_line2: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str = "India"
    
    # Additional details
    notes: Optional[str] = None

    class Settings:
        name = "orders"