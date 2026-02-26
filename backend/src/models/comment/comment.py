from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.core.database import BaseDBModel
from src.models.comment.comment_type import CommentType
from src.models.comment.comment_status import CommentStatus
from src.models.comment.comment_priority import CommentPriority
from datetime import datetime

class Comment(BaseDBModel):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey('reviewers.id'), nullable=False)
    content_md = Column(Text, nullable=False)
    type = Column(Enum(CommentType), nullable=False)
    priority = Column(Enum(CommentPriority), nullable=False)
    status = Column(Enum(CommentStatus), default=CommentStatus.new)
    created_at = Column(DateTime, default=datetime.now())

    reviewer = relationship("Reviewer", back_populates="comments")
    tasks = relationship("Task", back_populates="comment")
    response = relationship("Response", back_populates="comment", uselist=False)