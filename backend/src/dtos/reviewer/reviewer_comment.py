from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.models.comment.comment_priority import CommentPriority
from src.models.comment.comment_status import CommentStatus
from src.models.comment.comment_type import CommentType
from src.core.types import ID, MarkdownStr, MarkdownShortStr, UTCDatetime

class CommentBaseDTO(BaseModel):
    priority: CommentPriority
    type: CommentType
    content_md: MarkdownStr

class CommentCreateDTO(CommentBaseDTO):
    pass

class CommentUpdateDTO(BaseModel):
    content_md: Optional[MarkdownStr] = None
    priority: Optional[CommentPriority] = None
    type: Optional[CommentType] = None
    status: Optional[CommentStatus] = None

class CommentDTO(CommentBaseDTO):
    id: ID
    reviewer_id: ID
    status: CommentStatus
    created_at: UTCDatetime

    model_config = ConfigDict(from_attributes=True)

class CommentShortDTO(CommentDTO):
    content_md: MarkdownShortStr
    tasks_count: int = 0
    completed_tasks_count: int = 0

class CommentDetailDTO(CommentDTO):
    content_md: MarkdownStr
    tasks_count: int = 0
    completed_tasks_count: int = 0
    