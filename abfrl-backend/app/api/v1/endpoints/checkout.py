from fastapi import APIRouter, HTTPException
from app.schemas.cart import CheckoutRequest, CartSummary
from app.services.cart import CartService
from app.models.order import Order, OrderItem
from datetime import datetime

router = APIRouter()

@router.post("/checkout", response_model=dict)
async def checkout(request: CheckoutRequest):
    """Process checkout and create order"""
    
    cart_service = CartService()
    
    # Get cart summary with discount if provided
    cart_summary = await cart_service.get_cart_summary(
        request.user_id, 
        request.discount_code
    )
    
    if cart_summary["item_count"] == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate discount code if provided
    if request.discount_code:
        validation = await cart_service.validate_discount_code(
            request.discount_code, 
            cart_summary["subtotal"]
        )
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["message"])
    
    # Create order
    try:
        # Create order items list
        order_items = []
        for item in cart_summary["items"]:
            order_item = OrderItem(
                product_id=str(item["product_id"]),
                quantity=item["quantity"],
                price=item["price"]
            )
            order_items.append(order_item)

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
            
            items=order_items, # Beanie supports embedded documents list
            created_at=datetime.utcnow()
        )
        await order.save()
        
        # Clear cart
        await cart_service.clear_cart(request.user_id)
        
        return {
            "success": True,
            "order_id": str(order.id),
            "total": cart_summary["total"],
            "message": "Order placed successfully!",
            "estimated_delivery": "2-3 business days"
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
