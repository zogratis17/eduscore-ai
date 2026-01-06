from fastapi import APIRouter, UploadFile, File, HTTPException
from server.core.parser import DocumentParser

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document (PDF or DOCX).
    Extracts text and metadata from the document.
    """
    # Check file type based on content type or file extension
    file_extension = file.filename.split('.')[-1].lower() if file.filename else ""
    
    # Read file bytes
    file_bytes = await file.read()
    
    if file_bytes is None or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")
    
    # Route to appropriate parser based on file type
    if file.content_type == "application/pdf" or file_extension == "pdf":
        result = DocumentParser.extract_text_from_pdf(file_bytes)
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or file_extension == "docx":
        result = DocumentParser.extract_text_from_docx(file_bytes)  
    else:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF and DOCX are supported."
        )
    
    # Check if there was an error during processing
    if result.get("status") == "error":
        raise HTTPException(
            status_code=400, 
            detail=result.get("message", "An error occurred during document processing.")
        )
    
    return result
        