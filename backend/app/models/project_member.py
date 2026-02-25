from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import BaseDBModel
from app.models.user.user_role import UserRole
from datetime import datetime

class ProjectMember(BaseDBModel):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    joined_at = Column(DateTime, default=datetime.now())

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="projects")