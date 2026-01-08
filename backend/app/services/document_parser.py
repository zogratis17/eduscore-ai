import os
import logging
import re
import unicodedata
from typing import Dict, Any, Optional
import fitz  # PyMuPDF
import docx
try:
    import magic
except ImportError:
    magic = None

logger = logging.getLogger(__name__)

class DocumentParser:
    """
    Service to parse content from various document formats (PDF, DOCX, TXT).
    """

    def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parses a file from the given path and extracts text and metadata.
        
        Args:
            file_path: The absolute path to the file.
            
        Returns:
            Dict containing:
            - extracted_text (str)
            - word_count (int)
            - page_count (int, optional)
            - metadata (dict)
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # Detect MIME type if available
        mime_type = None
        if magic:
            try:
                mime_type = magic.from_file(file_path, mime=True)
            except Exception as e:
                logger.warning(f"magic.from_file failed: {e}")
        
        try:
            if mime_type == 'application/pdf':
                return self._parse_pdf(file_path)
            elif mime_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']:
                if file_path.endswith('.doc'):
                     raise ValueError("Legacy .doc format is not supported. Please convert to .docx or .pdf")
                return self._parse_docx(file_path)
            elif mime_type == 'text/plain':
                return self._parse_txt(file_path)
            else:
                # Fallback based on extension
                ext = os.path.splitext(file_path)[1].lower()
                if ext == '.pdf':
                     return self._parse_pdf(file_path)
                elif ext == '.docx':
                     return self._parse_docx(file_path)
                elif ext == '.txt':
                     return self._parse_txt(file_path)
                
                # If magic worked but found something else, and extension didn't match
                if mime_type:
                    raise ValueError(f"Unsupported file type: {mime_type}")
                else:
                    raise ValueError(f"Unsupported file type (extension: {ext})")


        except Exception as e:
            logger.error(f"Error parsing file {file_path}: {str(e)}")
            raise e

    def _clean_text(self, text: str) -> str:
        """
        Cleans and normalizes text.
        """
        if not text:
            return ""
        
        # Normalize unicode characters
        text = unicodedata.normalize('NFKC', text)
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Replace multiple spaces/newlines with single space/newline
        # But keep paragraph breaks (double newlines)
        text = re.sub(r'\r\n', '\n', text) # Normalize newlines
        
        # Remove excessive whitespace within lines, but preserve newlines
        lines = [re.sub(r'\s+', ' ', line).strip() for line in text.split('\n')]
        
        # Remove empty lines (optional, but good for analysis)
        # lines = [line for line in lines if line] 
        
        cleaned_text = "\n".join(lines)
        
        # Remove multiple newlines (e.g. more than 2)
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        
        return cleaned_text.strip()

    def _parse_pdf(self, file_path: str) -> Dict[str, Any]:
        text_content = []
        page_count = 0
        
        with fitz.open(file_path) as doc:
            page_count = len(doc)
            for page in doc:
                text_content.append(page.get_text())
        
        full_text = "\n".join(text_content)
        cleaned_text = self._clean_text(full_text)
        
        return {
            "extracted_text": cleaned_text,
            "word_count": self._count_words(cleaned_text),
            "page_count": page_count,
            "metadata": {"source": "pdf"}
        }

    def _parse_docx(self, file_path: str) -> Dict[str, Any]:
        doc = docx.Document(file_path)
        text_content = []
        
        for para in doc.paragraphs:
            text_content.append(para.text)
            
        full_text = "\n".join(text_content)
        cleaned_text = self._clean_text(full_text)
        
        # Approximate page count (not accurate in docx without rendering)
        
        return {
            "extracted_text": cleaned_text,
            "word_count": self._count_words(cleaned_text),
            "page_count": None, 
            "metadata": {"source": "docx"}
        }

    def _parse_txt(self, file_path: str) -> Dict[str, Any]:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            full_text = f.read()
            
        cleaned_text = self._clean_text(full_text)
            
        return {
            "extracted_text": cleaned_text,
            "word_count": self._count_words(cleaned_text),
            "page_count": 1, # Conceptually 1 document
            "metadata": {"source": "txt"}
        }

    def _count_words(self, text: str) -> int:
        if not text:
            return 0
        # Simple word count
        return len(text.split())

document_parser = DocumentParser()
