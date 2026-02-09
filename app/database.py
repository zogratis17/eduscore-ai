"""Database connection and initialization."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.config import settings

# MongoDB client
client: AsyncIOMotorClient = None
database = None
gridfs_bucket: AsyncIOMotorGridFSBucket = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global client, database, gridfs_bucket
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.mongodb_db_name]
    gridfs_bucket = AsyncIOMotorGridFSBucket(database)
    
    print(f"Connected to MongoDB: {settings.mongodb_db_name}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    """Get database instance."""
    return database


def get_gridfs():
    """Get GridFS bucket instance."""
    return gridfs_bucket
