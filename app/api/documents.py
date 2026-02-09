"""API routes for document operations."""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import DocumentInfo
from app.services.document_service import document_service
from typing import Optional

router = APIRouter(prefix="/api", tags=["documents"])


@router.get("/document/{document_id}", response_model=DocumentInfo)
async def get_document(document_id: str):
    """
    Get document information by ID.
    
    Args:
        document_id: Document identifier
        
    Returns:
        DocumentInfo: Document information
    """
    document = await document_service.get_document(document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentInfo(**document)


@router.get("/documents")
async def list_documents(limit: int = 50, skip: int = 0):
    """
    List all documents.
    
    Args:
        limit: Maximum number of documents to return
        skip: Number of documents to skip
        
    Returns:
        list: List of documents
    """
    documents = await document_service.list_documents(limit=limit, skip=skip)
    return {"documents": documents, "count": len(documents)}
