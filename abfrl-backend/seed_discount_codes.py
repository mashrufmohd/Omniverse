from sqlalchemy.orm import Session
from app.models.cart import DiscountCode
from datetime import datetime

def seed_discount_codes(db: Session):
    """Seed discount codes into database"""
    
    discount_codes = [
        {
            "code": "SAVE10",
            "discount_percent": 10.0,
            "min_purchase": 1000.0,
            "active": True,
            "valid_until": None
        },
        {
            "code": "FIRST20",
            "discount_percent": 20.0,
            "min_purchase": 2000.0,
            "active": True,
            "valid_until": None
        },
        {
            "code": "MEGA25",
            "discount_percent": 25.0,
            "min_purchase": 5000.0,
            "active": True,
            "valid_until": None
        },
        {
            "code": "VIP15",
            "discount_percent": 15.0,
            "min_purchase": 3000.0,
            "active": True,
            "valid_until": None
        },
        {
            "code": "WELCOME5",
            "discount_percent": 5.0,
            "min_purchase": 500.0,
            "active": True,
            "valid_until": None
        }
    ]
    
    for code_data in discount_codes:
        existing = db.query(DiscountCode).filter(DiscountCode.code == code_data["code"]).first()
        if not existing:
            discount_code = DiscountCode(**code_data)
            db.add(discount_code)
    
    db.commit()
    print(f"✅ Seeded {len(discount_codes)} discount codes")

if __name__ == "__main__":
    from app.db.session import SessionLocal, engine
    from app.models import Base  # Import all models
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed discount codes
    db = SessionLocal()
    try:
        seed_discount_codes(db)
    finally:
        db.close()
