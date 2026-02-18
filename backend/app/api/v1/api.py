from fastapi import APIRouter
from app.api.v1.endpoints import documents, evaluation, auth, reports, rubrics, analytics, health

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["evaluation"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(rubrics.router, prefix="/rubrics", tags=["rubrics"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(health.router, prefix="/health", tags=["health"])

