from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.services.cart import CartService
from pydantic import BaseModel

router = APIRouter()

class CartItemRequest(BaseModel):
    user_id: str
    product_id: Optional[int] = None
    quantity: int = 1
    size: Optional[str] = None

class DiscountRequest(BaseModel):
    user_id: str
    code: str

@router.get("/")
async def get_cart(user_id: str, discount_code: Optional[str] = None, db: Session = Depends(get_db)):
    """Get current user's cart"""
    cart_service = CartService()
    return cart_service.get_cart_summary(db, user_id, discount_code)

@router.post("/apply-discount")
async def apply_discount(request: DiscountRequest, db: Session = Depends(get_db)):
    """Apply discount code"""
    cart_service = CartService()
    cart_summary = cart_service.get_cart_summary(db, request.user_id)
    
    validation = cart_service.validate_discount_code(db, request.code, cart_summary["subtotal"])
    
    if validation["valid"]:
        # In a real app, we would store the applied discount code in the Cart model
        # For now, we'll just return the success message and the frontend/chat will need to pass it back
        # OR we can update the Cart model to store 'applied_discount_code'
        
        # Let's update the Cart model to store the code so it persists
        from app.models.cart import Cart
        cart = db.query(Cart).filter(Cart.user_id == request.user_id).first()
        if cart:
            cart.applied_discount_code = request.code
            db.commit()
            
        return {"success": True, "message": validation["message"]}
    else:
        return {"success": False, "message": validation["message"]}

@router.post("/add")
async def add_to_cart(request: CartItemRequest, db: Session = Depends(get_db)):
    """Add item to cart"""
    cart_service = CartService()
    if request.product_id is None:
        raise HTTPException(status_code=400, detail="product_id is required")
        
    result = cart_service.add_item(
        db, 
        request.user_id, 
        request.product_id, 
        request.quantity, 
        request.size
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    # Get cart with applied discount if any
    from app.models.cart import Cart
    cart = db.query(Cart).filter(Cart.user_id == request.user_id).first()
    discount_code = getattr(cart, 'applied_discount_code', None)
    
    return cart_service.get_cart_summary(db, request.user_id, discount_code)


@router.post("/remove")
async def remove_from_cart(request: CartItemRequest, db: Session = Depends(get_db)):
    """Remove item from cart"""
    cart_service = CartService()
    result = cart_service.remove_item(
        db, 
        request.user_id, 
        request.product_id, 
        request.size
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
        
    return cart_service.get_cart_summary(db, request.user_id)

@router.post("/update")
async def update_quantity(request: CartItemRequest, db: Session = Depends(get_db)):
    """Update item quantity"""
    cart_service = CartService()
    result = cart_service.update_quantity(
        db, 
        request.user_id, 
        request.product_id, 
        request.quantity, 
        request.size
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
        
    return cart_service.get_cart_summary(db, request.user_id)
