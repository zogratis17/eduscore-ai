# 🎯 Quick Reference - Document Evaluation Engine

## 🚀 Instant Start Commands

```powershell
# 1. First time setup
.\setup.ps1

# 2. Start MongoDB (in separate terminal)
mongod

# 3. Start application
.\start.ps1

# 4. Open browser
http://localhost:8000
```

## 📡 API Quick Reference

### Upload Document
```bash
curl -X POST http://localhost:8000/api/upload -F "file=@document.pdf"
```

### Evaluate
```bash
curl -X POST http://localhost:8000/api/evaluate/{id} \
  -H "Content-Type: application/json" \
  -d '{"prompt_text": "Your prompt here"}'
```

### Get Results
```bash
curl http://localhost:8000/api/results/{id}
```

### Export PDF
```bash
curl http://localhost:8000/api/export/{id} -o report.pdf
```

## 📊 Scoring Weights

| Component | Weight | Key Metrics |
|-----------|--------|-------------|
| Grammar & Language | 20% | Errors, Readability |
| Vocabulary Quality | 15% | Lexical Diversity, Word Length |
| Topic Relevance | 25% | Cosine Similarity |
| Coherence & Structure | 20% | Paragraphs, Transitions |
| Plagiarism Detection | 20% | MinHash Similarity |

## 🎨 UI Flow

```
Upload Page
    ↓
[Drag & Drop File]
    ↓
[Upload Progress]
    ↓
Evaluation Page
    ↓
[Optional: Add Prompt]
    ↓
[Click "Run Evaluation"]
    ↓
[Analysis Running...]
    ↓
Results Page
    ↓
[View Scores & Feedback]
    ↓
[Download PDF Report]
```

## 🔧 Configuration Shortcuts

### Quick Config (.env)

```env
# Essentials
MONGODB_URL=mongodb://localhost:27017
MAX_UPLOAD_SIZE_MB=10
ALLOWED_EXTENSIONS=pdf,docx

# Adjust weights (must sum to 1.0)
GRAMMAR_WEIGHT=0.20
VOCABULARY_WEIGHT=0.15
TOPIC_RELEVANCE_WEIGHT=0.25
COHERENCE_WEIGHT=0.20
PLAGIARISM_WEIGHT=0.20
```

## 🐛 Troubleshooting Quick Fixes

### MongoDB not connecting?
```powershell
mongod --dbpath C:\data\db
```

### Port 8000 already in use?
```powershell
uvicorn app.main:app --reload --port 8001
```

### Missing dependencies?
```powershell
pip install -r requirements.txt
```

### Python environment issues?
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## 📈 Performance Tips

1. **First evaluation is slow** (~60s)
   - AI models loading
   - Subsequent evaluations are faster

2. **Keep server running**
   - Models stay in memory
   - Much faster response times

3. **Optimal document size**
   - 500-5000 words
   - Larger docs take longer

## 🎯 Success Checklist

- [ ] MongoDB running
- [ ] Dependencies installed
- [ ] Server started
- [ ] Browser at localhost:8000
- [ ] Test file uploaded
- [ ] Evaluation completed
- [ ] PDF exported

## 🔑 Key Files

```
app/main.py          → FastAPI app entry
app/config.py        → Configuration
app/services/        → All evaluation logic
frontend/index.html  → UI
.env                 → Settings
```

## 📚 Documentation Links

- **Quick Start**: QUICKSTART.md
- **Architecture**: ARCHITECTURE.md
- **Full Summary**: PROJECT_SUMMARY.md
- **API Docs**: http://localhost:8000/docs

## 💻 Example Python Client

```python
import requests

# Upload
files = {'file': open('essay.pdf', 'rb')}
r = requests.post('http://localhost:8000/api/upload', files=files)
doc_id = r.json()['id']

# Evaluate
data = {'prompt_text': 'Write about climate change'}
r = requests.post(f'http://localhost:8000/api/evaluate/{doc_id}', json=data)
results = r.json()

print(f"Score: {results['overall_score']}")
print(f"Grade: {results['letter_grade']}")

# Export
r = requests.get(f'http://localhost:8000/api/export/{doc_id}')
open('report.pdf', 'wb').write(r.content)
```

## ⚡ Common Tasks

### Change evaluation weights:
Edit `.env` → Restart server

### Add new document type:
Edit `parser_service.py` → Update `allowed_extensions`

### Customize UI:
Edit `frontend/style.css` and `frontend/index.html`

### View logs:
Check terminal where server is running

### Check system health:
```bash
curl http://localhost:8000/health
```

## 🎉 Status: READY TO USE!

All systems operational. Start evaluating documents!

```
✅ Backend: Running
✅ Database: Connected
✅ Models: Loaded
✅ Frontend: Accessible
✅ Tests: Passing
```

---
**For detailed documentation, see README.md and ARCHITECTURE.md**
