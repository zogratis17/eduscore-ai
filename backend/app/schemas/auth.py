from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.common import PyObjectId

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    role: Optional[str] = "student"
    institution_id: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    institution_id: Optional[str] = None

class UserResponse(UserBase):
    id: PyObjectId = Field(alias="_id")
    firebase_uid: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
