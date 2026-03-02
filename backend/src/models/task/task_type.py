from enum import IntEnum, auto

class TaskType(IntEnum):
    text_change = auto()
    experiment = auto()
    analysis = auto()
    source = auto()
    question = auto()
