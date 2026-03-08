from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.models.user.user import User
from src.models.project.project import Project
from sqlalchemy import select, exists
from sqlalchemy.orm import selectinload
from src.dtos.project.project import ProjectBaseDTO, ProjectDTO, ProjectUpdateDTO
from src.models.project.project_status import ProjectStatus
from src.dtos.project.project_member import ProjectMemberDTO
from src.models.user.user_role import UserRole
from src.models.project_member import ProjectMember
from src.core.dependencies import DBSession, CurrentUser
from typing import List
from datetime import datetime
from src.dtos.events import ProjectArchivedEvent, ProjectCreatedEvent, ProjectUpdatedEvent, MemberAddedEvent, MemberRemovedEvent
from src.core.events.event_dispatcher import EventDispatcher

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/my_projects", response_model=List[ProjectDTO])
async def list_projects(db: DBSession, current_user: CurrentUser):
    result = await db.execute(select(Project).join(ProjectMember).where(ProjectMember.user_id == current_user.id, Project.deleted_at == None))
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectDTO)
async def get_project(project_id: int, db: DBSession, current_user: CurrentUser):
    checks=[
        exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id, ProjectMember.left_at == None)).label("is_member")
    ]
    query = select(*checks, Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
    if not responses:
        raise HTTPException(status_code=404, detail="Проект не найден")
    if current_user.role != UserRole.admin and not responses.is_member:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    return responses.Project

@router.post("/create_project", response_model=ProjectDTO)
async def create_project(data: ProjectBaseDTO, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    project = Project(**data.model_dump(), members=[ProjectMember(user_id=current_user.id, role=UserRole.author)])   
    db.add(project)
    await db.commit()
    await db.refresh(project, attribute_names=["members"])

    event = ProjectCreatedEvent(user_id=current_user.id, project_id=project.id, title=project.title, journal=project.journal)
    EventDispatcher.create_event(background_tasks, event)

    return project

@router.delete("/{project_id}")
async def archive_project(project_id: int, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    checks = [exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id, ProjectMember.role == UserRole.author, ProjectMember.left_at == None)).label("has_permission")]
    query = select(*checks, Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
    if not responses:
        raise HTTPException(status_code=404, detail="Проект не найден")
    if current_user.role != UserRole.admin and not responses.has_permission:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    responses.Project.deleted_at = datetime.now()
    await db.commit()

    event = ProjectArchivedEvent(user_id=current_user.id, project_id=responses.Project.id)
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Проект перемещён в архив"}

@router.patch("/{project_id}", response_model=ProjectDTO)
async def update_project(project_id: int, data: ProjectUpdateDTO, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    checks = [exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id, ProjectMember.role == UserRole.author, ProjectMember.left_at == None)).label("has_permission")]
    query = select(*checks, Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
    if not responses:
        raise HTTPException(status_code=404, detail="Проект не найден")
    if current_user.role != UserRole.admin and not responses.has_permission:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    project = responses.Project
    project.update(data)
    await db.commit()
    await db.refresh(project)

    event = ProjectUpdatedEvent(user_id=current_user.id, project_id=project_id, changed_fields=list(data.model_dump(exclude_unset=True).keys()))
    EventDispatcher.create_event(background_tasks, event)

    return project

@router.post("/{project_id}/members/add", response_model=ProjectMemberDTO)
async def add_member_project(data: ProjectMemberDTO, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    checks = [
            exists(select(Project.id).where(Project.id == data.project_id, Project.deleted_at == None)).label("project_exists"),
            exists(select(User.id).where(User.id == data.user_id)).label("user_exists"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == data.project_id, ProjectMember.user_id == data.user_id, ProjectMember.left_at == None)).label("is_member"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == data.project_id, ProjectMember.user_id == data.user_id, ProjectMember.left_at != None)).label("was_member")
        ]
    if current_user.role != UserRole.admin:
        checks.append(exists(select(ProjectMember.id).where(
                ProjectMember.project_id == data.project_id,
                ProjectMember.user_id == current_user.id,
                ProjectMember.role == UserRole.author,
                ProjectMember.left_at == None)).label("has_permission"))

    query = select(*checks)
    result = await db.execute(query)
    responses = result.fetchone()

    if not responses.project_exists:
        raise HTTPException(status_code=404, detail="Проект не найден")
    if not responses.user_exists:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if current_user.role != UserRole.admin and not responses.has_permission:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    if responses.is_member:
        raise HTTPException(status_code=400, detail="Пользователь уже является участником проекта")
    
    if responses.was_member:
        result = await db.execute(select(ProjectMember).where(ProjectMember.project_id == data.project_id, ProjectMember.user_id == data.user_id))
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(500, "Ошибка при получении записи участника")
        member.left_at = None
        member.update(data)
    else:
        member = ProjectMember(project_id=data.project_id, user_id=data.user_id, role=data.role)
        db.add(member)
    await db.commit()
    await db.refresh(member)

    event = MemberAddedEvent(user_id=current_user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role)
    EventDispatcher.create_event(background_tasks, event)

    return member

@router.delete("/{project_id}/members/leave")
async def leave_project(project_id: int, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    result = await db.execute(select(ProjectMember).join(Project).options(selectinload(ProjectMember.project)) 
                              .where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id, Project.deleted_at == None))
    member = result.scalar_one_or_none()
    project = member.project if member else None
    if not project:
        raise HTTPException(404, "Проект не найден")
    if not member or member.left_at is not None:
        raise HTTPException(status_code=404, detail="Вы не являетесь участником этого проекта")
    member.left_at = datetime.now()
    await db.commit()

    event = MemberRemovedEvent(user_id=current_user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role)
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Вы успешно покинули проект"}

@router.delete("/{project_id}/members/{user_id}")
async def remove_member(project_id: int, user_id: int, db: DBSession, current_user: CurrentUser, background_tasks: BackgroundTasks):
    checks = [
            exists(select(Project.id).where(Project.id == project_id, Project.deleted_at == None)).label("project_exists"),
            exists(select(User.id).where(User.id == user_id)).label("user_exists"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id, ProjectMember.left_at == None)).label("is_member"),
        ]
    if current_user.role != UserRole.admin:
        checks.append(exists(select(ProjectMember.id).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == current_user.id,
                ProjectMember.role == UserRole.author,
                ProjectMember.left_at == None)).label("has_permission"))
        
    query = select(*checks)
    result = await db.execute(query)
    responses = result.fetchone()

    if not responses.project_exists:
        raise HTTPException(status_code=404, detail="Проект не найден")
    if not responses.user_exists:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if current_user.role != UserRole.admin and not responses.has_permission:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    if not responses.is_member:
        raise HTTPException(status_code=404, detail="Пользователь не является участником проекта")
    
    result = await db.execute(select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id, ProjectMember.left_at == None))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "Ошибка при получении записи участника")
    member.left_at = datetime.now()
    await db.commit()

    event = MemberRemovedEvent(user_id=current_user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role)
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Пользователь исключён из команды проекта"}
