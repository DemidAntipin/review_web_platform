from pydantic import AliasPath, BaseModel, ConfigDict, Field
from typing import Optional, List
from src.models.task.task_type import TaskType
from src.models.task.task_status import TaskStatus
from src.models.comment.comment_priority import CommentPriority
from src.core.types import ID, MarkdownStr, UsernameStr, UTCDatetime
from src.models.user.user_role import UserRole

class TaskBaseDTO(BaseModel):
    title: str
    description_md: MarkdownStr
    type: TaskType

class TaskCreateDTO(TaskBaseDTO):
    assignee_id: Optional[ID]

class TaskCommentDTO(BaseModel):
    id: ID
    task_id: ID
    user_id: ID
    message: str
    created_at: UTCDatetime

    model_config = ConfigDict(from_attributes=True)

class TaskCommentPreviewDTO(TaskCommentDTO):
    username: UsernameStr = None
    role: UserRole = None

    model_config = ConfigDict(from_attributes=True)

class AttachmentDTO(BaseModel):
    id: ID
    task_id: ID
    file_url: str
    file_type: str
    uploaded_at: UTCDatetime

    model_config = ConfigDict(from_attributes=True)

class TaskUpdateDTO(BaseModel):
    title: Optional[str] = None
    description_md: Optional[MarkdownStr] = None
    type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[ID] = None

class TaskDTO(TaskBaseDTO):
    id: ID
    comment_id: ID
    assignee_id: Optional[ID]
    status: TaskStatus
    created_at: UTCDatetime
    completed_at: Optional[UTCDatetime] = None

    model_config = ConfigDict(from_attributes=True)

class TaskPreviewDTO(BaseModel):
    id: ID
    reviewer_id: ID 
    comment_id: ID
    title: str
    type: TaskType
    priority: CommentPriority
    status: TaskStatus
    assignee: Optional[UsernameStr] = None
    created_at: UTCDatetime
    deadline: UTCDatetime
    comments_count: int = 0
    attachments_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class TaskDetailDTO(TaskDTO):
    attachments: List[AttachmentDTO] = []
    task_comments: List[TaskCommentPreviewDTO] = []

class TaskCommentCreateDTO(BaseModel):
    message: str

class AttachmentCreateDTO(BaseModel):
    file_url: str
    file_type: str