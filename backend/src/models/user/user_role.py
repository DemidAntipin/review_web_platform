from enum import IntEnum, auto

class UserRole(IntEnum):
    author = auto()
    coauthor = auto()
    editor = auto()
    admin = auto()
