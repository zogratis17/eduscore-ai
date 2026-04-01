import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1.api import api_router
from app.workers.celery_app import celery_app  # Import to initialize Celery config

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    """Startup and shutdown lifecycle for the FastAPI app."""
    await connect_to_mongo()
    logger.info("Application startup complete.")
    yield
    await close_mongo_connection()
    logger.info("Application shutdown complete.")


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    return {"message": "EduScore AI API is running!"}
