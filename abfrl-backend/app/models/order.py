"""
SQLAlchemy models for orders and order items.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base import Base


class Order(Base):
    """
    Order model.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Changed to String to match session/cart
    total_amount = Column(Float) # Renamed from total to match usage in checkout.py
    status = Column(String, default="pending")
    payment_method = Column(String)
    payment_intent_id = Column(String, nullable=True)
    
    # Shipping Details
    shipping_name = Column(String)
    shipping_email = Column(String)
    shipping_phone = Column(String)
    shipping_address_line1 = Column(String)
    shipping_address_line2 = Column(String, nullable=True)
    shipping_city = Column(String)
    shipping_state = Column(String)
    shipping_zip = Column(String)
    shipping_country = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # user = relationship("User") # Disable relationship for now as user_id is string session id


class OrderItem(Base):
    """
    Order item model.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)

    order = relationship("Order")
    product = relationship("Product")