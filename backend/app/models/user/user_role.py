from enum import Enum, auto

class UserRole(Enum):
    author = auto()
    coauthor = auto()
    editor = auto()
    admin = auto()
