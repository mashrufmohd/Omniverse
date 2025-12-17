from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.mongodb import init_db
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="ABFRL Conversational Sales Agent Backend"
)

@app.on_event("startup")
async def on_startup():
    await init_db()
    
    # Initialize Firebase Admin SDK
    try:
        firebase_admin.get_app()
        print("✅ Firebase Admin already initialized")
    except ValueError:
        # Initialize with project ID from environment
        try:
            # Get project ID from environment variable
            firebase_project_id = os.getenv('FIREBASE_PROJECT_ID', 'omniverse-6ae98')
            
            # Initialize with project ID (required for token verification)
            firebase_admin.initialize_app(options={
                'projectId': firebase_project_id
            })
            
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print("🔥 FIREBASE ADMIN INITIALIZED")
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print(f"📌 Project ID: {firebase_project_id}")
            print("✅ Token verification: ENABLED")
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print()
        except Exception as e:
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print("❌ FIREBASE INITIALIZATION FAILED")
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print(f"Error: {e}")
            print("⚠️  Firebase authentication will NOT work!")
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print()

# CORS Configuration
origins = ["*"] # Allow all for Hackathon/MVP

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include centralized API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to ABFRL Conversational Sales Agent API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ABFRL Agent"}
