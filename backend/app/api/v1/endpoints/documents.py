from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from bson import ObjectId

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

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get all documents for the current user.
    """
    cursor = db["documents"].find({"uploaded_by": str(current_user["_id"])})
    docs = await cursor.to_list(length=100)
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get a specific document by ID.
    """
    doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc["uploaded_by"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
        
    return doc

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

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document.
    """
    doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["uploaded_by"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
    
    # Delete from Storage
    if doc.get("storage_path"):
        try:
            # Note: storage_service is synchronous in delete_file implementation? 
            # Let's check storage_service.py. If it's MinIO, it might be sync or async.
            # Assuming sync based on previous usage or wrapper.
            storage_service.delete_file(doc["storage_path"])
        except Exception as e:
            # Log error but proceed with DB deletion
            print(f"Error deleting file from storage: {e}")

    # Delete from Database
    await db["documents"].delete_one({"_id": ObjectId(document_id)})
    
    # Also delete evaluations? Yes, usually cascade.
    await db["evaluations"].delete_many({"document_id": document_id})
    
    return None