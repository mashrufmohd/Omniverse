from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.cart import CartService
from pydantic import BaseModel
from app.models.cart import Cart

router = APIRouter()

class CartItemRequest(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1
    size: Optional[str] = None

class DiscountRequest(BaseModel):
    user_id: str
    code: str

@router.get("/")
async def get_cart(user_id: str, discount_code: Optional[str] = None):
    """Get current user's cart"""
    cart_service = CartService()
    return await cart_service.get_cart_summary(user_id, discount_code)

@router.post("/apply-discount")
async def apply_discount(request: DiscountRequest):
    """Apply discount code"""
    cart_service = CartService()
    cart_summary = await cart_service.get_cart_summary(request.user_id)
    
    validation = await cart_service.validate_discount_code(request.code, cart_summary["subtotal"])
    
    if validation["valid"]:
        cart = await Cart.find_one(Cart.user_id == request.user_id)
        if cart:
            cart.applied_discount_code = request.code
            await cart.save()
            
        return {"success": True, "message": validation["message"]}
    else:
        return {"success": False, "message": validation["message"]}

@router.post("/add")
async def add_to_cart(request: CartItemRequest):
    """Add item to cart"""
    cart_service = CartService()
    return await cart_service.add_item(request.user_id, request.product_id, request.quantity, request.size)

@router.post("/remove")
async def remove_from_cart(request: CartItemRequest):
    """Remove item from cart"""
    cart_service = CartService()
    return await cart_service.remove_item(request.user_id, request.product_id, request.size)

@router.post("/update")
async def update_quantity(request: CartItemRequest):
    """Update item quantity"""
    cart_service = CartService()
    return await cart_service.update_quantity(request.user_id, request.product_id, request.quantity, request.size)

@router.post("/clear")
async def clear_cart(user_id: str):
    """Clear cart"""
    cart_service = CartService()
    return await cart_service.clear_cart(user_id)

