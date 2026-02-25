from enum import Enum, auto

class CommentStatus(Enum):
    new = auto()
    in_progress = auto()
    completed = auto()
    ready_to_review = auto()
    closed = auto()