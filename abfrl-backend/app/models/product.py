from typing import List, Optional
from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field

class Inventory(BaseModel):
    store_location: str
    size: str
    quantity: int = 0

class Product(Document):
    name: Indexed(str)
    description: Optional[str] = None
    price: float
    category: Indexed(str)
    image_url: Optional[str] = None
    stock: int = 0
    metadata_info: dict = {}
    inventory: List[Inventory] = []
    
    # Shopkeeper information
    shopkeeper_id: Optional[str] = None  # Firebase UID or MongoDB ID of shopkeeper
    shopkeeper_name: Optional[str] = None  # Shop name for display
    is_verified: bool = False  # Admin can verify shopkeeper products

    class Settings:
        name = "products"
