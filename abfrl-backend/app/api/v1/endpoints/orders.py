"""
Orders endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from app.models.order import Order
from beanie import PydanticObjectId
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_all_orders():
    """
    Get all orders (admin).
    """
    orders = await Order.find_all().sort("-created_at").to_list()
    return {"success": True, "orders": orders}


@router.get("/user/{user_id}")
async def get_user_orders(user_id: str):
    """
    Get all orders for a specific user.
    """
    orders = await Order.find(Order.user_id == user_id).sort("-created_at").to_list()
    return {"success": True, "orders": orders, "count": len(orders)}


@router.get("/{order_id}")
async def get_order_details(order_id: str):
    """
    Get details of a specific order.
    """
    try:
        order = await Order.get(PydanticObjectId(order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"success": True, "order": order}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))