from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.workers.tasks.evaluation_tasks import evaluate_document_task

# We might need a schema for the response
# For now, we'll return a generic dict or define a schema
from app.models.evaluation import Evaluation

router = APIRouter()

@router.post("/evaluate/{document_id}", status_code=status.HTTP_202_ACCEPTED)
async def trigger_evaluation(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Trigger evaluation for a specific document.
    """
    # 1. Verify Document Ownership
    doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["uploaded_by"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to evaluate this document")
        
    # 2. Check Status
    if doc.get("status") == "pending":
         raise HTTPException(status_code=400, detail="Document is still processing. Please wait.")
    
    # 3. Trigger Task
    evaluate_document_task.delay(document_id)
    
    return {"message": "Evaluation started", "document_id": document_id}

@router.get("/results/{document_id}")
async def get_evaluation_results(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get evaluation results for a document.
    """
    # 1. Verify Document Ownership (or if user has access)
    doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["uploaded_by"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this document")

    # 2. Fetch Evaluation
    evaluation = await db["evaluations"].find_one({"document_id": document_id})
    if not evaluation:
        if doc.get("status") in ["processing", "pending", "completed"]:
             return {"status": "processing", "message": "Evaluation not yet available"}
        return {"status": "not_found", "message": "No evaluation found"}
        
    # Convert _id to id for response (simple fix for now)
    evaluation["id"] = str(evaluation["_id"])
    del evaluation["_id"]
    
    return evaluation
