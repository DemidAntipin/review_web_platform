from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import BaseDBModel
from app.models.task.task_type import TaskType
from app.models.task.task_status import TaskStatus
from datetime import datetime

class Task(BaseDBModel):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)
    assignee_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    title = Column(String, nullable=False)
    description_md = Column(Text, nullable=False)
    type = Column(Enum(TaskType), nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.todo)

    created_at = Column(DateTime, default=datetime.now())
    completed_at = Column(DateTime, nullable=True)

    assignee = relationship("User", back_populates="tasks")
    comment = relationship("Comment", back_populates="tasks")
    attachments = relationship("Attachment", back_populates="task")
