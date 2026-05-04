from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from src.core.types import ID, MarkdownStr

class ResponseBaseDTO(BaseModel):
    response_md: MarkdownStr

class ResponseSaveDTO(BaseModel):
    response_md: Optional[MarkdownStr] = None

class ResponseApproveDTO(BaseModel):
    approved: bool

class ExportDTO(BaseModel):
    format: str

class ResponseDTO(ResponseBaseDTO):
    id: ID
    comment_id: ID
    approved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)