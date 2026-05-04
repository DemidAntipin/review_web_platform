from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from datetime import datetime

from src.dtos.response.response import ResponseApproveDTO, ResponseSaveDTO

class Response(BaseDBModel):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)
    
    response_md = Column(Text, nullable=False)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    comment = relationship("Comment", back_populates="response")

    def update(self, data: ResponseSaveDTO):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(self, field):
                setattr(self, field, value)
        self.approved = False

    def approve(self, data: ResponseApproveDTO):
        self.approved = data.approved