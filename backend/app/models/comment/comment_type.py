from enum import Enum, auto

class CommentType(Enum):
    text_change = auto()
    experiment = auto()
    analysis = auto()
    source = auto()
    question = auto()