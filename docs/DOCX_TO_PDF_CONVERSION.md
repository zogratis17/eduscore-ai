# DOCX to PDF Conversion Feature

## Overview

The system automatically converts uploaded DOCX and DOC files to PDF format before storing them in MongoDB. This ensures a consistent viewing experience in the document viewer, as all documents can be displayed as PDFs.

## How It Works

1. **Upload**: User uploads a DOCX or DOC file through the frontend
2. **Initial Save**: File is temporarily saved to disk
3. **Conversion**: LibreOffice is used to convert the document to PDF
4. **Storage**: The PDF version is stored in MongoDB, and the original DOCX is deleted
5. **Viewing**: When viewing the document, users see a PDF viewer with the converted file

## Benefits

- **Consistent Viewing**: All documents are displayed as PDFs in the viewer
- **No Client-Side Processing**: Conversion happens on the server
- **Original Filename Preserved**: The original filename is stored in the database
- **Automatic Process**: No manual intervention required

## Technical Implementation

### Backend Components

#### 1. Document Converter Service
Location: `backend/app/services/document_converter.py`

This service handles the DOCX to PDF conversion using LibreOffice in headless mode.

**Key Features:**
- Auto-detects LibreOffice installation on the system
- Supports multiple platforms (Windows, Linux, macOS)
- Timeout protection (60 seconds)
- Error handling with detailed logging

#### 2. Upload Endpoint Enhancement
Location: `backend/app/api/v1/endpoints/documents.py`

The upload endpoint now:
- Detects DOCX/DOC files
- Calls the converter service
- Updates file metadata (type, size, name)
- Cleans up temporary files

### LibreOffice Installation

#### Docker (Production)
LibreOffice is automatically installed in Docker containers via the Dockerfiles:
- `docker/backend.Dockerfile`
- `docker/worker.Dockerfile`

Installed packages:
- `libreoffice-writer`: Core word processing component
- `libreoffice-core`: LibreOffice base libraries
- `default-jre-headless`: Java runtime (required for headless mode)

#### Local Development

**Windows:**
1. Download from https://www.libreoffice.org/download/
2. Install to default location (`C:\Program Files\LibreOffice`)
3. The system will auto-detect the installation

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y libreoffice-writer libreoffice-core default-jre-headless
```

**macOS:**
```bash
brew install --cask libreoffice
```

### Verification

To verify LibreOffice is installed correctly:

```bash
# Linux/macOS
which libreoffice
libreoffice --version

# Windows (PowerShell)
& "C:\Program Files\LibreOffice\program\soffice.exe" --version
```

## Error Handling

If LibreOffice is not installed or conversion fails:
- A clear error message is returned to the user
- The temporary file is cleaned up
- No database record is created
- The user is prompted to try again or contact support

Error responses include:
- `500`: Conversion failed (with reason)
- `400`: File validation failed
- `404`: LibreOffice not installed

## Frontend Updates

The following components were updated to accept .doc files:
- `frontend/src/components/evaluation/DocumentUploader.jsx`
- `frontend/src/pages/UploadPage.jsx`

Accepted file types: `.pdf`, `.docx`, `.doc`, `.txt`

## Database Schema

The document schema stores:
- `original_filename`: Original name with original extension (e.g., "essay.docx")
- `filename`: Converted filename (e.g., "essay.pdf")
- `file_type`: "pdf" (after conversion)
- `content_type`: "application/pdf" (after conversion)
- `storage_path`: Path to the PDF file on disk

## Performance Considerations

- **Conversion Time**: Typically 2-10 seconds depending on document complexity
- **File Size**: PDF files may be larger or smaller than original DOCX
- **Concurrent Conversions**: LibreOffice can handle multiple conversions in parallel
- **Timeout**: 60-second timeout prevents hanging processes

## Troubleshooting

### Conversion Fails
1. Check LibreOffice is installed: Run verification commands above
2. Check log files for specific error messages
3. Verify file is a valid DOCX/DOC (not corrupted)
4. Check disk space for temporary files

### LibreOffice Not Found
1. Install LibreOffice (see installation instructions above)
2. Restart the application/container
3. Check PATH environment variable includes LibreOffice

### Slow Conversions
1. Check server resources (CPU, memory)
2. Reduce concurrent upload limits
3. Consider implementing a queue system for large batches

## Future Enhancements

Potential improvements:
- Support for more formats (RTF, ODT, etc.)
- Compression options for large PDFs
- Preview before conversion
- Batch conversion optimization
- Alternative conversion engines (Pandoc, Aspose)

## Dependencies

- **LibreOffice**: 7.0 or higher (headless mode)
- **Java Runtime**: Required for LibreOffice headless
- **System**: Sufficient disk space for temporary files

## Maintenance

- Monitor conversion success/failure rates
- Clean up orphaned files if conversion fails
- Update LibreOffice periodically for security patches
- Test with various DOCX formats and versions
