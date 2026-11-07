import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, SessionLocal, db_dialect
from app.services.incident_service import incident_service
from app.services.hindsight_service import hindsight_service
from app.routes import auth, incidents, investigation, hindsight, analytics, workspace, export

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("recallx.main")

# Initialize database and seed initial demo data synchronously at startup
logger.info("Initializing RECALLX AI Platform Database...")
init_db()
_db = SessionLocal()
try:
    incident_service.seed_initial_demo_data(_db)
    logger.info("Seeded initial enterprise demo incidents and accounts.")
except Exception as e:
    logger.error(f"Error seeding demo data: {e}")
finally:
    _db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Incident Response & Memory Agent powered by Hindsight and Groq"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(incidents.router, prefix=settings.API_V1_PREFIX)
app.include_router(investigation.router, prefix=settings.API_V1_PREFIX)
app.include_router(hindsight.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(workspace.router, prefix=settings.API_V1_PREFIX)
app.include_router(export.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "name": "RECALLX AI — Intelligent Incident Response & Memory Agent",
        "tagline": "Every Incident Teaches. Every Response Gets Smarter.",
        "status": "online",
        "version": settings.VERSION,
        "database_dialect": db_dialect,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": "2026-11-07T14:30:00Z",
        "hindsight": hindsight_service.check_connection()
    }
