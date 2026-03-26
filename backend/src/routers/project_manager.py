from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.models.user.user import User
from src.models.project.project import Project
from sqlalchemy import select, exists, func, distinct
from sqlalchemy.sql.functions import coalesce
from sqlalchemy.orm import selectinload
from src.dtos.project.project import ProjectBaseDTO, ProjectDTO, ProjectUpdateDTO, ProjectPreviewDTO
from src.dtos.project.project_member import ProjectMemberDTO
from src.models.user.user_role import UserRole
from src.models.project_member import ProjectMember
from src.models.task.task import Task
from src.models.reviewer import Reviewer
from src.models.comment.comment import Comment
from src.core.dependencies import DBSession, CurrentUser, ProjectAuthor, ProjectMemberAny
from typing import List
from datetime import datetime
from src.dtos.events import ProjectArchivedEvent, ProjectCreatedEvent, ProjectUpdatedEvent, MemberAddedEvent, MemberRemovedEvent
from src.core.events.event_dispatcher import EventDispatcher
from src.routers import task_manager

router = APIRouter(prefix="/projects", tags=["projects"])
router.include_router(task_manager.router, prefix="/{project_id}")

@router.get("/my_projects", response_model=List[ProjectPreviewDTO])
async def list_projects(db: DBSession, current_user: CurrentUser):
    query = (
        select(
            Project,
            coalesce(func.count(distinct(Task.id)), 1).label("total_tasks_count"),
            coalesce(func.count(distinct(Task.id)).filter(Task.completed_at.is_not(None)), 0).label("completed_tasks_count")
        )
        .outerjoin(Reviewer, Reviewer.project_id == Project.id)
        .outerjoin(Comment, Comment.reviewer_id == Reviewer.id)
        .outerjoin(Task, Task.comment_id == Comment.id)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(ProjectMember.user_id == current_user.id)
        .group_by(Project.id)
    )
    response = await db.execute(query)
    results = response.all()
    projects=[]
    for r in results:
        project = ProjectPreviewDTO.model_validate(r.Project)
        project.total_tasks_count = r.total_tasks_count
        project.completed_tasks_count = r.completed_tasks_count
        projects.append(project)
    return projects

@router.get("/{project_id}", response_model=ProjectDTO)
async def get_project(project_id: int, db: DBSession, current_user: ProjectMemberAny):
    query = select(Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
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
async def archive_project(project_id: int, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = select(Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
    responses.Project.deleted_at = datetime.now()
    await db.commit()

    event = ProjectArchivedEvent(user_id=current_user.user.id, project_id=project_id, payload={"project_id": project_id})
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Проект перемещён в архив"}

@router.patch("/{project_id}", response_model=ProjectDTO)
async def update_project(project_id: int, data: ProjectUpdateDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = select(Project).where(Project.id == project_id, Project.deleted_at == None)
    result = await db.execute(query)
    responses = result.fetchone()
    project = responses.Project
    project.update(data)
    await db.commit()
    await db.refresh(project)

    event = ProjectUpdatedEvent(user_id=current_user.user.id, project_id=project_id, changed_fields=list(data.model_dump(exclude_unset=True).keys()))
    EventDispatcher.create_event(background_tasks, event)

    return project

@router.post("/{project_id}/members/add", response_model=ProjectMemberDTO)
async def add_member_project(project_id: int, data: ProjectMemberDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    checks = [
            exists(select(User.id).where(User.id == data.user_id)).label("user_exists"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == data.user_id, ProjectMember.left_at == None)).label("is_member"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == data.user_id, ProjectMember.left_at != None)).label("was_member")
        ]
    query = select(*checks)
    result = await db.execute(query)
    responses = result.fetchone()

    if not responses.user_exists:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
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
        member = ProjectMember(project_id=project_id, user_id=data.user_id, role=data.role.name)
        db.add(member)
    await db.commit()
    await db.refresh(member)

    event = MemberAddedEvent(user_id=current_user.user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role.name)
    EventDispatcher.create_event(background_tasks, event)

    return member

@router.delete("/{project_id}/members/leave")
async def leave_project(project_id: int, db: DBSession, current_user: ProjectMemberAny, background_tasks: BackgroundTasks):
    result = await db.execute(select(ProjectMember).join(Project).options(selectinload(ProjectMember.project)) 
                              .where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id, Project.deleted_at == None))
    member = result.scalar_one_or_none()
    member.left_at = datetime.now()
    await db.commit()

    event = MemberRemovedEvent(user_id=current_user.user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role.name, payload={"project_id": project_id, "user_id": current_user.id})
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Вы успешно покинули проект"}

@router.delete("/{project_id}/members/{user_id}")
async def remove_member(project_id: int, user_id: int, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    checks = [
            exists(select(User.id).where(User.id == user_id)).label("user_exists"),
            exists(select(ProjectMember.id).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id, ProjectMember.left_at == None)).label("is_member"),
        ]       
    query = select(*checks)
    result = await db.execute(query)
    responses = result.fetchone()

    if not responses.user_exists:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not responses.is_member:
        raise HTTPException(status_code=404, detail="Пользователь не является участником проекта")
    
    result = await db.execute(select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id, ProjectMember.left_at == None))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "Ошибка при получении записи участника")
    member.left_at = datetime.now()
    await db.commit()

    event = MemberRemovedEvent(user_id=current_user.user.id, project_id=member.project_id, target_user_id=member.user_id, role=member.role.name, payload={"project_id": project_id, "user_id": member.user_id})
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Пользователь исключён из команды проекта"}
