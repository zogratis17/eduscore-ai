from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.common import PyObjectId

class Document(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    uploaded_by: str = Field(..., index=True)
    institution_id: Optional[str] = Field(None, index=True)
    
    filename: str
    original_filename: str
    content_type: str
    file_type: str  # e.g., 'pdf', 'docx', 'txt'
    file_size_bytes: int
    storage_path: str  # Path in the storage system
    
    extracted_text: Optional[str] = None
    word_count: Optional[int] = 0
    page_count: Optional[int] = None
    
    # Processing status
    status: str = Field(default="pending", index=True) # pending, processing, completed, failed
    error_message: Optional[str] = None
    
    #timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True