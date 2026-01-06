from fastapi import FastAPI
from server.api.routes import document

app = FastAPI(title="EduScore AI")
app.include_router(document.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "running", "message": "EduScore AI server is running."}