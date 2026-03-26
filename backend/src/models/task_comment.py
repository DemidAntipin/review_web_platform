from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from datetime import datetime

class TaskComment(BaseDBModel):
    __tablename__ = "task_comments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    task = relationship("Task", back_populates="task_comments")
    author = relationship("User", back_populates="comments")