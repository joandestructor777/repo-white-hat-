import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Assistant Security Guardrail"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "ai_guardrail_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    # Direct database URL override (optional)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)
    
    # Security Engine Parameters
    DEFAULT_RISK_THRESHOLD: int = 40  # Risk score >= 40 triggers warnings, >= 70 blocks
    BLOCK_ON_CRITICAL: bool = True

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
