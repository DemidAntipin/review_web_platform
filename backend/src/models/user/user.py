from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from src.models.user.user_role import UserRole
from datetime import datetime
from src.dtos.auth.user import UserUpdateDTO
from src.core.security import get_password_hash

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

    def update(self, data: UserUpdateDTO):
        update_data = data.model_dump(exclude_unset=True, exclude={'password'})
        new_password = update_data.pop("new_password", None)
        if new_password:
            update_data["hashed_password"] = get_password_hash(new_password)
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)
