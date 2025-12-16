from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.cart import CartService
from app.models.order import Order, OrderItem
from app.models.product import Product
from datetime import datetime
from beanie import PydanticObjectId

router = APIRouter()

class ShippingAddress(BaseModel):
    full_name: str
    email: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "India"

class CartItemData(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    selectedSize: Optional[str] = None

class CheckoutRequest(BaseModel):
    user_id: str
    shipping_address: ShippingAddress
    cart_items: List[CartItemData]
    subtotal: float
    shipping: float
    discount: float
    total: float
    discount_code: Optional[str] = None
    payment_id: str
    transaction_id: str
    notes: Optional[str] = None

@router.post("/checkout", response_model=dict)
async def checkout(request: CheckoutRequest):
    """Process checkout and create order after payment verification"""
    
    if len(request.cart_items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Create order
    try:
        # Create order items list with product details
        order_items = []
        for item in request.cart_items:
            order_item = OrderItem(
                product_id=str(item.id),
                product_name=item.name,
                quantity=item.quantity,
                price=item.price,
                size=item.selectedSize
            )
            order_items.append(order_item)

        order = Order(
            user_id=request.user_id,
            total_amount=request.total,
            subtotal=request.subtotal,
            shipping_cost=request.shipping,
            discount_amount=request.discount,
            discount_code=request.discount_code,
            status="confirmed",
            payment_status="success",
            payment_method="mock_upi",
            razorpay_order_id=request.payment_id,
            razorpay_payment_id=request.transaction_id,
            razorpay_signature="MOCK_PAYMENT",
            
            # Shipping Details
            shipping_name=request.shipping_address.full_name,
            shipping_email=request.shipping_address.email,
            shipping_phone=request.shipping_address.phone,
            shipping_address_line1=request.shipping_address.address_line1,
            shipping_address_line2=request.shipping_address.address_line2,
            shipping_city=request.shipping_address.city,
            shipping_state=request.shipping_address.state,
            shipping_zip=request.shipping_address.zip_code,
            shipping_country=request.shipping_address.country,
            
            items=order_items,
            notes=request.notes,
            created_at=datetime.utcnow()
        )
        await order.save()
        
        return {
            "success": True,
            "order_id": str(order.id),
            "total": request.total,
            "message": "Order placed successfully!",
            "estimated_delivery": "3-5 business days"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")

@router.get("/cart/{user_id}", response_model=dict)
async def get_cart(user_id: str):
    """Get cart summary for user"""
    cart_service = CartService()
    cart_summary = await cart_service.get_cart_summary(user_id)
    return cart_summary
