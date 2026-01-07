from fastapi import FastAPI
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1.api import api_router

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    return {"message": "EduScore AI API is running!"}
