from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import chat, checkout, payment, cart, products, orders

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="ABFRL Conversational Sales Agent Backend"
)

# CORS Configuration
origins = ["*"] # Allow all for Hackathon/MVP

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(cart.router, prefix=f"{settings.API_V1_STR}/cart", tags=["cart"])
app.include_router(checkout.router, prefix=f"{settings.API_V1_STR}/checkout", tags=["checkout"])
app.include_router(payment.router, prefix=f"{settings.API_V1_STR}/payment", tags=["payment"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ABFRL Agent"}
