import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

Base = declarative_base()

def get_engine():
    pg_url = settings.get_database_url()
    try:
        engine = create_engine(pg_url, pool_pre_ping=True)
        with engine.connect() as conn:
            logger.info(f"[DB] Conexión exitosa a PostgreSQL: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
        return engine
    except Exception as e:
        logger.warning(
            f"[DB] Conexión a PostgreSQL no disponible ({e}). Activando base de datos SQLite local ('guardrail_local.db')."
        )
        sqlite_url = "sqlite:///./guardrail_local.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models.rule import SecurityRule
    from app.models.audit_log import SecurityAuditLog
    from app.seeds.default_rules import SEED_RULES
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        rule_count = db.query(SecurityRule).count()
        if rule_count == 0:
            for item in SEED_RULES:
                rule = SecurityRule(**item)
                db.add(rule)
            db.commit()
    except Exception as e:
        logger.error(f"[DB Error]: {e}")
        db.rollback()
    finally:
        db.close()
