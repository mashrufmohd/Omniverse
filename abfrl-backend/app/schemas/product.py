"""
Pydantic schemas for products.
"""

from pydantic import BaseModel


class ProductBase(BaseModel):
    """
    Base product schema.
    """
    name: str
    description: str
    price: float
    category: str
    stock: int


class ProductCreate(ProductBase):
    """
    Schema for creating a product.
    """
    pass


class Product(ProductBase):
    """
    Product schema with ID.
    """
    id: int

    class Config:
        from_attributes = True