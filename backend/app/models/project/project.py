from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import BaseDBModel
from app.models.project.project_status import ProjectStatus
from datetime import datetime

class Project(BaseDBModel):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    journal = Column(String, nullable=False, index=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.in_progress)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    members = relationship("ProjectMember", back_populates="project")
    logs = relationship("ActivityLog", back_populates="project")
    reviewers = relationship("Reviewer", back_populates="project")