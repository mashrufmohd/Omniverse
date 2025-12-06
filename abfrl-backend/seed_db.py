"""
Script to seed the database with sample products
"""
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.product import Product, Inventory

# Create tables
Base.metadata.create_all(bind=engine)

def seed_products():
    db = SessionLocal()
    try:
        # Check if products already exist
        existing = db.query(Product).first()
        if existing:
            print("Products already seeded!")
            return

        products_data = [
            {
                "name": "Classic Black Jeans",
                "description": "Premium denim jeans with a perfect fit",
                "price": 2999.00,
                "category": "jeans",
                "image_url": "/images/black-jeans.jpg"
            },
            {
                "name": "Blue Slim Fit Jeans",
                "description": "Modern slim fit jeans for everyday wear",
                "price": 2499.00,
                "category": "jeans",
                "image_url": "/images/blue-jeans.jpg"
            },
            {
                "name": "White Formal Shirt",
                "description": "Crisp white shirt perfect for office",
                "price": 1999.00,
                "category": "shirts",
                "image_url": "/images/white-shirt.jpg"
            },
            {
                "name": "Casual Checked Shirt",
                "description": "Comfortable checked shirt for casual outings",
                "price": 1499.00,
                "category": "shirts",
                "image_url": "/images/checked-shirt.jpg"
            },
            {
                "name": "Dark Blue Formal Shirt",
                "description": "Professional dark blue formal shirt",
                "price": 2199.00,
                "category": "shirts",
                "image_url": "/images/blue-shirt.jpg"
            },
        ]

        for prod_data in products_data:
            product = Product(**prod_data)
            db.add(product)
            db.flush()
            
            # Add inventory for each product
            for size in ["S", "M", "L", "XL"]:
                inventory = Inventory(
                    product_id=product.id,
                    store_location="Phoenix Mall",
                    size=size,
                    quantity=10
                )
                db.add(inventory)

        db.commit()
        print(f"Seeded {len(products_data)} products successfully!")

    except Exception as e:
        print(f"Error seeding products: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
