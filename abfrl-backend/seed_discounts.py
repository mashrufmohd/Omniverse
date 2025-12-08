from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.cart import DiscountCode

def seed_discount_codes():
    db = SessionLocal()
    try:
        codes = [
            {"code": "SAVE10", "discount_percent": 10.0, "min_purchase": 1000.0},
            {"code": "FIRST20", "discount_percent": 20.0, "min_purchase": 2000.0},
            {"code": "MEGA25", "discount_percent": 25.0, "min_purchase": 5000.0},
            {"code": "VIP15", "discount_percent": 15.0, "min_purchase": 3000.0},
            {"code": "WELCOME5", "discount_percent": 5.0, "min_purchase": 500.0},
            {"code": "SHIRT10", "discount_percent": 10.0, "min_purchase": 0.0},
            {"code": "JEANS20", "discount_percent": 20.0, "min_purchase": 0.0},
            {"code": "SUMMER30", "discount_percent": 30.0, "min_purchase": 0.0},
        ]

        for code_data in codes:
            existing = db.query(DiscountCode).filter(DiscountCode.code == code_data["code"]).first()
            if not existing:
                new_code = DiscountCode(
                    code=code_data["code"],
                    discount_percent=code_data["discount_percent"],
                    min_purchase=code_data["min_purchase"],
                    active=True
                )
                db.add(new_code)
                print(f"Created discount code: {code_data['code']}")
            else:
                print(f"Discount code already exists: {code_data['code']}")
        
        db.commit()
    except Exception as e:
        print(f"Error seeding discount codes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_discount_codes()
