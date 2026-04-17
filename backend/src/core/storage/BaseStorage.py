from abc import ABC, abstractmethod
from fastapi import UploadFile

class BaseStorage(ABC):
    @classmethod
    @abstractmethod
    async def save(cls, file: UploadFile, filename: str) -> str:
        pass

    @classmethod
    @abstractmethod
    def get_path(cls, file_url: str) -> str:
        pass