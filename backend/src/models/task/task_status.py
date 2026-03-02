from enum import IntEnum, auto

class TaskStatus(IntEnum):
    todo = auto()
    in_progress = auto()
    completed = auto()
    ready_to_review = auto()
    closed = auto()
