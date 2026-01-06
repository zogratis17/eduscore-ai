# MongoDB Database Schema
# Using Pydantic models for FastAPI + MongoDB Motor

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

# Custom ObjectId type for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ============================================================================
# USERS COLLECTION
# ============================================================================
class User(BaseModel):
    """Educator/Admin user model"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    firebase_uid: str = Field(..., index=True, unique=True)
    email: EmailStr = Field(..., index=True, unique=True)
    name: str
    role: str = Field(default="educator")  # educator, admin, department_head
    institution_id: Optional[str] = None
    department: Optional[str] = None
    
    # Profile
    profile_picture: Optional[str] = None
    phone: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    # Statistics
    total_evaluations: int = 0
    total_documents_processed: int = 0
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# INSTITUTIONS COLLECTION
# ============================================================================
class Institution(BaseModel):
    """Institution/College model"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    code: str = Field(..., index=True, unique=True)
    type: str  # college, university, school
    address: Dict[str, str]
    
    # Configuration
    settings: Dict[str, Any] = {
        "max_file_size_mb": 25,
        "max_batch_size": 200,
        "allowed_file_types": ["pdf", "docx", "txt"],
        "enable_ocr": True,
        "enable_plagiarism_check": True
    }
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# DOCUMENTS COLLECTION
# ============================================================================
class Document(BaseModel):
    """Uploaded document model"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    # Ownership
    uploaded_by: str = Field(..., index=True)  # user_id
    institution_id: Optional[str] = Field(None, index=True)
    
    # File info
    filename: str
    original_filename: str
    file_type: str  # pdf, docx, txt
    file_size_bytes: int
    storage_path: str  # GridFS ID or MinIO path
    
    # Document metadata
    student_info: Optional[Dict[str, Any]] = {
        "name": None,
        "roll_number": None,
        "class": None,
        "subject": None
    }
    
    # Content
    extracted_text: str
    word_count: int
    page_count: Optional[int] = None
    
    # Assignment details
    assignment_type: str  # essay, report, case_study, research_paper
    topic: Optional[str] = None
    prompt: Optional[str] = None  # Original assignment prompt
    
    # Processing status
    status: str = Field(default="pending", index=True)
    # pending, processing, completed, failed
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    # Batch info
    batch_id: Optional[str] = Field(None, index=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# EVALUATIONS COLLECTION
# ============================================================================
class Evaluation(BaseModel):
    """Complete evaluation results for a document"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    document_id: str = Field(..., index=True)
    user_id: str = Field(..., index=True)
    
    # Overall scores
    final_score: float  # 0-100
    grade: Optional[str] = None  # A+, A, B+, etc.
    
    # Component scores
    scores: Dict[str, Any] = {
        "grammar": {
            "score": 0.0,
            "errors_count": 0,
            "error_categories": {},
            "suggestions": []
        },
        "vocabulary": {
            "score": 0.0,
            "richness_score": 0.0,
            "lexical_diversity": 0.0,
            "avg_word_length": 0.0
        },
        "coherence": {
            "score": 0.0,
            "paragraph_structure": 0.0,
            "sentence_transitions": 0.0,
            "logical_flow": 0.0
        },
        "topic_relevance": {
            "score": 0.0,
            "similarity_score": 0.0,
            "key_concepts_covered": []
        },
        "plagiarism": {
            "similarity_percentage": 0.0,
            "suspicion_level": "low",  # low, medium, high
            "matched_sources": [],
            "matched_segments": []
        },
        "ai_text_detection": {
            "suspicion_score": 0.0,
            "suspicion_level": "low",
            "perplexity_score": 0.0,
            "reasoning": ""
        },
        "citation_quality": {
            "score": 0.0,
            "total_citations": 0,
            "valid_citations": 0,
            "invalid_citations": [],
            "missing_fields": []
        }
    }
    
    # Rubric-based evaluation
    rubric_scores: List[Dict[str, Any]] = []
    # [
    #     {
    #         "criterion": "Introduction",
    #         "weight": 15,
    #         "score": 85,
    #         "max_score": 100,
    #         "feedback": "Clear thesis statement..."
    #     }
    # ]
    
    # AI-generated feedback
    overall_feedback: str
    strengths: List[str] = []
    improvements: List[str] = []
    detailed_comments: List[Dict[str, str]] = []
    # [{"section": "paragraph_2", "comment": "Consider..."}]
    
    # Explainability
    scoring_rationale: Dict[str, str] = {}
    retrieved_context: Optional[List[str]] = None  # RAG context
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# RUBRICS COLLECTION
# ============================================================================
class Rubric(BaseModel):
    """Evaluation rubric template"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    # Ownership
    created_by: str  # user_id
    institution_id: Optional[str] = None
    
    # Rubric details
    name: str
    description: Optional[str] = None
    assignment_type: str  # essay, report, etc.
    
    # Criteria
    criteria: List[Dict[str, Any]]
    # [
    #     {
    #         "name": "Introduction",
    #         "weight": 15,
    #         "max_score": 100,
    #         "description": "Quality of introduction...",
    #         "scoring_guidelines": {
    #             "90-100": "Excellent thesis...",
    #             "70-89": "Good thesis...",
    #             "50-69": "Adequate...",
    #             "0-49": "Weak..."
    #         }
    #     }
    # ]
    
    total_weight: float = 100.0
    
    # Metadata
    is_default: bool = False
    is_active: bool = True
    usage_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# BATCH_JOBS COLLECTION
# ============================================================================
class BatchJob(BaseModel):
    """Batch processing job tracker"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    # Job details
    created_by: str = Field(..., index=True)
    job_name: Optional[str] = None
    
    # Documents
    document_ids: List[str]
    total_documents: int
    
    # Progress
    status: str = Field(default="queued", index=True)
    # queued, processing, completed, failed, partial
    processed_count: int = 0
    succeeded_count: int = 0
    failed_count: int = 0
    
    # Configuration
    rubric_id: Optional[str] = None
    evaluation_settings: Dict[str, Any] = {}
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    
    # Results
    summary_stats: Optional[Dict[str, Any]] = None
    error_logs: List[Dict[str, str]] = []
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# PLAGIARISM_INDEX COLLECTION
# ============================================================================
class PlagiarismIndex(BaseModel):
    """Index for plagiarism detection"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    # Document reference
    document_id: str = Field(..., index=True)
    institution_id: str = Field(..., index=True)
    
    # Hashes for similarity detection
    minhash_signature: List[int]
    ngram_hashes: List[str]
    
    # Text segments
    segments: List[Dict[str, Any]]
    # [
    #     {
    #         "segment_id": "seg_1",
    #         "text": "...",
    #         "hash": "...",
    #         "start_pos": 0,
    #         "end_pos": 100
    #     }
    # ]
    
    # Metadata
    indexed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# ANALYTICS COLLECTION
# ============================================================================
class AnalyticsSnapshot(BaseModel):
    """Periodic analytics snapshot for dashboards"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    # Scope
    snapshot_type: str  # daily, weekly, monthly, institution, user
    institution_id: Optional[str] = Field(None, index=True)
    user_id: Optional[str] = Field(None, index=True)
    
    # Date range
    start_date: datetime = Field(..., index=True)
    end_date: datetime
    
    # Metrics
    metrics: Dict[str, Any] = {
        "total_evaluations": 0,
        "total_documents": 0,
        "avg_score": 0.0,
        "score_distribution": {},
        "avg_processing_time_sec": 0.0,
        "common_issues": [],
        "plagiarism_cases": 0,
        "ai_text_detections": 0
    }
    
    # Detailed breakdown
    assignment_type_breakdown: Dict[str, int] = {}
    department_breakdown: Dict[str, Dict[str, Any]] = {}
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# ACTIVITY_LOGS COLLECTION (Optional)
# ============================================================================
class ActivityLog(BaseModel):
    """Audit trail for important actions"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    user_id: str = Field(..., index=True)
    action: str  # upload, evaluate, delete, export, etc.
    resource_type: str  # document, evaluation, rubric
    resource_id: str
    
    # Details
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ============================================================================
# MONGODB INDEXES
# ============================================================================
"""
Required indexes for performance:

db.users.createIndex({ "firebase_uid": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "institution_id": 1 })

db.documents.createIndex({ "uploaded_by": 1, "created_at": -1 })
db.documents.createIndex({ "status": 1, "created_at": -1 })
db.documents.createIndex({ "batch_id": 1 })
db.documents.createIndex({ "institution_id": 1 })

db.evaluations.createIndex({ "document_id": 1 }, { unique: true })
db.evaluations.createIndex({ "user_id": 1, "created_at": -1 })
db.evaluations.createIndex({ "created_at": -1 })

db.batch_jobs.createIndex({ "created_by": 1, "created_at": -1 })
db.batch_jobs.createIndex({ "status": 1, "created_at": -1 })

db.plagiarism_index.createIndex({ "document_id": 1 })
db.plagiarism_index.createIndex({ "institution_id": 1 })

db.analytics_snapshots.createIndex({ "start_date": 1, "snapshot_type": 1 })
db.analytics_snapshots.createIndex({ "institution_id": 1, "start_date": 1 })

db.activity_logs.createIndex({ "user_id": 1, "timestamp": -1 })
db.activity_logs.createIndex({ "timestamp": -1 })
"""