"""
Inventory service for stock management.
"""

from sqlalchemy.orm import Session

from ..models.product import Product


class InventoryService:
    """
    Service for inventory operations.
    """

    @staticmethod
    def check_stock(db: Session, product_id: int, quantity: int) -> bool:
        """
        Check if sufficient stock is available.
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        return product.stock >= quantity

    @staticmethod
    def update_stock(db: Session, product_id: int, quantity: int) -> None:
        """
        Update stock after sale.
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.stock -= quantity
            db.commit()