from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.services.report_generator import report_generator

router = APIRouter()

@router.get("/{document_id}/pdf")
async def get_pdf_report(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Generate and download a PDF report for a document evaluation.
    """
    # 1. Fetch Document
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
        
    doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["uploaded_by"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this document")

    # 2. Fetch Evaluation
    evaluation = await db["evaluations"].find_one({"document_id": document_id})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for this document")

    # 3. Generate PDF
    try:
        pdf_bytes = report_generator.generate_pdf(evaluation, doc)
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Could not generate PDF report")

    # 4. Return Response
    filename = f"Report-{doc.get('original_filename', 'document')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
