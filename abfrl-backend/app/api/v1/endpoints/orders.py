"""
Orders endpoints.
"""

from fastapi import APIRouter
from app.models.order import Order

router = APIRouter()


@router.get("/")
async def get_orders():
    """
    Get all orders.
    """
    orders = await Order.find_all().to_list()
    return orders