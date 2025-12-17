import asyncio
import pytest
from app.agents.master import MasterAgent

@pytest.mark.asyncio
async def test_view_cart_empty(monkeypatch):
    agent = MasterAgent()

    # Mock cart_service.get_cart_summary to return empty (matching actual structure)
    async def fake_cart_summary(user_id):
        return {"items": [], "subtotal": 0, "shipping": 0, "discount": 0, "total": 0}

    agent.cart_service.get_cart_summary = fake_cart_summary

    res = await agent._handle_view_cart("what's in my cart", [], "test_user")
    assert "empty" in res["response"].lower() or "your cart is currently empty" in res["response"].lower()
    assert len(res["cart_summary"]["items"]) == 0

@pytest.mark.asyncio
async def test_view_cart_with_items(monkeypatch):
    agent = MasterAgent()

    async def fake_cart_summary(user_id):
        return {
            "items": [
                {"name": "AeroStride Pro", "quantity": 1, "total": 149.99, "size": "M"},
                {"name": "Retro Tee", "quantity": 2, "total": 799.98, "size": "L"}
            ],
            "subtotal": 949.97,
            "shipping": 49.0,
            "discount": 0,
            "total": 998.97
        }

    agent.cart_service.get_cart_summary = fake_cart_summary

    res = await agent._handle_view_cart("what's in my cart", [], "test_user")
    assert "Your cart has 2 item" in res["response"]
    assert "AeroStride Pro" in res["response"]
    assert len(res["cart_summary"]["items"]) == 2