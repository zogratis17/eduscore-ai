from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.models.common import PyObjectId

class Evaluation(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    document_id: str = Field(..., index=True)
    user_id: str = Field(..., index=True)
    
    final_score: float
    grade: str
    
    # Store detailed results from each analyzer
    components: Dict[str, Any] = Field(default_factory=dict)

    # Transparent score calculation breakdown
    score_breakdown: Optional[Dict[str, Any]] = None

    # Which scoring engine was used: "gemini" or "fallback"
    scoring_engine: Optional[str] = None
    rubric_used: Optional[str] = None

    # High-level feedback
    overall_feedback: Optional[str] = None
    
    # Metadata
    processing_time_ms: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
