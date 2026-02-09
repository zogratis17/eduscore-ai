from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "document_evaluation"
    
    # MinIO (optional)
    minio_endpoint: Optional[str] = "localhost:9000"
    minio_access_key: Optional[str] = "minioadmin"
    minio_secret_key: Optional[str] = "minioadmin"
    minio_bucket_name: str = "documents"
    minio_secure: bool = False
    
    # Storage
    storage_type: str = "gridfs"  # gridfs or minio
    
    # Application
    max_upload_size_mb: int = 10
    allowed_extensions: str = "pdf,docx"
    languagetool_enabled: bool = True
    
    # Evaluation Weights
    grammar_weight: float = 0.20
    vocabulary_weight: float = 0.15
    topic_relevance_weight: float = 0.25
    coherence_weight: float = 0.20
    plagiarism_weight: float = 0.20
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
