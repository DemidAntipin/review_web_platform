from pydantic import BaseModel
from src.core.types import ID

class AIRequestDTO(BaseModel):
    project_id: ID
    comment_id: ID

class AIResponseDTO(BaseModel):
    response: str
