from typing import Annotated, List
from fastapi import Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from datetime import datetime
from src.core.database import get_db_session
from src.core.config import SECRET_KEY, ALGORITHM
from src.models.user.user import User
from src.models.user.user_role import UserRole
from src.models.project_member import ProjectMember
from src.models.project.project import Project

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

DBSession = Annotated[AsyncSession, Depends(get_db_session)]

async def get_current_user(db: DBSession, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось валидировать пользователя",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(User).where(User.username == username).limit(1))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def check_user_permission(required_roles: List[UserRole]) -> User:
    async def check_permission(db: DBSession, user: CurrentUser, project_id: int | None = None) -> User:
        if user.role == UserRole.admin:
            return UserMember(user=user, role=UserRole.admin)
        query = (
            select(Project.deleted_at, ProjectMember.role)
            .outerjoin(
                ProjectMember, 
                (ProjectMember.project_id == Project.id) & 
                (ProjectMember.user_id == user.id) & 
                (ProjectMember.left_at == None)
            )
            .where(Project.id == project_id)
        ).limit(1)
        response = await db.execute(query)
        results = response.fetchone()
        if not results or results.deleted_at:
            raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Проект не найден")
        if user.role == UserRole.admin:
            return UserMember(user=user, role=UserRole.admin)
        if not results.role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail="Вы не являетесь участником этого проекта")
        if results.role not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail=f"Недостаточно прав для выполнения запроса. Требуются: {', '.join(r.name for r in required_roles)}. Ваша роль: {results.role.name}"
                )
        return UserMember(user=user, role=results.role)
    return check_permission

class UserMember:
     user: User
     role: UserRole

     def __init__(self, user:User, role:UserRole):
        self.user = user
        self.role = role

AdminUser = Annotated[User, Depends(check_user_permission([]))]
ProjectMemberAny = Annotated[UserMember, Depends(check_user_permission([UserRole.author, UserRole.coauthor, UserRole.editor]))]
ProjectAuthor = Annotated[UserMember, Depends(check_user_permission([UserRole.author]))]
ProjectCoauthor = Annotated[UserMember, Depends(check_user_permission([UserRole.coauthor]))]
ProjectEditor = Annotated[UserMember, Depends(check_user_permission([UserRole.editor]))]