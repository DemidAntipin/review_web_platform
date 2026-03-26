from pydantic import BaseModel, ConfigDict
from typing import List
from src.core.types import ID, UsernameStr, MarkdownStr
from src.dtos.reviewer.reviewer_comment import CommentShortDTO

class ReviewerBaseDTO(BaseModel):
    name: UsernameStr
    general_comment: MarkdownStr

class ReviewerCreateDTO(ReviewerBaseDTO):
    pass

class ReviewerDTO(ReviewerBaseDTO):
    id: ID  

    model_config = ConfigDict(from_attributes=True)

class ReviewerCommentsDTO(ReviewerDTO):
    comments: List[CommentShortDTO] = []

class ProjectReviewersPageDTO(BaseModel):
    reviewers: List[ReviewerCommentsDTO]