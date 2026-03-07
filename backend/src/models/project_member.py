from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from src.models.user.user_role import UserRole
from datetime import datetime
from src.dtos.project.project_member import ProjectMemberDTO

class ProjectMember(BaseDBModel):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    role = Column(Enum(UserRole), nullable=False)
    joined_at = Column(DateTime, default=datetime.now)
    left_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="projects")

    def update(self, data: ProjectMemberDTO):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)