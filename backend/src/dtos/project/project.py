from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from src.models.project.project_status import ProjectStatus

class ProjectBaseDTO(BaseModel):
    title: str
    journal: str
    deadline: datetime

class ProjectUpdateDTO(BaseModel):
    title: Optional[str] = None
    journal: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[ProjectStatus] = None

class ProjectDTO(ProjectBaseDTO):
    id: int
    status: ProjectStatus

    model_config = ConfigDict(from_attributes=True)