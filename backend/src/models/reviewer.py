from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from datetime import datetime

class Reviewer(BaseDBModel):
    __tablename__ = "reviewers"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String, nullable=False)
    general_comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    project = relationship("Project", back_populates="reviewers")
    comments = relationship("Comment", back_populates="reviewer")
