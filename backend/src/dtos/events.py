from pydantic import BaseModel
from src.core.events.event_type import EventType
from typing import List

class BaseEvent(BaseModel):
    user_id: int
    project_id: int
    action_type: str

class ProjectCreatedEvent(BaseEvent):
    action_type: str = EventType.PROJECT_CREATED.value
    title: str
    journal: str

class ProjectUpdatedEvent(BaseEvent):
    action_type: str = EventType.PROJECT_UPDATED.value
    changed_fields: List[str] 

class ProjectArchivedEvent(BaseEvent):
    action_type: str = EventType.PROJECT_ARCHIVED.value

class MemberAddedEvent(BaseEvent):
    action_type: str = EventType.MEMBER_ADDED.value
    target_user_id: int
    role: str

class MemberRemovedEvent(BaseEvent):
    action_type: str = EventType.MEMBER_REMOVED.value
    target_user_id: int
    role: str