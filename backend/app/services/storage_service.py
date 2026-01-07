import os
import aiofiles
import uuid
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)
            
    async def save_file(self, file: UploadFile) -> str:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.upload_dir, unique_filename)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            while content := await file.read(1024*1024):  # Read file in chunks
                await out_file.write(content)
                
        return file_path
    
    def delete_file(self, file_path: str):
        if os.path.exists(file_path):
            os.remove(file_path)
            
storage_service = StorageService()
        