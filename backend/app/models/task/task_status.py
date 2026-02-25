from enum import Enum, auto

class TaskStatus(Enum):
    todo = auto()
    in_progress = auto()
    completed = auto()
    ready_to_review = auto()
    closed = auto()