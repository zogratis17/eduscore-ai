"""Document parsing service for PDF and DOCX files."""
import fitz  # PyMuPDF
from docx import Document as DocxDocument
import re
from typing import Dict, Tuple
import io


class DocumentParserService:
    """Service for parsing PDF and DOCX documents."""
    
    @staticmethod
    def parse_pdf(file_content: bytes) -> Dict[str, any]:
        """
        Parse PDF document and extract text.
        
        Args:
            file_content: PDF file content as bytes
            
        Returns:
            dict: Parsed document data
        """
        doc = fitz.open(stream=file_content, filetype="pdf")
        
        text_content = []
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc[page_num]
            text_content.append(page.get_text())
        
        doc.close()
        
        # Combine all pages
        full_text = "\n".join(text_content)
        
        # Clean text
        cleaned_text = DocumentParserService._clean_text(full_text)
        
        # Calculate metrics
        word_count = len(cleaned_text.split())
        
        return {
            "extracted_text": cleaned_text,
            "page_count": page_count,
            "word_count": word_count,
            "raw_text": full_text
        }
    
    @staticmethod
    def parse_docx(file_content: bytes) -> Dict[str, any]:
        """
        Parse DOCX document and extract text.
        
        Args:
            file_content: DOCX file content as bytes
            
        Returns:
            dict: Parsed document data
        """
        doc = DocxDocument(io.BytesIO(file_content))
        
        # Extract text from paragraphs
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        full_text = "\n".join(paragraphs)
        
        # Clean text
        cleaned_text = DocumentParserService._clean_text(full_text)
        
        # Calculate metrics
        word_count = len(cleaned_text.split())
        page_count = len(doc.sections)  # Approximate
        
        return {
            "extracted_text": cleaned_text,
            "page_count": max(1, page_count),
            "word_count": word_count,
            "raw_text": full_text
        }
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Clean extracted text.
        
        Args:
            text: Raw text
            
        Returns:
            str: Cleaned text
        """
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.,!?;:\-\'\"]', ' ', text)
        
        # Remove multiple spaces
        text = re.sub(r' +', ' ', text)
        
        # Trim
        text = text.strip()
        
        return text
    
    @staticmethod
    def parse_document(file_content: bytes, file_type: str) -> Dict[str, any]:
        """
        Parse document based on file type.
        
        Args:
            file_content: File content as bytes
            file_type: File extension (pdf or docx)
            
        Returns:
            dict: Parsed document data
        """
        if file_type.lower() == "pdf":
            return DocumentParserService.parse_pdf(file_content)
        elif file_type.lower() in ["docx", "doc"]:
            return DocumentParserService.parse_docx(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")


document_parser = DocumentParserService()
