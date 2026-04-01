from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

from app.db.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/dashboard-stats", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get aggregated statistics for the dashboard with real trend data.
    Compares current 30-day period vs previous 30-day period.
    """
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    # --- Current Period (last 30 days) ---
    total_docs = await db["documents"].count_documents({"uploaded_by": user_id})
    current_docs = await db["documents"].count_documents(
        {"uploaded_by": user_id, "created_at": {"$gte": thirty_days_ago}}
    )

    pending_count = await db["documents"].count_documents(
        {"uploaded_by": user_id, "status": {"$in": ["pending", "processing"]}}
    )

    # Average score (current 30-day period)
    pipeline_current = [
        {
            "$match": {
                "uploaded_by": user_id,
                "status": "evaluated",
                "final_score": {"$ne": None},
                "created_at": {"$gte": thirty_days_ago},
            }
        },
        {"$group": {"_id": None, "avg_score": {"$avg": "$final_score"}}},
    ]
    cursor = db["documents"].aggregate(pipeline_current)
    result = await cursor.to_list(length=1)
    avg_score = round(result[0]["avg_score"], 1) if result else 0

    # Alerts (failed evaluations)
    alerts_count = await db["documents"].count_documents(
        {"uploaded_by": user_id, "status": "failed_evaluation"}
    )

    # --- Previous Period (30-60 days ago) for trend calculation ---
    prev_docs = await db["documents"].count_documents(
        {
            "uploaded_by": user_id,
            "created_at": {"$gte": sixty_days_ago, "$lt": thirty_days_ago},
        }
    )

    pipeline_prev = [
        {
            "$match": {
                "uploaded_by": user_id,
                "status": "evaluated",
                "final_score": {"$ne": None},
                "created_at": {"$gte": sixty_days_ago, "$lt": thirty_days_ago},
            }
        },
        {"$group": {"_id": None, "avg_score": {"$avg": "$final_score"}}},
    ]
    cursor_prev = db["documents"].aggregate(pipeline_prev)
    result_prev = await cursor_prev.to_list(length=1)
    prev_avg_score = round(result_prev[0]["avg_score"], 1) if result_prev else 0

    def calc_change(current, previous):
        if previous == 0:
            return f"+{current}" if current > 0 else "0"
        change = ((current - previous) / previous) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{round(change)}%"

    return {
        "total_documents": {
            "value": total_docs,
            "change": calc_change(current_docs, prev_docs),
        },
        "average_score": {
            "value": avg_score,
            "change": calc_change(avg_score, prev_avg_score),
        },
        "pending_review": {
            "value": pending_count,
            "change": "",  # No trend for pending — it's a snapshot
        },
        "alerts": {
            "value": alerts_count,
            "change": "",  # No trend for alerts
        },
    }


@router.get("/grade-distribution", response_model=List[Dict[str, Any]])
async def get_grade_distribution(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get grade distribution across all evaluated documents.
    Returns counts for each grade bracket.
    """
    user_id = str(current_user["_id"])

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "final_score": {"$ne": None},
            }
        },
        {
            "$bucket": {
                "groupBy": "$final_score",
                "boundaries": [0, 50, 55, 60, 65, 70, 75, 80, 85, 90, 101],
                "default": "Other",
                "output": {"count": {"$sum": 1}},
            }
        },
    ]

    cursor = db["evaluations"].aggregate(pipeline)
    buckets = await cursor.to_list(length=20)

    # Map buckets to grade labels
    grade_labels = {
        0: "F",
        50: "C-",
        55: "C",
        60: "C+",
        65: "B-",
        70: "B",
        75: "B+",
        80: "A-",
        85: "A",
        90: "A+",
    }

    distribution = []
    for bucket in buckets:
        label = grade_labels.get(bucket["_id"], "Other")
        distribution.append({"grade": label, "count": bucket["count"]})

    return distribution
