from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from app.models.common import PyObjectId

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    firebase_uid: str = Field(..., index=True)
    
    email: EmailStr = Field(..., index=True)
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    
    role: str = Field(default="student") # student, teacher, admin
    institution_id: Optional[str] = None
    
    is_active: bool = True
    is_superuser: bool = False
    
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
