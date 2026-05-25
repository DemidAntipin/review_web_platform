from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from src.dtos.events import TaskUpdatedEvent, TaskDeletedEvent
from src.core.events.event_dispatcher import EventDispatcher
from src.core.dependencies import DBSession, ProjectAuthor, ProjectCoauthor, ProjectMemberAny
from src.core.types import ID
from src.models.comment.comment import Comment
from src.models.task.task import Task
from src.models.task.task_status import TaskStatus
from src.models.reviewer import Reviewer
from src.models.task_comment import TaskComment
from src.models.attachment import Attachment
from src.models.project.project import Project
from src.models.user.user_role import UserRole
from src.models.user.user import User
from src.dtos.task.task import TaskPreviewDTO, TaskDetailDTO, TaskUpdateDTO, TaskDTO
from src.routers import attachment_manager, chat_manager

router = APIRouter(prefix="/tasks", tags=["tasks"])
router.include_router(attachment_manager.router, prefix="/{task_id}")
router.include_router(chat_manager.router, prefix="/{task_id}")

@router.get("", response_model=List[TaskPreviewDTO])
async def get_kanban_tasks(project_id: ID, db: DBSession, current_user: ProjectMemberAny):
    attachments_count_sub = (
        select(func.count(Attachment.id))
        .where(Attachment.task_id == Task.id)
        .scalar_subquery()
    )   
    task_comments_count_sub = (
        select(func.count(TaskComment.id))
        .where(TaskComment.task_id == Task.id)
        .scalar_subquery()
    )
    filters = [
        Reviewer.project_id == project_id,
        Task.deleted_at == None
    ]
    if current_user.role == UserRole.coauthor:
        filters.append(Task.assignee_id == current_user.user.id)
    query = (
        select(
            Task,
            Comment.priority,
            Reviewer.id.label("reviewer_id"),
            User.username.label("assignee"),
            Project.deadline.label("deadline"),
            attachments_count_sub.label("attachments_count"),
            task_comments_count_sub.label("comments_count")
        )
        .join(Comment, Task.comment_id == Comment.id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .outerjoin(User, Task.assignee_id == User.id)
        .join(Project, Reviewer.project_id == Project.id)
        .where(*filters)
        .order_by(Task.created_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()
    tasks = []
    for r in rows:
        task = TaskPreviewDTO.model_validate({
            **TaskDTO.model_validate(r.Task).model_dump(),
            "reviewer_id": r.reviewer_id,
            "deadline": r.deadline,
            "priority": r.priority,
            "assignee": r.assignee,
            "comments_count": r.comments_count,
            "attachments_count": r.attachments_count
        }).model_dump() 
        tasks.append(task)
    return tasks

@router.get("/{task_id}", response_model=TaskDetailDTO)
async def get_task_details(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(Task)
        .options(selectinload(Task.attachments), selectinload(Task.task_comments))
        .join(Comment, Comment.id == Task.comment_id).join(Reviewer, Reviewer.id == Comment.reviewer_id)
        .where(Task.id == task_id, Reviewer.project_id == project_id, Task.deleted_at == None)
    ).limit(1)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    return TaskDetailDTO.model_validate(task)

@router.patch("/{task_id}", response_model=TaskDTO)
async def update_task(project_id: ID, task_id: ID, data: TaskUpdateDTO, db: DBSession, current_user: ProjectCoauthor | ProjectAuthor, background_tasks: BackgroundTasks):
    query = (
        select(Task)
        .join(Comment, Comment.id == Task.comment_id).join(Reviewer, Reviewer.id == Comment.reviewer_id)
        .where(Task.id == task_id, Reviewer.project_id == project_id, Task.deleted_at == None)).limit(1)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    if current_user.role == UserRole.coauthor:
        if task.assignee_id != current_user.user.id:
            raise HTTPException(403, detail="Недостаточно прав. Вы не являетесь исполнителем задачи.")
        if set(data.model_dump(exclude_unset=True).keys()) > {"status"}:
            raise HTTPException(403, detail="Исполнитель может менять только статус")
    task.update(data)

    await db.commit()
    await db.refresh(task)

    event = TaskUpdatedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task.id, changed_fields=list(data.model_dump(exclude_unset=True).keys()))
    EventDispatcher.create_event(background_tasks, event)
        
    return task

@router.delete("/{task_id}")
async def delete_task(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = (select(Task)
             .join(Comment, Comment.id == Task.comment_id)
             .join(Reviewer, Reviewer.id == Comment.reviewer_id)
             .where(Reviewer.project_id == project_id, Task.deleted_at == None)).limit(1)
    result = await db.execute(query)
    responses = result.fetchone()
    responses.Task.deleted_at = datetime.now()
    await db.commit()

    event = TaskDeletedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task_id, payload={"task_id": task_id})
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Задача удалена"}