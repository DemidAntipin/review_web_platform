from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import BaseDBModel
from app.models.user.user_role import UserRole
from datetime import datetime

class User(BaseDBModel):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.author)
    created_at = Column(DateTime, default=datetime.now())

    projects = relationship("ProjectMember", back_populates="user")
    tasks = relationship("Task", back_populates="assignee")
    logs = relationship("ActivityLog", back_populates="user")