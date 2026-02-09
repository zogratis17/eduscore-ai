# Quick Start Guide

## Prerequisites

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **MongoDB** - [Download MongoDB Community](https://www.mongodb.com/try/download/community)
   - Install and start MongoDB on default port (27017)
   - Or use: `mongod --dbpath <your-data-path>`

## Installation

### Step 1: Clone/Download the Project
```bash
cd h:\The Programmer\Working\core-evaluation-engine
```

### Step 2: Run Setup Script
```powershell
.\setup.ps1
```

This will:
- Verify Python installation
- Check MongoDB connection
- Install all dependencies
- Download required NLTK data
- Create .env configuration file

### Step 3: Start the Application
```powershell
.\start.ps1
```

Or manually:
```powershell
uvicorn app.main:app --reload
```

### Step 4: Access the Application
- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Usage

### 1. Upload Document
- Navigate to http://localhost:8000
- Drag & drop or click to select a PDF/DOCX file
- Wait for parsing to complete

### 2. Run Evaluation
- Optionally add assignment prompt for topic relevance
- Click "Run Evaluation"
- Wait for analysis (may take 30-60 seconds)

### 3. View Results
- Overall score and letter grade
- Component breakdowns:
  - Grammar & Language (20%)
  - Vocabulary Quality (15%)
  - Topic Relevance (25%)
  - Coherence & Structure (20%)
  - Plagiarism Detection (20%)
- Grammar errors with suggestions
- AI-generated feedback

### 4. Export Report
- Click "Download PDF Report"
- Save comprehensive evaluation report

## API Endpoints

### Upload Document
```http
POST /api/upload
Content-Type: multipart/form-data

file: <binary>
```

### Get Document Info
```http
GET /api/document/{document_id}
```

### Evaluate Document
```http
POST /api/evaluate/{document_id}
Content-Type: application/json

{
  "prompt_text": "optional assignment prompt"
}
```

### Get Results
```http
GET /api/results/{document_id}
```

### Export PDF
```http
GET /api/export/{document_id}
```

## Testing the API

### Using curl

```powershell
# Upload a document
curl -X POST "http://localhost:8000/api/upload" `
  -F "file=@sample.pdf"

# Evaluate (replace {id} with document ID from upload response)
curl -X POST "http://localhost:8000/api/evaluate/{id}" `
  -H "Content-Type: application/json" `
  -d '{"prompt_text": "Write about climate change"}'

# Get results
curl "http://localhost:8000/api/results/{id}"

# Export PDF
curl "http://localhost:8000/api/export/{id}" --output report.pdf
```

### Using Python

```python
import requests

# Upload
with open('sample.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/upload',
        files={'file': f}
    )
    doc_id = response.json()['id']

# Evaluate
response = requests.post(
    f'http://localhost:8000/api/evaluate/{doc_id}',
    json={'prompt_text': 'Write about climate change'}
)
results = response.json()
print(f"Score: {results['overall_score']}")
print(f"Grade: {results['letter_grade']}")

# Export
response = requests.get(f'http://localhost:8000/api/export/{doc_id}')
with open('report.pdf', 'wb') as f:
    f.write(response.content)
```

## Configuration

Edit `.env` file to customize:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=document_evaluation

# Upload Settings
MAX_UPLOAD_SIZE_MB=10
ALLOWED_EXTENSIONS=pdf,docx

# Features
LANGUAGETOOL_ENABLED=true
STORAGE_TYPE=gridfs

# Evaluation Weights (must sum to 1.0)
GRAMMAR_WEIGHT=0.20
VOCABULARY_WEIGHT=0.15
TOPIC_RELEVANCE_WEIGHT=0.25
COHERENCE_WEIGHT=0.20
PLAGIARISM_WEIGHT=0.20
```

## Troubleshooting

### MongoDB Connection Error
```
Error: Cannot connect to MongoDB
```
**Solution**: Ensure MongoDB is running
```powershell
mongod --dbpath C:\data\db
```

### LanguageTool Errors
```
Warning: LanguageTool initialization failed
```
**Solution**: This is non-critical. Grammar checking will be limited but app will still work.

### Import Errors
```
ModuleNotFoundError: No module named 'xyz'
```
**Solution**: Reinstall dependencies
```powershell
pip install -r requirements.txt
```

### Port Already in Use
```
Error: Address already in use
```
**Solution**: Change port or kill existing process
```powershell
# Use different port
uvicorn app.main:app --reload --port 8001

# Or find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

## Project Structure

```
core-evaluation-engine/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── database.py             # MongoDB connection
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── services/
│   │   ├── storage_service.py  # File storage (GridFS)
│   │   ├── parser_service.py   # PDF/DOCX parsing
│   │   ├── grammar_service.py  # Grammar analysis
│   │   ├── vocabulary_service.py
│   │   ├── topic_service.py
│   │   ├── coherence_service.py
│   │   ├── plagiarism_service.py
│   │   ├── evaluation_service.py  # Main evaluator
│   │   ├── document_service.py    # Document management
│   │   └── export_service.py      # PDF export
│   ├── api/
│   │   ├── upload.py           # Upload endpoint
│   │   ├── documents.py        # Document endpoints
│   │   ├── evaluation.py       # Evaluation endpoints
│   │   └── export.py           # Export endpoint
│   └── utils/
├── frontend/
│   ├── index.html              # Main UI
│   ├── style.css               # Styling
│   └── script.js               # Frontend logic
├── requirements.txt            # Python dependencies
├── .env                        # Configuration
├── setup.ps1                   # Setup script
├── start.ps1                   # Start script
└── README.md                   # Documentation
```

## Performance Notes

- **First Evaluation**: May take 60-90 seconds (loading AI models)
- **Subsequent Evaluations**: 20-30 seconds
- **Recommended**: Documents up to 5000 words for best performance
- **Large Documents**: May take longer to process

## Next Steps

1. **Test with Sample Documents**: Try different PDF and DOCX files
2. **Customize Weights**: Adjust evaluation weights in `.env`
3. **Add Corpus**: Upload multiple documents to test plagiarism detection
4. **Extend Features**: Add custom evaluation criteria

## Support

For issues or questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review logs in the terminal
3. Check MongoDB connection and data

## License

MIT License - Feel free to modify and extend!
