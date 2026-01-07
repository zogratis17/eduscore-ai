from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoClientManager:
    client: AsyncIOMotorClient = None
    db_name: str = settings.MONGODB_DB_NAME

db_manager = MongoClientManager()

async def connect_to_mongo():
    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
    logger.info("Connected to MongoDB")

async def close_mongo_connection():
    db_manager.client.close()
    logger.info("Closed MongoDB connection")

async def get_database():
    return db_manager.client[db_manager.db_name]
