from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from src.models.project.project_status import ProjectStatus
from datetime import datetime
from src.dtos.project.project import ProjectUpdateDTO

class Project(BaseDBModel):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    journal = Column(String, nullable=False, index=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.in_progress)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted_at = Column(DateTime, nullable=True, index=True)
    
    members = relationship("ProjectMember", back_populates="project")
    logs = relationship("ActivityLog", back_populates="project")
    reviewers = relationship("Reviewer", back_populates="project")

    def update(self, data: ProjectUpdateDTO):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)
        self.updated_at = datetime.now()