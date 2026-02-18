from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.common import PyObjectId

class Criterion(BaseModel):
    name: str = Field(..., description="Name of the criterion (e.g., 'Grammar', 'Coherence')")
    description: str = Field(..., description="Description of what this criterion evaluates")
    weight: float = Field(..., ge=0, le=100, description="Weight percentage (0-100)")
    # Future: thresholds for A/B/C grades specific to this criterion

class Rubric(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="Name of the rubric (e.g., 'Standard Essay', 'Creative Writing')")
    description: Optional[str] = None
    criteria: List[Criterion] = Field(..., description="List of evaluation criteria")
    created_by: str = Field(default="", description="User ID who created this rubric")
    is_default: bool = Field(default=False, description="If true, used when no rubric is specified")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "name": "Standard Academic Essay",
                "description": "General purpose rubric for college essays",
                "criteria": [
                    {"name": "Grammar", "description": "Mechanics and spelling", "weight": 30},
                    {"name": "Vocabulary", "description": "Lexical diversity", "weight": 20},
                    {"name": "Coherence", "description": "Flow and structure", "weight": 20},
                    {"name": "Topic Relevance", "description": "Adherence to prompt", "weight": 30}
                ]
            }
        }
