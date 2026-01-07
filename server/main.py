from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from database import users_collection
from auth import verify_firebase_token
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignupPayload(BaseModel):
    role: str = Field(default='student', description="The user's role, e.g., 'student' or 'teacher'")

class User(BaseModel):
    uid: str
    email: str
    role: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to EduScore AI API"}

@app.get("/health")
def health_check():
    try:
        # Simple check to see if we can access the collection
        users_collection.count_documents({})
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

@app.post("/users/signup")
def create_user(
    payload: SignupPayload,
    user_data: dict = Depends(verify_firebase_token)
):
    """
    Creates or updates a user in the database based on the Firebase token and role from the request body.
    """
    uid = user_data.get("uid")
    email = user_data.get("email")
    
    if not uid or not email:
        raise HTTPException(status_code=400, detail="Invalid token data")

    user_payload = {
        "uid": uid,
        "email": email,
        "display_name": user_data.get("name"),
        "photo_url": user_data.get("picture"),
        "role": payload.role,  # Add role from the request body
        "updated_at": datetime.utcnow()
    }

    # Upsert: Update if exists, Insert if not
    result = users_collection.update_one(
        {"uid": uid},
        {
            "$set": user_payload,
            "$setOnInsert": {"created_at": datetime.utcnow()}
        },
        upsert=True
    )
    
    return {"status": "success", "uid": uid, "operation": "created" if result.upserted_id else "updated"}
