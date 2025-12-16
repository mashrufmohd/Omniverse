from pydantic import BaseModel
from typing import List, Optional

class CartItemSchema(BaseModel):
    id: Optional[str] = None
    product_id: str
    product_name: str
    quantity: int
    price: float
    size: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    items: List[CartItemSchema]
    subtotal: float
    shipping: float
    discount: float
    total: float
    discount_code: Optional[str] = None

class DiscountCodeSchema(BaseModel):
    code: str
    discount_percent: float
    min_purchase: float

    class Config:
        from_attributes = True

class ShippingAddress(BaseModel):
    full_name: str
    email: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "India"
    phone: str

class PaymentInfo(BaseModel):
    method_type: str  # credit_card, upi, wallet, stripe
    # For Stripe, we might not need card details here as they are handled by Stripe Elements
    payment_intent_id: Optional[str] = None

class CheckoutRequest(BaseModel):
    user_id: str
    shipping_address: ShippingAddress
    payment_info: PaymentInfo
    discount_code: Optional[str] = None
