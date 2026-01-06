# EduScore AI - Full Stack Setup Guide

## Overview
EduScore AI is a full-stack application with a React/TypeScript frontend and FastAPI/Python backend for AI-powered document analysis and evaluation.

---

## Frontend Setup (React + Vite + TypeScript)

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Installation & Running

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   # Using npm
   npm install
   
   # Or using bun
   bun install
   ```

3. **Create environment file:**
   Create a `.env.development` file with:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Start development server:**
   ```bash
   # Using npm
   npm run dev
   
   # Or using bun
   bun run dev
   ```

   The frontend will be available at `http://localhost:5173` (Vite default port)

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Backend Setup (FastAPI + Python)

### Prerequisites
- Python 3.9+
- pip or uv package manager

### Installation & Running

1. **Navigate to project root:**
   ```bash
   cd /path/to/eduscore-ai
   ```

2. **Create Python virtual environment:**
   ```bash
   # Using venv
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server:**
   ```bash
   # Using uvicorn
   uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
   
   # Or using FastAPI CLI (if available)
   fastapi run server/main.py
   ```

   The backend will be available at `http://localhost:8000`
   - Health check: `GET http://localhost:8000/`
   - API docs (Swagger): `http://localhost:8000/docs`
   - Alternative API docs (ReDoc): `http://localhost:8000/redoc`

---

## Frontend-Backend Integration

### How It Works
1. Frontend (`http://localhost:5173`) sends requests to Backend (`http://localhost:8000`)
2. The backend has CORS enabled to accept requests from frontend origins
3. API service in frontend handles authentication, error handling, and request/response transformation

### API Endpoints

#### Document Upload
- **Endpoint:** `POST /api/v1/upload`
- **Content-Type:** `multipart/form-data`
- **Payload:**
  ```
  file: File (PDF or DOCX, max 10MB)
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "text": "Extracted document text...",
    "metadata": {
      "page_count": 10,
      "title": "Document Title",
      "author": "Author Name"
    }
  }
  ```

#### Health Check
- **Endpoint:** `GET /api/v1/`
- **Response:**
  ```json
  {
    "status": "running",
    "message": "EduScore AI server is running."
  }
  ```

---

## Project Structure

```
eduscore-ai/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   │   ├── api.ts       # Real backend API service
│   │   │   └── mockApi.ts   # Mock data for development
│   │   ├── config/          # Configuration files
│   │   │   └── api.ts       # API configuration
│   │   └── context/         # React context
│   ├── .env.development     # Dev environment variables
│   ├── .env.production      # Prod environment variables
│   └── package.json         # Frontend dependencies
│
├── server/                   # FastAPI backend
│   ├── main.py             # FastAPI application entry
│   ├── api/
│   │   └── routes/
│   │       └── document.py  # Document upload route
│   └── core/
│       └── parser.py        # Document parsing logic
│
├── requirements.txt         # Python dependencies
├── .gitignore              # Git ignore patterns
└── README.md               # Project README
```

---

## Supported File Formats

### Upload Endpoint
- **PDF** (.pdf) - Extracted using PyMuPDF
- **DOCX** (.docx) - Extracted using python-docx
- **Maximum size:** 10MB

---

## Development Tips

### Hot Reload
- **Frontend:** Vite automatically hot-reloads on file changes
- **Backend:** FastAPI with `--reload` flag auto-reloads on code changes

### Debugging
- Frontend: Use browser DevTools and React DevTools extension
- Backend: Check console output from uvicorn server

### API Testing
- Use Swagger UI at `http://localhost:8000/docs`
- Or use tools like Postman, Thunder Client, or `curl`

---

## Environment Variables

### Frontend (.env.development)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EduScore AI
VITE_APP_ENV=development
```

### Backend
No additional env files needed for development. Configure in `server/main.py` for CORS origins.

---

## Common Issues & Solutions

### 1. CORS Error
**Problem:** Frontend can't reach backend
**Solution:** Ensure backend is running and CORS middleware is configured with your frontend URL

### 2. File Upload Fails
**Problem:** 400 Bad Request on upload
**Solution:** Check file format (only PDF/DOCX), file size (< 10MB), and backend logs

### 3. Python Module Not Found
**Problem:** `ModuleNotFoundError: No module named 'server'`
**Solution:** Run backend from project root, not from server directory

### 4. Port Already in Use
**Problem:** Port 8000 or 5173 already occupied
**Solution:** 
```bash
# Change backend port
uvicorn server.main:app --reload --port 8001

# Change frontend port (in vite.config.ts)
```

---

## Testing

### Frontend Testing
```bash
cd frontend
npm run test  # When test setup is added
npm run lint  # Run ESLint
```

### Backend Testing
```bash
# Run tests
python -m pytest tests/

# Test specific file
python -m pytest tests/test_parser.py -v
```

---

## Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to static hosting (Vercel, Netlify, GitHub Pages)
```

### Backend Deployment
```bash
# Deploy using gunicorn
pip install gunicorn
gunicorn server.main:app -w 4 -b 0.0.0.0:8000
```

---

## License
MIT

## Support
For issues or questions, please create an issue in the repository.
