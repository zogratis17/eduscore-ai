from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import os

from app.db.mongodb import get_database
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.storage_service import storage_service
from app.api.deps import get_current_user
from app.workers.tasks.document_tasks import process_uploaded_document

router = APIRouter()

# Map MIME types to our internal file_type strings
ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt"
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Upload a new document.
    """
    # 1. Validate File Type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF, DOCX, and TXT are allowed."
        )

    # 2. Save File to Disk (Async)
    try:
        storage_path = await storage_service.save_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # 3. Create Database Record
    file_type = ALLOWED_MIME_TYPES[file.content_type]
    
    # Get file size safely and validate
    try:
        file_size = os.path.getsize(storage_path)
        if file_size > MAX_FILE_SIZE:
            # Cleanup
            storage_service.delete_file(storage_path)
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of 25MB."
            )
    except OSError:
        file_size = 0

    doc_in = Document(
        uploaded_by=str(current_user["_id"]), 
        institution_id=current_user.get("institution_id"),
        filename=file.filename,
        original_filename=file.filename,
        content_type=file.content_type,
        file_type=file_type,
        file_size_bytes=file_size,
        storage_path=storage_path,
        status="pending"
    )

    # Insert into MongoDB
    # model_dump(by_alias=True) ensures 'id' becomes '_id' for Mongo
    new_doc = await db["documents"].insert_one(
        doc_in.model_dump(by_alias=True, exclude={"id"})
    )
    
    # Trigger Background Processing
    process_uploaded_document.delay(str(new_doc.inserted_id))
    
    # Retrieve the created document to return it
    created_doc = await db["documents"].find_one({"_id": new_doc.inserted_id})
    
    return created_doc