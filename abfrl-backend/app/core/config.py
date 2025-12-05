from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ABFRL Sales Agent"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str = "development_secret_key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 
    
    # AI - Gemini
    GOOGLE_API_KEY: str
    
    # Vector DB
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()