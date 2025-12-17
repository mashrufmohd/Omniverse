"""
Admin endpoints - MongoDB/Beanie version.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timedelta

from app.api.v1.endpoints.auth import get_current_admin_user
from app.models.user import User as UserModel
from app.models.order import Order as OrderModel
from app.models.product import Product as ProductModel

router = APIRouter()


@router.get("/dashboard/metrics")
async def get_dashboard_metrics(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get dashboard metrics."""
    
    # Calculate metrics
    all_orders = await OrderModel.find_all().to_list()
    total_revenue = sum(order.total for order in all_orders)
    total_orders = len(all_orders)
    total_users = await UserModel.count()
    total_products = await ProductModel.count()
    
    # Today's revenue
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_orders = [order for order in all_orders if hasattr(order, 'created_at') and order.created_at >= today]
    todays_revenue = sum(order.total for order in todays_orders)
    
    # Monthly revenue
    month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_orders = [order for order in all_orders if hasattr(order, 'created_at') and order.created_at >= month_start]
    monthly_revenue = sum(order.total for order in monthly_orders)
    
    # Low stock products
    low_stock_products = 0
    
    return {
        "totalRevenue": float(total_revenue),
        "totalOrders": total_orders,
        "totalUsers": total_users,
        "totalProducts": total_products,
        "lowStockProducts": low_stock_products,
        "todaysRevenue": float(todays_revenue),
        "monthlyRevenue": float(monthly_revenue)
    }


@router.get("/orders/recent")
async def get_recent_orders(
    limit: int = 10,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get recent orders."""
    
    orders = await OrderModel.find_all().limit(limit).to_list()
    
    result = []
    for order in orders:
        user = await UserModel.get(order.user_id) if hasattr(order, 'user_id') else None
        result.append({
            "id": str(order.id),
            "userId": str(order.user_id) if hasattr(order, 'user_id') else "",
            "userName": user.name if user else "Unknown",
            "userEmail": user.email if user else "Unknown",
            "total": float(order.total),
            "status": order.status if hasattr(order, 'status') else "pending",
            "date": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
            "paymentStatus": "paid",
            "items": []
        })
    
    return result


@router.get("/products/top")
async def get_top_products(
    limit: int = 5,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get top selling products."""
    
    products = await ProductModel.find_all().limit(limit).to_list()
    
    return [
        {
            "productId": product.id,
            "productName": product.name,
            "totalSold": 0,
            "revenue": 0
        }
        for product in products
    ]


@router.get("/users")
async def get_all_users(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get all users."""
    
    users = await UserModel.find_all().to_list()
    
    return [
        {
            "id": user.firebase_uid or str(user.id),
            "name": user.name or user.full_name,
            "email": user.email,
            "role": user.role,
            "totalOrders": 0,
            "totalSpent": 0,
            "createdAt": user.created_at.isoformat() if hasattr(user, 'created_at') else datetime.now().isoformat()
        }
        for user in users
    ]


@router.get("/users/{user_id}/orders")
async def get_user_orders(
    user_id: str,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get orders for a specific user."""
    
    user = await UserModel.find_one(UserModel.firebase_uid == user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders = await OrderModel.find(OrderModel.user_id == user.id).to_list()
    
    return [
        {
            "id": str(order.id),
            "total": float(order.total),
            "status": order.status if hasattr(order, 'status') else "pending",
            "date": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
            "items": []
        }
        for order in orders
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_data: dict,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Update user role."""
    
    user = await UserModel.find_one(UserModel.firebase_uid == user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_role = role_data.get('role')
    if new_role not in ['user', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = new_role
    user.updated_at = datetime.now()
    await user.save()
    
    return {
        "id": user.firebase_uid or str(user.id),
        "name": user.name or user.full_name,
        "email": user.email,
        "role": user.role,
        "totalOrders": 0,
        "totalSpent": 0,
        "createdAt": user.created_at.isoformat() if hasattr(user, 'created_at') else datetime.now().isoformat()
    }


@router.get("/orders")
async def get_all_orders(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get all orders."""
    
    orders = await OrderModel.find_all().to_list()
    
    result = []
    for order in orders:
        user = await UserModel.get(order.user_id) if hasattr(order, 'user_id') else None
        result.append({
            "id": str(order.id),
            "userId": str(order.user_id) if hasattr(order, 'user_id') else "",
            "userName": user.name if user else "Unknown",
            "userEmail": user.email if user else "Unknown",
            "total": float(order.total),
            "status": order.status if hasattr(order, 'status') else "pending",
            "date": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
            "createdAt": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
            "updatedAt": order.updated_at.isoformat() if hasattr(order, 'updated_at') else datetime.now().isoformat(),
            "paymentStatus": "paid",
            "items": []
        })
    
    return result


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_data: dict,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Update order status."""
    
    order = await OrderModel.get(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = status_data.get('status')
    if new_status:
        order.status = new_status
        if hasattr(order, 'updated_at'):
            order.updated_at = datetime.now()
        await order.save()
    
    user = await UserModel.get(order.user_id) if hasattr(order, 'user_id') else None
    
    return {
        "id": str(order.id),
        "userId": str(order.user_id) if hasattr(order, 'user_id') else "",
        "userName": user.name if user else "Unknown",
        "userEmail": user.email if user else "Unknown",
        "total": float(order.total),
        "status": order.status if hasattr(order, 'status') else "pending",
        "date": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
        "createdAt": order.created_at.isoformat() if hasattr(order, 'created_at') else datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "paymentStatus": "paid",
        "items": []
    }


@router.get("/products")
async def get_all_products_admin(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get all products for admin."""
    
    products = await ProductModel.find_all().to_list()
    
    return [
        {
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "description": product.description if hasattr(product, 'description') else "",
            "category": product.category if hasattr(product, 'category') else "",
            "image_url": product.image_url if hasattr(product, 'image_url') else ""
        }
        for product in products
    ]


@router.post("/products")
async def create_product_admin(
    product_data: dict,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Create new product."""
    
    product = ProductModel(**product_data)
    await product.insert()
    
    return {
        "id": product.id,
        "name": product.name,
        "price": float(product.price),
        "description": product.description if hasattr(product, 'description') else "",
        "category": product.category if hasattr(product, 'category') else "",
        "image_url": product.image_url if hasattr(product, 'image_url') else ""
    }


@router.put("/products/{product_id}")
async def update_product_admin(
    product_id: int,
    product_data: dict,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Update product."""
    
    product = await ProductModel.get(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    
    await product.save()
    
    return {
        "id": product.id,
        "name": product.name,
        "price": float(product.price),
        "description": product.description if hasattr(product, 'description') else "",
        "category": product.category if hasattr(product, 'category') else "",
        "image_url": product.image_url if hasattr(product, 'image_url') else ""
    }


@router.delete("/products/{product_id}")
async def delete_product_admin(
    product_id: int,
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Delete product."""
    
    product = await ProductModel.get(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await product.delete()
    
    return {"message": "Product deleted successfully"}


@router.get("/inventory")
async def get_inventory(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get inventory items."""
    return []


@router.get("/analytics")
async def get_analytics(
    current_admin: UserModel = Depends(get_current_admin_user)
):
    """Get analytics data."""
    
    all_orders = await OrderModel.find_all().to_list()
    total_revenue = sum(order.total for order in all_orders)
    total_orders = len(all_orders)
    avg_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
    
    return {
        "totalRevenue": float(total_revenue),
        "totalOrders": total_orders,
        "averageOrderValue": avg_order_value,
        "revenueByDay": [],
        "revenueByMonth": [],
        "topProducts": []
    }
