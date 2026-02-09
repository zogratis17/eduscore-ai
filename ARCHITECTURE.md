# Document Evaluation Engine - Architecture & Design

## System Architecture

### Overview
The Document Evaluation Engine follows a **client-server architecture** with:
- **Backend**: FastAPI (Python) - RESTful API
- **Frontend**: HTML/CSS/JavaScript - Simple SPA
- **Database**: MongoDB with GridFS
- **Storage**: GridFS for document storage

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────────────────────────────┐
│         FastAPI Server              │
│  ┌─────────────────────────────┐   │
│  │      API Routes             │   │
│  │  - Upload                   │   │
│  │  - Evaluate                 │   │
│  │  - Export                   │   │
│  └──────────┬──────────────────┘   │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │   Business Logic (Services) │   │
│  │  - Parser                   │   │
│  │  - Grammar                  │   │
│  │  - Vocabulary               │   │
│  │  - Topic Relevance          │   │
│  │  - Coherence                │   │
│  │  - Plagiarism               │   │
│  │  - Evaluation               │   │
│  │  - Export                   │   │
│  └──────────┬──────────────────┘   │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │   Data Layer                │   │
│  │  - MongoDB (documents)      │   │
│  │  - GridFS (files)           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Directory Structure

```
core-evaluation-engine/
│
├── app/                          # Backend application
│   ├── main.py                   # FastAPI app & routes setup
│   ├── config.py                 # Configuration management
│   ├── database.py               # MongoDB connection
│   │
│   ├── models/                   # Data models
│   │   └── schemas.py            # Pydantic models for API
│   │
│   ├── services/                 # Business logic layer
│   │   ├── storage_service.py    # File storage (GridFS/MinIO)
│   │   ├── parser_service.py     # Document parsing (PDF/DOCX)
│   │   ├── grammar_service.py    # Grammar analysis (LanguageTool)
│   │   ├── vocabulary_service.py # Vocabulary assessment
│   │   ├── topic_service.py      # Topic relevance (transformers)
│   │   ├── coherence_service.py  # Structure analysis
│   │   ├── plagiarism_service.py # Plagiarism detection (MinHash)
│   │   ├── evaluation_service.py # Main evaluation orchestrator
│   │   ├── document_service.py   # Document CRUD operations
│   │   └── export_service.py     # PDF report generation
│   │
│   ├── api/                      # API endpoints
│   │   ├── upload.py             # POST /api/upload
│   │   ├── documents.py          # GET /api/document/{id}
│   │   ├── evaluation.py         # POST /api/evaluate/{id}
│   │   └── export.py             # GET /api/export/{id}
│   │
│   └── utils/                    # Utility functions
│
├── frontend/                     # Simple web interface
│   ├── index.html                # Main UI
│   ├── style.css                 # Styling
│   └── script.js                 # Client-side logic
│
├── requirements.txt              # Python dependencies
├── .env                          # Environment configuration
├── setup.ps1                     # Setup script
├── start.ps1                     # Start script
└── test_system.py                # System tests
```

## Component Design

### 1. API Layer (app/api/)

**Responsibilities:**
- Handle HTTP requests/responses
- Input validation
- Error handling
- Route orchestration

**Endpoints:**
- `POST /api/upload` - Upload document
- `GET /api/document/{id}` - Get document info
- `POST /api/evaluate/{id}` - Run evaluation
- `GET /api/results/{id}` - Get evaluation results
- `GET /api/export/{id}` - Download PDF report

### 2. Service Layer (app/services/)

#### Storage Service
- **Purpose**: Manage file storage
- **Technology**: GridFS (MongoDB), MinIO (optional)
- **Operations**: Upload, download, delete files

#### Parser Service
- **Purpose**: Extract text from documents
- **Technology**: PyMuPDF (PDF), python-docx (DOCX)
- **Output**: Cleaned text, word count, page count

#### Grammar Service
- **Purpose**: Analyze grammar and readability
- **Technology**: LanguageTool, TextStat
- **Metrics**:
  - Error count by category
  - Readability score (Flesch)
  - Grammar score (0-100)

