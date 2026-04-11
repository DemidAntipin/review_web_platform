from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from src.models.project.project_status import ProjectStatus
from src.core.types import ID, TitleStr, JournalStr, UTCDatetime

class ProjectBaseDTO(BaseModel):
    title: TitleStr
    journal: JournalStr
    deadline: UTCDatetime

class ProjectUpdateDTO(BaseModel):
    title: Optional[TitleStr] = None
    journal: Optional[JournalStr] = None
    deadline: Optional[UTCDatetime] = None
    status: Optional[ProjectStatus] = None

class ProjectDTO(ProjectBaseDTO):
    id: ID
    status: ProjectStatus
    created_at: UTCDatetime

    model_config = ConfigDict(from_attributes=True)

class ProjectPreviewDTO(ProjectDTO):
    total_tasks_count: int = 0
    completed_tasks_count: int = 0