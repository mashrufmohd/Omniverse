import asyncio
import json
import os
from app.db.mongodb import init_db
from app.models.product import Product

async def seed_products():
    print("Initializing database...")
    await init_db()
    
    print("Reading seed data...")
    file_path = os.path.join("data", "products_seed.json")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, "r") as f:
        products_data = json.load(f)
        
    print(f"Found {len(products_data)} products.")
    
    for p_data in products_data:
        # Check if product exists
        existing = await Product.find_one(Product.name == p_data["name"])
        if not existing:
            product = Product(
                name=p_data["name"],
                description=p_data.get("description"),
                price=p_data["price"],
                category=p_data["category"],
                stock=p_data.get("stock", 0),
                image_url=p_data.get("image_url"),
                metadata_info=p_data.get("metadata", {})
            )
            await product.insert()
            print(f"Inserted: {product.name}")
        else:
            print(f"Skipped (already exists): {p_data['name']}")
            
    print("Seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_products())
