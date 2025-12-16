"""Import all models to ensure they are registered with Beanie"""

from app.models.product import Product, Inventory
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.chat import ChatSession, Message
from app.models.cart import Cart, CartItem, DiscountCode, PaymentMethod

# Export all models
__all__ = ["Product", "Inventory", "User", "Order", "OrderItem", 
           "ChatSession", "Message", "Cart", "CartItem", "DiscountCode", "PaymentMethod"]
