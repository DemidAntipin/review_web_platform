from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from src.models.project.project_status import ProjectStatus
from src.core.types import ID, TitleStr, JournalStr

class ProjectBaseDTO(BaseModel):
    title: TitleStr
    journal: JournalStr
    deadline: datetime

class ProjectUpdateDTO(BaseModel):
    title: Optional[TitleStr] = None
    journal: Optional[JournalStr] = None
    deadline: Optional[datetime] = None
    status: Optional[ProjectStatus] = None

class ProjectDTO(ProjectBaseDTO):
    id: ID
    status: ProjectStatus

    model_config = ConfigDict(from_attributes=True)