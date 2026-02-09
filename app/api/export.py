"""API routes for exporting results."""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from app.services.document_service import document_service
from app.services.export_service import export_service

router = APIRouter(prefix="/api", tags=["export"])


@router.get("/export/{document_id}")
async def export_report(document_id: str):
    """
    Export evaluation results as PDF.
    
    Args:
        document_id: Document identifier
        
    Returns:
        PDF file download
    """
    document = await document_service.get_document(document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not document.get("evaluation_results"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No evaluation results found. Run evaluation first."
        )
    
    try:
        # Generate PDF report
        pdf_content = export_service.generate_pdf_report(
            document_data=document,
            evaluation_results=document["evaluation_results"]
        )
        
        # Return PDF response
        filename = f"evaluation_report_{document_id}.pdf"
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )
