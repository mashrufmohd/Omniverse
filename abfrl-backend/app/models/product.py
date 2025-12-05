from typing import List, Optional
from sqlalchemy import String, Float, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String, index=True)
    image_url: Mapped[Optional[str]] = mapped_column(String)
    metadata_info: Mapped[Optional[dict]] = mapped_column(JSON, default={})

    inventory: Mapped[List["Inventory"]] = relationship(back_populates="product")

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    store_location: Mapped[str] = mapped_column(String) # e.g., "Phoenix Mall"
    size: Mapped[str] = mapped_column(String) # S, M, L, XL
    quantity: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="inventory")