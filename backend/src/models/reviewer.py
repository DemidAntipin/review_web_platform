from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from datetime import datetime

from src.dtos.reviewer.reviewer import ReviewerUpdateDTO

class Reviewer(BaseDBModel):
    __tablename__ = "reviewers"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False, index=True)
    name = Column(String, nullable=False)
    general_comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    project = relationship("Project", back_populates="reviewers")
    comments = relationship("Comment", back_populates="reviewer")

    def update(self, data: ReviewerUpdateDTO):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)
