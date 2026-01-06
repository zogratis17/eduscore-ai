# 🚀 Getting Started - AI Evaluation Platform

## Prerequisites

### Required Software
- **Docker** (20.10+) & **Docker Compose** (2.0+)
- **Node.js** (18+ LTS) & **npm** (9+)
- **Python** (3.11+)
- **Git**

### Accounts Needed
- **Firebase Project** (free tier)
- **MongoDB Atlas** (optional, for production - 512MB free)
- **GitHub** account (for CI/CD)

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: `ai-evaluation-platform`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable Google sign-in

### 1.3 Get Web App Credentials
1. Go to **Project Settings** > **General**
2. Scroll to "Your apps"
3. Click Web icon (</>) to add web app
4. Register app with nickname: `ai-eval-web`
5. Copy the config object - you'll need these values:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### 1.4 Generate Service Account Key
1. Go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file securely
4. You'll use values from this file in backend `.env`

---

## Step 2: Clone Repository

```bash
# Clone the repo
git clone https://github.com/your-org/ai-evaluation-platform.git
cd ai-evaluation-platform

# Project structure
ai-evaluation-platform/
├── frontend/
├── backend/
├── docker/
├── docker-compose.yml
└── .env.example
```

---

## Step 3: Environment Configuration

### 3.1 Root Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env and fill in:
nano .env
```

Update these values:
```bash
# Strong passwords
MONGO_ROOT_PASSWORD=your_secure_mongo_password
REDIS_PASSWORD=your_secure_redis_password
MINIO_ROOT_PASSWORD=your_secure_minio_password

# Firebase (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 3.2 Backend Configuration
```bash
cd backend
cp .env.example .env
nano .env
```

Fill in Firebase and database credentials (same as root `.env`)

### 3.3 Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
nano .env
```

Fill in Firebase web app config:
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Step 4: Install AI Models

### 4.1 Create Models Directory
```bash
cd ..
mkdir -p ai-models/embeddings
mkdir -p ai-models/faiss-indices
mkdir -p ai-models/spacy-models
```

### 4.2 Download Required Models
```bash
# Install Python dependencies first
cd backend
pip install -r requirements.txt

# Download embedding model
python scripts/download_models.py
```

Create `backend/scripts/download_models.py`:
```python
from sentence_transformers import SentenceTransformer
import spacy

