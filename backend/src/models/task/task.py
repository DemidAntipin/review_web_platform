from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from src.models.task.task_type import TaskType
from src.models.task.task_status import TaskStatus
from datetime import datetime
from src.dtos.task.task import TaskUpdateDTO

class Task(BaseDBModel):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)
    assignee_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    title = Column(String, nullable=False)
    description_md = Column(Text, nullable=False)
    type = Column(Enum(TaskType), nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.todo)

    created_at = Column(DateTime, default=datetime.now)
    deleted_at = Column(DateTime, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)

    assignee = relationship("User", back_populates="tasks")
    comment = relationship("Comment", back_populates="tasks")
    attachments = relationship("Attachment", back_populates="task")
    task_comments = relationship("TaskComment", back_populates="task")

    def update(self, data: TaskUpdateDTO):
        update_data = data.model_dump(exclude_unset=True)
        old_status = self.status
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)
        if self.status != old_status:
            if self.status == TaskStatus.completed:
                self.completed_at = datetime.now()
            if old_status == TaskStatus.completed:
                self.completed_at = None