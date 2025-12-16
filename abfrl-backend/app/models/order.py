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
    user_id = Column(Integer, index=True) # Match existing schema
    total = Column(Float) # Match existing schema column name
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Legacy fields - keep for backward compatibility but not in DB yet
    # payment_method = Column(String)
    # payment_intent_id = Column(String, nullable=True)
    # shipping_name = Column(String)
    # shipping_email = Column(String)
    # shipping_phone = Column(String)
    # shipping_address_line1 = Column(String)
    # shipping_address_line2 = Column(String, nullable=True)
    # shipping_city = Column(String)
    # shipping_state = Column(String)
    # shipping_zip = Column(String)
    # shipping_country = Column(String)

    # user = relationship("User") # Disable relationship for now


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