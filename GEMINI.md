# EduScore AI - Project Context & Status

## Project Overview
**EduScore AI** is an automated essay scoring and feedback system using a modular microservices architecture.

**Last Updated:** February 5, 2026
**Current Status:** :white_check_mark: **Core Evaluation Loop Functional**

## Architecture & Infrastructure
*   **Backend:** Python (FastAPI) + Celery (Async Workers).
*   **Frontend:** React (Vite) + Tailwind CSS.
*   **Database:** MongoDB (Data) + Redis (Queue/Cache).
*   **Storage:** MinIO (S3-compatible).
*   **AI Engine:** LanguageTool (Grammar), MinHash (Plagiarism), Heuristics (AI Detect), Logic-based RAG.
*   **Auth:** Firebase Authentication (Real implementation active).

## :white_check_mark: Completed Features
1.  **Authentication System:**
    *   Full Firebase integration (Frontend + Backend Verification).
    *   User Registration & Login flows (UI polished).
    *   Backend User Sync (`POST /auth/register`).
    *   Service Account integration for backend admin tasks.

2.  **Document Pipeline:**
    *   Upload -> MinIO -> MongoDB.
    *   Robust PDF Parsing (PyMuPDF with `pdftotext` fallback).
    *   Background Processing via Celery.

3.  **Evaluation Engine (The "Brain"):**
    *   **Rubrics System:** Fully implemented.
        *   `Rubric` Model & API Endpoints (`/api/v1/rubrics`).
        *   Default Rubric ("Standard Academic Essay") seeded.
        *   Orchestrator calculates scores dynamically based on Rubric weights.
    *   **Modules:**
        *   Grammar (LanguageTool with error spans).
        *   Plagiarism (MinHash LSH with MongoDB persistence).
        *   Topic Relevance (Cosine Similarity).
        *   AI Detection (Statistical Heuristics).

4.  **User Interface (The "Face"):**
    *   **Interactive Essay Viewer:** Annotates text with grammar errors (Red underlines + Sidebar).
    *   **Results Dashboard:** Visualizes scores (Radar Chart) and Qualitative Feedback.
    *   **Mock Data Removed:** Real scores and feedback are now displayed.

## :construction: Work In Progress / Known Gaps
1.  **Dashboard Analytics:**
    *   `DashboardPage.jsx` shows real document lists but fake "Trends" (+12%).
    *   `DashboardStats.jsx` is empty/unused.
    *   `analytics.py` endpoints are empty.

2.  **Rubric Management UI:**
    *   Backend has the API, but Frontend currently has no UI to *create* or *select* custom rubrics during upload. It defaults to the seeded one.

3.  **Advanced AI:**
    *   AI Text Detection is a heuristic placeholder. Needs a real model (RoBERTa) for production accuracy.
    *   Feedback Generation is template-based. Could use a local LLM (Llama 3) for more nuance.

4.  **Class/Course Management:**
    *   Feature mentioned in docs but no code exists yet.

## Next Session Roadmap
1.  **Rubric Selection UI:** Allow users to pick a rubric during upload.
2.  **Real Analytics:** Implement `analytics.py` to calculate real trends and wire up the Dashboard.
3.  **Class Management:** Begin implementing "Courses" to group assignments.

## Key Commands
*   **Start Stack:** `docker-compose up -d`
*   **Logs:** `docker-compose logs -f backend` or `celery-worker`
*   **Frontend:** http://localhost:5173
*   **API Docs:** http://localhost:8000/docs
