import re
import textwrap
from datetime import datetime

def validate_string(v: str) -> str:
    if isinstance(v, str):
        v = v.strip()
        if not v:
            raise ValueError("Поле не может быть пустым")
    return v

def validate_password(v: str) -> str:
    if not any(char.isdigit() for char in v):
        raise ValueError("Пароль должен содержать хотя бы одну цифру")
    if not any(char.isalpha() for char in v):
        raise ValueError("Пароль должен содержать хотя бы одну букву")
    return v

def validate_preview_description(text: str, limit: int = 140) -> str:
        if not text:
            return ""
        
        text = re.sub(r'([#*`_~]|\[|\]\([^)]+\))', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return textwrap.shorten(text, width=limit, placeholder="...")

def validate_datetime(v: datetime | str) -> any:
    if isinstance(v, str):
        v = datetime.fromisoformat(v.replace("Z", "+00:00"))
    if isinstance(v, datetime) and v.tzinfo is not None:
        return v.replace(tzinfo=None)
    return v