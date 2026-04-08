# EduScore AI — Automated Essay Scoring Platform

> **EduScore AI** is an end-to-end automated essay evaluation system. Upload PDFs, DOCX, or TXT files and receive AI-generated scores covering grammar, plagiarism, topic relevance, and content quality — all powered by Google Gemini and local NLP tools.

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture](#-architecture)
3. [Prerequisites](#-prerequisites)
4. [Quick Start (Docker)](#-quick-start-docker)
5. [Environment Configuration](#-environment-configuration)
6. [Firebase Setup](#-firebase-setup)
7. [Gemini API Key](#-gemini-api-key)
8. [Service URLs & Access](#-service-urls--access)
9. [How to Use the App](#-how-to-use-the-app)
10. [Useful Commands](#-useful-commands)
11. [Troubleshooting](#-troubleshooting)
12. [Project Structure](#-project-structure)

---

## 🧠 System Overview

EduScore AI evaluates student essays across multiple dimensions:

| Dimension         | Method                                  |
|-------------------|-----------------------------------------|
| **Grammar**       | LanguageTool (local server, inline highlighting) |
| **Plagiarism**    | MinHash LSH (cross-document similarity) |
| **Topic Relevance** | Cosine similarity against prompt      |
| **Content Quality** | Google Gemini (LLM-based scoring)    |
| **AI Detection**  | Statistical heuristics                  |

Results are displayed in an interactive dashboard with a radar chart, inline grammar annotations, and qualitative feedback.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│              React + Vite (port 5173)                │
└───────────────────┬─────────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────────┐
│             FastAPI Backend (port 8000)              │
│         Firebase Auth Verification                   │
└──────┬────────────┬───────────────┬─────────────────┘
       │            │               │
  ┌────▼───┐  ┌─────▼─────┐  ┌─────▼──────┐
  │MongoDB │  │   Redis   │  │   MinIO    │
  │ :27017 │  │   :6379   │  │ :9000/9001 │
  └────────┘  └─────┬─────┘  └────────────┘
                    │
         ┌──────────▼──────────┐
         │   Celery Workers    │
         │  (Background Eval)  │
         └─────────┬───────────┘
                   │
         ┌─────────▼──────────┐
         │   LanguageTool     │
         │   (port 8010)      │
         └────────────────────┘
```

**Stack:**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Python 3.11 + FastAPI + Celery
- **Database:** MongoDB 7
- **Queue / Cache:** Redis 7
- **Storage:** MinIO (S3-compatible)
- **Grammar Engine:** LanguageTool (self-hosted)
- **AI Scoring:** Google Gemini API
- **Auth:** Firebase Authentication

---

## ✅ Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ | Includes Docker Compose v2 |
| [Git](https://git-scm.com/) | any | For cloning |

> **No local Python, Node.js, or database installations are required.** Everything runs inside Docker.

**Minimum resources recommended for Docker:**
- CPU: 4 cores
- RAM: 6 GB (LanguageTool is memory-hungry)
- Disk: 5 GB free

---

## 🚀 Quick Start (Docker)

### Step 1 — Clone the repository

```bash
git clone https://github.com/zogratis17/eduscore-ai.git
cd eduscore-ai
```

### Step 2 — Create your environment file

```bash
cp .env.example .env
```

Then open `.env` and fill in the required keys (details in the next section).

### Step 3 — Build and start all services

```bash
docker compose up --build
```

> **First run takes 5–10 minutes** — Docker will pull images and build containers. Subsequent starts are much faster.

To run in the background (detached mode):

```bash
docker compose up --build -d
```

### Step 4 — Access the app

Once all containers are healthy, open: **http://localhost:5173**

---

## ⚙️ Environment Configuration

The project ships with a `.env.example` file at the root. Copy it to `.env` and fill in values:

```bash
cp .env.example .env
```

### Minimum Required Values

These are the only fields you **must** change to get the app running:

```env
# ─── Gemini AI (Required for AI scoring) ───────────────────────────────────
# Get a free key at: https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# ─── Firebase (Required for Login/Signup) ──────────────────────────────────
# Instructions: See "Firebase Setup" section below
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### Infrastructure Passwords (Optional — defaults work fine locally)

```env
# These default passwords are fine for local development.
# Change them if running on a shared/public machine.
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
MONGO_DATABASE=eduscore_ai

REDIS_PASSWORD=changeme

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme123
MINIO_BUCKET=documents
```

### Frontend Firebase Config

You also need to set Firebase **client-side** keys in `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_AUTH=false

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 🔥 Firebase Setup

Firebase is used for user authentication (Login / Register).

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).

2. **Enable Authentication:**  
   `Authentication → Sign-in method → Email/Password → Enable`

3. **Get the Admin SDK credentials (for the backend):**  
   `Project Settings → Service Accounts → Generate new private key`  
   This downloads a JSON file. Copy the values from it into your root `.env`:

   | JSON field | `.env` variable |
   |---|---|
   | `type` | `FIREBASE_TYPE` |
   | `project_id` | `FIREBASE_PROJECT_ID` |
   | `private_key_id` | `FIREBASE_PRIVATE_KEY_ID` |
   | `private_key` | `FIREBASE_PRIVATE_KEY` |
   | `client_email` | `FIREBASE_CLIENT_EMAIL` |
   | `client_id` | `FIREBASE_CLIENT_ID` |
   | `auth_uri` | `FIREBASE_AUTH_URI` |
   | `token_uri` | `FIREBASE_TOKEN_URI` |
   | `auth_provider_x509_cert_url` | `FIREBASE_AUTH_PROVIDER_CERT_URL` |
   | `client_x509_cert_url` | `FIREBASE_CLIENT_CERT_URL` |

   > ⚠️ The `FIREBASE_PRIVATE_KEY` must be enclosed in double quotes, with literal `\n` for newlines (not actual line breaks).

4. **Get client-side Firebase config (for the frontend):**  
   `Project Settings → General → Your apps → SDK setup and configuration`  
   Copy the `firebaseConfig` values into `frontend/.env`.

---

## 🤖 Gemini API Key

EduScore AI uses **Google Gemini** for AI-based essay scoring and feedback generation.

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with a Google account
3. Click **"Create API Key"**
4. Copy the key and set it in your root `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

> The free tier is sufficient for testing and demonstration purposes.

---

## 🌐 Service URLs & Access

Once `docker compose up` is running and all services are healthy:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend (App)** | http://localhost:5173 | Register a new account |
| **Backend API Docs** | http://localhost:8000/docs | — |
| **Celery Flower** (task monitor) | http://localhost:5555 | — |
| **MinIO Console** (file storage) | http://localhost:9001 | `minioadmin` / `changeme123` |

> **Note:** The Nginx reverse proxy is only active in production mode (`--profile production`). For local use, access each service directly via its port.

---

## 📖 How to Use the App

### 1. Register / Login

Navigate to **http://localhost:5173** and click **Register** to create a new account with your email and password.

### 2. Upload an Essay

- Click **"New Evaluation"** in the sidebar (or the `+` button on the dashboard).
- Upload a **PDF**, **DOCX**, or **TXT** file (max 25 MB).
- You can also bulk-upload a **.ZIP** containing multiple essays.
- Add an optional **assignment prompt** (used for topic relevance scoring).
- Select a **grading rubric** (a default "Standard Academic Essay" rubric is pre-seeded).
- Click **Submit**.

### 3. Wait for Processing

The dashboard shows live status badges:

| Status | Meaning |
|--------|---------|
| 🔵 **Uploaded** | File received, text extraction queued |
| 🟡 **Processing** | Celery worker is running the evaluation |
| 🟢 **Evaluated** | AI scoring complete — results ready |
| 🔴 **Failed** | An error occurred (check logs) |

> Refresh the page if the status doesn't update automatically.

### 4. View Results

Click the **eye icon** on any evaluated document to open the Results page:

- **Radar Chart** — Visual breakdown of all scoring dimensions
- **Grammar Viewer** — Essay text with red-underlined grammar errors; click any error to see details in the sidebar
- **Qualitative Feedback** — Gemini-powered narrative feedback per rubric criterion
- **Plagiarism Score** — Cross-document similarity percentage

---

## 🛠️ Useful Commands

### Start / Stop

```bash
# Start all services (foreground)
docker compose up

# Start all services (background)
docker compose up -d

# Stop all services
docker compose down

# Stop and remove all containers + volumes (full reset)
docker compose down -v
```

### Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f celery-worker
docker compose logs -f frontend
```

### Rebuild after code changes

```bash
# Rebuild a specific service
docker compose up --build backend

# Rebuild everything
docker compose up --build
```

### Check container health

```bash
docker compose ps
```

---

## 🩺 Troubleshooting

### `docker compose` command not found
Use the legacy format: `docker-compose up --build`

### Port conflicts

Ensure these ports are free before running:

| Port | Service |
|------|---------|
| 5173 | Frontend |
| 8000 | Backend API |
| 8010 | LanguageTool |
| 27017 | MongoDB |
| 6379 | Redis |
| 9000 | MinIO API |
| 9001 | MinIO Console |
| 5555 | Celery Flower |

To kill a process using a port (Linux/Mac):
```bash
sudo lsof -ti:5173 | xargs kill -9
```

### Upload fails immediately
- Make sure you're accessing via `http://localhost:5173` (not a different hostname).
- Check that the backend container is healthy: `docker compose ps`

### Evaluation stuck in "Processing" forever
- The Gemini API rate limit may have been hit. Check worker logs:  
  ```bash
  docker compose logs -f celery-worker
  ```
- If you see rate-limit errors, wait a moment and re-submit.

### LanguageTool takes a long time to start
LanguageTool is a JVM-based service and can take **60–90 seconds** to start on first boot. The backend waits for it to be healthy before accepting requests.

### Cannot log in / Firebase errors
- Ensure all `FIREBASE_*` variables in `.env` are correctly set.
- Make sure **Email/Password** sign-in is enabled in your Firebase project.
- Check browser console for specific error messages.

### `FIREBASE_PRIVATE_KEY` formatting issues
The private key must have literal `\n` characters (escaped newlines), not real line breaks, and must be wrapped in double quotes in your `.env`:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n"
```

---

## 📁 Project Structure

```
eduscore-ai/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers (documents, rubrics, users, analytics)
│   │   ├── core/             # Config, security, Firebase init
│   │   ├── models/           # MongoDB document models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (evaluation, plagiarism, grammar)
│   │   └── workers/          # Celery tasks and app config
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages (Dashboard, Results, Upload, etc.)
│   │   ├── context/          # React Contexts (Auth, Settings)
│   │   └── services/         # API client functions
│   └── package.json
│
├── docker/                   # Dockerfiles
│   ├── backend.Dockerfile
│   ├── worker.Dockerfile
│   └── frontend.Dockerfile
│
├── docker-compose.yml        # Main compose file (development)
├── docker-compose.prod.yml   # Production compose overrides
├── init-mongo.js             # MongoDB initialization script
├── .env.example              # Environment variable template
└── README.md
```

---

## 📄 License

[MIT License](LICENSE) — Feel free to use, modify, and distribute.
