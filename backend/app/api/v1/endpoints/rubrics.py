from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.models.rubric import Rubric

router = APIRouter()

@router.post("/", response_model=Rubric, status_code=status.HTTP_201_CREATED)
async def create_rubric(
    rubric: Rubric,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Create a new evaluation rubric.
    """
    # Validate weights sum to 100
    total_weight = sum(c.weight for c in rubric.criteria)
    if abs(total_weight - 100.0) > 0.1: # Allow small float error
        raise HTTPException(
            status_code=400, 
            detail=f"Total weight of criteria must equal 100 (Current: {total_weight})"
        )

    # Set Creator
    rubric.created_by = str(current_user["_id"])
    
    # Insert
    new_rubric = await db["rubrics"].insert_one(rubric.model_dump(by_alias=True, exclude={"id"}))
    created_rubric = await db["rubrics"].find_one({"_id": new_rubric.inserted_id})
    return created_rubric

@router.get("/", response_model=List[Rubric])
async def list_rubrics(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    List all rubrics available to the user (owned + defaults).
    """
    # Logic: Show public defaults + user created ones
    # For MVP, just show all
    cursor = db["rubrics"].find().skip(skip).limit(limit)
    rubrics = await cursor.to_list(length=limit)
    return rubrics

@router.get("/{rubric_id}", response_model=Rubric)
async def get_rubric(
    rubric_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get a specific rubric by ID.
    """
    if not ObjectId.is_valid(rubric_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    rubric = await db["rubrics"].find_one({"_id": ObjectId(rubric_id)})
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
        
    return rubric

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_default_rubric(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Helper to create a default rubric if none exist.
    """
    existing = await db["rubrics"].find_one({"name": "Standard Academic Essay"})
    if existing:
        return {"message": "Default rubric already exists", "rubric_id": str(existing["_id"])}
        
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
        "created_at": datetime.utcnow(), # Fixed import below
        "updated_at": datetime.utcnow()
    }
    
    # Fix import inside function scope or add top level
    from datetime import datetime
    default_rubric["created_at"] = datetime.utcnow()
    default_rubric["updated_at"] = datetime.utcnow()

    res = await db["rubrics"].insert_one(default_rubric)
    return {"message": "Default rubric created", "rubric_id": str(res.inserted_id)}
