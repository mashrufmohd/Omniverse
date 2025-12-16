from fastapi import APIRouter, HTTPException
from app.services.cart import CartService
from pydantic import BaseModel
import stripe
import os

router = APIRouter()

# Initialize Stripe with your secret key
# In production, use os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_51QO8q2P9X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6") 

class PaymentIntentRequest(BaseModel):
    user_id: str
    discount_code: str = None

@router.post("/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    cart_service = CartService()
    cart_summary = await cart_service.get_cart_summary(request.user_id, request.discount_code)
    
    if cart_summary["total"] <= 0:
        raise HTTPException(status_code=400, detail="Cart total must be greater than 0")
    
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=int(cart_summary["total"] * 100), # Stripe expects amount in cents
            currency="inr",
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'user_id': request.user_id,
                'discount_code': request.discount_code
            }
        )
        return {
            'clientSecret': intent.client_secret
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
