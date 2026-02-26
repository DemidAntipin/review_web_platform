from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from datetime import datetime

class Attachment(BaseDBModel):
    __tablename__ = "attachments"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)

    uploaded_at = Column(DateTime, default=datetime.now())

    task = relationship("Task", back_populates="attachments")