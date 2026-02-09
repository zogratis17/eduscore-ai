# Document Evaluation Engine

A comprehensive document evaluation system that analyzes uploaded documents (PDF/DOCX) for grammar, vocabulary, coherence, topic relevance, and plagiarism.

## Features

- 📄 Single file upload (PDF/DOCX) with drag & drop
- 📝 Document parsing and text extraction
- ✅ Grammar and language analysis
- 📊 Vocabulary quality assessment
- 🎯 Topic relevance scoring
- 🔗 Coherence and structure analysis
- 🔍 Plagiarism detection
- 📈 Comprehensive results with PDF export

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: MongoDB with GridFS
- **Text Analysis**: LanguageTool, TextStat, Sentence Transformers
- **Frontend**: HTML/CSS/JavaScript (Simple UI)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on localhost:27017
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

5. Access the application:
- Frontend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
core-evaluation-engine/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── models/                 # Pydantic models & MongoDB schemas
│   ├── services/               # Business logic
│   ├── api/                    # API routes
│   └── utils/                  # Utility functions
├── frontend/                   # Simple HTML/CSS/JS interface
├── requirements.txt
└── README.md
```

## API Endpoints

- `POST /api/upload` - Upload document
- `GET /api/document/{id}` - Get document details
- `POST /api/evaluate/{id}` - Evaluate document
- `GET /api/results/{id}` - Get evaluation results
- `GET /api/export/{id}` - Export results as PDF

## License

MIT
