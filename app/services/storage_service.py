"""Document storage service using GridFS or MinIO."""
from typing import BinaryIO, Optional
from datetime import datetime
from bson import ObjectId
import io

from app.config import settings
from app.database import get_gridfs, get_database


class StorageService:
    """Service for storing and retrieving documents."""
    
    def __init__(self):
        self.storage_type = settings.storage_type
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        metadata: Optional[dict] = None
    ) -> str:
        """
        Upload a file to storage.
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            content_type: MIME type
            metadata: Additional metadata
            
        Returns:
            str: File ID
        """
        if self.storage_type == "gridfs":
            return await self._upload_to_gridfs(
                file_content, filename, content_type, metadata
            )
        else:
            # MinIO implementation would go here
            raise NotImplementedError("MinIO storage not implemented yet")
    
    async def _upload_to_gridfs(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        metadata: Optional[dict] = None
    ) -> str:
        """Upload file to GridFS."""
        gridfs = get_gridfs()
        
        file_id = await gridfs.upload_from_stream(
            filename,
            io.BytesIO(file_content),
            metadata={
                "content_type": content_type,
                "uploaded_at": datetime.utcnow(),
                **(metadata or {})
            }
        )
        
        return str(file_id)
    
    async def download_file(self, file_id: str) -> tuple[bytes, dict]:
        """
        Download a file from storage.
        
        Args:
            file_id: File identifier
            
        Returns:
            tuple: (file_content, metadata)
        """
        if self.storage_type == "gridfs":
            return await self._download_from_gridfs(file_id)
        else:
            raise NotImplementedError("MinIO storage not implemented yet")
    
    async def _download_from_gridfs(self, file_id: str) -> tuple[bytes, dict]:
        """Download file from GridFS."""
        gridfs = get_gridfs()
        
        try:
            grid_out = await gridfs.open_download_stream(ObjectId(file_id))
            file_content = await grid_out.read()
            
            metadata = {
                "filename": grid_out.filename,
                "content_type": grid_out.metadata.get("content_type", ""),
                "uploaded_at": grid_out.metadata.get("uploaded_at"),
                "length": grid_out.length
            }
            
            return file_content, metadata
        except Exception as e:
            raise FileNotFoundError(f"File {file_id} not found: {str(e)}")
    
    async def delete_file(self, file_id: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            file_id: File identifier
            
        Returns:
            bool: Success status
        """
        if self.storage_type == "gridfs":
            return await self._delete_from_gridfs(file_id)
        else:
            raise NotImplementedError("MinIO storage not implemented yet")
    
    async def _delete_from_gridfs(self, file_id: str) -> bool:
        """Delete file from GridFS."""
        gridfs = get_gridfs()
        
        try:
            await gridfs.delete(ObjectId(file_id))
            return True
        except Exception:
            return False


storage_service = StorageService()
