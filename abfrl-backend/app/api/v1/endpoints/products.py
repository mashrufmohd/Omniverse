"""
Products endpoints.
"""

from fastapi import APIRouter
from ....models.product import Product

router = APIRouter()


@router.get("/")
async def get_products():
    """
    Get all products.
    """
    products = await Product.find_all().to_list()
    
    # Enhance products with sizes and colors from inventory
    result = []
    for product in products:
        product_dict = {
            "id": str(product.id),
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
