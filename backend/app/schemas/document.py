from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

# Base properties shared across schemas
class DocumentBase(BaseModel):
    filename: Optional[str] = None
    original_filename: Optional[str] = None
    file_type: Optional[str] = None

# Properties to return via API (The "Menu")
class DocumentResponse(DocumentBase):
    id: str = Field(alias="_id")  # Shows as 'id' to user, maps from '_id'
    uploaded_by: str
    status: str
    file_size_bytes: int
    word_count: Optional[int] = 0
    page_count: Optional[int] = None
    created_at: datetime
    error_message: Optional[str] = None
    
    # We hide 'storage_path' and 'extracted_text' for security and performance

    class Config:
        populate_by_name = True
        from_attributes = True
