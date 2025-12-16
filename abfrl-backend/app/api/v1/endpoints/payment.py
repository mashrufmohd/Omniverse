from fastapi import APIRouter, HTTPException
from app.services.cart import CartService
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timedelta
from typing import Dict, Optional

router = APIRouter()

# In-memory mock payment storage (use Redis in production)
mock_payments: Dict[str, dict] = {}

class CreateOrderRequest(BaseModel):
    user_id: str
    discount_code: Optional[str] = None

class ConfirmPaymentRequest(BaseModel):
    payment_id: str

@router.post("/create-mock-payment")
async def create_mock_payment(request: CreateOrderRequest):
    """Create mock payment session and generate QR code data"""
    cart_service = CartService()
    cart_summary = await cart_service.get_cart_summary(request.user_id, request.discount_code)
    
    if cart_summary["total"] <= 0:
        raise HTTPException(status_code=400, detail="Cart total must be greater than 0")
    
    try:
        # Generate unique payment ID
        payment_id = str(uuid4())
        
        # Store payment session
        mock_payments[payment_id] = {
            'payment_id': payment_id,
            'user_id': request.user_id,
            'amount': cart_summary["total"],
            'discount_code': request.discount_code,
            'status': 'PENDING',
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(minutes=15)).isoformat(),
            'cart_summary': cart_summary
        }
        
        # Generate QR URL (this will be scanned by mobile)
        qr_url = f"mock-pay/{payment_id}?amount={cart_summary['total']}"
        
        return {
            'success': True,
            'payment_id': payment_id,
            'qr_url': qr_url,
            'amount': cart_summary["total"],
            'currency': 'INR',
            'status': 'PENDING',
            'cart_summary': cart_summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm-mock-payment/{payment_id}")
async def confirm_mock_payment(payment_id: str):
    """Confirm mock payment (called when user clicks Pay on mobile)"""
    if payment_id not in mock_payments:
        raise HTTPException(status_code=404, detail="Payment session not found")
    
    payment = mock_payments[payment_id]
    
    # Check if expired
    expires_at = datetime.fromisoformat(payment['expires_at'])
    if datetime.utcnow() > expires_at:
        payment['status'] = 'EXPIRED'
        raise HTTPException(status_code=400, detail="Payment session expired")
    
    # Mark as success
    payment['status'] = 'SUCCESS'
    payment['confirmed_at'] = datetime.utcnow().isoformat()
    payment['transaction_id'] = f"TXN{uuid4().hex[:12].upper()}"
    
    return {
        'success': True,
        'status': 'SUCCESS',
        'transaction_id': payment['transaction_id'],
        'message': 'Mock payment successful'
    }

@router.get("/mock-payment-status/{payment_id}")
async def get_mock_payment_status(payment_id: str):
    """Get payment status (for polling from frontend)"""
    if payment_id not in mock_payments:
        raise HTTPException(status_code=404, detail="Payment session not found")
    
    payment = mock_payments[payment_id]
    
    # Check if expired
    expires_at = datetime.fromisoformat(payment['expires_at'])
    if datetime.utcnow() > expires_at and payment['status'] == 'PENDING':
        payment['status'] = 'EXPIRED'
    
    return {
        'success': True,
        'payment_id': payment_id,
        'status': payment['status'],
        'amount': payment['amount'],
        'transaction_id': payment.get('transaction_id'),
        'confirmed_at': payment.get('confirmed_at')
    }

@router.get("/mock-payment-details/{payment_id}")
async def get_mock_payment_details(payment_id: str):
    """Get full payment details for display on payment page"""
    if payment_id not in mock_payments:
        raise HTTPException(status_code=404, detail="Payment session not found")
    
    payment = mock_payments[payment_id]
    
    return {
        'success': True,
        'payment_id': payment_id,
        'amount': payment['amount'],
        'status': payment['status'],
        'user_id': payment['user_id'],
        'created_at': payment['created_at'],
        'expires_at': payment['expires_at']
    }
