from langchain_core.tools import tool
from app.models.product import Product
from app.models.order import Order
from typing import List, Dict, Any
import json

# Note: Old SQLAlchemy-based tools removed as this project uses MongoDB/Beanie

@tool
async def get_user_orders(user_id: str):
    """Get all orders for a user. Use this when user asks about 'my orders', 'order history', 'past purchases', or 'recent orders'."""
    try:
        orders = await Order.find(Order.user_id == user_id).sort("-created_at").limit(10).to_list()
        
        if not orders:
            return "You don't have any orders yet. Start shopping to place your first order!"
        
        orders_summary = []
        for order in orders:
            order_info = {
                "order_id": str(order.id),
                "date": order.created_at.strftime("%B %d, %Y"),
                "status": order.status,
                "total_amount": f"₹{order.total_amount:.2f}",
                "items_count": len(order.items),
                "payment_status": order.payment_status,
                "items": [{"name": item.product_name, "quantity": item.quantity, "price": f"₹{item.price:.2f}"} for item in order.items[:3]]  # Show first 3 items
            }
            orders_summary.append(order_info)
        
        return {
            "total_orders": len(orders),
            "orders": orders_summary
        }
    except Exception as e:
        return f"Unable to fetch orders: {str(e)}"

@tool
async def get_order_status(order_id: str):
    """Get detailed status and tracking information for a specific order. Use when user provides an order ID or asks 'where is my order'."""
    try:
        from beanie import PydanticObjectId
        order = await Order.get(PydanticObjectId(order_id))
        
        if not order:
            return f"Order {order_id} not found. Please check the order ID."
        
        order_details = {
            "order_id": str(order.id),
            "order_date": order.created_at.strftime("%B %d, %Y at %I:%M %p"),
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "total_amount": f"₹{order.total_amount:.2f}",
            "subtotal": f"₹{order.subtotal:.2f}",
            "shipping_cost": f"₹{order.shipping_cost:.2f}",
            "discount": f"₹{order.discount_amount:.2f}" if order.discount_amount > 0 else "No discount",
            "items": [
                {
                    "product": item.product_name,
                    "quantity": item.quantity,
                    "size": item.size or "N/A",
                    "price": f"₹{item.price:.2f}"
                }
                for item in order.items
            ],
            "shipping_address": f"{order.shipping_name}, {order.shipping_address_line1}, {order.shipping_city}, {order.shipping_state} - {order.shipping_zip}",
            "estimated_delivery": "3-5 business days" if order.status == "confirmed" else "Delivered" if order.status == "delivered" else "Pending"
        }
        
        return order_details
    except Exception as e:
        return f"Unable to fetch order details: {str(e)}"

# Export all tools as a list for the agent to use
AVAILABLE_TOOLS = [
    get_user_orders,
    get_order_status
]