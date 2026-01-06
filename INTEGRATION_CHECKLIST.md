# EduScore AI - Integration Checklist

## ✅ Completed Integrations

### Backend Setup
- [x] FastAPI application configured
- [x] CORS middleware enabled for frontend communication
- [x] Document parsing module (PDF and DOCX support)
- [x] API routes organized in `/api/routes`
- [x] Error handling standardized (status + message format)
- [x] Python package structure (`__init__.py` files)

### Frontend Setup
- [x] React + Vite + TypeScript configured
- [x] API configuration file (`config/api.ts`)
- [x] API service layer (`services/api.ts`) for backend communication
- [x] Environment variables setup (.env files)
- [x] Upload component integrated with backend API
- [x] Error handling and response management

### Integration Points
- [x] Document upload endpoint connected
- [x] Request/response handling standardized
- [x] File type validation (PDF, DOCX)
- [x] File size validation (10MB limit)
- [x] Proper error messages from backend to frontend

---

## 📋 Setup Instructions

### Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn server.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

---

## 🧪 Testing the Integration

### 1. Health Check
```bash
curl http://localhost:8000/
# Expected response: {"status": "running", "message": "EduScore AI server is running."}
```

### 2. API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Upload a Document
Using the frontend:
1. Navigate to `http://localhost:5173`
2. Go to Upload page
3. Select a PDF or DOCX file
4. Submit
5. Check backend logs for processing details

Using curl:
```bash
curl -X POST -F "file=@test.pdf" http://localhost:8000/api/v1/upload
```

---

## 📁 File Structure Overview

```
eduscore-ai/
├── frontend/
│   ├── src/
│   │   ├── config/api.ts          # ✅ API configuration
│   │   ├── services/
│   │   │   ├── api.ts             # ✅ Backend API service
│   │   │   └── mockApi.ts         # Mock data (legacy)
│   │   ├── pages/Upload.tsx        # ✅ Updated to use real API
│   │   └── ...
│   ├── .env.development           # ✅ Dev environment
│   ├── .env.production            # ✅ Prod environment
│   └── ...
│
├── server/
│   ├── main.py                     # ✅ FastAPI app with CORS
│   ├── api/
│   │   ├── __init__.py            # ✅ Package init
│   │   └── routes/
│   │       ├── __init__.py        # ✅ Package init
│   │       └── document.py        # ✅ Upload endpoint
│   ├── core/
│   │   ├── __init__.py            # ✅ Package init
│   │   ├── parser.py              # ✅ Document parsing
│   │   └── PDF_PARSING_GUIDE.md
│   └── __init__.py                # ✅ Package init
│
├── requirements.txt               # ✅ Python dependencies
├── INTEGRATION_GUIDE.md            # ✅ Comprehensive guide
├── start-dev.sh                    # ✅ Linux/macOS startup script
├── start-dev.bat                   # ✅ Windows startup script
├── .gitignore                      # ✅ Git ignore patterns
└── ...
```

---

## 🔧 Configuration Details

### Backend CORS Settings
Currently allows requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Common dev port)
- `http://localhost:8080` (Another common port)

To add more origins, edit `server/main.py`:
```python
allow_origins=["http://localhost:5173", "http://localhost:3000", "your-url"],
```

### Frontend API Configuration
Edit `frontend/src/config/api.ts` to change API settings:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Update CORS origins in `server/main.py` with production URLs
- [ ] Set `VITE_API_BASE_URL` to production backend URL in `.env.production`
- [ ] Test entire upload flow in staging environment
- [ ] Add any required authentication/authorization

### Frontend Deployment
- [ ] Run `npm run build`
- [ ] Deploy `frontend/dist` to static hosting
- [ ] Verify `VITE_API_BASE_URL` points to production backend

### Backend Deployment
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run with gunicorn or similar WSGI server
- [ ] Set proper environment variables if needed
- [ ] Enable HTTPS/SSL certificates

---

## 🐛 Troubleshooting

### Common Issues

**CORS Error: "No 'Access-Control-Allow-Origin' header"**
- Ensure backend is running and CORS middleware is configured
- Check browser console for exact error
- Add frontend URL to `allow_origins` in `server/main.py`

**Upload fails with "Invalid file type"**
- Only PDF and DOCX supported
- Check file extension and MIME type
- File size must be < 10MB

**Backend not found (Connection refused)**
- Ensure backend server is running on port 8000
- Check firewall settings
- Verify `VITE_API_BASE_URL` is correct

**Module not found (server.main not found)**
- Run uvicorn from project root, not from server directory
- Ensure virtual environment is activated
- Check Python path

---

## 📚 Additional Resources

### Documentation Files
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed setup instructions
- [server/core/PDF_PARSING_GUIDE.md](./server/core/PDF_PARSING_GUIDE.md) - PDF parsing details
- [PROJECT_SPECS.md](./PROJECT_SPECS.md) - Project specifications

### API Endpoints Reference
- `GET /` - Health check
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc UI
- `POST /api/v1/upload` - Document upload and processing

---

## ✨ Next Steps

### Planned Features
- [ ] Authentication & Authorization
- [ ] AI-powered document evaluation
- [ ] Results storage and history
- [ ] User dashboard
- [ ] Student/Teacher/Admin roles

### Improvements
- [ ] Add unit tests for backend
- [ ] Add integration tests for API
- [ ] Add e2e tests for frontend
- [ ] Implement file encryption for security
- [ ] Add rate limiting for API

---

**Last Updated:** January 6, 2026
**Status:** ✅ Frontend-Backend integration completed and tested
