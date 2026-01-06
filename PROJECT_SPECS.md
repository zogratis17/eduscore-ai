# EduScore AI - Project Specifications (V1: Lean & Free)

## 1. Project Overview
**EduScore AI** is an automated academic document evaluation platform designed to reduce educator workload by utilizing free, cutting-edge AI tools.

**Version 1 (MVP)** focuses on a "Lean & Free" architecture:
*   **Zero Cost:** Utilizes free tiers of cloud APIs and open-source local libraries.
*   **Target Audience:** Educators (Private use).
*   **Input:** Digital-native PDF and DOCX files (No OCR for V1).
*   **Output:** Instant, rubric-based feedback and grading reports.

---

## 2. Strategic Scope (V1)

| Feature | Scope | Implementation Strategy |
| :--- | :--- | :--- |
| **Input Format** | Digital PDF/DOCX | `PyMuPDF` (PDF) and `python-docx` (Word). **No OCR** in V1. |
| **Intelligence** | Cloud LLM | **Gemini 1.5 Flash API** (Free Tier). Replaces heavy local LLMs. |
| **Workflow** | Single File | One-by-one upload for deep analysis. No batch processing yet. |
| **Grammar** | Local NLP | **spaCy** for fast, offline grammar and style checks. |
| **Plagiarism** | Internal Corpus | **FAISS** vector search against a local database of past submissions. |
| **Frontend** | Low-Code | **Streamlit** for rapid UI development (replacing React for MVP). |
| **Database** | Embedded | **SQLite** for zero-setup metadata storage. |

---

## 3. Technology Stack

*   **Language:** Python 3.10+
*   **Frontend:** Streamlit
*   **Backend API:** FastAPI
*   **AI/LLM:** Google Gemini 1.5 Flash (via `google-generativeai`)
*   **NLP & Vector Search:**
    *   `spaCy` (Grammar/Syntax)
    *   `FAISS` (Similarity/Plagiarism)
    *   `Sentence-Transformers` (Embeddings)
*   **Data Handling:** `Pandas`, `SQLite`

---

## 4. System Architecture

```mermaid
graph TD
    User[Educator] -->|Uploads PDF/DOCX| UI[Streamlit Frontend]
    UI -->|Sends File| API[FastAPI Backend]
    
    subgraph "Processing Engine"
        API -->|Extract Text| Parser[Text Parser (PyMuPDF/Docx)]
        Parser -->|Clean Text| Logic
        
        Logic -->|Get Embeddings| FAISS[FAISS Vector DB]
        FAISS -->|Check Similarity| PlagiarismReport
        
        Logic -->|Analyze Syntax| SpaCy[spaCy NLP]
        SpaCy -->|Grammar Errors| GrammarReport
        
        Logic -->|Prompt + Rubric| Gemini[Gemini 1.5 Flash API]
        Gemini -->|Grading & Feedback| AIReport
    end
    
    PlagiarismReport --> Aggregator
    GrammarReport --> Aggregator
    AIReport --> Aggregator
    
    Aggregator -->|JSON Result| API
    API -->|Display/Download| UI
```

---

## 5. Detailed Feature Requirements

### 5.1 Document Ingestion
*   **Drag & Drop UI:** Simple upload area in Streamlit.
*   **Validation:** Reject files > 10MB or non-PDF/DOCX formats.
*   **Parsing:** Extract raw text efficiently. If text extraction fails (scanned image), return an error (OCR is out of scope for V1).

### 5.2 AI Evaluation (Gemini 1.5 Flash)
*   **Rubric Input:** Educator defines criteria (e.g., "Clarity: 10pts", "Research: 20pts").
*   **Prompting:** Construct a structural prompt sending the *Rubric* and *Student Text* to Gemini.
*   **Output:** JSON structured response containing scores, specific feedback, and improved examples.

### 5.3 Local Analysis (spaCy & FAISS)
*   **Grammar:** Detect sentence fragmentation, passive voice overuse, and basic errors using `spaCy`.
*   **Plagiarism:**
    *   On startup, load `index.faiss` (if exists).
    *   Convert new submission to vector.
    *   Search for nearest neighbors in the index.
    *   Report similarity % if > threshold.

### 5.4 Reporting
*   **Dashboard:** View scores and key insights immediately.
*   **Export:** Generate a PDF report containing:
    *   Student Name & Date
    *   Final Grade
    *   Rubric Breakdown
    *   AI Feedback
    *   Grammar Highlights

---

## 6. Development Plan (4 Weeks)

### Week 1: Core Setup & Parsing
*   [ ] Set up Python environment & Git.
*   [ ] Implement `TextParser` service (PDF/DOCX).
*   [ ] Create basic Streamlit UI (Upload button + Text display).
*   [ ] Create FastAPI skeleton.

### Week 2: AI Integration
*   [ ] Integrate Google Gemini API.
*   [ ] Design prompt templates for Rubric grading.
*   [ ] Connect Streamlit to FastAPI for AI analysis.
*   [ ] Display raw AI feedback in UI.

### Week 3: Local Intelligence
*   [ ] Implement `spaCy` pipeline for grammar metrics.
*   [ ] Set up `FAISS` and SQLite for storing/checking past embeddings.
*   [ ] Implement "Internal Plagiarism" check.

### Week 4: Polish & Reporting
*   [ ] Generate downloadable PDF reports.
*   [ ] Improve UI styling.
*   [ ] Error handling and edge cases.
*   [ ] Final testing and documentation.

---

## 7. Folder Structure
```text
eduscore-ai/
├── data/                   # Storage for local DB and FAISS index
├── client/                 # Streamlit Frontend
│   ├── main.py
│   └── components/
├── server/                 # FastAPI Backend
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   └── core/               # Business Logic
│       ├── parser.py       # PDF/DOCX extraction
│       ├── ai_client.py    # Gemini integration
│       ├── analyzer.py     # SpaCy/FAISS logic
│       └── config.py
├── tests/
├── .env
├── requirements.txt
└── PROJECT_SPECS.md
```

---

## 8. Build & Run Instructions

**Prerequisites:**
*   Python 3.10+
*   Google Gemini API Key

**Setup:**
1.  **Clone & Install:**
    ```bash
    git clone <repo>
    cd eduscore-ai
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate on Windows
    pip install -r requirements.txt
    ```

2.  **Environment:**
    Create a `.env` file:
    ```ini
    GEMINI_API_KEY=your_key_here
    ```

3.  **Run:**
    *   Start Backend: `uvicorn server.main:app --reload`
    *   Start Frontend: `streamlit run client/main.py`
