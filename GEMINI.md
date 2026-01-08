# EduScore AI - Project Context

## Project Overview
**EduScore AI** is a comprehensive, automated essay scoring and feedback system. The project is designed as a modular full-stack application leveraging AI for text analysis, plagiarism detection, and grading.

**Current Status:** :construction: **Implementation Phase** :construction:
Backend infrastructure (Docker) is fully operational.

## Intended Architecture
Based on `docs/ARCHITECTURE.md` and `docker-compose.yml`:

### Backend (`/backend`)
*   **Framework:** Python (FastAPI).
*   **Database:** MongoDB (Metadata), Redis (Cache/Queue).
*   **Storage:** MinIO (S3-compatible object storage).
*   **AI/NLP:** LanguageTool (Grammar), Custom AI Models (in `ai-models/`).
*   **Workers:** Celery (Background tasks, e.g., document processing).
*   **Auth:** Firebase.

### Frontend (`/frontend`)
*   **Framework:** React (Vite).
*   **Styling:** Tailwind CSS.
*   **State Management:** (Likely Zustand or Redux Toolkit per architecture doc).

### Infrastructure (RUNNING)
*   **Containerization:** Docker & Docker Compose.
*   **Services:**
    *   `backend`: API Server (Port 8000)
    *   `celery-worker`: Background processing
    *   `mongodb`, `redis`, `minio`, `languagetool`
    *   `flower`: Celery monitoring (Port 5555)

## Key Commands
*   **Start Backend Env:** `docker-compose up -d --build backend celery-worker celery-beat flower`
*   **Check Status:** `docker-compose ps`
*   **Logs:** `docker-compose logs -f backend`

## Immediate Next Steps
1.  **Database Connection:** Implement `backend/app/db/mongodb.py` to connect the app to the running MongoDB container.
2.  **Schemas & Models:** Define initial Pydantic schemas for Documents and Users.
3.  **Auth Integration:** Start implementing the Auth router.

## Documentation
*   [Architecture Overview](docs/ARCHITECTURE.md)
*   [API Specification](docs/API.md)
*   [Deployment Guide](docs/DEPLOYMENT.md)

- User Role: BUILDER/STUDENT. I am the MENTOR/GUIDE. I provide explanations and code snippets, but the user implements them.

- Current Focus: Backend Implementation.

- Standards: Strict adherence to industry best practices (12-factor app, typing, testing).

- Project Status: Infrastructure up. Ready to connect FastAPI to MongoDB.