# Download embedding model
print("Downloading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
model.save('../ai-models/embeddings/all-MiniLM-L6-v2')

# Download spaCy model
print("Downloading spaCy model...")
spacy.cli.download("en_core_web_sm")

print("Models downloaded successfully!")
```

Run it:
```bash
python scripts/download_models.py
```

---

## Step 5: Start Development Environment

### 5.1 Using Docker Compose (Recommended)
```bash
# Return to root directory
cd ..

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

Services running:
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **MinIO**: `localhost:9000` (console: `localhost:9001`)
- **LanguageTool**: `localhost:8010`
- **Backend API**: `localhost:8000`
- **Frontend**: `localhost:5173`
- **Flower (Celery Monitor)**: `localhost:5555`

### 5.2 Manual Setup (Alternative)

#### Start Infrastructure
```bash
# Start MongoDB
docker run -d --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  mongo:7.0

# Start Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Start MinIO
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=your_password \
  minio/minio server /data --console-address ":9001"

# Start LanguageTool
docker run -d --name languagetool \
  -p 8010:8010 \
  erikvl87/languagetool
```

#### Start Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (if any)
# alembic upgrade head

# Start FastAPI
uvicorn app.main:app --reload --port 8000

# In another terminal: Start Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# In another terminal: Start Celery beat
celery -A app.workers.celery_app beat --loglevel=info
```

#### Start Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Step 6: Initialize Database

### 6.1 Create MongoDB Indexes
```bash
# Connect to MongoDB
docker exec -it ai-eval-mongodb mongosh -u admin -p your_password

# Switch to database
use ai_evaluation

# Create indexes
db.users.createIndex({ "firebase_uid": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.documents.createIndex({ "uploaded_by": 1, "created_at": -1 })
db.documents.createIndex({ "status": 1 })
db.evaluations.createIndex({ "document_id": 1 }, { unique: true })
db.batch_jobs.createIndex({ "created_by": 1, "created_at": -1 })

exit
```

### 6.2 Create MinIO Bucket
```bash
# Access MinIO console at http://localhost:9001
# Login with: minioadmin / your_password
# Create bucket named "documents"
# Or use CLI:

docker exec -it ai-eval-minio mc alias set myminio http://localhost:9000 minioadmin your_password
docker exec -it ai-eval-minio mc mb myminio/documents
docker exec -it ai-eval-minio mc anonymous set download myminio/documents
```

---

## Step 7: Create First User

### 7.1 Via Firebase Console
1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Email: `admin@college.edu`
4. Password: (set a password)
5. Click "Add user"

### 7.2 First Login
1. Open browser: `http://localhost:5173`
2. Login with email/password
3. Backend will auto-create user record in MongoDB
4. You're ready to go!

---

## Step 8: Test the Platform

### 8.1 Upload Test Document
1. Go to Dashboard
2. Click "Upload Document"
3. Select a PDF/DOCX file
4. Fill in student details
5. Click "Upload"

### 8.2 Run Evaluation
1. Wait for document to be processed
2. Click "Evaluate"
3. Select a rubric (or use default)
4. Wait for evaluation to complete (~30 seconds)
5. View results

---

## Verification Checklist

- [ ] All Docker containers running (`docker-compose ps`)
- [ ] Backend API accessible (`http://localhost:8000/docs`)
- [ ] Frontend accessible (`http://localhost:5173`)
- [ ] MongoDB connected (check logs)
- [ ] Redis connected (check logs)
- [ ] MinIO accessible (`http://localhost:9001`)
- [ ] LanguageTool working (`http://localhost:8010/v2/languages`)
- [ ] Celery workers running (check Flower: `http://localhost:5555`)
- [ ] Firebase auth working (can login)
- [ ] Can upload documents
- [ ] Can run evaluation

---

## Common Issues & Solutions

### Issue: Docker containers won't start
```bash
# Check Docker daemon
docker info

# Check disk space
df -h

# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Backend can't connect to MongoDB
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string in .env
MONGODB_URL=mongodb://admin:password@mongodb:27017

# Test connection
docker exec -it ai-eval-backend python -c "from motor.motor_asyncio import AsyncIOMotorClient; client = AsyncIOMotorClient('mongodb://admin:password@mongodb:27017'); print(client.list_database_names())"
```

### Issue: Frontend can't connect to backend
```bash
# Check CORS settings in backend .env
CORS_ORIGINS=http://localhost:5173

# Check frontend .env
VITE_API_URL=http://localhost:8000

# Check browser console for errors
```

### Issue: Celery tasks not running
```bash
# Check Celery worker logs
docker-compose logs celery-worker

# Check Redis connection
docker exec -it ai-eval-redis redis-cli ping

# Restart worker
docker-compose restart celery-worker
```

### Issue: Models not found
```bash
# Check models directory
ls -la ai-models/embeddings/

# Re-download models
cd backend
python scripts/download_models.py
```

---

## Next Steps

1. **Configure Rubrics**: Create evaluation rubrics for different assignment types
2. **Add Users**: Create accounts for other educators via Firebase Console
3. **Test Batch Upload**: Upload multiple documents at once
4. **Explore Analytics**: Check the analytics dashboard
5. **Customize Settings**: Adjust evaluation parameters in settings

---

## Development Workflow

### Making Changes

#### Backend
```bash
# Changes auto-reload with uvicorn --reload
# Add new dependencies:
pip install package_name
pip freeze > requirements.txt
```

#### Frontend
```bash
# Vite hot-reloads automatically
# Add new dependencies:
npm install package_name
```

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

### Database Migrations
```bash
# If you modify models significantly, create migration script
# MongoDB is schema-less, but document structure changes manually
```

---

## Production Deployment

See `docs/DEPLOYMENT.md` for production deployment guide covering:
- Cloud hosting (AWS, GCP, Azure, Oracle Cloud)
- SSL/TLS setup
- Environment security
- Performance optimization
- Monitoring setup
- Backup strategies

---

## Support & Resources

- **Documentation**: `docs/` directory
- **API Reference**: `http://localhost:8000/docs`

---

## License

MIT License - See LICENSE file for details