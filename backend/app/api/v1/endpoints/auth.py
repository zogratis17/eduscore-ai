from fastapi import APIRouter, Depends, HTTPException, status, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.db.mongodb import get_database
from app.core.security import get_current_user_dependency as get_firebase_user
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import UserResponse, UserUpdate

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(
    token_data: dict = Depends(get_firebase_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user based on their Firebase token.
    If user already exists, return existing user.
    """
    uid = token_data.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="Invalid token: missing uid")

    # Check if exists
    existing_user = await db["users"].find_one({"firebase_uid": uid})
    if existing_user:
        return existing_user

    # Create new user
    user_in = User(
        firebase_uid=uid,
        email=token_data.get("email"),
        full_name=token_data.get("name"),
        profile_picture=token_data.get("picture"),
        is_active=True,
        role="student" # Default role
    )
    
    # Insert
    result = await db["users"].insert_one(user_in.model_dump(by_alias=True, exclude={"id"}))
    
    # Fetch back
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    return created_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get current user profile.
    """
    # Update last login
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update current user profile.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    if not update_data:
        return current_user

    update_data["updated_at"] = datetime.utcnow()
        
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await db["users"].find_one({"_id": current_user["_id"]})
    return updated_user
