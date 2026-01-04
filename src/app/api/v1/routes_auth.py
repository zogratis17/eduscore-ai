from fastapi import APIRouter, HTTPException
from src.app.core.security import hash_password, verify_password
from src.app.core.jwt import create_access_token

router = APIRouter()

# Temporary user (DB next step)
FAKE_USER = {
    "email": "admin@eduscore.ai",
    "password": hash_password("admin123")
}

@router.post("/login")
def login(email: str, password: str):
    if email != FAKE_USER["email"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, FAKE_USER["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": email})
    return {
        "access_token": token,
        "token_type": "bearer"
    }
