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

@router.get("/{product_id}")
async def get_product_by_id(product_id: str):
    """
    Get a single product by ID.
    """
    from beanie import PydanticObjectId
    
    try:
        product = await Product.get(PydanticObjectId(product_id))
        
        if not product:
            return {"error": "Product not found"}
        
        return {
            "_id": str(product.id),
            "id": str(product.id),
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "image_url": product.image_url,
            "imageUrl": product.image_url,
            "sizes": list(set([inv.size for inv in product.inventory])) if product.inventory else [],
            "colors": product.metadata_info.get("colors", []) if product.metadata_info else [],
            "rating": 4.5,
            "reviews": 1234
        }
    except Exception as e:
        return {"error": str(e)}
