"""
Inventory service for stock management.
"""

from ..models.product import Product


class InventoryService:
    """
    Service for inventory operations.
    """

    @staticmethod
    async def check_stock(product_id: str, quantity: int) -> bool:
        """
        Check if sufficient stock is available.
        """
        # Try to find product
        product = await Product.get(product_id)
        if not product:
            # Try finding by integer id if string lookup failed
            try:
                product = await Product.find_one(Product.id == int(product_id))
            except ValueError:
                pass
        
        if not product:
            return False
            
        # Check stock
        if hasattr(product, 'stock'):
            return product.stock >= quantity
        return False

    @staticmethod
    async def update_stock(product_id: str, quantity: int) -> None:
        """
        Update stock after sale.
        """
        product = await Product.get(product_id)
        if not product:
            try:
                product = await Product.find_one(Product.id == int(product_id))
            except ValueError:
                pass
                
        if product and hasattr(product, 'stock'):
            product.stock -= quantity
            db.commit()