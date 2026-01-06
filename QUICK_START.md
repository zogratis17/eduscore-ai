# Quick Start Guide - EduScore AI

## 🚀 Get Started in 5 Minutes

### Option 1: Windows Users
```bash
# Simply run the startup script
start-dev.bat
```

This will automatically:
- Create Python virtual environment
- Install all dependencies
- Start backend server on port 8000
- Start frontend server on port 5173

### Option 2: Linux/macOS Users
```bash
# Make script executable
chmod +x start-dev.sh

# Run the startup script
./start-dev.sh
```

### Option 3: Manual Setup

#### Step 1: Start Backend
```bash
# Activate Python virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux: source venv/bin/activate
                          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (runs on http://localhost:8000)
uvicorn server.main:app --reload --port 8000
```

#### Step 2: Start Frontend (in new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:8000 | API server |
| Swagger UI | http://localhost:8000/docs | API documentation |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |

---

## 📤 Test Document Upload

1. Open http://localhost:5173 in your browser
2. Navigate to the **Upload** page
3. Drag & drop or select a PDF or DOCX file
4. Select a subject
5. Click **Submit Assignment**
6. Check the extracted text and metadata

---

## 📁 What Was Integrated

✅ **Backend (FastAPI)**
- Document upload endpoint
- PDF & DOCX text extraction
- Standardized error handling
- CORS support for frontend

✅ **Frontend (React)**
- API service layer for backend calls
- Environment configuration
- Upload component with real API integration
- Error handling and user feedback

✅ **DevOps**
- Startup scripts for easy development
- Complete documentation
- Integration guides
- Troubleshooting help

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change backend port
uvicorn server.main:app --reload --port 8001

# Change frontend port in vite.config.ts or run with:
npm run dev -- --port 3000
```

### Module Not Found Error
```bash
# Make sure you're in the right directory
# For backend: run from project root, not from server/
# For frontend: run from frontend/ directory
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
pip install -r requirements.txt --force-reinstall
npm install --force
```

---

## 📖 For More Information

- **Setup Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Integration Details:** [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
- **Project Specs:** [PROJECT_SPECS.md](./PROJECT_SPECS.md)

---

## 🎯 Next Steps After Running

1. Test the upload feature with sample files
2. Check backend logs for processing details
3. Review API documentation at /docs
4. Start building additional features!

---

Happy coding! 🎉
