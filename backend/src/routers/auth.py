from fastapi import APIRouter, HTTPException, Depends
from src.models.user.user import User
from src.core.security import create_access_token, check_password, get_password_hash
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from src.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from src.dtos.auth.user import UserCreateDTO, UserUpdateDTO, UserDTO
from src.dtos.auth.token import TokenDTO
from src.models.user.user_role import UserRole
from src.core.dependencies import DBSession, CurrentUser

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserDTO)
def register(user: UserCreateDTO, db: DBSession):
    existing = db.query(User).filter((User.email == user.email) | (User.username == user.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email или username уже зарегистрированы")
    hashed = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed, role=UserRole(user.role))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenDTO)
def login(db: DBSession, form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not check_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return TokenDTO(access_token=access_token, token_type="bearer")

@router.patch("/update", response_model=UserDTO)
def update_current_user(data: UserUpdateDTO, db: DBSession, current_user: CurrentUser):
    if not check_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверный пароль")
    if data.username is not None and data.username != current_user.username:
        existing = db.query(User).filter(User.username == data.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Имя пользователя уже занято")

    if data.email is not None and data.email != current_user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email уже используется")
    current_user.update(data)
    db.commit()
    db.refresh(current_user)
    return current_user