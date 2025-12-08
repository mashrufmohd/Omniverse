from langchain_core.tools import tool
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.product import Product, Inventory
from app.models.user import User

# Helper to get DB inside a tool
def get_db_session():
    return SessionLocal()

@tool
def search_products(query: str):
    """Search for clothes/products based on a description (e.g. 'black jeans')."""
    # In production: Connect to Qdrant here. 
    # MVP Fallback: Simple SQL LIKE search
    db = get_db_session()
    products = db.query(Product).filter(Product.name.ilike(f"%{query}%")).limit(5).all()
    db.close()
    
    if not products:
        return "No products found matching that description."
    
    return [{"id": p.id, "name": p.name, "price": p.price} for p in products]

@tool
def check_inventory(product_id: int, size: str):
    """Check availability of a product in a specific size."""
    db = get_db_session()
    item = db.query(Inventory).filter(
        Inventory.product_id == product_id, 
        Inventory.size == size
    ).first()
    db.close()
    
    if item and item.quantity > 0:
        return f"Available! We have {item.quantity} in stock at {item.store_location}."
    return "Sorry, that size is currently out of stock."

@tool
def get_cart_items(user_id: int = 1):
    """Get the current items in the user's cart."""
    from app.models.cart import Cart, CartItem
    
    db = get_db_session()
    try:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            return "Your cart is empty."
        
        items_details = []
        total_amount = 0
        
        for item in cart.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                item_total = product.price * item.quantity
                total_amount += item_total
                items_details.append({
                    "product": product.name,
                    "quantity": item.quantity,
                    "size": item.size,
                    "price_per_unit": product.price,
                    "total_price": item_total
                })
        
        return {
            "items": items_details,
            "total_cart_value": total_amount,
            "item_count": len(items_details)
        }
    finally:
        db.close()

@tool
def get_loyalty_offers(phone_number: str):
    """Check loyalty points and available offers for a user."""
    db = get_db_session()
    user = db.query(User).filter(User.phone_number == phone_number).first()
    db.close()
    
    if not user:
        return "User not found. Sign up to earn points!"
    
    msg = f"You have {user.loyalty_points} points."
    if user.loyalty_points > 500:
        msg += " You are eligible for a Flat 10% OFF coupon!"
    else:
        msg += f" Earn {500 - user.loyalty_points} more points to unlock rewards."
    return msg