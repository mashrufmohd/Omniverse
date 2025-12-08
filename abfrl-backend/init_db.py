from app.db.base import Base
from app.db.session import engine
# Import models to register them with Base.metadata
from app.models.product import Product
from app.models.chat import ChatSession, Message
from app.models.cart import Cart, CartItem, DiscountCode, PaymentMethod
from app.models.order import Order, OrderItem

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
