from fastapi import APIRouter, UploadFile, File, HTTPException
from server.core.parser import DocumentParser

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    
    file_bytes = await file.read()
    if file.content_type == "application/pdf":
        result = DocumentParser.extract_text_from_pdf(file_bytes)
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        result = DocumentParser.extract_text_from_docx(file_bytes)  
        
    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message", "An error occurred during document processing."))
    
    return result
        