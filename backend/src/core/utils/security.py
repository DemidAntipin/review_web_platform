from werkzeug.security import generate_password_hash, check_password_hash
from jose import JWTError, jwt
from datetime import datetime, timedelta
from src.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from typing import Optional

def check_password(password, hashed_password) -> bool:
    return check_password_hash(hashed_password, password)

def get_password_hash(password) -> str:
    return generate_password_hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
