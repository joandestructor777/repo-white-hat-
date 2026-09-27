import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "JoanVector - AI Security Guardrail"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", os.getenv("PORT", "8000")))
    CORS_ORIGINS: List[str] = ["*"]
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "ai_guardrail_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)
    
    DEFAULT_CLIENT_IP: str = "127.0.0.1"
    DEFAULT_RISK_THRESHOLD: int = 40
    CRITICAL_RISK_THRESHOLD: int = 70
    BLOCK_ON_CRITICAL: bool = True
    DEFAULT_PAGE_LIMIT: int = 50
    RECENT_EVENTS_LIMIT: int = 8

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