#### Vocabulary Service
- **Purpose**: Assess vocabulary quality
- **Technology**: NLTK, regex
- **Metrics**:
  - Lexical diversity (TTR)
  - Average word length
  - Vocabulary richness score

#### Topic Relevance Service
- **Purpose**: Measure topic alignment
- **Technology**: Sentence Transformers (all-MiniLM-L6-v2)
- **Method**: Cosine similarity of embeddings
- **Output**: Similarity score (0-1)

#### Coherence Service
- **Purpose**: Analyze text structure
- **Technology**: NLTK, statistical analysis
- **Metrics**:
  - Paragraph count
  - Sentences per paragraph
  - Sentence length variance
  - Transition word usage

#### Plagiarism Service
- **Purpose**: Detect copied content
- **Technology**: MinHash LSH (datasketch)
- **Method**:
  - 3-word shingles
  - 128-bit MinHash signatures
  - Jaccard similarity
- **Output**: Similarity %, matched segments

#### Evaluation Service
- **Purpose**: Orchestrate all analyses
- **Workflow**:
  1. Run all component analyses
  2. Calculate weighted score
  3. Assign letter grade
  4. Generate feedback
- **Weights**:
  - Grammar: 20%
  - Vocabulary: 15%
  - Topic Relevance: 25%
  - Coherence: 20%
  - Plagiarism: 20%

#### Export Service
- **Purpose**: Generate PDF reports
- **Technology**: ReportLab
- **Content**: All scores, errors, feedback

### 3. Data Layer (app/database.py)

**MongoDB Collections:**

```javascript
// documents collection
{
  _id: ObjectId,
  filename: String,
  file_type: String,
  file_size: Number,
  file_id: String,  // GridFS file ID
  status: String,   // uploaded, parsing, parsed, evaluating, completed, failed
  uploaded_at: Date,
  word_count: Number,
  page_count: Number,
  extracted_text: String,
  evaluation_results: {
    overall_score: Number,
    letter_grade: String,
    grammar: Object,
    vocabulary: Object,
    topic_relevance: Object,
    coherence: Object,
    plagiarism: Object,
    feedback: String,
    evaluated_at: Date
  }
}
```

**GridFS:**
- Stores actual file binaries
- Metadata includes content type, upload date

## Data Flow

### Upload & Parse Flow
```
1. User uploads file
   ↓
2. API validates (type, size)
   ↓
3. Store in GridFS → get file_id
   ↓
4. Create document record in MongoDB
   ↓
5. Parse file (PDF/DOCX)
   ↓
6. Extract & clean text
   ↓
7. Update document with text & metrics
   ↓
8. Return document info to client
```

### Evaluation Flow
```
1. User requests evaluation
   ↓
2. Fetch document from MongoDB
   ↓
3. Run parallel analyses:
   - Grammar Analysis
   - Vocabulary Analysis
   - Topic Relevance
   - Coherence Analysis
   - Plagiarism Detection
   ↓
4. Calculate weighted overall score
   ↓
5. Assign letter grade (A-F)
   ↓
6. Generate AI feedback
   ↓
7. Save results to MongoDB
   ↓
8. Return results to client
```

### Export Flow
```
1. User requests PDF
   ↓
2. Fetch document & results
   ↓
3. Generate PDF with ReportLab:
   - Document info
   - Overall scores
   - Component breakdowns
   - Error lists
   - Feedback
   ↓
4. Stream PDF to client
```

## Scoring Algorithm

### Overall Score Calculation
```python
overall_score = (
    grammar_score * 0.20 +
    vocabulary_score * 0.15 +
    topic_score * 0.25 +
    coherence_score * 0.20 +
    plagiarism_score * 0.20
)
```

### Component Scores

**Grammar (0-100):**
```python
error_rate = errors / words * 100
grammar_score = max(0, 100 - error_rate * 10)
final = grammar_score * 0.7 + readability * 0.3
```

**Vocabulary (0-100):**
```python
diversity_score = min(100, (lexical_diversity / 0.5) * 100)
length_score = max(0, 100 - abs(avg_length - 5) * 15)
final = diversity_score * 0.6 + length_score * 0.4
```

