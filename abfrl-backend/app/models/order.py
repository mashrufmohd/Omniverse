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
    user_id = Column(Integer, ForeignKey("users.id"))
    total = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


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