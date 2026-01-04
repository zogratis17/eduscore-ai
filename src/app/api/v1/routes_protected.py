from fastapi import APIRouter, Depends
from src.app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/secure-data")
def secure_endpoint(current_user: str = Depends(get_current_user)):
    return {
        "message": "You are authorized",
        "user": current_user
    }