**Topic Relevance (0-100):**
```python
score = cosine_similarity * 100
```

**Coherence (0-100):**
```python
para_score = score_range(sentences_per_para, 3, 5)
variance_score = score_range(variance, 15, 50)
transition_score = min(100, transitions / expected * 100)
final = para * 0.3 + variance * 0.3 + transitions * 0.4
```

**Plagiarism (0-100):**
```python
score = 100 - (similarity_percentage)
# Higher is better (less plagiarism)
```

### Letter Grades
- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: 0-59

## Technology Stack

### Backend
- **FastAPI** 0.109.0 - Web framework
- **Uvicorn** 0.27.0 - ASGI server
- **Motor** 3.3.2 - Async MongoDB driver
- **Pydantic** 2.5.3 - Data validation

### Document Processing
- **PyMuPDF** 1.23.8 - PDF parsing
- **python-docx** 1.1.0 - DOCX parsing

### Text Analysis
- **language-tool-python** 2.8.1 - Grammar checking
- **textstat** 0.7.3 - Readability metrics
- **sentence-transformers** 2.3.1 - Embeddings
- **datasketch** 1.6.4 - MinHash LSH
- **nltk** 3.8.1 - NLP utilities

### Export & Storage
- **reportlab** 4.0.9 - PDF generation
- **minio** 7.2.3 - Object storage (optional)

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3 with Flexbox/Grid
- Fetch API for HTTP requests

## Performance Considerations

### Optimization Strategies

1. **Async Operations**
   - All I/O operations are async
   - MongoDB queries use Motor (async driver)
   - Concurrent analysis when possible

2. **Caching**
   - Sentence transformer models cached after first load
   - NLTK data downloaded once
   - GridFS file metadata cached

3. **Lazy Loading**
   - AI models loaded on first use
   - Large dependencies imported when needed

4. **Resource Limits**
   - Max file size: 10MB
   - Max documents in plagiarism check: 100
   - Max errors displayed: 50

### Bottlenecks

1. **First Evaluation**
   - Loading sentence transformer model: ~30s
   - LanguageTool initialization: ~10s
   - Solution: Keep service running

2. **Large Documents**
   - >5000 words may be slow
   - Solution: Progress indicators, async processing

3. **Plagiarism Detection**
   - Scales with corpus size
   - Solution: Limit comparisons, use LSH indexing

## Security Considerations

1. **Input Validation**
   - File type validation
   - Size limits enforced
   - Malicious content scanning (basic)

2. **Data Privacy**
   - No external API calls (all local)
   - GridFS for secure storage
   - Optional encryption at rest

3. **API Security**
   - CORS configured
   - Rate limiting (can add)
   - Authentication (can add)

## Extensibility

### Adding New Evaluation Criteria

1. Create service in `app/services/`:
```python
class NewCriteriaService:
    def analyze(self, text: str) -> Analysis:
        # Your analysis logic
        return Analysis(score=score)
```

2. Add to evaluation service:
```python
new_analysis = new_criteria_service.analyze(text)
overall_score += new_analysis.score * weight
```

3. Update models/schemas.py
4. Update frontend display

### Adding New Document Types

1. Add parser method in `parser_service.py`
2. Update `allowed_extensions` in config
3. Add MIME type validation

## Testing Strategy

1. **Unit Tests**: Test individual services
2. **Integration Tests**: Test API endpoints
3. **System Tests**: End-to-end workflows
4. **Performance Tests**: Load testing

## Deployment

### Development
```bash
uvicorn app.main:app --reload
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Future)
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Monitoring & Logging

- FastAPI automatic logs
- MongoDB slow query logging
- Custom logging can be added
- Health check endpoint: `/health`

## Future Enhancements

1. **AI Text Detection** (GPT-2 perplexity)
2. **Citation Quality** checking
3. **OCR** for scanned documents
4. **Batch Processing** multiple documents
5. **User Authentication** & authorization
6. **Advanced Analytics** dashboard
7. **Real-time Collaboration**
8. **Mobile App**
9. **API Rate Limiting**
10. **Webhook Notifications**

## License

MIT License - Open source and free to use!
