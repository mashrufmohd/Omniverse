"""
Webhook endpoints for omnichannel support.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/telegram")
def telegram_webhook(data: dict):
    """
    Handle Telegram webhook.
    """
    # Process Telegram message
    return {"ok": True}