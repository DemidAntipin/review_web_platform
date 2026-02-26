from enum import Enum, auto

class TaskType(Enum):
    text_change = auto()
    experiment = auto()
    analysis = auto()
    source = auto()
    question = auto()