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
    
    # Enhance products with sizes and colors from inventory
    result = []
    for product in products:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "image_url": product.image_url,
            "imageUrl": product.image_url,  # Add camelCase version for frontend
            "sizes": list(set([inv.size for inv in product.inventory])) if product.inventory else [],
            "colors": product.metadata_info.get("colors", []) if product.metadata_info else [],
        }
        result.append(product_dict)
    
    return result