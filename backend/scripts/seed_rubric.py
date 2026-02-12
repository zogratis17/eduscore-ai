import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:changeme@localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "ai_evaluation")

async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DATABASE]
    
    existing = await db["rubrics"].find_one({"name": "Standard Academic Essay"})
    if existing:
        print("Default rubric already exists.")
        return

    default_rubric = {
        "name": "Standard Academic Essay",
        "description": "Standard weighting for college-level writing",
        "criteria": [
            {"name": "Grammar", "description": "Mechanics, spelling, and punctuation", "weight": 30},
            {"name": "Vocabulary", "description": "Lexical diversity and word choice", "weight": 20},
            {"name": "Coherence", "description": "Structure, flow, and transitions", "weight": 20},
            {"name": "Topic Relevance", "description": "Adherence to the prompt", "weight": 30}
        ],
        "created_by": "system",
        "is_default": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db["rubrics"].insert_one(default_rubric)
    print("Default rubric created successfully.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
