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