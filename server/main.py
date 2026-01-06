from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.api.routes import document

app = FastAPI(title="EduScore AI")

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # Vite default port, other common ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "running", "message": "EduScore AI server is running."}