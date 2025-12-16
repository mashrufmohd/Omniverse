from typing import Optional, Dict, Any
from app.models.cart import Cart, CartItem, DiscountCode
from app.models.product import Product
from datetime import datetime
from beanie import PydanticObjectId

class CartService:
    
    @staticmethod
    async def get_or_create_cart(user_id: str) -> Cart:
        """Get existing cart or create new one for user"""
        cart = await Cart.find_one(Cart.user_id == user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            await cart.insert()
        return cart
    
    @staticmethod
    async def add_item(user_id: str, product_id: str, quantity: int = 1, size: Optional[str] = None) -> Dict[str, Any]:
        """Add item to cart"""
        cart = await CartService.get_or_create_cart(user_id)
        
        # Check if product exists
        try:
            product = await Product.get(PydanticObjectId(product_id))
        except:
            product = None
            
        if not product:
            return {"success": False, "message": "Product not found"}
        
        # Check if item already in cart
        existing_item = next((item for item in cart.items if item.product_id == product_id and item.size == size), None)
        
        if existing_item:
            existing_item.quantity += quantity
        else:
            cart_item = CartItem(
                product_id=product_id,
                quantity=quantity,
                size=size
            )
            cart.items.append(cart_item)
        
        cart.updated_at = datetime.utcnow()
        await cart.save()
        
        return {
            "success": True,
            "message": f"Added {product.name} to cart",
            "product_name": product.name,
            "quantity": quantity
        }
    
    @staticmethod
    async def remove_item(user_id: str, product_id: str, size: Optional[str] = None) -> Dict[str, Any]:
        """Remove item from cart"""
        cart = await CartService.get_or_create_cart(user_id)
        
        initial_count = len(cart.items)
        cart.items = [item for item in cart.items if not (item.product_id == product_id and item.size == size)]
        
        if len(cart.items) < initial_count:
            cart.updated_at = datetime.utcnow()
            await cart.save()
            return {"success": True, "message": "Removed item from cart"}
        
        return {"success": False, "message": "Item not found in cart"}
    
    @staticmethod
    async def update_quantity(user_id: str, product_id: str, quantity: int, size: Optional[str] = None) -> Dict[str, Any]:
        """Update item quantity"""
        cart = await CartService.get_or_create_cart(user_id)
        
        existing_item = next((item for item in cart.items if item.product_id == product_id and item.size == size), None)
        
        if existing_item:
            if quantity <= 0:
                return await CartService.remove_item(user_id, product_id, size)
            existing_item.quantity = quantity
            cart.updated_at = datetime.utcnow()
            await cart.save()
            return {"success": True, "message": f"Updated quantity to {quantity}"}
        
        return {"success": False, "message": "Item not found in cart"}
    
    @staticmethod
    async def get_cart_summary(user_id: str, discount_code: Optional[str] = None) -> Dict[str, Any]:
        cart = await CartService.get_or_create_cart(user_id)
        
        # Use stored discount code if not provided
        if not discount_code and cart.applied_discount_code:
            discount_code = cart.applied_discount_code
            
        subtotal = 0
        items_details = []
        
        for item in cart.items:
            try:
                product = await Product.get(PydanticObjectId(item.product_id))
                if product:
                    item_total = product.price * item.quantity
                    subtotal += item_total
                    items_details.append({
                        "id": item.product_id,
                        "name": product.name,
                        "price": product.price,
                        "quantity": item.quantity,
                        "size": item.size,
                        "image_url": product.image_url,
                        "total": item_total
                    })
            except:
                continue
                
        shipping = 0 if subtotal > 1000 else 100
        discount_amount = 0
        
        if discount_code:
            validation = await CartService.validate_discount_code(discount_code, subtotal)
            if validation["valid"]:
                discount_amount = validation["discount_amount"]
                
        total = subtotal + shipping - discount_amount
        
        return {
            "items": items_details,
            "subtotal": subtotal,
            "shipping": shipping,
            "discount": discount_amount,
            "total": total,
            "discount_code": discount_code if discount_amount > 0 else None
        }

    @staticmethod
    async def validate_discount_code(code: str, subtotal: float) -> Dict[str, Any]:
        discount = await DiscountCode.find_one(DiscountCode.code == code, DiscountCode.active == True)
        
        if not discount:
            return {"valid": False, "message": "Invalid discount code", "discount_amount": 0}
            
        if discount.valid_until and discount.valid_until < datetime.utcnow():
            return {"valid": False, "message": "Discount code expired", "discount_amount": 0}
            
        if subtotal < discount.min_purchase:
            return {"valid": False, "message": f"Minimum purchase of {discount.min_purchase} required", "discount_amount": 0}
            
        discount_amount = (subtotal * discount.discount_percent) / 100
        return {"valid": True, "message": "Discount applied", "discount_amount": discount_amount}
    
    @staticmethod
    async def clear_cart(user_id: str) -> bool:
        cart = await CartService.get_or_create_cart(user_id)
        cart.items = []
        cart.applied_discount_code = None
        cart.updated_at = datetime.utcnow()
        await cart.save()
        return True

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
        
        # Check if discount code is passed OR if it's stored in the cart
        code_to_check = discount_code
        if not code_to_check and hasattr(cart, 'applied_discount_code') and cart.applied_discount_code:
            code_to_check = cart.applied_discount_code
            
        if code_to_check:
            discount_obj = db.query(DiscountCode).filter(
                DiscountCode.code == code_to_check.upper(),
                DiscountCode.active == True
            ).first()
            
            if discount_obj:
                if subtotal >= discount_obj.min_purchase:
                    discount = subtotal * (discount_obj.discount_percent / 100)
                    discount_applied = code_to_check.upper()
        
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
    async def clear_cart(user_id: str) -> bool:
        """Clear all items from cart"""
        cart = await CartService.get_or_create_cart(user_id)
        cart.items = []
        await cart.save()
        return True
    
    @staticmethod
    async def validate_discount_code(code: str, subtotal: float) -> Dict[str, Any]:
        """Validate discount code"""
        discount_obj = await DiscountCode.find_one(
            DiscountCode.code == code.upper(),
            DiscountCode.active == True
        )
        
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
