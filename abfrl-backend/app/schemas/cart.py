from pydantic import BaseModel
from typing import List, Optional

class CartItemSchema(BaseModel):
    id: int
    product_id: int
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

class PaymentInfo(BaseModel):
    method_type: str  # credit_card, upi, wallet
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    cvv: Optional[str] = None
    upi_id: Optional[str] = None
    wallet_type: Optional[str] = None
    save_card: bool = False

class CheckoutRequest(BaseModel):
    user_id: str
    payment_info: PaymentInfo
    discount_code: Optional[str] = None
