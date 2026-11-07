import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RECALLX AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "recallx-super-secret-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (PostgreSQL supported; defaults to SQLite for immediate zero-config local run)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recallx_ai.db")
    SQLITE_FALLBACK_URL: str = "sqlite:///./recallx_ai.db"
    
    # AI / LLM (Groq)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Hindsight Memory Integration
    # Official docs: https://hindsight.vectorize.io/
    HINDSIGHT_API_URL: str = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    DEFAULT_BANK_ID: str = os.getenv("DEFAULT_BANK_ID", "recallx-sre-workspace")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
