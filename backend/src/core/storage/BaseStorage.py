from abc import ABC, abstractmethod
from fastapi import UploadFile

class BaseStorage(ABC):
    @classmethod
    @abstractmethod
    async def save(cls, file: UploadFile, filename: str) -> str:
        pass