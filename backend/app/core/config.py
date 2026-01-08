from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduScore AI"
    API_V1_STR: str = "/api/v1"
    
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "eduscore_ai"
    UPLOAD_DIR: str = "uploads"
    
    # MinIO / S3
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "eduscore-documents"
    MINIO_SECURE: bool = False

    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Services
    LANGUAGETOOL_URL: str = "http://localhost:8010"
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file="backend/.env",
        extra="ignore",
    )
    
settings = Settings()