from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.product import Product
from app.models.cart import Cart, DiscountCode, PaymentMethod
from app.models.order import Order
from app.models.chat import ChatSession

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User,
            Product,
            Cart,
            DiscountCode,
            PaymentMethod,
            Order,
            ChatSession
        ]
    )
