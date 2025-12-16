"""
API router aggregator.
"""

from fastapi import APIRouter

from .endpoints import chat, orders, products, webhook, cart

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])