import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from app.config import settings

logger = logging.getLogger("recallx.database")

Base = declarative_base()

def get_engine():
    """
    Attempts to initialize PostgreSQL database engine.
    If PostgreSQL is unreachable or not configured locally, safely falls back
    to SQLite to ensure zero disruption and reliable local development.
    """
    pg_url = settings.DATABASE_URL
    try:
        # Check if URL is PostgreSQL
        if pg_url.startswith("postgres"):
            # Support both psycopg3 and psycopg2
            if pg_url.startswith("postgres://"):
                pg_url = pg_url.replace("postgres://", "postgresql+psycopg://", 1)
            elif pg_url.startswith("postgresql://") and not pg_url.startswith("postgresql+"):
                pg_url = pg_url.replace("postgresql://", "postgresql+psycopg://", 1)
            
            engine = create_engine(
                pg_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 1}
            )
            # Test connection
            with engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
                return engine, "postgresql"
    except Exception as e:
        logger.warning(f"PostgreSQL connection to {pg_url} failed: {e}. Falling back to SQLite.")

    # Fallback to SQLite
    sqlite_url = settings.SQLITE_FALLBACK_URL
    logger.info(f"Using SQLite database engine at {sqlite_url}")
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )
    return engine, "sqlite"

engine, db_dialect = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import user, workspace, incident, investigation, memory_log  # noqa
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database initialized with dialect: {db_dialect}")
