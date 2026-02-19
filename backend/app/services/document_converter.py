import os
import logging
import subprocess
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)

class DocumentConverter:
    """
    Service to convert documents between formats (primarily DOCX/DOC to PDF).
    Uses LibreOffice in headless mode for reliable cross-platform conversion.
    """
    
    def __init__(self):
        self.libreoffice_path = self._find_libreoffice()
        
    def _find_libreoffice(self) -> Optional[str]:
        """
        Locate LibreOffice executable on the system.
        """
        # Common LibreOffice paths for different platforms
        possible_paths = [
            # Windows
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            # Linux
            "/usr/bin/libreoffice",
            "/usr/bin/soffice",
            # macOS
            "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Found LibreOffice at: {path}")
                return path
        
        # Try to find in PATH
        try:
            result = subprocess.run(
                ["which", "libreoffice"],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
        except Exception:
            pass
            
        logger.warning("LibreOffice not found. DOCX to PDF conversion will not be available.")
        return None
    
    def convert_docx_to_pdf(self, docx_path: str, output_dir: Optional[str] = None) -> str:
        """
        Convert a DOCX file to PDF.
        
        Args:
            docx_path: Path to the input DOCX file
            output_dir: Directory to save the PDF (defaults to same directory as input)
            
        Returns:
            Path to the generated PDF file
            
        Raises:
            RuntimeError: If LibreOffice is not installed or conversion fails
            FileNotFoundError: If input file doesn't exist
        """
        if not os.path.exists(docx_path):
            raise FileNotFoundError(f"Input file not found: {docx_path}")
        
        if not self.libreoffice_path:
            raise RuntimeError(
                "LibreOffice is not installed. Please install LibreOffice to enable "
                "DOCX to PDF conversion. Visit: https://www.libreoffice.org/download/"
            )
        
        # Determine output directory
        if output_dir is None:
            output_dir = os.path.dirname(docx_path)
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        try:
            # Run LibreOffice in headless mode to convert to PDF
            # --headless: Run without GUI
            # --convert-to pdf: Convert to PDF format
            # --outdir: Output directory
            logger.info(f"Converting {docx_path} to PDF using LibreOffice...")
            
            result = subprocess.run(
                [
                    self.libreoffice_path,
                    "--headless",
                    "--convert-to", "pdf",
                    "--outdir", output_dir,
                    docx_path
                ],
                capture_output=True,
                text=True,
                timeout=60,  # 60 second timeout
                check=False
            )
            
            if result.returncode != 0:
                logger.error(f"LibreOffice conversion failed: {result.stderr}")
                raise RuntimeError(f"PDF conversion failed: {result.stderr}")
            
            # Construct expected PDF path
            base_name = os.path.splitext(os.path.basename(docx_path))[0]
            pdf_path = os.path.join(output_dir, f"{base_name}.pdf")
            
            if not os.path.exists(pdf_path):
                raise RuntimeError(f"PDF file was not created: {pdf_path}")
            
            logger.info(f"Successfully converted to PDF: {pdf_path}")
            return pdf_path
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("PDF conversion timed out after 60 seconds")
        except Exception as e:
            logger.error(f"Error during PDF conversion: {str(e)}")
            raise RuntimeError(f"PDF conversion failed: {str(e)}")
    
    def is_convertible(self, file_path: str) -> bool:
        """
        Check if a file can be converted to PDF.
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if the file can be converted, False otherwise
        """
        if not self.libreoffice_path:
            return False
        
        convertible_extensions = ['.docx', '.doc', '.odt', '.rtf']
        ext = os.path.splitext(file_path)[1].lower()
        return ext in convertible_extensions

# Singleton instance
document_converter = DocumentConverter()
