"""
API router aggregator.
"""

from fastapi import APIRouter

from .endpoints import chat, orders, products, webhook, cart, payment, checkout, auth, admin, shopkeeper

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(shopkeeper.router, prefix="/shopkeeper", tags=["shopkeeper"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["checkout"])
api_router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])