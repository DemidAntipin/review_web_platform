from fastapi import APIRouter, HTTPException, Depends
from src.models.user.user import User
from src.core.utils.security import create_access_token, check_password, get_password_hash
from sqlalchemy import select, exists
from fastapi.security import OAuth2PasswordRequestForm
from src.dtos.auth.user import UserCreateDTO, UserUpdateDTO, UserDTO
from src.dtos.auth.token import TokenDTO
from src.models.user.user_role import UserRole
from src.core.dependencies import DBSession, CurrentUser

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserDTO)
async def register(user: UserCreateDTO, db: DBSession):
    existing = await db.scalar(select(exists().where((User.email == user.email) | (User.username == user.username))))
    if existing:
        raise HTTPException(status_code=400, detail="Email или username уже зарегистрированы")
    hashed = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed, role=UserRole(user.role))
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenDTO)
async def login(db: DBSession, form_data: OAuth2PasswordRequestForm = Depends()):
    result = await db.execute(select(User).where(User.username == form_data.username).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    password_ok = check_password(form_data.password, user.hashed_password)
    if not password_ok:
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    access_token = create_access_token(data={"sub": user.username})
    return TokenDTO(access_token=access_token, token_type="bearer")

@router.patch("/update", response_model=UserDTO)
async def update_current_user(data: UserUpdateDTO, db: DBSession, current_user: CurrentUser):
    if not check_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверный пароль")
    if data.username is not None and data.username != current_user.username:
        existing = await db.scalar(select(exists().where(User.username == data.username)))
        if existing:
            raise HTTPException(status_code=400, detail="Имя пользователя уже занято")

    if data.email is not None and data.email != current_user.email:
        existing = await db.scalar(select(exists().where(User.email == data.email)))
        if existing:
            raise HTTPException(status_code=400, detail="Email уже используется")
    current_user.update(data)
    await db.commit()
    await db.refresh(current_user)
    return current_user