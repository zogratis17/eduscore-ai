"""API routes for document upload."""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.models.schemas import DocumentUploadResponse, DocumentStatus
from app.services.storage_service import storage_service
from app.services.document_service import document_service
from app.services.parser_service import document_parser
from app.config import settings
import os

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a single document (PDF or DOCX).
    
    Args:
        file: Uploaded file
        
    Returns:
        DocumentUploadResponse: Upload confirmation with document ID
    """
    # Validate file extension
    file_extension = os.path.splitext(file.filename)[1].lower().lstrip('.')
    allowed_extensions = settings.allowed_extensions.split(',')
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file size
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded"
        )
    
    try:
        # Upload to storage (GridFS)
        file_id = await storage_service.upload_file(
            file_content=file_content,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream"
        )
        
        # Create document record
        document_id = await document_service.create_document(
            filename=file.filename,
            file_type=file_extension,
            file_size=file_size,
            file_id=file_id
        )
        
        # Parse document asynchronously
        try:
            await document_service.update_status(document_id, DocumentStatus.PARSING)
            
            parsed_data = document_parser.parse_document(file_content, file_extension)
            
            await document_service.save_parsed_data(
                document_id=document_id,
                extracted_text=parsed_data["extracted_text"],
                word_count=parsed_data["word_count"],
                page_count=parsed_data["page_count"]
            )
        except Exception as parse_error:
            await document_service.update_status(document_id, DocumentStatus.FAILED)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Document parsing failed: {str(parse_error)}"
            )
        
        # Get created document
        document = await document_service.get_document(document_id)
        
        return DocumentUploadResponse(
            id=document_id,
            filename=document["filename"],
            file_type=document["file_type"],
            file_size=document["file_size"],
            status=document["status"],
            uploaded_at=document["uploaded_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
