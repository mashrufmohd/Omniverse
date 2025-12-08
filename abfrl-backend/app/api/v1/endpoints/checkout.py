from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.cart import CheckoutRequest, CartSummary
from app.services.cart import CartService
from app.models.order import Order, OrderItem
from datetime import datetime

router = APIRouter()

@router.post("/checkout", response_model=dict)
async def checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    """Process checkout and create order"""
    
    cart_service = CartService()
    
    # Get cart summary with discount if provided
    cart_summary = cart_service.get_cart_summary(
        db, 
        request.user_id, 
        request.discount_code
    )
    
    if cart_summary["item_count"] == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate discount code if provided
    if request.discount_code:
        validation = cart_service.validate_discount_code(
            db, 
            request.discount_code, 
            cart_summary["subtotal"]
        )
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["message"])
    
    # Create order
    try:
        order = Order(
            user_id=request.user_id,
            total_amount=cart_summary["total"],
            status="confirmed", # Assuming payment is done if we reach here via Stripe flow
            payment_method=request.payment_info.method_type,
            payment_intent_id=request.payment_info.payment_intent_id,
            
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
            
            created_at=datetime.utcnow()
        )
        db.add(order)
        db.flush()
        
        # Create order items
        for item in cart_summary["items"]:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"]
            )
            db.add(order_item)
        
        # Clear cart
        cart_service.clear_cart(db, request.user_id)
        
        db.commit()
        db.refresh(order)
        
        return {
            "success": True,
            "order_id": order.id,
            "total": cart_summary["total"],
            "message": "Order placed successfully!",
            "estimated_delivery": "2-3 business days"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")

@router.get("/cart/{user_id}", response_model=dict)
async def get_cart(user_id: str, db: Session = Depends(get_db)):
    """Get cart summary for user"""
    cart_service = CartService()
    cart_summary = cart_service.get_cart_summary(db, user_id)
    return cart_summary
