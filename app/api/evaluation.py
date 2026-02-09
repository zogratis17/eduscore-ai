"""API routes for document evaluation."""
from fastapi import APIRouter, HTTPException, status, Body
from app.models.schemas import EvaluationResults, DocumentStatus
from app.services.document_service import document_service
from app.services.evaluation_service import evaluation_service
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["evaluation"])


class EvaluationRequest(BaseModel):
    """Request model for evaluation."""
    prompt_text: Optional[str] = None


@router.post("/evaluate/{document_id}", response_model=EvaluationResults)
async def evaluate_document(
    document_id: str,
    request: EvaluationRequest = Body(default=EvaluationRequest())
):
    """
    Evaluate a document.
    
    Args:
        document_id: Document identifier
        request: Evaluation request with optional prompt
        
    Returns:
        EvaluationResults: Complete evaluation results
    """
    # Get document
    document = await document_service.get_document(document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document is parsed
    if document["status"] not in [DocumentStatus.PARSED.value, DocumentStatus.COMPLETED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document not ready for evaluation. Current status: {document['status']}"
        )
    
    # Check if text is available
    if not document.get("extracted_text"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No extracted text available for evaluation"
        )
    
    try:
        # Update status
        await document_service.update_status(document_id, DocumentStatus.EVALUATING)
        
        # Perform evaluation
        results = await evaluation_service.evaluate_document(
            document_id=document_id,
            text=document["extracted_text"],
            prompt_text=request.prompt_text
        )
        
        # Save results
        results_dict = results.model_dump()
        await document_service.save_evaluation_results(
            document_id=document_id,
            evaluation_results=results_dict
        )
        
        return results
        
    except Exception as e:
        await document_service.update_status(document_id, DocumentStatus.FAILED)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.get("/results/{document_id}", response_model=EvaluationResults)
async def get_evaluation_results(document_id: str):
    """
    Get evaluation results for a document.
    
    Args:
        document_id: Document identifier
        
    Returns:
        EvaluationResults: Evaluation results
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
    
    return EvaluationResults(**document["evaluation_results"])
