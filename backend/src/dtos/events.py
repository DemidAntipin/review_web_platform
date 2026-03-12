from pydantic import BaseModel, Field
from src.core.events.event_type import EventType
from typing import List
from src.core.types import ID, ActionTypeStr, TitleStr, JournalStr

class BaseEvent(BaseModel):
    user_id: ID
    project_id: ID
    action_type: ActionTypeStr

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