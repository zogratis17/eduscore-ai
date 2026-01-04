from fastapi import FastAPI
from src.app.api.v1.routes_auth import router as auth_router
from src.app.api.v1.routes_protected import router as protected_router
from src.app.api.v1.routes_upload import router as upload_router


app = FastAPI(
    title="EduScore AI",
    version="0.1",
    description="AI-assisted academic evaluation platform"
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Auth"]
)

app.include_router(
    protected_router,
    prefix="/api/v1",
    tags=["Protected"]
)

app.include_router(
    upload_router,
    prefix="/api/v1",
    tags=["Upload"]
)

