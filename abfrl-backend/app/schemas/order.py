"""
Pydantic schemas for orders.
"""

from datetime import datetime
from typing import List

from pydantic import BaseModel

from .product import Product


class OrderItemBase(BaseModel):
    """
    Base order item schema.
    """
    product_id: int
    quantity: int


class OrderItem(OrderItemBase):
    """
    Order item schema with details.
    """
    id: int
    price: float
    product: Product

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    """
    Base order schema.
    """
    user_id: int
    items: List[OrderItemBase]


class Order(OrderBase):
    """
    Order schema with full details.
    """
    id: int
    total: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True