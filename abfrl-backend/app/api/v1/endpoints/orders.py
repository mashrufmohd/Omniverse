"""
Orders endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....models.order import Order

router = APIRouter()


@router.get("/")
def get_orders(db: Session = Depends(get_db)):
    """
    Get all orders.
    """
    orders = db.query(Order).all()
    return orders