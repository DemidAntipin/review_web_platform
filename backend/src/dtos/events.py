from pydantic import BaseModel, Field
from src.core.events.event_type import EventType
from typing import List, Dict, Any
from src.core.types import ID, ActionTypeStr, TitleStr, JournalStr, UsernameStr
from src.dtos.task.task import TaskDTO

class BaseEvent(BaseModel):
    user_id: ID
    project_id: ID
    action_type: ActionTypeStr
    payload: Dict[str, Any] = {}

class ProjectCreatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.PROJECT_CREATED.value
    title: TitleStr
    journal: JournalStr

class ProjectUpdatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.PROJECT_UPDATED.value
    changed_fields: List[str] 

class ProjectArchivedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.PROJECT_ARCHIVED.value

class MemberAddedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.MEMBER_ADDED.value
    target_user_id: ID
    role: str

class MemberRemovedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.MEMBER_REMOVED.value
    target_user_id: ID
    role: str

class MemberUpdatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.MEMBER_UPDATED.value
    target_user_id: ID
    role: str

class ReviewerAddedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.REVIEWER_ADDED.value
    reviewer_id: ID

class ReviewerUpdatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.REVIEWER_UPDATED.value
    reviewer_id: ID

class ReviewerRemovedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.REVIEWER_REMOVED.value
    reviewer_id: ID

class CommentAddedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.COMMENT_ADDED.value
    reveiwer_id: ID
    comment_id: ID

class CommentUpdatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.COMMENT_UPDATED.value
    comment_id: ID
    changed_fields: List[str]

class CommentDeletedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.COMMENT_DELETED.value
    comment_id: ID

class TaskUpdatedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.TASK_UPDATED.value
    task_id: ID
    changed_fields: List[str]

class TaskDeletedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.TASK_DELETED.value
    task_id: ID

class CommentDecomposedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.COMMENT_DECOMPOSED.value
    comment_id: ID
    created: List[ID]
    updated: List[ID]
    deleted: List[ID]


class AttachmentUploadedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.ATTACHMENT_UPLOADED.value
    task_id: ID
    attachment_id: ID

class TaskCommentAddedEvent(BaseEvent):
    action_type: ActionTypeStr = EventType.TASK_COMMENT_ADDED.value
    task_id: ID
    chat_message_id: ID