import os
import shutil
from fastapi import UploadFile
from src.core.storage.BaseStorage import BaseStorage

class LocalStorage(BaseStorage):
    UPLOAD_DIR = "uploads"

    @classmethod
    async def save(cls, file: UploadFile, filename: str) -> str:
        if not os.path.exists(cls.UPLOAD_DIR):
            os.makedirs(cls.UPLOAD_DIR)

        file_path = os.path.join(cls.UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return filename
    
    @classmethod
    def get_path(cls, file_url: str) -> str:
        filename = os.path.basename(file_url)
        return os.path.abspath(os.path.join(cls.UPLOAD_DIR, filename))
