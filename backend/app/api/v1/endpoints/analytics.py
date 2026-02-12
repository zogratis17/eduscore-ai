from typing import Any, Dict
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

from app.db.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/dashboard-stats", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get aggregated statistics for the dashboard.
    """
    user_id = str(current_user["_id"])
    
    # 1. Total Documents
    total_docs = await db["documents"].count_documents({"uploaded_by": user_id})
    
    # 2. Pending Review (pending or processing)
    pending_count = await db["documents"].count_documents({
        "uploaded_by": user_id, 
        "status": {"$in": ["pending", "processing"]}
    })
    
    # 3. Average Score (of evaluated docs)
    pipeline = [
        {"$match": {"uploaded_by": user_id, "status": "evaluated", "final_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$final_score"}}}
    ]
    cursor = db["documents"].aggregate(pipeline)
    result = await cursor.to_list(length=1)
    avg_score = round(result[0]["avg_score"], 1) if result else 0
    
    # 4. Plagiarism Alerts (Just counting failed for now, or maybe specific flag later)
    # For now, let's count docs with high plagiarism if we had that field. 
    # Use 'failed_evaluation' as a proxy for "Needs Attention" or just 0 for now.
    alerts_count = await db["documents"].count_documents({
        "uploaded_by": user_id,
        "status": "failed_evaluation"
    })

    # 5. Trends (Mocking slight variations for now based on real data)
    # In a real app, we'd compare with last month's data.
    # For MVP, we'll just return the current snapshot.
    
    return {
        "total_documents": {
            "value": total_docs,
            "change": "+0%" # Placeholder
        },
        "average_score": {
            "value": avg_score,
            "change": "+0%" # Placeholder
        },
        "pending_review": {
            "value": pending_count,
            "change": "+0%" # Placeholder
        },
        "alerts": {
            "value": alerts_count,
            "change": "+0%" # Placeholder
        }
    }
