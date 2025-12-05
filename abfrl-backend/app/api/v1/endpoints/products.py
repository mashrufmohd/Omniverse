"""
Products endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....models.product import Product

router = APIRouter()


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    """
    Get all products.
    """
    products = db.query(Product).all()
    return products