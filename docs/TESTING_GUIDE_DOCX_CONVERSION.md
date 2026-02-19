# Quick Testing Guide for DOCX to PDF Conversion

## Prerequisites

### For Docker Testing
✅ No additional setup needed - LibreOffice is included in Docker images

### For Local Development Testing
1. **Install LibreOffice**
   - Windows: Download from https://libreoffice.org and install
   - Linux: `sudo apt-get install libreoffice-writer libreoffice-core default-jre-headless`
   - macOS: `brew install --cask libreoffice`

2. **Verify Installation**
   ```bash
   # Linux/macOS
   libreoffice --version
   
   # Windows (PowerShell)
   & "C:\Program Files\LibreOffice\program\soffice.exe" --version
   ```

## Test Cases

### Test 1: Upload DOCX File (Happy Path)
1. Start the application: `docker compose up --build`
2. Navigate to http://localhost:5173
3. Login (mock auth - any credentials work)
4. Go to "Upload" or "Studio" page
5. Upload a `.docx` file
6. **Expected Result:**
   - File uploads successfully
   - Status shows "pending" → "processing" → "completed"
   - When viewing the document, it shows as a PDF in the viewer
   - Original filename still shows `.docx` extension
   - File type in database is `pdf`

### Test 2: Upload DOC File (Legacy Word)
1. Upload a `.doc` file (old Microsoft Word format)
2. **Expected Result:**
   - Same behavior as DOCX
   - Converted to PDF automatically
   - Viewable in PDF viewer

### Test 3: Upload PDF File (No Conversion)
1. Upload a `.pdf` file
2. **Expected Result:**
   - No conversion happens
   - Stored as-is
   - Viewable in PDF viewer

### Test 4: Upload TXT File (No Conversion)
1. Upload a `.txt` file
2. **Expected Result:**
   - No conversion
   - Shows in text viewer (not PDF viewer)

### Test 5: LibreOffice Not Installed (Error Handling)
**Local Development Only**
1. Temporarily rename/move LibreOffice installation
2. Restart backend
3. Try uploading a DOCX file
4. **Expected Result:**
   - Upload fails with clear error message
   - Error mentions LibreOffice installation requirement
   - No orphaned files in uploads directory

### Test 6: Corrupted DOCX File
1. Create a .txt file and rename it to .docx
2. Try uploading
3. **Expected Result:**
   - Conversion fails gracefully
   - Error message shown
   - File cleaned up (not stored)

### Test 7: Large DOCX File
1. Upload a DOCX file close to 25MB limit
2. **Expected Result:**
   - Conversion may take 5-10 seconds
   - Successfully converts and uploads
   - PDF may be larger or smaller than original

### Test 8: Concurrent Uploads
1. Upload multiple DOCX files simultaneously (3-5 files)
2. **Expected Result:**
   - All conversions succeed
   - No file corruption
   - All documents viewable

## Verification Steps

### Backend Logs
Check logs for conversion messages:
```
INFO: Converting /path/to/file.docx to PDF using LibreOffice...
INFO: Successfully converted to PDF: /path/to/file.pdf
```

### Database Inspection
Check MongoDB document:
```javascript
db.documents.findOne({ filename: "essay.pdf" })

// Should show:
{
  filename: "essay.pdf",
  original_filename: "essay.docx",
  file_type: "pdf",
  content_type: "application/pdf",
  storage_path: "/app/uploads/<uuid>.pdf"
}
```

### File System
Check uploads directory:
```bash
ls -lh backend/uploads/

# Should contain only PDF files (no DOCX files remain)
```

### Frontend Viewer
1. Click "View" on a converted document
2. **Should show:**
   - PDF viewer with original document formatting
   - No download prompt for DOCX
   - Properly rendered text and formatting

## Performance Benchmarks

**Expected Conversion Times:**
- Small DOCX (< 1MB, ~5 pages): 2-3 seconds
- Medium DOCX (1-5MB, ~20 pages): 3-5 seconds
- Large DOCX (5-10MB, ~100 pages): 5-10 seconds

**File Size Changes:**
- Simple text documents: PDF usually smaller
- Image-heavy documents: PDF may be larger
- Complex formatting: Similar sizes

## Troubleshooting

### "Failed to convert DOCX to PDF"
- Check LibreOffice is installed: `libreoffice --version`
- Check LibreOffice is in PATH
- Check server has enough disk space
- Check file is a valid DOCX (not corrupted)

### "LibreOffice is not installed"
- Install LibreOffice (see prerequisites)
- Restart backend/container
- Verify PATH includes LibreOffice

### Conversion Times Out
- File may be too large or complex
- Increase timeout in `document_converter.py` (default 60s)
- Check server CPU usage

### PDF Not Showing in Viewer
- Check browser console for errors
- Verify file type in database is `pdf`
- Check storage_path points to .pdf file
- Try downloading the file directly

## Docker-Specific Testing

### Build and Run
```bash
docker compose down
docker compose up --build
```

### Check LibreOffice in Container
```bash
# Access backend container
docker compose exec backend bash

# Verify LibreOffice
libreoffice --version

# Test conversion manually
cd /app/uploads
libreoffice --headless --convert-to pdf sample.docx
```

### View Logs
```bash
# Backend logs
docker compose logs backend -f

# Worker logs (if conversion happens in background)
docker compose logs worker -f
```

## Success Criteria

✅ All test cases pass
✅ DOCX files convert to PDF automatically
✅ Original formatting preserved
✅ No manual intervention required
✅ Clear error messages on failure
✅ No orphaned files in uploads directory
✅ PDF viewer displays converted documents
✅ Original filename preserved in metadata

## Regression Testing

After implementing changes, verify existing functionality:
- [ ] PDF upload still works
- [ ] TXT upload still works
- [ ] Document listing shows correct info
- [ ] Document deletion works
- [ ] Evaluation pipeline processes converted PDFs
- [ ] Text extraction works on converted PDFs
- [ ] Dashboard displays all documents correctly

## Deployment Testing

Before deploying to production:
1. Test in staging environment with Docker
2. Verify LibreOffice installation in production image
3. Test with real-world DOCX samples
4. Monitor conversion performance
5. Set up alerts for conversion failures
6. Test rollback procedure

## Monitoring

After deployment, monitor:
- Conversion success rate
- Average conversion time
- Disk space usage
- Error logs for conversion failures
- User feedback on PDF quality

## Rollback Plan

If critical issues are found:
1. Revert changes in `documents.py`
2. Remove document_converter import
3. Redeploy without conversion logic
4. Existing PDFs remain accessible
5. New uploads accepted as-is (no conversion)
