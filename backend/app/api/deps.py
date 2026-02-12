from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import get_current_user_dependency as get_firebase_user
from app.models.user import User
import os
from datetime import datetime

async def get_current_user(
    token_data: dict = Depends(get_firebase_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    """
    Dependency that retrieves the user from MongoDB based on the Firebase token.
    If the user does not exist in MongoDB (e.g., first login before registration),
    it returns None or raises an error depending on strictness.
    
    For now, we enforce that the user MUST exist in our DB.
    """
    uid = token_data.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing uid"
        )

    user_doc = await db["users"].find_one({"firebase_uid": uid})
    
    # --- MOCK AUTH AUTO-PROVISIONING ---
    # If Mock Auth is enabled and the mock user doesn't exist in DB, create them on the fly.
    if not user_doc and os.getenv("ENABLE_MOCK_AUTH") == "true" and uid == "mock-user-123":
        mock_user = {
            "firebase_uid": uid,
            "email": token_data.get("email"),
            "full_name": token_data.get("name"),
            "is_active": True,
            "is_superuser": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db["users"].insert_one(mock_user)
        user_doc = await db["users"].find_one({"firebase_uid": uid})
    # -----------------------------------
    
    if not user_doc:
        # If user is authenticated in Firebase but not in our DB, 
        # they might need to hit the /register endpoint.
        # But for general protected endpoints, this is a 401/403.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in database. Please register first."
        )
    
    # Return the user document (dict) to maintain compatibility with existing code
    # that expects dictionary access (e.g., doc["uploaded_by"])
    return user_doc

async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user