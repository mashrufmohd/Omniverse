from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.models.cart import Cart, CartItem, DiscountCode
from app.models.product import Product
from datetime import datetime

class CartService:
    
    @staticmethod
    def get_or_create_cart(db: Session, user_id: str) -> Cart:
        """Get existing cart or create new one for user"""
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart
    
    @staticmethod
    def add_item(db: Session, user_id: str, product_id: int, quantity: int = 1, size: Optional[str] = None) -> Dict[str, Any]:
        """Add item to cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"success": False, "message": "Product not found"}
        
        # Check if item already in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.size == size
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                size=size
            )
            db.add(cart_item)
        
        cart.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": f"Added {product.name} to cart",
            "product_name": product.name,
            "quantity": quantity
        }
    
    @staticmethod
    def remove_item(db: Session, user_id: str, product_id: int, size: Optional[str] = None) -> Dict[str, Any]:
        """Remove item from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.size == size
        ).first()
        
        if cart_item:
            product_name = cart_item.product.name
            db.delete(cart_item)
            cart.updated_at = datetime.utcnow()
            db.commit()
            return {"success": True, "message": f"Removed {product_name} from cart"}
        
        return {"success": False, "message": "Item not found in cart"}
    
    @staticmethod
    def update_quantity(db: Session, user_id: str, product_id: int, quantity: int, size: Optional[str] = None) -> Dict[str, Any]:
        """Update item quantity"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.size == size
        ).first()
        
        if cart_item:
            if quantity <= 0:
                return CartService.remove_item(db, user_id, product_id, size)
            cart_item.quantity = quantity
            cart.updated_at = datetime.utcnow()
            db.commit()
            return {"success": True, "message": f"Updated quantity to {quantity}"}
        
        return {"success": False, "message": "Item not found in cart"}
    
    @staticmethod
    def get_cart_summary(db: Session, user_id: str, discount_code: Optional[str] = None) -> Dict[str, Any]:
        """Get complete cart summary with pricing"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        items = []
        subtotal = 0.0
        
        for cart_item in cart.items:
            product = cart_item.product
            item_total = product.price * cart_item.quantity
            subtotal += item_total
            
            items.append({
                "id": cart_item.id,
                "product_id": product.id,
                "product_name": product.name,
                "quantity": cart_item.quantity,
                "price": product.price,
                "size": cart_item.size,
                "image_url": product.image_url,
                "item_total": item_total
            })
        
        # Calculate shipping
        shipping = 5.0 if subtotal > 0 else 0.0
        if subtotal > 5000:
            shipping = 0.0  # Free shipping above ₹5000
        
        # Apply discount
        discount = 0.0
        discount_applied = None
        if discount_code:
            discount_obj = db.query(DiscountCode).filter(
                DiscountCode.code == discount_code.upper(),
                DiscountCode.active == True
            ).first()
            
            if discount_obj:
                if subtotal >= discount_obj.min_purchase:
                    discount = subtotal * (discount_obj.discount_percent / 100)
                    discount_applied = discount_code.upper()
        
        total = subtotal + shipping - discount
        
        return {
            "items": items,
            "subtotal": round(subtotal, 2),
            "shipping": round(shipping, 2),
            "discount": round(discount, 2),
            "total": round(total, 2),
            "discount_code": discount_applied,
            "item_count": len(items)
        }
    
    @staticmethod
    def clear_cart(db: Session, user_id: str) -> bool:
        """Clear all items from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        return True
    
    @staticmethod
    def validate_discount_code(db: Session, code: str, subtotal: float) -> Dict[str, Any]:
        """Validate discount code"""
        discount_obj = db.query(DiscountCode).filter(
            DiscountCode.code == code.upper(),
            DiscountCode.active == True
        ).first()
        
        if not discount_obj:
            return {"valid": False, "message": "Invalid discount code"}
        
        if subtotal < discount_obj.min_purchase:
            return {
                "valid": False,
                "message": f"Minimum purchase of ₹{discount_obj.min_purchase} required"
            }
        
        discount_amount = subtotal * (discount_obj.discount_percent / 100)
        return {
            "valid": True,
            "discount_percent": discount_obj.discount_percent,
            "discount_amount": round(discount_amount, 2),
            "message": f"{discount_obj.discount_percent}% discount applied!"
        }
