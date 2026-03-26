from enum import IntEnum, auto

class CommentStatus(IntEnum):
    new = auto()
    in_progress = auto()
    completed = auto()
    closed = auto()
