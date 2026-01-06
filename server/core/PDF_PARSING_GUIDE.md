# PDF Text Extraction Implementation Guide

This document outlines how to implement a robust PDF text extraction service for the **EduScore AI** backend.

## 1. Choice of Library: PyMuPDF (fitz)
We use `PyMuPDF` (imported as `fitz`) because:
- **Speed:** It is significantly faster than libraries like `pdfminer` or `PyPDF2`.
- **Formatting:** It maintains better text order and handles multi-column layouts effectively.
- **Metadata:** Easy access to document properties (page count, author, encryption status).

## 2. Prerequisites
Ensure the library is in your environment:
```bash
pip install pymupdf
```

## 3. Implementation Steps

### Step A: Import and Setup
You should import `fitz` and define a class or function that accepts file bytes.
```python
import fitz
```

### Step B: Opening the Document
When receiving a file via an API (like FastAPI), you will often have the file as `bytes`. You can open this directly without saving to disk:
```python
doc = fitz.open(stream=file_bytes, filetype="pdf")
```

### Step C: Iterating and Extracting
1. Create an empty list or string buffer.
2. Loop through the `doc` object (it is an iterator of pages).
3. Call `.get_text()` on each page.
4. Append the text to your buffer.

### Step D: Metadata & Cleaning
- **Metadata:** Use `doc.page_count` for the total pages and `doc.metadata` for info like title or author.
- **Cleaning:** Use `.strip()` on the final string to remove leading/trailing whitespace.
- **Safety:** Always check `doc.is_encrypted` before processing.

## 4. Expected Logic Flow
1. Receive bytes.
2. Initialize `fitz` document.
3. Check for encryption/corruption.
4. Loop pages -> Extract text.
5. Aggregate and return a structured response (Status, Text, Metadata).

## 5. Basic Code Skeleton (For Reference)
```python
def extract_text(file_bytes):
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error: {e}")
```
