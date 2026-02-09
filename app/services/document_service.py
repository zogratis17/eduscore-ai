"""Document management service."""
from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict
from app.database import get_database
from app.models.schemas import DocumentStatus


class DocumentService:
    """Service for managing documents in MongoDB."""
    
    @staticmethod
    async def create_document(
        filename: str,
        file_type: str,
        file_size: int,
        file_id: str
    ) -> str:
        """
        Create a new document record.
        
        Args:
            filename: Original filename
            file_type: File extension
            file_size: File size in bytes
            file_id: GridFS file ID
            
        Returns:
            str: Document ID
        """
        db = get_database()
        
        document = {
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "file_id": file_id,
            "status": DocumentStatus.UPLOADED.value,
            "uploaded_at": datetime.utcnow(),
            "word_count": None,
            "page_count": None,
            "extracted_text": None,
            "evaluation_results": None
        }
        
        result = await db.documents.insert_one(document)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_document(document_id: str) -> Optional[Dict]:
        """
        Get document by ID.
        
        Args:
            document_id: Document identifier
            
        Returns:
            Optional[Dict]: Document data or None
        """
        db = get_database()
        
        try:
            document = await db.documents.find_one({"_id": ObjectId(document_id)})
            if document:
                document["id"] = str(document.pop("_id"))
            return document
        except Exception:
            return None
    
    @staticmethod
    async def update_document(document_id: str, update_data: Dict) -> bool:
        """
        Update document fields.
        
        Args:
            document_id: Document identifier
            update_data: Fields to update
            
        Returns:
            bool: Success status
        """
        db = get_database()
        
        try:
            result = await db.documents.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    @staticmethod
    async def update_status(document_id: str, status: DocumentStatus) -> bool:
        """
        Update document status.
        
        Args:
            document_id: Document identifier
            status: New status
            
        Returns:
            bool: Success status
        """
        return await DocumentService.update_document(
            document_id,
            {"status": status.value}
        )
    
    @staticmethod
    async def save_parsed_data(
        document_id: str,
        extracted_text: str,
        word_count: int,
        page_count: int
    ) -> bool:
        """
        Save parsed document data.
        
        Args:
            document_id: Document identifier
            extracted_text: Extracted text
            word_count: Number of words
            page_count: Number of pages
            
        Returns:
            bool: Success status
        """
        return await DocumentService.update_document(
            document_id,
            {
                "extracted_text": extracted_text,
                "word_count": word_count,
                "page_count": page_count,
                "status": DocumentStatus.PARSED.value
            }
        )
    
    @staticmethod
    async def save_evaluation_results(
        document_id: str,
        evaluation_results: Dict
    ) -> bool:
        """
        Save evaluation results.
        
        Args:
            document_id: Document identifier
            evaluation_results: Evaluation results data
            
        Returns:
            bool: Success status
        """
        return await DocumentService.update_document(
            document_id,
            {
                "evaluation_results": evaluation_results,
                "status": DocumentStatus.COMPLETED.value
            }
        )
    
    @staticmethod
    async def list_documents(limit: int = 50, skip: int = 0) -> list:
        """
        List all documents.
        
        Args:
            limit: Maximum number of documents
            skip: Number of documents to skip
            
        Returns:
            list: List of documents
        """
        db = get_database()
        
        cursor = db.documents.find().sort("uploaded_at", -1).skip(skip).limit(limit)
        documents = []
        
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            documents.append(doc)
        
        return documents


document_service = DocumentService()
